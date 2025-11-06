import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './VehicleManagement.css'
import './AdminVehicleDetail.css'

const AdminUpdateModel = () => {
    const navigate = useNavigate()
    const params = useParams()
    const modelIdParam = params.modellId ?? params.modelId ?? params.id
    const BACKEND_BASE_URL = 'http://localhost:8084/EVRentalSystem'
    const fileInputRef = useRef(null)

    // --- STATE ---
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const [formData, setFormData] = useState({
        modelId: '',
        brand: '',
        model: '',
        price: '',
        seats: '',
        modelPicture: ''
    })

    const [imagePreview, setImagePreview] = useState(null)
    const [pictureFile, setPictureFile] = useState(null)

    // --- FETCH MODEL DETAIL ---
    useEffect(() => {
        const fetchModelDetail = async () => {
            try {
                setLoading(true)
                const resp = await fetch(`${BACKEND_BASE_URL}/vehicle-management/models/${modelIdParam}`)
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
                const data = await resp.json()
                setFormData({
                    modelId: data.modelId,
                    brand: data.brand ?? '',
                    model: data.model ?? '',
                    price: data.price != null ? String(data.price) : '',
                    seats: data.seats != null ? String(data.seats) : '',
                    modelPicture: data.modelPicture ?? ''
                })
                if (data.modelPicture) setImagePreview(String(data.modelPicture))
                else setImagePreview(null)
            } catch (err) {
                setError('Không thể tải thông tin model.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchModelDetail()
    }, [modelIdParam])

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh hợp lệ.')
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)
        setPictureFile(file)
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        setPictureFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleToggleEdit = () => {
        setIsEditing(!isEditing)
        setError(null)
        setSuccess(false)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setError(null)
        setPictureFile(null)
    }

    const validate = () => {
        if (!formData.brand || !formData.model) {
            setError('Vui lòng nhập đầy đủ thông tin.')
            return false
        }
        if (!formData.price || isNaN(Number(formData.price))) {
            setError('Giá không hợp lệ.')
            return false
        }
        if (!formData.seats || Number(formData.seats) <= 0) {
            setError('Số chỗ phải lớn hơn 0.')
            return false
        }
        return true
    }

    const handleSave = async () => {
        if (!validate()) return
        try {
            setSaving(true)
            const form = new FormData()
            form.append('brand', formData.brand.trim())
            form.append('model', formData.model.trim())
            form.append('price', String(Number(formData.price)))
            form.append('seats', String(Number(formData.seats)))
            if (pictureFile) form.append('modelPicture', pictureFile, pictureFile.name)

            const resp = await fetch(`${BACKEND_BASE_URL}/vehicle-management/update-model/${modelIdParam}`, {
                method: 'PUT',
                body: form
            })
            const body = await resp.json().catch(() => ({}))
            if (!resp.ok) throw new Error(body?.message || `HTTP ${resp.status}`)

            setSuccess(true)
            setIsEditing(false)
            setError(null)

            // refresh image
            const reload = await fetch(`${BACKEND_BASE_URL}/vehicle-management/models/${modelIdParam}`)
            if (reload.ok) {
                const updated = await reload.json()
                setFormData({
                    modelId: updated.modelId,
                    brand: updated.brand,
                    model: updated.model,
                    price: updated.price,
                    seats: updated.seats,
                    modelPicture: updated.modelPicture
                })
                if (updated.modelPicture) setImagePreview(`${updated.modelPicture}?t=${Date.now()}`)
            }
        } catch (err) {
            setError(err.message || 'Cập nhật model thất bại.')
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    // --- RENDER ---
    if (loading) {
        return (
            <ErrorBoundary>
                <div className="vehicle-detail-loading">
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: 36, color: '#06b6d4' }}></i>
                    <p>Đang tải thông tin model...</p>
                </div>
            </ErrorBoundary>
        )
    }

    return (
        <ErrorBoundary>
            <div className="vehicle-detail-page">
                {/* Breadcrumb */}
                <div className="admin-breadcrumb">
                    <i className="fas fa-home"></i>
                    <span>Quản trị</span>
                    <i className="fas fa-chevron-right"></i>
                    <button onClick={() => navigate('/admin/vehicles')} className="breadcrumb-link">Quản lý xe</button>
                    <i className="fas fa-chevron-right"></i>
                    <span>Chi tiết model #{modelIdParam}</span>
                </div>

                {/* Header */}
                <div className="vehicle-detail-header">
                    <div className="vehicle-detail-header-left">
                        <button className="vehicle-detail-back-btn" onClick={() => navigate('/admin/vehicles')}>
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className="vehicle-detail-title-group">
                            <h1 className="vehicle-detail-title">Chi tiết model</h1>
                            <p className="vehicle-detail-subtitle">Xem và chỉnh sửa thông tin model xe</p>
                        </div>
                    </div>

                    <div className="vehicle-detail-header-right">
                        {isEditing ? (
                            <>
                                <button
                                    className="vehicle-detail-action-btn vehicle-detail-action-btn--secondary"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                >
                                    <i className="fas fa-times"></i>
                                    <span>Hủy chỉnh sửa</span>
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
                        ) : (
                            <button
                                className="vehicle-detail-action-btn vehicle-detail-action-btn--primary"
                                onClick={handleToggleEdit}
                            >
                                <i className="fas fa-edit"></i>
                                <span>Chỉnh sửa</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Alert */}
                {success && (
                    <div className="vehicle-detail-alert vehicle-detail-alert--success">
                        <i className="fas fa-check-circle"></i>
                        <span>Cập nhật model thành công!</span>
                    </div>
                )}
                {error && (
                    <div className="vehicle-detail-alert vehicle-detail-alert--error">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Content */}
                <div className="vehicle-detail-content">
                    <div className="vehicle-detail-layout">
                        {/* Left - Image */}
                        <div className="vehicle-detail-image-card">
                            <div className="vehicle-detail-image-container">
                                <img
                                    className="vehicle-detail-image"
                                    src={imagePreview || formData.modelPicture || '/carpic/default.jpg'}
                                    alt="Model"
                                    onError={(e) => { e.target.src = '/carpic/default.jpg' }}
                                />
                            </div>
                            {isEditing && (
                                <div className="vehicle-detail-image-actions">
                                    <input
                                        ref={fileInputRef}
                                        id="model-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="vehicle-detail-file-input"
                                    />
                                    <label htmlFor="model-image-input" className="vehicle-image-btn vehicle-image-btn--upload">
                                        <i className="fas fa-upload"></i>
                                        <span>{imagePreview ? 'Thay đổi ảnh' : 'Thêm ảnh'}</span>
                                    </label>
                                    {(imagePreview || formData.modelPicture) && (
                                        <button className="vehicle-image-btn vehicle-image-btn--remove" onClick={handleRemoveImage}>
                                            <i className="fas fa-trash"></i>
                                            <span>Gỡ ảnh</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right - Info */}
                        <div className="vehicle-detail-info-cards">
                            <div className="vehicle-info-card">
                                <div className="vehicle-info-card-header">
                                    <i className="fas fa-info-circle"></i>
                                    <h2 className="vehicle-info-card-title">Thông tin Model Xe</h2>
                                </div>

                                <div className="vehicle-info-card-body">
                                    {/* Brand & Model */}
                                    <div className="vehicle-info-row">
                                        <div className="vehicle-info-item">
                                            <span className="vehicle-info-label">Thương hiệu</span>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="brand"
                                                    className="vehicle-info-input"
                                                    value={formData.brand}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                <p className="vehicle-info-value">{formData.brand || '-'}</p>
                                            )}
                                        </div>

                                        <div className="vehicle-info-item">
                                            <span className="vehicle-info-label">Model</span>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="model"
                                                    className="vehicle-info-input"
                                                    value={formData.model}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                <p className="vehicle-info-value">{formData.model || '-'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price & Seats */}
                                    <div className="vehicle-info-row">
                                        <div className="vehicle-info-item">
                                            <span className="vehicle-info-label">Giá (VND)</span>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="price"
                                                    className="vehicle-info-input"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                <p className="vehicle-info-value">
                                                    {formData.price
                                                        ? `${(Number(formData.price) * 1000).toLocaleString('vi-VN')}`
                                                        : '-'}
                                                </p>
                                            )}
                                        </div>

                                        <div className="vehicle-info-item">
                                            <span className="vehicle-info-label">Số chỗ</span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    name="seats"
                                                    className="vehicle-info-input"
                                                    value={formData.seats}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                <p className="vehicle-info-value">{formData.seats ?? '-'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}

export default AdminUpdateModel
