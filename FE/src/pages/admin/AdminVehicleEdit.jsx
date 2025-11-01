import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVehicleById, updateVehicle } from '../../api/adminVehicles'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './VehicleManagement.css'

const AdminVehicleEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    status: '',
    odo: 0,
    stationId: null,
    picture: ''
  })

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getVehicleById(id)
        setVehicle(data)
        setFormData({
          licensePlate: data.licensePlate || '',
          brand: data.brand || '',
          model: data.model || '',
          status: data.status || 'AVAILABLE',
          odo: data.odo || 0,
          stationId: data.stationId || null,
          picture: data.picture || ''
        })
      } catch (err) {
        console.error('Error fetching vehicle:', err)
        setError(err.message || 'Không thể tải thông tin xe')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVehicle()
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      await updateVehicle(id, formData)
      
      setSuccess(true)
      setTimeout(() => {
        navigate(`/admin/vehicles/${id}`)
      }, 1000)
    } catch (err) {
      console.error('Error updating vehicle:', err)
      setError(err.message || 'Không thể cập nhật thông tin xe')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'odo' || name === 'stationId' ? Number(value) || 0 : value
    }))
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="admin-page-header">
          <div className="admin-page-loading">Đang tải...</div>
        </div>
      </ErrorBoundary>
    )
  }

  if (!vehicle) {
    return (
      <ErrorBoundary>
        <div className="admin-page-header">
          <div className="admin-page-error">
            <p>Không tìm thấy xe</p>
            <button onClick={() => navigate('/admin/vehicles')}>Quay lại danh sách</button>
          </div>
        </div>
      </ErrorBoundary>
    )
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
        <button onClick={() => navigate(`/admin/vehicles/${id}`)} className="breadcrumb-link">
          Chi tiết xe
        </button>
        <i className="fas fa-chevron-right"></i>
        <span>Chỉnh sửa</span>
      </div>

      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <i className="fas fa-edit"></i>
          </div>
          <div className="admin-page-title-group">
            <h1 className="admin-page-title">Chỉnh sửa xe điện</h1>
            <p className="admin-page-subtitle">{vehicle.brand} {vehicle.model}</p>
          </div>
        </div>
        <div className="admin-page-header-right">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={() => navigate(`/admin/vehicles/${id}`)}
          >
            <i className="fas fa-arrow-left"></i> Hủy
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="vehicle-edit-container">
        {error && (
          <div className="admin-alert admin-alert--error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="admin-alert admin-alert--success">
            <i className="fas fa-check-circle"></i>
            Cập nhật thành công! Đang chuyển hướng...
          </div>
        )}

        <form onSubmit={handleSubmit} className="vehicle-edit-form">
          <div className="vehicle-edit-form-grid">
            <div className="vehicle-edit-form-group">
              <label htmlFor="licensePlate">Biển số</label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vehicle-edit-form-group">
              <label htmlFor="brand">Hãng</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vehicle-edit-form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="vehicle-edit-form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="AVAILABLE">Khả dụng</option>
                <option value="RENTED">Đang thuê</option>
                <option value="FIXING">Bảo trì</option>
                <option value="MAINTENANCE">Bảo dưỡng</option>
              </select>
            </div>

            <div className="vehicle-edit-form-group">
              <label htmlFor="odo">Số km</label>
              <input
                type="number"
                id="odo"
                name="odo"
                value={formData.odo}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="vehicle-edit-form-group">
              <label htmlFor="stationId">Station ID</label>
              <input
                type="number"
                id="stationId"
                name="stationId"
                value={formData.stationId || ''}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="vehicle-edit-form-group vehicle-edit-form-group--full">
              <label htmlFor="picture">Tên file ảnh</label>
              <input
                type="text"
                id="picture"
                name="picture"
                value={formData.picture}
                onChange={handleChange}
                placeholder="ví dụ: 1.jpg hoặc 1"
              />
            </div>
          </div>

          <div className="vehicle-edit-form-actions">
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => navigate(`/admin/vehicles/${id}`)}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  )
}

export default AdminVehicleEdit

