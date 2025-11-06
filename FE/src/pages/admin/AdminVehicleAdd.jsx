import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { uploadVehicleImage, getVehicleModels } from '../../api/adminVehicles'
import { getStationOptions } from '../../api/adminDashboard'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './VehicleManagement.css'
import './AdminVehicleDetail.css'
import './AdminVehicleAdd.css'


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
  const { detailId } = useParams()

  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleModelId: '',
    stationId: '',
    color: '',
    batteryCapacity: '',
    odo: "",
    picture: '',
    status: 'AVAILABLE'
  })

  const [pictureFile, setPictureFile] = useState(null)

  const handleBatteryCapacityChange = (e) => {
    // Lấy raw value
    let val = e.target.value;

    // Loại bỏ mọi ký tự không phải số hoặc dấu chấm
    // Nếu bạn chỉ muốn số nguyên, dùng /[^0-9]/g
    val = val.replace(/[^0-9.]/g, '');

    // Chỉ cho 1 dấu chấm duy nhất
    if ((val.match(/\./g) || []).length > 1) {
      const first = val.indexOf('.');
      val = val.slice(0, first + 1) + val.slice(first + 1).replace(/\./g, '');
    }

    // Nếu bắt đầu bằng "0" tiếp ký tự khác ngoài ".", có thể trim leading zeros (tùy ý)
    // val = val.replace(/^0+(\d)/, '$1');

    setFormData(prev => ({ ...prev, batteryCapacity: val }));
  };

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
    if (!file) return
    // validate type & size as you had
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result) {
        setImagePreview(reader.result)
      } else {
        setError('Không thể đọc file ảnh.')
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)

    // save file object for multipart submit
    setPictureFile(file)

    // optional: keep filename in formData.picture for compatibility
    setFormData(prev => ({ ...prev, picture: file.name }))
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, picture: '' }))
    setImagePreview(null)
    setPictureFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
    if (!validateForm()) return
    try {
      setSaving(true); setError(null); setSuccess(false)

      const form = new FormData()
      form.append('licensePlate', formData.licensePlate.trim())
      form.append('batteryCapacity', formData.batteryCapacity ? `${formData.batteryCapacity} kWh` : '')
      form.append('odo', String(Number(formData.odo) || 0))
      form.append('color', formData.color || '')
      form.append('vehicleModelId', String(Number(formData.vehicleModelId) || ''))
      form.append('stationId', String(Number(formData.stationId) || ''))

      if (pictureFile) {
        form.append('picture', pictureFile, pictureFile.name)
      } else if (formData.picture) {
        form.append('picture', formData.picture)
      }

      const effectiveDetailId = detailId || formData.vehicleModelId || ''
      const url = `http://localhost:8084/EVRentalSystem/vehicle-management/create-vehicle`

      const resp = await fetch(url, {
        method: 'POST',
        body: form
      })

      const respBody = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        const serverMsg = respBody?.message || respBody?.error || `Lỗi server: ${resp.status}`
        setError(serverMsg)
        return
      }
      setSuccess(true)
      setError(null)
      window.dispatchEvent(new CustomEvent('vehicleDeleted'))
      setTimeout(() => navigate('/admin/vehicles'), 1500)
    } catch (err) {
      setError(err?.message || 'Không thể tạo xe mới')
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
                    placeholder="Nhập biển số"
                    required
                  />
                </div>
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
                    <option value="">Chọn model</option>
                    {vehicleModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name || model.model || `Model ${model.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="vehicle-info-row">
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
                    <option value="">Chọn trạm</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-palette"></i>
                    Màu của xe
                  </span>
                  <input
                    type="text"
                    name="color"
                    className="vehicle-info-input"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Nhập màu cho xe"
                  />
                </div>
              </div>

              <div className="vehicle-info-row">


                {/* Battery Capacity */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-battery-three-quarters"></i>
                    Dung lượng pin (kWh)
                  </span>
                  <input
                    type="text"
                    name="batteryCapacity"
                    className="vehicle-info-input"
                    value={formData.batteryCapacity}
                    pattern="[0-9]*"
                    onChange={handleBatteryCapacityChange}
                    placeholder="Nhập số dung lượng pin"
                  />
                </div>
                {/* ODO */}
                <div className="vehicle-info-item">
                  <span className="vehicle-info-label">
                    <i className="fas fa-tachometer-alt"></i>
                    Số km
                  </span>
                  <input
                    type="text"
                    name="odo"
                    className="vehicle-info-input"
                    value={formData.odo}
                    pattern="[0-9]*"
                    onChange={handleChange}
                    placeholder='Nhập số odo'
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

