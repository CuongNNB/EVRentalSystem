// src/pages/admin/CustomerDetailManagement.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './CustomerDetailManagement.css'

// NOTE: endpoint used for save is PUT to same path as GET.
// If your backend uses a different endpoint or method, change `UPDATE_URL` / method accordingly.
const BASE = 'http://localhost:8084/EVRentalSystem/api/users'
const BASEUPDATE = 'http://localhost:8084/EVRentalSystem/api/user-management'
// Lightweight custom select so we can style option list (browser native <select> doesn't allow styling the popup)
const CustomSelect = ({ value, onChange, options = [], placeholder }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)


    useEffect(() => {
        const onDocClick = (e) => {
            if (!ref.current?.contains(e.target)) setOpen(false)
        }
        document.addEventListener('click', onDocClick)
        return () => document.removeEventListener('click', onDocClick)
    }, [])

    const selected = options.find(o => String(o.value) === String(value))

    return (
        <div className="custom-select" ref={ref}>
            <button
                type="button"
                className="custom-select-btn"
                onClick={() => setOpen(s => !s)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="custom-select-label">{selected ? selected.label : (placeholder || 'Chọn')}</span>
                <span className={`custom-select-arrow ${open ? 'open' : ''}`} />
            </button>

            {open && (
                <ul className="custom-select-list" role="listbox" tabIndex={-1}>
                    {options.map(opt => (
                        <li
                            key={opt.value}
                            role="option"
                            aria-selected={String(opt.value) === String(value)}
                            className={`custom-select-item ${String(opt.value) === String(value) ? 'selected' : ''}`}
                            onClick={() => {
                                // call onChange with an event-like object so existing onChange handler works
                                onChange({ target: { value: String(opt.value) } })
                                setOpen(false)
                            }}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

const CustomerDetailManagement = () => {
    const { userId } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // form state for editable fields
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        status: '',
        verificationStatus: '',
        isRisky: false
    })

    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const [savedMessage, setSavedMessage] = useState(null)
    const [showSuccess, setShowSuccess] = useState(false)
    // helper: đã up đủ giấy tờ chưa
    const hasAllDocs = !!(data?.cccdFrontUrl && data?.cccdBackUrl && data?.driverLicenseUrl)
    const tooltipStyle = {
        cursor: 'not-allowed',
        backgroundColor: '#f3f4f6'
    }

    // Helper: get last two words initials
    const getLastTwoInitials = (fullName = '') => {
        const words = fullName.trim().split(' ').filter(Boolean)
        if (words.length === 0) return 'U'
        const lastTwo = words.slice(-2)
        return lastTwo.map(w => w[0].toUpperCase()).join('')
    }

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`${BASE}/${userId}/renter-detail`)
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Không tìm thấy thông tin chi tiết')
                    throw new Error(`HTTP ${res.status}`)
                }
                const json = await res.json()
                setData(json)

                // initialize form with backend values (safely)
                setForm({
                    fullName: json.fullName ?? '',
                    email: json.email ?? '',
                    phone: json.phone ?? '',
                    address: json.address ?? '',
                    status: json.status ?? '',
                    verificationStatus: json.verificationStatus ?? '',
                    // backend may return boolean or string
                    isRisky: (typeof json.isRisky === 'boolean') ? json.isRisky : (json.isRisky === 'true')
                })
            } catch (err) {
                console.error('fetch renter detail error', err)
                setError(err.message || 'Lỗi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetchDetail()
    }, [userId])

    // Controlled input change handler
    const onChange = (key) => (e) => {
        const raw = e.target.value
        if (key === 'isRisky') {
            setForm(prev => ({ ...prev, [key]: raw === 'true' }))
        } else {
            setForm(prev => ({ ...prev, [key]: raw }))
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setSaveError(null)
        setSavedMessage(null)

        try {
            // basic local validation (optional)
            if (!form.fullName || !form.email) {
                setSaveError('Vui lòng nhập họ & tên và email.')
                setSaving(false)
                return
            }
            // ===== BUSINESS VALIDATION (tối thiểu) =====
            // 1) Chỉ được chọn "Đã xác thực" khi đủ hình CCCD + GPLX
            if (form.verificationStatus === 'VERIFIED' && !hasAllDocs) {
                setSaveError('Không thể đặt "Đã xác thực" khi thiếu hình CCCD hoặc Giấy phép lái.')
                setSaving(false)
                return
            }

            // 2) Chỉ tài khoản đã xác thực mới được "Có hiệu lực"
            if (form.status === 'ACTIVE' && form.verificationStatus !== 'VERIFIED') {
                setSaveError('Chỉ tài khoản đã xác thực mới được đặt trạng thái "Có hiệu lực".')
                setSaving(false)
                return
            }
            // ===== END BUSINESS VALIDATION =====

            // build payload exactly matching UpdateRenterDetailRequest
            const payload = {
                userId: parseInt(userId, 10),          // integer
                fullName: form.fullName,               // string
                email: form.email,                     // string
                phone: form.phone,                     // string
                address: form.address,                 // string
                status: form.status,                   // string (e.g. 'ACTIVE')
                isRisky: Boolean(form.isRisky),        // boolean
                verificationStatus: form.verificationStatus // string (e.g. 'VERIFIED'/'PENDING')
            }

            const url = `${BASEUPDATE}/${userId}/renter-detail` // e.g. http://.../api/user-management/{userId}/renter-detail

            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                    // , 'Authorization': `Bearer ${token}` // <- add if your backend requires auth
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                // try parse body for message
                let msg = `HTTP ${res.status}`
                try {
                    const body = await res.json()
                    if (body && (body.message || body.error)) msg = body.message || body.error
                    else if (typeof body === 'string') msg = body
                } catch (e) { /* ignore parse error */ }
                throw new Error(msg)
            }

            // backend returns message or updated object — handle both
            let result = null
            try { result = await res.json() } catch (e) { result = null }

            // If backend returns updated object, refresh UI; if returns only message, you may re-fetch
            if (result && result.userId) {
                setData(result)
                setForm(prev => ({
                    ...prev,
                    fullName: result.fullName ?? prev.fullName,
                    email: result.email ?? prev.email,
                    phone: result.phone ?? prev.phone,
                    address: result.address ?? prev.address,
                    status: result.status ?? prev.status,
                    verificationStatus: result.verificationStatus ?? prev.verificationStatus,
                    isRisky: (typeof result.isRisky === 'boolean') ? result.isRisky : prev.isRisky
                }))
                setShowSuccess(true)
            } else {
                setShowSuccess(true)
            }

            setTimeout(() => setSavedMessage(null), 3000)
        } catch (err) {
            console.error('save error', err)
            setSaveError(err.message || 'Lỗi khi lưu')
        } finally {
            setSaving(false)
        }
    }


    return (
        <div className="rd-page">
            <div className="rd-header">
                <button className="rd-back" onClick={() => navigate(-1)}>&larr; Quay lại</button>
                <h2>Chi tiết khách hàng</h2>
            </div>

            {loading ? (
                <div className="rd-empty rd-loading">Đang tải...</div>
            ) : error ? (
                <div className="rd-empty rd-error">{error}</div>
            ) : data ? (
                <div className="rd-card">
                    <div className="rd-left">
                        <div className="rd-avatar">{getLastTwoInitials(data.fullName || data.username || 'U')}</div>
                        <div className="rd-role">{data.role}</div>

                        {/* ===== rd-meta: inputs and dropdown ===== */}
                        <div className="rd-meta">
                            <div className="rd-field">
                                <label><strong>Họ và tên:</strong></label>
                                <input className="rd-input" value={form.fullName} onChange={onChange('fullName')} />
                            </div>
                            <div className="rd-field">
                                <label><strong>Email:</strong></label>
                                <input
                                    className="rd-input"
                                    value={form.email}
                                    disabled
                                    style={tooltipStyle}
                                    title="Không cho phép chỉnh sửa email khách hàng tại trang này."
                                />
                            </div>

                            <div className="rd-field">
                                <label><strong>Số điện thoại:</strong></label>
                                <input
                                    className="rd-input"
                                    value={form.phone}
                                    disabled
                                    style={tooltipStyle}
                                    title="Không cho phép chỉnh sửa số điện thoại khách hàng tại trang này."
                                />
                            </div>

                            <div className="rd-field">
                                <label><strong>Địa chỉ:</strong></label>
                                <input className="rd-input" value={form.address} onChange={onChange('address')} />
                            </div>



                            <div className="rd-field">
                                <label><strong>Trạng thái xác thực:</strong></label>
                                <CustomSelect
                                    value={form.verificationStatus}
                                    onChange={onChange('verificationStatus')}
                                    options={[
                                        { value: 'VERIFIED', label: 'Đã xác thực' },
                                        { value: 'PENDING', label: 'Chưa xác thực' }
                                    ]}
                                />
                            </div>

                            <div className="rd-field">
                                <label><strong>Rủi ro:</strong></label>
                                <CustomSelect
                                    value={String(form.isRisky)}
                                    onChange={onChange('isRisky')}
                                    options={[
                                        { value: 'true', label: 'Rủi ro' },
                                        { value: 'false', label: 'Bình thường' }
                                    ]}
                                />
                            </div>

                            <div className="rd-field">
                                <label><strong>Trạng thái tài khoản:</strong></label>
                                <CustomSelect
                                    value={form.status}
                                    onChange={onChange('status')}
                                    options={[
                                        { value: 'ACTIVE', label: 'Có hiệu lực' },
                                        { value: 'INACTIVE', label: 'Không còn hiệu lực' }
                                    ]}
                                />
                            </div>

                            <div className="rd-save">
                                <button
                                    className="rd-save-btn"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>

                                {saveError && <div style={{ color: '#dc2626', marginTop: 8 }}>{saveError}</div>}
                                {savedMessage && <div style={{ color: '#16a34a', marginTop: 8 }}>{savedMessage}</div>}
                            </div>
                        </div>
                        {/* ===== end rd-meta ===== */}
                    </div>

                    <div className="rd-right">
                        <h4>Hình ảnh chứng thực</h4>
                        <div className="rd-images">
                            {data.cccdFrontUrl && (
                                <div className="rd-image-card">
                                    <img src={data.cccdFrontUrl} alt="cccd-front" />
                                    <div className="rd-image-label">CCCD - Mặt trước</div>
                                    <button className="rd-btn" onClick={() => window.open(data.cccdFrontUrl, '_blank')}>
                                        Xem CCCD trước
                                    </button>
                                </div>
                            )}

                            {data.cccdBackUrl && (
                                <div className="rd-image-card">
                                    <img src={data.cccdBackUrl} alt="cccd-back" />
                                    <div className="rd-image-label">CCCD - Mặt sau</div>
                                    <button className="rd-btn" onClick={() => window.open(data.cccdBackUrl, '_blank')}>
                                        Xem CCCD sau
                                    </button>
                                </div>
                            )}

                            {data.driverLicenseUrl && (
                                <div className="rd-image-card">
                                    <img src={data.driverLicenseUrl} alt="driver-license" />
                                    <div className="rd-image-label">Giấy phép lái</div>
                                    <button className="rd-btn" onClick={() => window.open(data.driverLicenseUrl, '_blank')}>
                                        Xem Giấy phép lái
                                    </button>
                                </div>
                            )}

                            {!data.cccdFrontUrl && !data.cccdBackUrl && !data.driverLicenseUrl && (
                                <div className="rd-empty">Không có hình ảnh</div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rd-empty">Không có dữ liệu</div>
            )}

            {showSuccess && (
                <div className="success-overlay" role="dialog" aria-modal="true" onClick={() => setShowSuccess(false)}>
                    <div className="success-card" onClick={(e) => e.stopPropagation()}>
                        <div className="success-icon">
                            <svg className="tick-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle className="tick-circle" cx="60" cy="60" r="46" fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
                                <path className="tick-check" d="M40 62 L54 76 L82 44" fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className="success-title">Success</h3>
                        <p className="success-text">Bạn đã lưu thay đổi thành công!</p>
                        <button className="success-ok" onClick={() => setShowSuccess(false)}>Ok</button>
                    </div>
                </div>
            )}
        </div>

    )
}

export default CustomerDetailManagement
