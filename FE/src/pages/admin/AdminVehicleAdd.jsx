import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createVehicle, uploadVehicleImage, getVehicleModels } from '../../api/adminVehicles'
import { getStationOptions } from '../../api/adminDashboard'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './VehicleManagement.css'
import './AdminVehicleDetail.css'

const AdminVehicleAdd = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [stations, setStations] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleModelId: '',
    stationId: '',
    color: '',
    batteryCapacity: '',
    odo: 0,
    picture: '',
    status: 'AVAILABLE'
  })

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        const [stationsData] = await Promise.all([
          getStationOptions()
        ])
        
        setStations(stationsData || [])
        
        // Fetch vehicle models - try multiple methods
        let modelsFetched = false
        
        // Try 1: Using adminVehicles API
        try {
          const modelsFromAPI = await getVehicleModels()
          if (Array.isArray(modelsFromAPI) && modelsFromAPI.length > 0) {
            // If API returns array of strings, convert to objects
            if (typeof modelsFromAPI[0] === 'string') {
              setVehicleModels(modelsFromAPI.map((name, index) => ({ 
                id: index + 1, 
                name: name,
                model: name 
              })))
            } else {
              // If already objects, use as is
              setVehicleModels(modelsFromAPI)
            }
            modelsFetched = true
            console.log('[AdminVehicleAdd] Vehicle models loaded from API:', modelsFromAPI.length)
          }
        } catch (apiErr) {
          console.warn('[AdminVehicleAdd] Could not fetch models from API:', apiErr)
        }
        
        // Try 2: Direct fetch as fallback
        if (!modelsFetched) {
          try {
            const response = await fetch('http://localhost:8084/EVRentalSystem/api/vehicle/models', {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            })
            
            if (response.ok) {
              const modelsData = await response.json()
              if (Array.isArray(modelsData) && modelsData.length > 0) {
                if (typeof modelsData[0] === 'object' && modelsData[0].id) {
                  setVehicleModels(modelsData)
                } else if (typeof modelsData[0] === 'string') {
                  setVehicleModels(modelsData.map((name, index) => ({ 
                    id: index + 1, 
                    name: name,
                    model: name 
                  })))
                }
                modelsFetched = true
                console.log('[AdminVehicleAdd] Vehicle models loaded from direct fetch:', modelsData.length)
              }
            } else {
              console.warn('[AdminVehicleAdd] Direct fetch returned status:', response.status)
            }
          } catch (fetchErr) {
            console.warn('[AdminVehicleAdd] Direct fetch failed:', fetchErr)
          }
        }
        
        // Fallback: Use default models if all methods fail
        if (!modelsFetched) {
          console.warn('[AdminVehicleAdd] All methods failed, using default models')
          setVehicleModels([
            { id: 1, name: 'VinFast VF e34', model: 'VF e34' },
            { id: 2, name: 'VinFast VF 8', model: 'VF 8' },
            { id: 3, name: 'VinFast VF 9', model: 'VF 9' },
            { id: 4, name: 'Tesla Model 3', model: 'Model 3' },
            { id: 5, name: 'Tesla Model Y', model: 'Model Y' }
          ])
        }
      } catch (err) {
        console.error('[AdminVehicleAdd] Error fetching options:', err)
        setError('Không thể tải dữ liệu dropdown')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'vehicleModelId' || name === 'stationId' || name === 'odo' 
        ? (Number(value) || (name === 'odo' ? 0 : '')) 
        : value
    }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('[AdminVehicleAdd] No file selected')
      return
    }

    console.log('[AdminVehicleAdd] File selected:', file.name, file.type, file.size)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Clear previous error
    setError(null)

    // Preview image FIRST (immediately, before upload) - THIS MUST WORK
    const reader = new FileReader()
    
    // Set up FileReader event handlers
    reader.onloadend = () => {
      if (reader.result) {
        console.log('[AdminVehicleAdd] Image preview loaded successfully')
        setImagePreview(reader.result)
      } else {
        console.error('[AdminVehicleAdd] FileReader result is empty')
        setError('Không thể đọc file ảnh. Vui lòng chọn file khác.')
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    
    reader.onerror = () => {
      console.error('[AdminVehicleAdd] FileReader error:', reader.error)
      setError('Không thể đọc file ảnh. Vui lòng chọn file khác.')
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    
    reader.onabort = () => {
      console.warn('[AdminVehicleAdd] FileReader aborted')
      setError('Đọc file ảnh bị hủy. Vui lòng thử lại.')
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    
    // Start reading file
    try {
      reader.readAsDataURL(file)
      console.log('[AdminVehicleAdd] FileReader started')
    } catch (readErr) {
      console.error('[AdminVehicleAdd] Error starting FileReader:', readErr)
      setError('Không thể đọc file ảnh. Vui lòng thử lại.')
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Upload image to server (in background, after preview is loaded)
    // Don't wait for preview - just start upload immediately
    setUploadingImage(true)
    
    uploadVehicleImage(file)
      .then((filename) => {
        console.log('[AdminVehicleAdd] Image uploaded successfully:', filename)
        
        // Update form data with uploaded filename
        setFormData(prev => ({
          ...prev,
          picture: filename
        }))
      })
      .catch((err) => {
        console.error('[AdminVehicleAdd] Error uploading image:', err)
        
        // Use filename as fallback if upload fails (preserve extension)
        const lastDot = file.name.lastIndexOf('.')
        const ext = lastDot > 0 ? file.name.substring(lastDot) : ''
        const nameWithoutExt = lastDot > 0 ? file.name.substring(0, lastDot) : file.name
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9._-]/g, '_')
        const fallbackFilename = sanitizedName + ext
        console.warn('[AdminVehicleAdd] Using fallback filename:', fallbackFilename)
        
        setFormData(prev => ({
          ...prev,
          picture: fallbackFilename
        }))
        
        // Show warning but don't block - preview is already shown
        // Only show error if it's not a CORS/404 issue (these are expected if backend not configured)
        const isCORSor404 = err.message?.includes('CORS') || 
                           err.code?.includes('CORS') ||
                           err.code === 'ERR_NETWORK' ||
                           err.response?.status === 404 ||
                           err.response?.status === 405
                           
        if (!isCORSor404 && err.response?.status !== 500) {
          // Only show error for unexpected errors, not CORS/404/500
          const errorMessage = err.userMessage || 
                              err.response?.data?.message || 
                              `Không thể upload ảnh lên server. Ảnh vẫn có thể được hiển thị tạm thời với tên: ${fallbackFilename}`
          setError(errorMessage)
        } else {
          // CORS or 404/500 - this is expected if endpoint not available, just log
          console.info('[AdminVehicleAdd] Upload endpoint not available (CORS/404/500), using filename:', fallbackFilename)
        }
      })
      .finally(() => {
        setUploadingImage(false)
      })
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
        return status
    }
  }

  const validateForm = () => {
    if (!formData.licensePlate || formData.licensePlate.trim() === '') {
      setError('Biển số không được để trống')
      return false
    }
    
    if (!formData.vehicleModelId || formData.vehicleModelId <= 0) {
      setError('Vui lòng chọn model xe')
      return false
    }
    
    if (!formData.stationId || formData.stationId <= 0) {
      setError('Vui lòng chọn trạm')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      // Prepare data for API
      const vehicleData = {
        licensePlate: formData.licensePlate.trim(),
        vehicleModelId: Number(formData.vehicleModelId),
        stationId: Number(formData.stationId),
        color: formData.color || '',
        batteryCapacity: formData.batteryCapacity || '',
        odo: Number(formData.odo) || 0,
        picture: formData.picture || '',
        status: formData.status || 'AVAILABLE'
      }
      
      console.log('[AdminVehicleAdd] Submitting vehicle data:', vehicleData)
      
      const result = await createVehicle(vehicleData)
      
      console.log('[AdminVehicleAdd] Vehicle created successfully:', result)
      
      setSuccess(true)
      
      // Dispatch event để refresh stats
      window.dispatchEvent(new CustomEvent('vehicleDeleted'))
      
      // Navigate về danh sách sau 1.5s
      setTimeout(() => {
        navigate('/admin/vehicles')
      }, 1500)
    } catch (err) {
      console.error('Error creating vehicle:', err)
      const errorMessage = err.userMessage || 
                          err.response?.data?.message || 
                          err.message || 
                          'Không thể tạo xe mới'
      setError(errorMessage)
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
        <button onClick={() => navigate('/admin/vehicles')} className="breadcrumb-link">
          Quản lý xe
        </button>
        <i className="fas fa-chevron-right"></i>
        <span>Thêm xe mới</span>
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
            <h1 className="vehicle-detail-title">Thêm xe mới</h1>
            <p className="vehicle-detail-subtitle">
              Điền thông tin để thêm xe điện vào hệ thống
            </p>
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

      {/* Success Message */}
      {success && (
        <div className="vehicle-detail-alert vehicle-detail-alert--success">
          <i className="fas fa-check-circle"></i>
          <span>Thêm xe thành công! Đang chuyển hướng...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="vehicle-detail-alert vehicle-detail-alert--error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="vehicle-detail-content">
        <div className="vehicle-info-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="vehicle-info-card-header">
            <i className="fas fa-car"></i>
            <h2 className="vehicle-info-card-title">Thông tin xe</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="vehicle-add-form">
            <div className="vehicle-info-card-body">
              <div className="vehicle-info-row">
                {/* License Plate */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-id-card"></i>
                    Biển số <span style={{ color: 'red' }}>*</span>
                  </span>
                  <input
                    type="text"
                    name="licensePlate"
                    className="vehicle-info-input"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    placeholder="Ví dụ: 51A-12345"
                    required
                  />
                </div>

                {/* Status */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-circle"></i>
                    Trạng thái <span style={{ color: 'red' }}>*</span>
                  </span>
                  <select
                    name="status"
                    className="vehicle-info-select"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="AVAILABLE">Khả dụng</option>
                    <option value="FIXING">Bảo trì</option>
                    <option value="MAINTENANCE">Bảo dưỡng</option>
                  </select>
                </div>
              </div>

              <div className="vehicle-info-row">
                {/* Vehicle Model */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-car-side"></i>
                    Model xe <span style={{ color: 'red' }}>*</span>
                  </span>
                  <select
                    name="vehicleModelId"
                    className="vehicle-info-select"
                    value={formData.vehicleModelId}
                    onChange={handleChange}
                    required
                    disabled={loadingOptions}
                  >
                    <option value="">-- Chọn model --</option>
                    {vehicleModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name || model.model || `Model ${model.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Station */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-map-marker-alt"></i>
                    Trạm <span style={{ color: 'red' }}>*</span>
                  </span>
                  <select
                    name="stationId"
                    className="vehicle-info-select"
                    value={formData.stationId}
                    onChange={handleChange}
                    required
                    disabled={loadingOptions}
                  >
                    <option value="">-- Chọn trạm --</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="vehicle-info-row">
                {/* Color */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-palette"></i>
                    Màu sắc
                  </span>
                  <input
                    type="text"
                    name="color"
                    className="vehicle-info-input"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Ví dụ: Đen, Trắng, Xám"
                  />
                </div>

                {/* Battery Capacity */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-battery-three-quarters"></i>
                    Dung lượng pin
                  </span>
                  <input
                    type="text"
                    name="batteryCapacity"
                    className="vehicle-info-input"
                    value={formData.batteryCapacity}
                    onChange={handleChange}
                    placeholder="Ví dụ: 42 kWh"
                  />
                </div>
              </div>

              <div className="vehicle-info-row">
                {/* ODO */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-tachometer-alt"></i>
                    Số km
                  </span>
                  <input
                    type="number"
                    name="odo"
                    className="vehicle-info-input"
                    value={formData.odo}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Image Upload Card */}
              <div className="vehicle-info-item vehicle-info-item--full">
                <span className="vehicle-info-label">
                  <i className="fas fa-image"></i>
                  Ảnh xe
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
                    {formData.status && (
                      <div className="vehicle-image-upload-overlay">
                        <span className={`vehicle-image-upload-badge ${getStatusBadgeClass(formData.status)}`}>
                          <i className="fas fa-circle"></i>
                          {getStatusLabel(formData.status)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="vehicle-image-upload-actions">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      onClick={(e) => {
                        // Reset value to allow selecting the same file again
                        e.target.value = ''
                      }}
                      className="vehicle-image-upload-input"
                      id="vehicle-image-upload-input"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="vehicle-image-upload-input"
                      className={`vehicle-image-upload-btn vehicle-image-upload-btn--upload ${uploadingImage ? 'uploading' : ''}`}
                      style={{ cursor: uploadingImage ? 'wait' : 'pointer' }}
                    >
                      {uploadingImage ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Đang upload...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>{imagePreview ? 'Thay đổi ảnh' : 'Thêm ảnh'}</span>
                        </>
                      )}
                    </label>
                    
                    {imagePreview && (
                      <button
                        type="button"
                        className="vehicle-image-upload-btn vehicle-image-upload-btn--remove"
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                      >
                        <i className="fas fa-trash"></i>
                        <span>Gỡ ảnh</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="vehicle-add-form-actions">
              <button
                type="button"
                className="vehicle-detail-action-btn vehicle-detail-action-btn--secondary"
                onClick={() => navigate('/admin/vehicles')}
                disabled={saving}
              >
                <i className="fas fa-times"></i>
                <span>Hủy</span>
              </button>
              <button
                type="submit"
                className="vehicle-detail-action-btn vehicle-detail-action-btn--primary"
                disabled={saving || loadingOptions}
              >
                <i className="fas fa-plus-circle"></i>
                <span>{saving ? 'Đang thêm...' : 'Thêm xe'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default AdminVehicleAdd

