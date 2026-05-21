const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const ImageVector = require('../../models/ImageVector');
const Product = require('../../models/Product'); // Adjust based on your model

// Controller cho Image Search
const searchProductByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh',
      });
    }

    const imagePath = await getLocalImagePath(req.file.path);

    // Gọi Python model để extract features
    const searchResults = await callPythonModel(imagePath);

    if (!searchResults.success) {
      cleanupTempFile(imagePath);
      return res.status(400).json({
        success: false,
        message: searchResults.error || 'Lỗi xử lý ảnh',
      });
    }

    if (!searchResults.results || searchResults.results.length === 0) {
      cleanupTempFile(imagePath);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm tương tự',
        products: [],
      });
    }

    // Lấy ID sản phẩm từ model AI
    const productIds = searchResults.results.map((result) => result.id);

    // Query database để lấy thông tin sản phẩm
    // TODO: Thay đổi theo model Product của bạn
    let products = [];
    try {
      products = await Product.findByIds(productIds);
      // Add similarity score từ AI search results
      products = products.map(p => {
        const similarity = searchResults.results.find(r => r.id === String(p._id))?.similarity || 0;
        return { ...p, similarity };
      });
    } catch (error) {
      console.warn('Warning: Could not fetch products from DB:', error.message);
      // Fallback: return similarity scores only
      products = searchResults.results.map((result, idx) => ({
        id: result.id,
        _id: result.id,
        name: `Product ${result.id}`,
        similarity: result.similarity
      }));
    }

    // Clean up uploaded file
    cleanupTempFile(imagePath);

    return res.status(200).json({
      success: true,
      message: 'Tìm kiếm thành công',
      products: products,
    });
  } catch (error) {
    console.error('Image Search Error:', error);
    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi tìm kiếm: ' + error.message,
    });
  }
};

// Lưu vector ảnh của product (gọi khi tạo/cập nhật product)
const saveProductImageVector = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh',
      });
    }

    const { productId } = req.body;
    if (!productId) {
      cleanupTempFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp productId',
      });
    }

    // Kiểm tra product tồn tại (foreign key constraint)
    let productExists = false;
    try {
      // TODO: Thay thế bằng Product model của bạn
      // const product = await Product.findById(productId);
      // productExists = !!product;
      
      // Tạm thời: chỉ check ID là INT
      productExists = Number.isInteger(parseInt(productId));
      if (!productExists) {
        throw new Error('Product ID phải là số nguyên');
      }
    } catch (err) {
      cleanupTempFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Product ID không hợp lệ: ' + err.message,
      });
    }

    const imagePath = await getLocalImagePath(req.file.path);

    // Extract features từ ảnh (chỉ extract, không cần DB lookup)
    const extractResult = await callPythonModel(imagePath, { extractOnly: true });

    if (!extractResult.success) {
      cleanupTempFile(imagePath);
      return res.status(400).json({
        success: false,
        message: extractResult.error || 'Lỗi xử lý ảnh',
      });
    }

    // Lấy vector từ response
    const vectorFromPython = extractResult.features;

    if (!vectorFromPython || vectorFromPython.length === 0) {
      cleanupTempFile(imagePath);
      return res.status(400).json({
        success: false,
        message: 'Không thể extract features từ ảnh',
      });
    }

    // Lưu vào database MySQL (with foreign key constraint)
    try {
      await ImageVector.upsert(productId, vectorFromPython);
    } catch (dbError) {
      if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          message: `Product với ID ${productId} không tồn tại trong database`,
        });
      }
      throw dbError;
    }

    // Clean up
    cleanupTempFile(imagePath);

    return res.status(200).json({
      success: true,
      message: 'Lưu vector ảnh thành công',
      productId: parseInt(productId),
      featureDimension: vectorFromPython.length,
    });
  } catch (error) {
    console.error('Save Image Vector Error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Lỗi lưu vector: ' + error.message,
    });
  }
};

const cleanupTempFile = (filePath) => {
  if (!filePath) return;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const resolvePythonExecutable = () => {
  const localVenvPython = path.resolve(__dirname, '../../../.venv/Scripts/python.exe');
  if (fs.existsSync(localVenvPython)) {
    return localVenvPython;
  }

  return process.env.PYTHON_EXECUTABLE || 'python';
};

const getLocalImagePath = async (filePathOrUrl) => {
  if (!filePathOrUrl) {
    throw new Error('Không có đường dẫn ảnh');
  }

  if (!filePathOrUrl.startsWith('http://') && !filePathOrUrl.startsWith('https://')) {
    return filePathOrUrl;
  }

  const urlObject = new URL(filePathOrUrl);
  const tempFilePath = path.join(os.tmpdir(), `image-search-${Date.now()}-${Math.random().toString(16).slice(2)}${path.extname(urlObject.pathname) || '.jpg'}`);
  const client = urlObject.protocol === 'https:' ? https : http;

  await new Promise((resolve, reject) => {
    const request = client.get(urlObject, (response) => {
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`Không tải được ảnh từ Cloudinary: HTTP ${response.statusCode}`));
        response.resume();
        return;
      }

      const fileStream = fs.createWriteStream(tempFilePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });

      fileStream.on('error', (error) => {
        fileStream.close(() => reject(error));
      });
    });

    request.on('error', reject);
  });

  return tempFilePath;
};

// Gọi Python model bằng subprocess
const callPythonModel = (imagePath, options = {}) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '../../ai_model/search.py');
    const args = [pythonScriptPath, imagePath];
    if (options.extractOnly) args.push('--extract-only');
    const python = spawn(resolvePythonExecutable(), args);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('[Python Error]:', data.toString());
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e.message}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
      }
    });

    python.on('error', (error) => {
      reject(new Error(`Failed to spawn Python process: ${error.message}`));
    });

    // Timeout 30 seconds
    setTimeout(() => {
      python.kill();
      reject(new Error('Python process timeout'));
    }, 30000);
  });
};

module.exports = {
  searchProductByImage,
  saveProductImageVector
};
