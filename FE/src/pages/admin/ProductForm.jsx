import React, { useState } from 'react';
import './ProductForm.css';

/**
 * Admin Product Form with Image Search Vector Integration
 * 
 * Features:
 * - Upload product image
 * - Save vector to MySQL via /api/search/image/save
 * - Preview image
 */

const ProductForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };

  // Save product AND vector
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      setError('Vui lòng chọn ảnh');
      return;
    }

    if (!formData.name || !formData.price) {
      setError('Vui lòng điền đủ thông tin');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Save product
      console.log('📦 Saving product...');
      const productRes = await fetch('/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!productRes.ok) {
        throw new Error('Failed to save product');
      }

      const productData = await productRes.json();
      const productId = productData._id || productData.id;

      console.log('✅ Product saved:', productId);

      // Step 2: Save image vector
      console.log('🖼️  Saving image vector...');
      const vectorFormData = new FormData();
      vectorFormData.append('image', image);
      // productId từ database là INT, không cần stringify
      vectorFormData.append('productId', productId);

      const vectorRes = await fetch('/api/search/image/save', {
        method: 'POST',
        body: vectorFormData,
      });

      if (!vectorRes.ok) {
        console.warn('⚠️  Vector save failed, but product was saved');
        setSuccess(`✅ Product saved! (Vector save: ${vectorRes.statusText})`);
      } else {
        const vectorData = await vectorRes.json();
        console.log('✅ Vector saved:', vectorData.featureDimension, 'dimensions');
        setSuccess(`✅ Product & vector saved successfully!\nVector dimensions: ${vectorData.featureDimension}`);
      }

      // Reset form
      setFormData({ name: '', price: '', description: '', category: '' });
      setImage(null);
      setImagePreview(null);

      // Callback
      if (onSuccess) {
        onSuccess(productId);
      }

    } catch (err) {
      console.error('Error:', err);
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h2>Thêm Sản Phẩm Mới</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="form-group">
          <label>Ảnh Sản Phẩm *</label>
          <div className="image-upload-section">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  Xóa
                </button>
              </div>
            ) : (
              <label className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <div className="upload-icon">📷</div>
                <p>Click để chọn ảnh</p>
              </label>
            )}
          </div>
        </div>

        {/* Product Name */}
        <div className="form-group">
          <label>Tên Sản Phẩm *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label>Giá Bán *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Nhập giá bán"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Danh Mục</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="">-- Chọn danh mục --</option>
            <option value="electronics">Điện tử</option>
            <option value="fashion">Thời trang</option>
            <option value="home">Nhà cửa</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Mô Tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả sản phẩm"
            rows="4"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '⏳ Đang lưu...' : '✅ Lưu Sản Phẩm'}
        </button>
      </form>

      {/* Info */}
      <div className="form-info">
        <h4>ℹ️ Thông tin</h4>
        <ul>
          <li>Ảnh sẽ được phân tích bằng AI (MobileNetV2)</li>
          <li>Vector (62,720 dimensions) lưu vào MySQL</li>
          <li>Dùng cho tìm kiếm ảnh của user</li>
          <li>Lưu ý: Lần đầu chạy chậm (load model ~3-5 giây)</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductForm;
