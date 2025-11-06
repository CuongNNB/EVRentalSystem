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
  const [pictureFile, setPictureFile] = useState(null)
  const fileInputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)

  const BACKEND_BASE_URL = 'http://localhost:8084/EVRentalSystem'

  const [vehicleModels, setVehicleModels] = useState([
    { id: 1, model: 'VinFast VF e34' },
    { id: 2, model: 'VinFast VF 8' },
    { id: 3, model: 'Tesla Model 3' },
    { id: 4, model: 'VinFast VF 5 Plus' },
    { id: 5, model: 'VinFast VF 9' },
    { id: 6, model: 'Tesla Model Y' },
    { id: 7, model: 'Tesla Model X' },
    { id: 8, model: 'Hyundai IONIQ 5' },
    { id: 9, model: 'Kia EV6' },
    { id: 10, model: 'Nissan Leaf' },
    { id: 11, model: 'BMW i4 eDrive40' },
    { id: 12, model: 'Mercedes-Benz EQE 300' },
    { id: 13, model: 'Porsche Taycan 4S' }
  ])

  const [stationOptions, setStationOptions] = useState([
    { id: 1, station_name: 'Cho thuê Xe điện VinFast - Thảo Điền' },
    { id: 2, station_name: 'Cho thuê Xe điện VinFast - Tân Cảng' },
    { id: 3, station_name: 'Cho thuê Xe điện VinFast - Quận 1' },
    { id: 4, station_name: 'Cho thuê Xe điện VinFast - Quận 7' },
    { id: 5, station_name: 'Cho thuê Xe điện VinFast - Gò Vấp' },
    { id: 6, station_name: 'Cho thuê Xe điện VinFast - Bình Tân' },
    { id: 7, station_name: 'Cho thuê Xe điện VinFast - Phú Nhuận' }
  ])

  // Form state
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    // thêm dòng này:
    vehicleModelId: null,
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
          const resp = await fetch(`${BACKEND_BASE_URL}/vehicle-management/details/${id}`)
          if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`)
          }
          const data = await resp.json()

          // nếu URL có param 'r' (cache-buster) thì thêm vào detailPicture để bust cache sau reload
          const urlParams = new URLSearchParams(window.location.search)
          const cacheParam = urlParams.get('r')
          if (cacheParam && data?.detailPicture) {
            const base = String(data.detailPicture).trim()
            data.detailPicture = `${base}${base.includes('?') ? '&' : '?'}t=${cacheParam}`
          }

          setVehicle(data)
          setFormData(prev => ({
            ...prev,
            licensePlate: data.licensePlate || '',
            brand: data.brand || '',
            model: data.model || '',
            status: data.status || 'AVAILABLE',
            odo: data.odo ?? 0,
            stationId: data.stationId ?? null,
            stationName: data.stationName || '',
            // map new fields:
            batteryCapacity: data.batteryCapacity || '',
            color: data.color || '',
            vehicleModelId: data.modelId ?? null,
            detailId: data.detailId ?? null,
            detailPicture: data.detailPicture || prev.detailPicture || ''
          }))

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
              // Khi fetch detail thành công, trong setFormData(...)
              setFormData({
                licensePlate: data.licensePlate || '',
                brand: data.brand || '',
                model: data.model || '',
                vehicleModelId: data.modelId ?? null,   // <-- thêm mapping
                status: data.status || 'AVAILABLE',
                odo: data.odo ?? 0,
                stationId: data.stationId ?? null,      // <-- thêm mapping
                stationName: data.stationName || '',
                picture: data.detailPicture || data.picture || ''
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

    // ƯU TIÊN: Nếu API trả detailPicture (full URL) thì dùng luôn
    if (v.detailPicture && String(v.detailPicture).trim() !== '') {
      return String(v.detailPicture).trim()
    }

    // fallback logic như cũ
    const picture = v.picture
    const vehicleId = v.vehicleId ?? v.id ?? v.detailId

    if (picture && picture !== '' && picture !== 'null') {
      const picStr = String(picture).trim()
      const hasExtension = picStr.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      const backendSrc = hasExtension
        ? `${BACKEND_BASE_URL}/carpic/${picStr}`
        : `${BACKEND_BASE_URL}/carpic/${picStr}.jpg`
      return backendSrc
    }

    if (vehicleId) {
      return `${BACKEND_BASE_URL}/carpic/${vehicleId}.jpg`
    }

    return '/carpic/default.jpg'
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSuccess(false)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)

    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        // map các field khác bạn cần giữ lại
        status: vehicle.status || 'AVAILABLE',
        odo: vehicle.odo || 0,
        stationId: vehicle.stationId ?? null,
        stationName: vehicle.stationName || '',
        // đảm bảo picture & detailPicture lấy từ vehicle (server)
        picture: vehicle.detailPicture || vehicle.picture || '',
        detailPicture: vehicle.detailPicture || ''
      })
    } else {
      // nếu không có vehicle, reset cơ bản
      setFormData(prev => ({
        ...prev,
        licensePlate: '',
        brand: '',
        model: '',
        picture: '',
        detailPicture: ''
      }))
    }

    // reset preview / file
    setImagePreview(null)
    setPictureFile(null)

    // reset actual file input element so user có thể re-upload cùng file nếu cần
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // clear possible messages / errors
    setError(null)
    setSuccess(false)
  }


  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Chọn detailId để đính vào URL: ưu tiên formData.detailId nếu backend trả, fallback id từ route
      const detailId = formData.detailId ?? id
      if (!detailId) {
        throw new Error('Không xác định detailId để cập nhật.')
      }

      // Build FormData theo API backend yêu cầu
      const form = new FormData()
      form.append('licensePlate', formData.licensePlate ?? '')
      // backend expects batteryCapacity string (e.g. "42 kWh")
      form.append('batteryCapacity', formData.batteryCapacity ?? '')
      form.append('odo', String(formData.odo ?? 0))
      form.append('color', formData.color ?? '')
      // stationId (nếu backend require, xử lý tương tự)
      if (formData.stationId != null && formData.stationId !== '') {
        form.append('stationId', String(formData.stationId))
      }

      // vehicleModelId: kiểm tra hợp lệ trước khi append
      const vehicleModelIdToSend = formData.vehicleModelId ?? vehicle?.modelId ?? null
      if (vehicleModelIdToSend == null) {
        // Nếu backend yêu cầu trường này bắt buộc, thông báo cho user
        setError('Vui lòng chọn Model xe trước khi lưu.')
        setSaving(false)
        return
      }
      form.append('vehicleModelId', String(vehicleModelIdToSend))


      // picture must be a MultipartFile — attach File object if user selected one
      if (pictureFile) {
        form.append('picture', pictureFile, pictureFile.name)
      } else {
        // If no new file chosen, backend might accept empty or you may skip attaching it.
        // To be safe, do not append picture if no file selected.
      }

      const url = `${BACKEND_BASE_URL}/vehicle-management/update-vehicle/${detailId}`

      const resp = await fetch(url, {
        method: 'PUT',
        body: form // DO NOT set Content-Type header; browser will add boundary
      })

      const respBody = await resp.json().catch(() => ({}))

      if (!resp.ok) {
        // lấy message hợp lý từ response nếu có
        const serverMsg = respBody?.message || respBody?.error || `HTTP ${resp.status}`
        throw new Error(serverMsg)
      }

      // Nếu success, reload lại detail từ backend để sync (gọi endpoint detail bạn đã dùng)
      // --- sau khi gửi PUT và trước khi setVehicle ---
      const updatedResp = await fetch(`${BACKEND_BASE_URL}/vehicle-management/details/${detailId}`)

      if (updatedResp.ok) {
        const updatedDataRaw = await updatedResp.json().catch(() => null)
        if (updatedDataRaw) {
          // thêm timestamp để bust cache (nếu backend trả URL cố định)
          if (updatedDataRaw.detailPicture && String(updatedDataRaw.detailPicture).trim() !== '') {
            const base = String(updatedDataRaw.detailPicture).trim()
            updatedDataRaw.detailPicture = `${base}${base.includes('?') ? '&' : '?'}t=${Date.now()}`
          }

          // cập nhật state với URL đã thêm timestamp
          setVehicle(updatedDataRaw)

          setFormData(prev => ({
            ...prev,
            licensePlate: updatedDataRaw.licensePlate || prev.licensePlate,
            brand: updatedDataRaw.brand || prev.brand,
            model: updatedDataRaw.model || prev.model,
            vehicleModelId: updatedDataRaw.modelId ?? prev.vehicleModelId,
            batteryCapacity: updatedDataRaw.batteryCapacity ?? prev.batteryCapacity,
            color: updatedDataRaw.color ?? prev.color,
            odo: updatedDataRaw.odo ?? prev.odo,
            stationId: updatedDataRaw.stationId ?? prev.stationId,
            stationName: updatedDataRaw.stationName ?? prev.stationName,
            picture: updatedDataRaw.detailPicture || updatedDataRaw.picture || prev.picture,
            detailId: updatedDataRaw.detailId ?? prev.detailId,
            detailPicture: updatedDataRaw.detailPicture || prev.detailPicture
          }))
        }
      } else {
        console.warn('Failed to reload updated vehicle details', updatedResp.status)
      }
      // Hiển thị thông báo "Cập nhật thành công"
      setSuccess(true)
      setIsEditing(false)
      setImagePreview(null)
      setPictureFile(null)

      // Sau 3 giây (3000ms) thì reload trang kèm cache-buster để lấy ảnh mới
      setTimeout(() => {
        const ts = Date.now()
        const basePath = window.location.pathname
        window.location.replace(`${basePath}?r=${ts}`)
      }, 1000)

    } catch (err) {
      console.error('Error updating vehicle:', err)
      const errorMessage = err?.message || 'Không thể cập nhật thông tin xe'
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
    if (!file) return

    // validate kích thước / loại nếu cần (bạn có sẵn logic này)
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result
      setImagePreview(dataUrl) // ưu tiên hiển thị preview
      setFormData(prev => ({ ...prev, detailPicture: dataUrl, picture: file.name }))
    }
    reader.readAsDataURL(file)

    // lưu File để send multipart later
    setPictureFile(file)
  }
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      detailPicture: '',
      picture: ''
    }))
    setImagePreview(null)
    setPictureFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => {
      // Nếu là trường số (vehicleModelId, stationId, odo)
      if (name === 'vehicleModelId' || name === 'stationId' || name === 'odo') {
        // Nếu user chọn option rỗng -> lưu null (không lưu chuỗi rỗng)
        if (value === '' || value == null) {
          return { ...prev, [name]: null }
        }
        // else parse số (Number('123') -> 123)
        const parsed = Number(value)
        return { ...prev, [name]: Number.isNaN(parsed) ? null : parsed }
      }

      // default: giữ string
      return { ...prev, [name]: value }
    })
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
  const imageSrc = imagePreview || (currentVehicle?.detailPicture ? String(currentVehicle.detailPicture).trim() : getImageSrc(currentVehicle))

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
                  className="vehicle-detail-action-btn vehicle-detail-action-btn--primary vehicle-detail-action-btn--edit"
                  onClick={handleEdit}
                >
                  <i className="fas fa-edit"></i>
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  className="vehicle-detail-action-btn vehicle-detail-action-btn--warning"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <i className="fas fa-trash"></i>
                  <span>Xóa xe</span>
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
                  className='vehicle-detail-image'
                  // ưu tiên preview khi upload, sau đó lấy từ vehicle.detailPicture (nếu có) -> cuối cùng fallback default
                  src={
                    imagePreview
                      ? imagePreview
                      : (vehicle?.detailPicture && String(vehicle.detailPicture).trim() !== '' ? vehicle.detailPicture : '/carpic/1.jpg')
                  }
                  alt={formData.modelName || `${vehicle?.brand || ''} ${vehicle?.model || ''}`.trim() || 'Vehicle image'}
                  // đặt key bằng vehicle.detailPicture để đảm bảo React remount khi URL backend thay đổi (cache-bust xử lý riêng)
                  key={vehicle?.detailPicture || 'vehicle-image'}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/carpic/1.jpg'
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
                        <span className={`vehicle-info-value ${getStatusBadgeClass(currentVehicle.status)}`}>
                          {getStatusLabel(currentVehicle.status)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="vehicle-info-row">
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-car-side"></i>
                        Model xe
                      </span>

                      {isEditing ? (
                        <select
                          name="vehicleModelId"
                          className="vehicle-info-select"
                          value={formData.vehicleModelId ?? ''}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Chọn model</option>
                          {vehicleModels.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.model}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="vehicle-info-value">
                          {/* hiển thị brand + model nếu có, ưu tiên formData nếu đã map */}
                          {formData.vehicleModelId
                            ? (vehicleModels.find(x => String(x.id) === String(formData.vehicleModelId))?.model
                              || `${formData.brand || ''}${formData.brand && formData.model ? ' ' : ''}${formData.model || ''}`)
                            : `${currentVehicle.brand || ''}${currentVehicle.brand && currentVehicle.model ? ' ' : ''}${currentVehicle.model || ''}`.trim() || 'N/A'}
                        </span>
                      )}
                    </div>
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
                  </div>
                  <div className="vehicle-info-row">
                    {/* Battery Capacity */}
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-battery-full"></i>
                        Dung lượng pin
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="batteryCapacity"
                          className="vehicle-info-input"
                          value={formData.batteryCapacity}
                          onChange={handleChange}
                          placeholder="ví dụ: 42 kWh"
                        />
                      ) : (
                        <span className="vehicle-info-value">{currentVehicle.batteryCapacity ?? formData.batteryCapacity ?? 'N/A'}</span>
                      )}
                    </div>

                    {/* Color */}
                    <div className="vehicle-info-item">
                      <span className="vehicle-info-label">
                        <i className="fas fa-palette"></i>
                        Màu
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="color"
                          className="vehicle-info-input"
                          value={formData.color}
                          onChange={handleChange}
                          placeholder="ví dụ: Trắng"
                        />
                      ) : (
                        <span className="vehicle-info-value">{currentVehicle.color ?? formData.color ?? 'N/A'}</span>
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
                        <select
                          name="stationId"
                          className="vehicle-info-select"
                          value={formData.stationId ?? ''}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Chọn trạm</option>
                          {stationOptions.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.station_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="vehicle-info-value">{currentVehicle.stationName ?? 'N/A'}</span>
                      )}

                    </div>
                  </div>
                  <div className="vehicle-info-row">
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
