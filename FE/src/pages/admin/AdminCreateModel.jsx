import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './VehicleManagement.css'
import './AdminVehicleAdd.css'
import './AdminVehicleDetail.css'

const AdminCreateModel = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [brand, setBrand] = useState('')
  const [modelName, setModelName] = useState('')
  const [price, setPrice] = useState('') // giữ dạng string để kiểm soát input
  const [seats, setSeats] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [pictureFile, setPictureFile] = useState(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Validate cơ bản
  const validateForm = () => {
    if (!brand || brand.trim() === '') {
      setError('Vui lòng nhập thương hiệu (brand).')
      return false
    }
    if (!modelName || modelName.trim() === '') {
      setError('Vui lòng nhập tên model.')
      return false
    }
    if (!price || String(price).trim() === '') {
      setError('Vui lòng nhập giá.')
      return false
    }
    if (isNaN(Number(String(price).replace(/[^\d.-]/g, '')))) {
      setError('Giá không hợp lệ.')
      return false
    }
    if (!seats || Number(seats) <= 0) {
      setError('Vui lòng nhập số chỗ (seats) hợp lệ.')
      return false
    }
    return true
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // optional: kiểm tra size/type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result || null)
    }
    reader.readAsDataURL(file)

    setPictureFile(file)
    setError(null)
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setPictureFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) return

    try {
      setSaving(true)

      const form = new FormData()
      form.append('brand', brand.trim())
      form.append('model', modelName.trim())
      // gửi price dưới dạng number (Double)
      form.append('price', String(Number(String(price).replace(/[^\d.-]/g, ''))))
      form.append('seats', String(Number(seats)))
      if (pictureFile) {
        form.append('modelPicture', pictureFile, pictureFile.name)
      }

      const url = 'http://localhost:8084/EVRentalSystem/vehicle-management/create-model'
      const resp = await fetch(url, {
        method: 'POST',
        body: form
      })

      const body = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        const serverMsg = body?.message || body?.error || `Lỗi server: ${resp.status}`
        setError(serverMsg)
        return
      }

      // Thành công
      setSuccess(true)
      setError(null)

      // Nếu backend trả message, bạn có thể hiển thị thêm
      // setTimeout redirect về danh sách models hoặc page quản lý
      setTimeout(() => {
        navigate('/admin/vehicles') // hoặc route bạn muốn
      }, 1200)
    } catch (err) {
      console.error('Create model failed', err)
      setError(err?.message || 'Không thể tạo model. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ErrorBoundary>
      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <i className="fas fa-home"></i>
        <span>Quản trị</span>
        <i className="fas fa-chevron-right"></i>
        <button onClick={() => navigate('/admin/vehicles')} className="breadcrumb-link">Quản lý xe</button>
        <i className="fas fa-chevron-right"></i>
        <span>Thêm model xe</span>
      </div>

      {/* Header */}
      <div className="vehicle-detail-header">
        <div className="vehicle-detail-header-left">
          <button
            className="vehicle-detail-back-btn"
            onClick={() => navigate('/admin/vehicles')}
            title="Quay lại danh sách"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="vehicle-detail-title-group">
            <h1 className="vehicle-detail-title">Thêm model xe</h1>
            <p className="vehicle-detail-subtitle">Tạo mẫu xe mới cho hệ thống</p>
          </div>
        </div>
        <div className="vehicle-detail-header-right">
          <button
            className="vehicle-detail-action-btn vehicle-detail-action-btn--secondary"
            onClick={() => navigate('/admin/vehicles')}
            disabled={saving}
          >
            <i className="fas fa-times"></i>
            <span>Hủy</span>
          </button>
        </div>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="vehicle-detail-alert vehicle-detail-alert--success">
          <i className="fas fa-check-circle"></i>
          <span>Thêm model thành công! Đang chuyển hướng...</span>
        </div>
      )}

      {error && (
        <div className="vehicle-detail-alert vehicle-detail-alert--error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <div className="vehicle-detail-content">
        <div className="vehicle-info-card" style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className="vehicle-info-card-header">
            <i className="fas fa-car"></i>
            <h2 className="vehicle-info-card-title">Thông tin Model xe</h2>
          </div>

          <form onSubmit={handleSubmit} className="vehicle-add-form">
            <div className="vehicle-info-card-body">
              <div className="vehicle-info-row">
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-tag"></i>
                    Thương hiệu<span style={{ color: 'red' }}>*</span>
                  </span>
                  <input
                    type="text"
                    name="brand"
                    className="vehicle-info-input"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Nhập hãng xe"
                    required
                  />
                </div>

                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-car-side"></i>
                    Model<span style={{ color: 'red' }}>*</span>
                  </span>
                  <input
                    type="text"
                    name="model"
                    className="vehicle-info-input"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Nhập model xe"
                    required
                  />
                </div>
              </div>

              <div className="vehicle-info-row">
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-dollar-sign"></i>
                    Giá (nghìn VND) <span style={{ color: 'red' }}>*</span>
                  </span>
                  <input
                    type="text"
                    name="price"
                    className="vehicle-info-input"
                    value={price}
                    onChange={(e) => {
                      // cho phép nhập số, dấu chấm, dấu phẩy
                      const v = e.target.value.replace(/[^\d.,-]/g, '')
                      setPrice(v)
                    }}
                    placeholder=""
                    required
                  />
                </div>

                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-user-friends"></i>
                    Số chỗ ngồi<span style={{ color: 'red' }}>*</span>
                  </span>
                  <input
                    type="number"
                    name="seats"
                    className="vehicle-info-input"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    placeholder="Nhập số chỗ ngồi"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Image upload */}
              <div className="vehicle-info-item vehicle-info-item--full">
                <span className="vehicle-info-label">
                  <i className="fas fa-image"></i>
                  Ảnh model xe
                </span>

                <div className="vehicle-image-upload-card">
                  <div className="vehicle-image-upload-container">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="vehicle-image-upload-preview"
                      />
                    ) : (
                      <div className="vehicle-image-upload-placeholder">
                        <i className="fas fa-car" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '12px' }}></i>
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Chưa có ảnh</p>
                      </div>
                    )}
                  </div>

                  <div className="vehicle-image-upload-actions">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      onClick={(e) => { e.target.value = '' }}
                      className="vehicle-image-upload-input"
                      id="model-image-upload-input"
                      disabled={saving}
                    />
                    <label
                      htmlFor="model-image-upload-input"
                      className={`vehicle-image-upload-btn vehicle-image-upload-btn--upload`}
                      style={{ cursor: saving ? 'wait' : 'pointer' }}
                    >
                      <i className="fas fa-cloud-upload-alt"></i>
                      <span>{imagePreview ? 'Thay đổi ảnh' : 'Thêm ảnh'}</span>
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        className="vehicle-image-upload-btn vehicle-image-upload-btn--remove"
                        onClick={handleRemoveImage}
                        disabled={saving}
                      >
                        <i className="fas fa-trash"></i>
                        <span>Gỡ ảnh</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="vehicle-add-form-actions">
              <button
                type="submit"
                className="vehicle-detail-action-btn vehicle-detail-action-btn--primary"
                disabled={saving}
              >
                <i className="fas fa-plus-circle"></i>
                <span>{saving ? 'Đang thêm...' : 'Thêm model'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default AdminCreateModel
