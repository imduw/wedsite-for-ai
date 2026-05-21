import React, { useState, useRef } from 'react';
import './ImageSearch.css';

const ImageSearch = ({ onResults }) => {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Xử lý file được chọn (file picker hoặc camera)
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    // Preview ảnh
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);

    // Gửi lên server
    await searchByImage(file);
  };

  // Upload ảnh và tìm kiếm
  const searchByImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search/search', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        throw new Error(data.message || 'Tìm kiếm thất bại');
      }

      if (!data.products || data.products.length === 0) {
        setError('Không tìm thấy sản phẩm tương tự');
        if (onResults) onResults([]);
        return;
      }

      setError(null);
      if (onResults) onResults(data.products);
    } catch (error) {
      console.error('Error:', error);
      setError('Lỗi tìm kiếm: ' + error.message);
      if (onResults) onResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // File picker
  const handleFilePickerClick = () => {
    fileInputRef.current?.click();
  };

  // Camera
  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="image-search-container">
      <h2>🔍 Tìm kiếm sản phẩm bằng hình ảnh</h2>

      {/* Error message */}
      {error && (
        <div className="error-message" style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Preview ảnh */}
      {preview && (
        <div className="preview-section">
          <img src={preview} alt="Preview" className="preview-image" />
          <button
            onClick={() => {
              setPreview(null);
              setError(null);
              setIsLoading(false);
            }}
            className="btn-clear"
            disabled={isLoading}
          >
            ✕ Xóa
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Kéo & thả ảnh vào đây</p>
        <p className="divider">— hoặc —</p>

        <div className="button-group">
          {/* File Picker */}
          <button
            onClick={handleFilePickerClick}
            className="btn btn-file"
            disabled={isLoading}
          >
            📁 Chọn từ máy
          </button>

          {/* Camera */}
          <button
            onClick={handleCameraClick}
            className="btn btn-camera"
            disabled={isLoading}
          >
            📷 Chụp ảnh
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && <div className="loading">Đang tìm kiếm...</div>}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageSearch;
