import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVehicleById, updateVehicle, deleteVehicle } from '../../api/adminVehicles'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './VehicleManagement.css'
import './AdminVehicleDetail.css'

const AdminVehicleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const fileInputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)

  const BACKEND_BASE_URL = 'http://localhost:8084/EVRentalSystem'

  // Form state
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    status: 'AVAILABLE',
    odo: 0,
    stationId: null,
    stationName: '',
    picture: ''
  })

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Thử gọi API detail trước
        try {
          const data = await getVehicleById(id)
          setVehicle(data)
          setFormData({
            licensePlate: data.licensePlate || '',
            brand: data.brand || '',
            model: data.model || '',
            status: data.status || 'AVAILABLE',
            odo: data.odo || 0,
            stationId: data.stationId || null,
            stationName: data.stationName || '',
            picture: data.picture || ''
          })
          setLoading(false)
          return
        } catch (detailErr) {
          console.warn('[AdminVehicleDetail] Detail API failed, trying fallback from list:', detailErr)
          
          // Fallback: Lấy từ list vehicles nếu detail API lỗi
          try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/vehicle/vehicles?page=0&size=100`)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            
            const listData = await response.json()
            const vehicles = listData?.content || listData || []
            
            // Tìm vehicle theo id trong list
            const foundVehicle = vehicles.find(v => 
              String(v?.id) === String(id) || 
              String(v?.vehicleId) === String(id) ||
              String(v?.vehicle_id) === String(id)
            )
            
            if (foundVehicle) {
              console.log('[AdminVehicleDetail] Found vehicle from list fallback')
              setVehicle(foundVehicle)
              setFormData({
                licensePlate: foundVehicle.licensePlate || '',
                brand: foundVehicle.brand || '',
                model: foundVehicle.model || '',
                status: foundVehicle.status || 'AVAILABLE',
                odo: foundVehicle.odo || 0,
                stationId: foundVehicle.stationId || null,
                stationName: foundVehicle.stationName || '',
                picture: foundVehicle.picture || ''
              })
              setLoading(false)
              return
            }
            
            throw new Error('Không tìm thấy xe với ID này trong danh sách')
          } catch (fallbackErr) {
            console.error('[AdminVehicleDetail] Fallback also failed:', fallbackErr)
            throw detailErr // Throw original error
          }
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err)
        const errorMessage = err?.response?.status === 500 
          ? 'Lỗi máy chủ. Endpoint chi tiết xe có thể chưa được implement. Vui lòng kiểm tra backend API.'
          : err?.response?.status === 404
          ? 'Không tìm thấy thông tin xe với ID này.'
          : err?.message || 'Không thể tải thông tin xe'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVehicle()
    }
  }, [id])

  const getImageSrc = (v) => {
    if (!v) return '/carpic/default.jpg'
    
    const picture = v?.picture
    const vehicleId = v?.vehicleId ?? v?.vehicle_id ?? v?.id
    
    console.log('[AdminVehicleDetail] getImageSrc called with:', { 
      picture, 
      vehicleId,
      hasPicture: !!(picture && picture !== '' && picture !== 'null')
    })
    
    if (picture && picture !== '' && picture !== 'null') {
      const picStr = String(picture).trim()
      const hasExtension = picStr.match(/\.(jpg|jpeg|png|gif|webp|webm)$/i)
      
      // Try backend first (where uploaded images are stored)
      const backendSrc = hasExtension 
        ? `${BACKEND_BASE_URL}/carpic/${picStr}`
        : `${BACKEND_BASE_URL}/carpic/${picStr}.jpg`
      
      // Return backend path first (since images are uploaded there)
      // Frontend fallback is handled in onError handler
      console.log('[AdminVehicleDetail] Using picture:', picStr, '→', backendSrc)
      return backendSrc
    }
    
    if (vehicleId) {
      const vehicleIdSrc = `${BACKEND_BASE_URL}/carpic/${vehicleId}.jpg`
      console.log('[AdminVehicleDetail] Using vehicleId:', vehicleId, '→', vehicleIdSrc)
      return vehicleIdSrc
    }
    
    console.log('[AdminVehicleDetail] Using default image')
    return '/carpic/default.jpg'
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSuccess(false)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data
    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        status: vehicle.status || 'AVAILABLE',
        odo: vehicle.odo || 0,
        stationId: vehicle.stationId || null,
        stationName: vehicle.stationName || '',
        picture: vehicle.picture || ''
      })
    }
    setImagePreview(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      await updateVehicle(id, formData)
      
      // Reload vehicle data
      const updatedData = await getVehicleById(id).catch(() => vehicle)
      setVehicle(updatedData || vehicle)
      
      setSuccess(true)
      setIsEditing(false)
      setImagePreview(null)
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error updating vehicle:', err)
      // Sử dụng userMessage từ interceptor nếu có, không thì dùng message mặc định
      const errorMessage = err.userMessage || 
                          err.response?.data?.message || 
                          err.message || 
                          'Không thể cập nhật thông tin xe'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      setError(null)
      
      await deleteVehicle(id)
      
      // Thêm delay nhỏ để đảm bảo backend xử lý xong
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Navigate về danh sách và trigger refresh bằng cách reload
      navigate('/admin/vehicles', { replace: true })
      
      // Trigger custom event để VehicleManagement biết cần refresh
      window.dispatchEvent(new CustomEvent('vehicleDeleted'))
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      // Sử dụng userMessage từ interceptor nếu có, không thì dùng message mặc định
      const errorMessage = err.userMessage || 
                          err.response?.data?.message || 
                          err.message || 
                          'Không thể xóa xe'
      setError(errorMessage)
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Preview image
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      
      // Set picture name (backend sẽ handle upload)
      setFormData(prev => ({
        ...prev,
        picture: file.name
      }))
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      picture: ''
    }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'odo' || name === 'stationId' ? (Number(value) || 0) : value
    }))
  }

  const getStatusBadgeClass = (status) => {
    switch (String(status || '').toUpperCase()) {
      case 'AVAILABLE':
        return 'vehicle-status--available'
      case 'RENTED':
        return 'vehicle-status--rented'
      case 'FIXING':
      case 'MAINTENANCE':
        return 'vehicle-status--fixing'
      default:
        return ''
    }
  }

  const getStatusLabel = (status) => {
    switch (String(status || '').toUpperCase()) {
      case 'AVAILABLE':
        return 'Khả dụng'
      case 'RENTED':
        return 'Đang thuê'
      case 'FIXING':
      case 'MAINTENANCE':
        return 'Bảo trì'
      default:
        return status || 'Không xác định'
    }
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="vehicle-detail-page">
          <div className="admin-breadcrumb">
            <i className="fas fa-home"></i>
            <span>Quản trị</span>
            <i className="fas fa-chevron-right"></i>
            <span>Quản lý xe</span>
            <i className="fas fa-chevron-right"></i>
            <span>Chi tiết xe</span>
          </div>
          
          <div className="vehicle-detail-loading">
            <div className="vehicle-detail-skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-content">
                <div className="skeleton-image"></div>
                <div className="skeleton-info">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (error && !vehicle) {
    return (
      <ErrorBoundary>
        <div className="vehicle-detail-page">
          <div className="admin-breadcrumb">
            <i className="fas fa-home"></i>
            <span>Quản trị</span>
            <i className="fas fa-chevron-right"></i>
            <button onClick={() => navigate('/admin/vehicles')} className="breadcrumb-link">
              Quản lý xe
            </button>
            <i className="fas fa-chevron-right"></i>
            <span>Chi tiết xe</span>
          </div>
          
          <div className="vehicle-detail-error">
            <div className="error-container">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2 className="error-title">Không thể tải thông tin xe</h2>
              <p className="error-message">{error}</p>
              <div className="error-actions">
                <button 
                  className="error-btn error-btn--primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo"></i> Thử lại
                </button>
                <button 
                  className="error-btn error-btn--secondary"
                  onClick={() => navigate('/admin/vehicles')}
                >
                  <i className="fas fa-arrow-left"></i> Quay lại danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  const currentVehicle = vehicle || {}
  const imageSrc = imagePreview || getImageSrc(currentVehicle)

  return (
    <ErrorBoundary>
      <div className="vehicle-detail-page">
        {/* Breadcrumb */}
        <div className="admin-breadcrumb">
          <i className="fas fa-home"></i>
          <span>Quản trị</span>
          <i className="fas fa-chevron-right"></i>
          <button onClick={() => navigate('/admin/vehicles')} className="breadcrumb-link">
            Quản lý xe
          </button>
          <i className="fas fa-chevron-right"></i>
          <span>Chi tiết xe #{id}</span>
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
              <h1 className="vehicle-detail-title">
                {isEditing ? 'Chỉnh sửa xe' : `${currentVehicle.brand || ''} ${currentVehicle.model || ''}`}
              </h1>
              <p className="vehicle-detail-subtitle">
                Biển số: <strong>{currentVehicle.licensePlate || formData.licensePlate || 'N/A'}</strong>
              </p>
            </div>
          </div>
          <div className="vehicle-detail-header-right">
            {!isEditing ? (
              <>
                <button
                  className="vehicle-detail-action-btn vehicle-detail-action-btn--secondary"
                  onClick={() => navigate('/admin/vehicles')}
                >
                  <i className="fas fa-list"></i>
                  <span>Danh sách</span>
                </button>
                <button
                  className="vehicle-detail-action-btn vehicle-detail-action-btn--warning"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <i className="fas fa-trash"></i>
                  <span>Xóa xe</span>
                </button>
                <button
                  className="vehicle-detail-action-btn vehicle-detail-action-btn--primary vehicle-detail-action-btn--edit"
                  onClick={handleEdit}
                >
                  <i className="fas fa-edit"></i>
                  <span>Chỉnh sửa</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className="vehicle-detail-action-btn vehicle-detail-action-btn--secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <i className="fas fa-times"></i>
                  <span>Hủy</span>
                </button>
                <button
                  className="vehicle-detail-action-btn vehicle-detail-action-btn--primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <i className="fas fa-save"></i>
                  <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="vehicle-detail-alert vehicle-detail-alert--success">
            <i className="fas fa-check-circle"></i>
            <span>Cập nhật thành công!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="vehicle-detail-alert vehicle-detail-alert--error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="vehicle-detail-content">
          <div className="vehicle-detail-layout">
            {/* Left: Image Card */}
            <div className="vehicle-detail-image-card">
              <div className="vehicle-detail-image-container">
                <img
                  src={imageSrc}
                  alt={`${currentVehicle.brand} ${currentVehicle.model}`}
                  className="vehicle-detail-image"
                  onError={(e) => {
                    const fallbackLevel = e.currentTarget.dataset.fallback || '0'
                    const picture = currentVehicle?.picture
                    const vehicleId = currentVehicle?.vehicleId ?? currentVehicle?.vehicle_id ?? currentVehicle?.id
                    const currentSrc = e.currentTarget.src
                    
                    console.log('[AdminVehicleDetail] Image error, trying fallback:', {
                      fallbackLevel,
                      currentSrc,
                      picture,
                      vehicleId
                    })
                    
                    // Try 1: Frontend public folder with picture name
                    if (fallbackLevel === '0' && picture && picture !== '' && picture !== 'null') {
                      const picStr = String(picture).trim()
                      const hasExt = picStr.match(/\.(jpg|jpeg|png|gif|webp|webm)$/i)
                      const frontendSrc = hasExt ? `/carpic/${picStr}` : `/carpic/${picStr}.jpg`
                      e.currentTarget.dataset.fallback = '1'
                      e.currentTarget.src = frontendSrc
                      console.log('[AdminVehicleDetail] Trying frontend public with picture:', frontendSrc)
                      return
                    }
                    
                    // Try 2: Backend with picture name (retry with different extension)
                    if ((fallbackLevel === '0' || fallbackLevel === '1') && picture && picture !== '' && picture !== 'null') {
                      const picStr = String(picture).trim()
                      const hasExt = picStr.match(/\.(jpg|jpeg|png|gif|webp|webm)$/i)
                      // Try with .jpg if current path failed
                      const backendSrc = hasExt 
                        ? `${BACKEND_BASE_URL}/carpic/${picStr.replace(/\.(jpeg|png|gif|webp|webm)$/i, '.jpg')}`
                        : `${BACKEND_BASE_URL}/carpic/${picStr}.jpg`
                      e.currentTarget.dataset.fallback = '2'
                      e.currentTarget.src = backendSrc
                      console.log('[AdminVehicleDetail] Trying backend with modified extension:', backendSrc)
                      return
                    }
                    
                    // Try 3: Frontend public folder with vehicleId
                    if (fallbackLevel !== '3' && vehicleId) {
                      e.currentTarget.dataset.fallback = '3'
                      e.currentTarget.src = `/carpic/${vehicleId}.jpg`
                      console.log('[AdminVehicleDetail] Trying frontend public with vehicleId:', `/carpic/${vehicleId}.jpg`)
                      return
                    }
                    
                    // Try 4: Backend with vehicleId (retry)
                    if (fallbackLevel === '3' && vehicleId) {
                      e.currentTarget.dataset.fallback = '4'
                      e.currentTarget.src = `${BACKEND_BASE_URL}/carpic/${vehicleId}.jpg`
                      console.log('[AdminVehicleDetail] Trying backend with vehicleId:', `${BACKEND_BASE_URL}/carpic/${vehicleId}.jpg`)
                      return
                    }
                    
                    // Final fallback: default.jpg
                    if (fallbackLevel !== '5') {
                      e.currentTarget.dataset.fallback = '5'
                      e.currentTarget.src = '/carpic/default.jpg'
                      console.log('[AdminVehicleDetail] Using default image')
                    }
                  }}
                />
                <div className="vehicle-detail-image-overlay">
                  <span className={`vehicle-detail-status-badge ${getStatusBadgeClass(formData.status || currentVehicle.status)}`}>
                    <i className="fas fa-circle"></i>
                    {getStatusLabel(formData.status || currentVehicle.status)}
                  </span>
                </div>
              </div>
              
              {/* Image Actions */}
              {isEditing && (
                <div className="vehicle-detail-image-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="vehicle-detail-file-input"
                    id="vehicle-image-input"
                  />
                  <label htmlFor="vehicle-image-input" className="vehicle-image-btn vehicle-image-btn--upload">
                    <i className="fas fa-upload"></i>
                    <span>Thay đổi ảnh</span>
                  </label>
                  {(formData.picture || currentVehicle.picture) && (
                    <button
                      className="vehicle-image-btn vehicle-image-btn--remove"
                      onClick={handleRemoveImage}
                    >
                      <i className="fas fa-trash"></i>
                      <span>Gỡ ảnh</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Info Cards */}
            <div className="vehicle-detail-info-cards">
              {/* Basic Info Card */}
              <div className="vehicle-info-card">
                <div className="vehicle-info-card-header">
                  <i className="fas fa-info-circle"></i>
                  <h2 className="vehicle-info-card-title">Thông tin cơ bản</h2>
                </div>
                <div className="vehicle-info-card-body">
                  <div className="vehicle-info-row">
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-hashtag"></i>
                        ID xe
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          className="vehicle-info-input"
                          value={currentVehicle.id ?? currentVehicle.vehicleId ?? id}
                          disabled
                        />
                      ) : (
                        <span className="vehicle-info-value">
                          {currentVehicle.id ?? currentVehicle.vehicleId ?? id}
                        </span>
                      )}
                    </div>
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-id-card"></i>
                        Biển số
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="licensePlate"
                          className="vehicle-info-input"
                          value={formData.licensePlate}
                          onChange={handleChange}
                          required
                        />
                      ) : (
                        <span className="vehicle-info-value vehicle-info-value--highlight">
                          {currentVehicle.licensePlate ?? 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="vehicle-info-row">
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-industry"></i>
                        Hãng xe
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="brand"
                          className="vehicle-info-input"
                          value={formData.brand}
                          onChange={handleChange}
                          required
                        />
                      ) : (
                        <span className="vehicle-info-value">{currentVehicle.brand ?? 'N/A'}</span>
                      )}
                    </div>
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-car"></i>
                        Model
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="model"
                          className="vehicle-info-input"
                          value={formData.model}
                          onChange={handleChange}
                          required
                        />
                      ) : (
                        <span className="vehicle-info-value">{currentVehicle.model ?? 'N/A'}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="vehicle-info-row">
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-tachometer-alt"></i>
                        Số km
                      </span>
                      {isEditing ? (
                        <input
                          type="number"
                          name="odo"
                          className="vehicle-info-input"
                          value={formData.odo}
                          onChange={handleChange}
                          min="0"
                          required
                        />
                      ) : (
                        <span className="vehicle-info-value">
                          {currentVehicle.odo?.toLocaleString('vi-VN') ?? 0} km
                        </span>
                      )}
                    </div>
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-circle"></i>
                        Trạng thái
                      </span>
                      {isEditing ? (
                        <select
                          name="status"
                          className="vehicle-info-select"
                          value={formData.status}
                          onChange={handleChange}
                          required
                        >
                          <option value="AVAILABLE">Khả dụng</option>
                          <option value="RENTED">Đang thuê</option>
                          <option value="FIXING">Bảo trì</option>
                          <option value="MAINTENANCE">Bảo dưỡng</option>
                        </select>
                      ) : (
                        <span className={`vehicle-status-badge-inline ${getStatusBadgeClass(currentVehicle.status)}`}>
                          {getStatusLabel(currentVehicle.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Station Info Card */}
              <div className="vehicle-info-card">
                <div className="vehicle-info-card-header">
                  <i className="fas fa-map-marker-alt"></i>
                  <h2 className="vehicle-info-card-title">Thông tin trạm</h2>
                </div>
                <div className="vehicle-info-card-body">
                  <div className="vehicle-info-row">
                    <div className="vehicle-info-item vehicle-info-item--full">
                      <span className="vehicle-info-label">
                        <i className="fas fa-building"></i>
                        Tên trạm
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="stationName"
                          className="vehicle-info-input"
                          value={formData.stationName}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="vehicle-info-value">{currentVehicle.stationName ?? 'N/A'}</span>
                      )}
                    </div>
                  </div>
                  <div className="vehicle-info-row">
                    <div className="vehicle-info-item vehicle-info-item--full">
                      <span className="vehicle-info-label">
                        <i className="fas fa-hashtag"></i>
                        Station ID
                      </span>
                      {isEditing ? (
                        <input
                          type="number"
                          name="stationId"
                          className="vehicle-info-input"
                          value={formData.stationId || ''}
                          onChange={handleChange}
                          min="0"
                        />
                      ) : (
                        <span className="vehicle-info-value">{currentVehicle.stationId ?? 'N/A'}</span>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="vehicle-info-row">
                      <div className="vehicle-info-item vehicle-info-item--full">
                        <span className="vehicle-info-label">
                          <i className="fas fa-image"></i>
                          Tên file ảnh
                        </span>
                        <input
                          type="text"
                          name="picture"
                          className="vehicle-info-input"
                          value={formData.picture}
                          onChange={handleChange}
                          placeholder="ví dụ: 1.jpg hoặc 1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="vehicle-delete-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="vehicle-delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="vehicle-delete-modal-header">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>Xác nhận xóa xe</h3>
              </div>
              <div className="vehicle-delete-modal-body">
                <p>Bạn có chắc chắn muốn xóa xe này không?</p>
                <p className="vehicle-delete-modal-warning">
                  <strong>{currentVehicle.brand} {currentVehicle.model}</strong>
                  <br />
                  Biển số: <strong>{currentVehicle.licensePlate}</strong>
                </p>
                <p className="vehicle-delete-modal-note">
                  Hành động này không thể hoàn tác!
                </p>
              </div>
              <div className="vehicle-delete-modal-actions">
                <button
                  className="vehicle-delete-btn vehicle-delete-btn--cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Hủy
                </button>
                <button
                  className="vehicle-delete-btn vehicle-delete-btn--confirm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default AdminVehicleDetail
