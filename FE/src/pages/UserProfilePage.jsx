import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './UserProfilePage.css';

const API_BASE = 'http://localhost:8084/EVRentalSystem/api';

const UserProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [activeSection, setActiveSection] = useState('personal');

    // Personal Info State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Modals & Loading States
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // --- NEW: Documents Edit State ---
    const [isEditingDocs, setIsEditingDocs] = useState(false);
    const [docFiles, setDocFiles] = useState({
        cccdFront: null,
        cccdBack: null,
        driverLicense: null
    });
    const [docPreviews, setDocPreviews] = useState({
        cccdFront: null,
        cccdBack: null,
        driverLicense: null
    });
    const [showDocConfirmModal, setShowDocConfirmModal] = useState(false);
    const [updatingDocs, setUpdatingDocs] = useState(false);
    // ---------------------------------

    // Helper: format ISO date to readable date
    const formatDate = (iso) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return iso;
        }
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'ND';
        return name
            .split(' ')
            .map(word => word[0] || '')
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // Get KYC badge
    const getKycBadge = (status) => {
        const badges = {
            VERIFIED: { text: 'Đã xác thực', class: 'kyc-badge kyc-badge-verified' },
            PENDING: { text: 'Chờ xác thực', class: 'kyc-badge kyc-badge-pending' },
            REJECTED: { text: 'Bị từ chối', class: 'kyc-badge kyc-badge-rejected' },
        };
        return badges[status] || badges.PENDING;
    };

    // Load user data
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const storedUser = localStorage.getItem('ev_user');
        const token = localStorage.getItem('ev_token');

        if (!token || !storedUser || storedUser === "undefined" || storedUser === "null") {
            navigate('/login');
            return;
        }

        let parsedUser;
        try {
            parsedUser = JSON.parse(storedUser);
        } catch (err) {
            console.error('Error parsing user data:', err);
            localStorage.removeItem('ev_user');
            navigate('/login');
            return;
        }

        const userId = parsedUser.userId || parsedUser.id || parsedUser.user_id || parsedUser.uid;
        if (!userId) {
            navigate('/login');
            return;
        }

        const fetchRenterDetail = async () => {
            try {
                const resp = await fetch(`${API_BASE}/users/${userId}/renter-detail`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });

                if (!isMounted) return;

                if (resp.ok) {
                    const data = await resp.json();
                    const mapped = {
                        userId: data.userId ?? userId,
                        username: data.username ?? parsedUser.username,
                        fullName: data.fullName ?? parsedUser.fullName ?? 'Người dùng',
                        email: data.email ?? parsedUser.email ?? '',
                        phone: data.phone ?? parsedUser.phone ?? '',
                        address: data.address ?? parsedUser.address ?? '',
                        createdAt: data.createdAt ?? parsedUser.createdAt,
                        joinedDate: data.createdAt ? formatDate(data.createdAt) : '',
                        kycStatus: data.verificationStatus ?? 'PENDING',
                        // Documents
                        cccdFrontUrl: data.cccdFrontUrl ?? null,
                        cccdBackUrl: data.cccdBackUrl ?? null,
                        driverLicenseUrl: data.driverLicenseUrl ?? null,
                        avatarUrl: parsedUser.avatarUrl ?? '',
                    };

                    setUserData(mapped);
                    setFormData({
                        fullName: mapped.fullName,
                        phone: mapped.phone,
                        email: mapped.email,
                        address: mapped.address,
                    });
                } else {
                    // Handle error gracefully or show minimal data
                    setLoading(false);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Fetch renter-detail failed:', error);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchRenterDetail();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [navigate]);

    // --- Handlers for Personal Info ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('ev_token');
        const payload = {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
        };

        setSavingProfile(true);
        try {
            const resp = await fetch(`${API_BASE}/users/${userData.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const respBody = await resp.json().catch(() => ({}));
            if (resp.ok) {
                setUserData(prev => ({ ...prev, ...payload }));
                alert(respBody?.message || 'Cập nhật thông tin thành công.');
            } else {
                alert(respBody?.message || 'Lỗi cập nhật.');
            }
        } catch (error) {
            alert('Lỗi kết nối.');
        } finally {
            setSavingProfile(false);
        }
    };

    // --- Handlers for Password ---
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleChangePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp.');
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmChangePassword = async () => {
        const token = localStorage.getItem('ev_token');
        setChangingPassword(true);
        try {
            const payload = {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            };
            const resp = await fetch(`${API_BASE}/users/${userData.userId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const respBody = await resp.json().catch(() => ({}));
            if (resp.ok) {
                alert('Đổi mật khẩu thành công.');
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(respBody?.message || 'Đổi mật khẩu thất bại.');
            }
        } catch (error) {
            alert('Lỗi kết nối.');
        } finally {
            setChangingPassword(false);
            setShowConfirmModal(false);
        }
    };

    // --- NEW Handlers for Documents ---

    // 1. Bật chế độ sửa
    const handleEditDocuments = () => {
        setIsEditingDocs(true);
        // Reset state tạm
        setDocFiles({ cccdFront: null, cccdBack: null, driverLicense: null });
        setDocPreviews({ cccdFront: null, cccdBack: null, driverLicense: null });
    };

    // 2. Hủy bỏ sửa
    const handleCancelEditDocuments = () => {
        setIsEditingDocs(false);
        setDocFiles({ cccdFront: null, cccdBack: null, driverLicense: null });
        setDocPreviews({ cccdFront: null, cccdBack: null, driverLicense: null });
    };

    // 3. Chọn file và tạo preview
    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type/size if needed
            setDocFiles(prev => ({ ...prev, [fieldName]: file }));

            // Create preview URL
            const objectUrl = URL.createObjectURL(file);
            setDocPreviews(prev => ({ ...prev, [fieldName]: objectUrl }));
        }
    };

    // 4. Bấm nút cập nhật -> Hiện modal
    const handleUpdateDocumentsClick = () => {
        // Check if at least one file is selected? Or allow partial updates?
        // Assuming optional updates are fine.
        setShowDocConfirmModal(true);
    };

    // 5. Gọi API cập nhật
    const confirmUpdateDocuments = async () => {
        const token = localStorage.getItem('ev_token');
        setUpdatingDocs(true);

        try {
            const formData = new FormData();
            if (docFiles.cccdFront) formData.append('cccdFront', docFiles.cccdFront);
            if (docFiles.cccdBack) formData.append('cccdBack', docFiles.cccdBack);
            if (docFiles.driverLicense) formData.append('driverLicense', docFiles.driverLicense);

            // API Call
            const resp = await fetch(`${API_BASE}/users/${userData.userId}/update-pictures`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Content-Type header is auto-set by browser for FormData
                },
                body: formData
            });

            // Xử lý text response hoặc json response
            let message = '';
            const contentType = resp.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await resp.json();
                message = data.message || JSON.stringify(data);
            } else {
                message = await resp.text();
            }

            if (resp.ok) {
                alert(message || 'Cập nhật hình ảnh thành công!');

                // Update UI locally (use previews as new URLs to avoid reload)
                setUserData(prev => ({
                    ...prev,
                    cccdFrontUrl: docPreviews.cccdFront || prev.cccdFrontUrl,
                    cccdBackUrl: docPreviews.cccdBack || prev.cccdBackUrl,
                    driverLicenseUrl: docPreviews.driverLicense || prev.driverLicenseUrl,
                    kycStatus: 'PENDING' // Usually status resets to pending after update
                }));

                setIsEditingDocs(false);
            } else {
                alert(message || 'Cập nhật thất bại.');
            }

        } catch (error) {
            console.error('Upload error:', error);
            alert('Lỗi kết nối khi tải ảnh.');
        } finally {
            setUpdatingDocs(false);
            setShowDocConfirmModal(false);
        }
    };

    // Image error fallback
    const handleImageError = (e) => {
        e.currentTarget.style.display = 'none';
    };

    if (loading) {
        return <div className="profile-page"><Header /><div className="profile-container"><p>Đang tải...</p></div><Footer /></div>;
    }

    if (!userData) {
        return <div className="profile-page"><Header /><div className="profile-container"><p>Lỗi dữ liệu.</p></div><Footer /></div>;
    }

    const kycBadge = getKycBadge(userData.kycStatus);

    const menuItems = [
        { id: 'personal', label: 'Thông tin cá nhân', icon: '👤' },
        { id: 'documents', label: 'Giấy tờ (CCCD/GPLX)', icon: '📄' },
        { id: 'security', label: 'Bảo mật', icon: '🔒' },
    ];

    return (
        <div className="profile-page">
            <Header />

            <div className="profile-container">
                {/* Header Card */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="user-header-card">
                    <div className="user-header-content">
                        <div className="user-avatar-wrapper">
                            {userData.avatarUrl ? (
                                <img src={userData.avatarUrl} alt="avatar" className="user-avatar" onError={handleImageError} />
                            ) : (
                                <div className="user-avatar-placeholder">{getInitials(userData.fullName)}</div>
                            )}
                        </div>
                        <div className="user-info-section">
                            <div className="user-name-row">
                                <h1 className="user-name">{userData.fullName}</h1>
                                <span className={kycBadge.class}>{kycBadge.text}</span>
                            </div>
                            <p className="user-email">{userData.email}</p>
                            <p className="user-joined">Tham gia từ {userData.joinedDate}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="profile-layout">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <nav className="sidebar-nav">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
                                >
                                    <span className="nav-item-icon">{item.icon}</span>
                                    <span className="nav-item-label">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="profile-content">
                        <AnimatePresence mode="wait">
                            {/* Personal Section */}
                            {activeSection === 'personal' && (
                                <motion.div key="personal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="content-card">
                                    <h2 className="content-title">Thông tin cá nhân</h2>
                                    <form onSubmit={handleSaveProfile} className="profile-form">
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label className="form-label">Họ và tên</label>
                                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="form-input" required />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Số điện thoại</label>
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" required />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Email</label>
                                                <input type="email" value={formData.email} readOnly className="form-input" />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Địa chỉ</label>
                                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" />
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                                                {savingProfile ? 'Đang lưu...' : 'Lưu chỉnh sửa'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Documents Section */}
                            {activeSection === 'documents' && (
                                <motion.div key="documents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="content-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h2 className="content-title" style={{ marginBottom: 0 }}>Giấy tờ tùy thân</h2>
                                            {/* Nút Chỉnh sửa hiển thị khi chưa ở chế độ Edit */}
                                            {!isEditingDocs && (
                                                <button
                                                    className="btn-edit-doc"
                                                    onClick={handleEditDocuments}
                                                    // Disable nếu trạng thái là VERIFIED
                                                    disabled={userData.kycStatus === 'VERIFIED'}
                                                    // Thêm style để làm mờ nút khi bị disable
                                                    style={userData.kycStatus === 'VERIFIED' ? { opacity: 0.5, cursor: 'not-allowed', background: '#f3f4f6', borderColor: '#d1d5db', color: '#9ca3af' } : {}}
                                                    title={userData.kycStatus === 'VERIFIED' ? "Tài khoản đã xác thực, không thể chỉnh sửa" : ""}
                                                >
                                                    ✎ Chỉnh sửa
                                                </button>
                                            )}
                                        </div>
                                        {userData.kycStatus === 'REJECTED' && (
                                            <div className="alert-box alert-danger">
                                                <span className="alert-icon">⚠️</span>
                                                <div className="alert-content">
                                                    <p className="alert-title">Giấy tờ bị từ chối, vui lòng cập nhật lại.</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="documents-grid">
                                            {/* CCCD Front */}
                                            <DocumentUploadCard
                                                title="Mặt trước CCCD"
                                                icon="🪪"
                                                currentUrl={userData.cccdFrontUrl}
                                                previewUrl={docPreviews.cccdFront}
                                                isEditing={isEditingDocs}
                                                onChange={(e) => handleFileChange(e, 'cccdFront')}
                                                fileInputId="file-cccd-front"
                                            />

                                            {/* CCCD Back */}
                                            <DocumentUploadCard
                                                title="Mặt sau CCCD"
                                                icon="🪪"
                                                currentUrl={userData.cccdBackUrl}
                                                previewUrl={docPreviews.cccdBack}
                                                isEditing={isEditingDocs}
                                                onChange={(e) => handleFileChange(e, 'cccdBack')}
                                                fileInputId="file-cccd-back"
                                            />

                                            {/* Driver License */}
                                            <DocumentUploadCard
                                                title="Giấy phép lái xe"
                                                icon="🚗"
                                                currentUrl={userData.driverLicenseUrl}
                                                previewUrl={docPreviews.driverLicense}
                                                isEditing={isEditingDocs}
                                                onChange={(e) => handleFileChange(e, 'driverLicense')}
                                                fileInputId="file-license"
                                            />
                                        </div>

                                        {/* Action Buttons when Editing */}
                                        {isEditingDocs && (
                                            <div className="doc-edit-actions">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={handleCancelEditDocuments}
                                                    disabled={updatingDocs}
                                                >
                                                    Từ chối
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleUpdateDocumentsClick}
                                                    disabled={updatingDocs}
                                                >
                                                    {updatingDocs ? 'Đang tải...' : 'Cập nhật'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Security Section */}
                            {activeSection === 'security' && (
                                <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="security-section">
                                    <div className="security-card">
                                        <h2 className="content-title">Đổi mật khẩu</h2>
                                        <form onSubmit={handleChangePasswordSubmit} className="profile-form">
                                            <div className="form-group">
                                                <label className="form-label">Mật khẩu hiện tại</label>
                                                <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} className="form-input" required />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Mật khẩu mới</label>
                                                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="form-input" required minLength={6} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Nhập lại mật khẩu mới</label>
                                                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="form-input" required minLength={6} />
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                                                    {changingPassword ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Password Confirmation Modal */}
            {showConfirmModal && (
                <ModalConfirm
                    title="Xác nhận đổi mật khẩu"
                    message="Bạn có chắc chắn muốn đổi mật khẩu không?"
                    onConfirm={confirmChangePassword}
                    onCancel={() => setShowConfirmModal(false)}
                    loading={changingPassword}
                />
            )}

            {/* Document Update Confirmation Modal */}
            {showDocConfirmModal && (
                <ModalConfirm
                    title="Xác nhận cập nhật giấy tờ"
                    message="Bạn có chắc chắn muốn cập nhật hình ảnh giấy tờ không? Quá trình này có thể mất vài giây để tải ảnh lên."
                    onConfirm={confirmUpdateDocuments}
                    onCancel={() => setShowDocConfirmModal(false)}
                    loading={updatingDocs}
                />
            )}
        </div>
    );
};

// --- Sub-components for cleaner code ---

const DocumentUploadCard = ({ title, icon, currentUrl, previewUrl, isEditing, onChange, fileInputId }) => {
    // Determine what image to show
    const displayUrl = previewUrl || currentUrl;

    return (
        <div className="document-card">
            <div className="document-header">
                <div className="document-icon document-icon-purple">{icon}</div>
                <div className="document-info">
                    <h3>{title}</h3>
                </div>
            </div>

            <div className="document-preview">
                <div className="document-image-frame">
                    {displayUrl ? (
                        <img
                            src={displayUrl}
                            alt={title}
                            className="document-image"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    ) : (
                        <div className="document-placeholder">Chưa có ảnh</div>
                    )}
                </div>

                {isEditing ? (
                    <div className="upload-action">
                        <input
                            type="file"
                            id={fileInputId}
                            accept="image/*"
                            className="hidden-file-input"
                            onChange={onChange}
                        />
                        <label htmlFor={fileInputId} className="btn-upload-label">
                            📥 Chọn ảnh mới
                        </label>
                    </div>
                ) : (
                    currentUrl && (
                        <a href={currentUrl} target="_blank" rel="noreferrer" className="document-view-link">
                            Mở ảnh trong tab mới
                        </a>
                    )
                )}
            </div>
        </div>
    );
};

const ModalConfirm = ({ title, message, onConfirm, onCancel, loading }) => (
    <div className="confirm-overlay">
        <div className="confirm-card">
            <h3>{title}</h3>
            <p>{message}</p>
            <div className="modal-actions">
                <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Hủy</button>
                <button onClick={onConfirm} className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đồng ý'}
                </button>
            </div>
        </div>
    </div>
);

export default UserProfilePage;