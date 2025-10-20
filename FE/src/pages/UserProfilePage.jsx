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
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // NEW: confirmation modal + API call state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [notifications, setNotifications] = useState({
        bookingUpdates: true,
        returnReminder: true,
        promo: false,
        analytics: true,
    });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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

    // Load user data from localStorage + call renter-detail API
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

        // Try common id keys
        const userId = parsedUser.userId || parsedUser.id || parsedUser.user_id || parsedUser.uid;
        if (!userId) {
            console.warn('No userId found in local user object, redirecting to login.');
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

                if (resp.status === 404) {
                    const data = await resp.json().catch(() => ({}));
                    alert(data.message || 'Người dùng không tồn tại (404)');
                    setLoading(false);
                    return;
                }

                if (!resp.ok) {
                    const data = await resp.json().catch(() => ({}));
                    console.error('Error fetching renter detail:', data);
                    alert(data.message || `Lỗi khi lấy thông tin (status ${resp.status})`);
                    setLoading(false);
                    return;
                }

                const data = await resp.json();

                // Map API response to the shape used by the page, gracefully fallback to local storage fields
                const mapped = {
                    userId: data.userId ?? userId,
                    username: data.username ?? parsedUser.username ?? parsedUser.name,
                    fullName: data.fullName ?? parsedUser.fullName ?? parsedUser.name ?? 'Người dùng',
                    email: data.email ?? parsedUser.email ?? '',
                    phone: data.phone ?? parsedUser.phone ?? parsedUser.phoneNumber ?? '',
                    address: data.address ?? parsedUser.address ?? '',
                    role: data.role ?? parsedUser.role ?? '',
                    status: data.status ?? parsedUser.status ?? '',
                    createdAt: data.createdAt ?? parsedUser.createdAt ?? parsedUser.joinedDate ?? null,
                    joinedDate: data.createdAt ? formatDate(data.createdAt) : (parsedUser.joinedDate || ''),
                    verificationStatus: data.verificationStatus ?? parsedUser.kycStatus ?? data.verificationStatus ?? 'PENDING',
                    isRisky: data.isRisky ?? false,
                    // Documents / images
                    cccdFrontUrl: data.cccdFrontUrl ?? null,
                    cccdBackUrl: data.cccdBackUrl ?? null,
                    driverLicenseUrl: data.driverLicenseUrl ?? null,
                    // If API does not return number strings for cccd/gplx, fallback to stored values (if any)
                    cccd: data.cccd ?? parsedUser.cccd ?? parsedUser.identityCard ?? '',
                    gplx: data.driverLicenseNumber ?? parsedUser.gplx ?? parsedUser.drivingLicense ?? '',
                    avatarUrl: parsedUser.avatarUrl ?? '',
                    kycStatus: data.verificationStatus ?? parsedUser.kycStatus ?? 'PENDING',
                };

                setUserData(mapped);
                setFormData({
                    fullName: mapped.fullName,
                    phone: mapped.phone,
                    email: mapped.email,
                    address: mapped.address,
                });
            } catch (error) {
                if (error.name === 'AbortError') {
                    // ignore
                    return;
                }
                console.error('Fetch renter-detail failed:', error);
                alert('Không thể tải thông tin người dùng. Vui lòng thử lại.');
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

    // Handle form change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle password change input updates
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    // Handle notification toggle
    const handleNotificationToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Save profile
    const handleSaveProfile = (e) => {
        e.preventDefault();
        // For now we only mock client update — you can extend to call an API to persist changes.
        setUserData(prev => ({ ...prev, fullName: formData.fullName, phone: formData.phone, address: formData.address }));
        alert('Đã lưu thông tin cá nhân (mock)');
    };

    // UPDATED: when user submits change-password form -> open confirm modal (do not call API yet)
    const handleChangePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Mật khẩu mới không khớp!');
            return;
        }
        // Basic password length check
        if (!passwordData.currentPassword || passwordData.newPassword.length < 6) {
            alert('Vui lòng điền mật khẩu hiện tại và mật khẩu mới ít nhất 6 ký tự.');
            return;
        }
        // Open confirmation modal
        setShowConfirmModal(true);
    };

    // Confirm & call API to change password
    const confirmChangePassword = async () => {
        if (!userData || !userData.userId) {
            alert('Không tìm thấy userId. Vui lòng đăng nhập lại.');
            setShowConfirmModal(false);
            return;
        }

        const token = localStorage.getItem('ev_token');
        if (!token) {
            alert('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            setShowConfirmModal(false);
            return;
        }

        setChangingPassword(true);

        try {
            // Payload: include relevant fields. Backend ChangePasswordRequest should accept these (adjust if your backend expects different field names)
            const payload = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
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

            if (!resp.ok) {
                // Try to display server message if present
                const message = respBody?.message || `Đổi mật khẩu thất bại (status ${resp.status})`;
                alert(message);
            } else {
                alert(respBody?.message || 'Đổi mật khẩu thành công.');
                // Clear inputs
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            console.error('Change password error:', error);
            alert('Lỗi khi đổi mật khẩu. Vui lòng thử lại.');
        } finally {
            setChangingPassword(false);
            setShowConfirmModal(false);
        }
    };

    // Cancel modal
    const cancelChangePassword = () => {
        setShowConfirmModal(false);
    };

    // Save notifications
    const handleSaveNotifications = () => {
        alert('Đã lưu cài đặt thông báo (mock)');
    };

    // Delete account
    const handleDeleteAccount = () => {
        if (window.confirm('⚠️ Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
            const confirmation = window.prompt('Nhập "DELETE" để xác nhận xóa tài khoản:');
            if (confirmation === 'DELETE') {
                alert('Đã gửi yêu cầu xóa tài khoản (mock)');
            } else {
                alert('Đã hủy');
            }
        }
    };

    // Image fallback
    const handleImageError = (e) => {
        e.currentTarget.style.display = 'none';
    };

    // Loading state
    if (loading) {
        return (
            <div className="profile-page">
                <Header />
                <div className="profile-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải thông tin tài khoản...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="profile-page">
                <Header />
                <div className="profile-container">
                    <div className="content-card">
                        <h2 className="content-title">Không tìm thấy thông tin người dùng</h2>
                        <p>Vui lòng đăng nhập lại hoặc thử lại sau.</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const kycBadge = getKycBadge(userData.kycStatus);

    // Sidebar menu items
    const menuItems = [
        { id: 'personal', label: 'Thông tin cá nhân', icon: '👤' },
        { id: 'documents', label: 'Giấy tờ (CCCD/GPLX)', icon: '📄' },
        { id: 'security', label: 'Bảo mật', icon: '🔒' },
    ];

    return (
        <div className="profile-page">
            <Header />

            <div className="profile-container">
                {/* User Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="user-header-card"
                >
                    <div className="user-header-content">
                        {/* Avatar */}
                        <div className="user-avatar-wrapper">
                            {userData.avatarUrl ? (
                                <img
                                    src={userData.avatarUrl}
                                    alt={userData.fullName}
                                    className="user-avatar"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    {getInitials(userData.fullName)}
                                </div>
                            )}
                            <div className="user-status-indicator"></div>
                        </div>

                        {/* User Info */}
                        <div className="user-info-section">
                            <div className="user-name-row">
                                <h1 className="user-name">{userData.fullName}</h1>
                                <span className={kycBadge.class}>
                  {kycBadge.text}
                </span>
                            </div>
                            <p className="user-email">{userData.email}</p>
                            <p className="user-joined">Tham gia từ {userData.joinedDate || (userData.createdAt ? formatDate(userData.createdAt) : '')}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Layout */}
                <div className="profile-layout">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="profile-sidebar"
                    >
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
                    </motion.div>

                    {/* Content Area */}
                    <div className="profile-content">
                        <AnimatePresence mode="wait">
                            {/* Overview Section */}
                            {activeSection === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="content-card"
                                >
                                </motion.div>
                            )}

                            {/* Personal Info Section */}
                            {activeSection === 'personal' && (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="content-card"
                                >
                                    <h2 className="content-title">Thông tin cá nhân</h2>

                                    <form onSubmit={handleSaveProfile} className="profile-form">
                                        <div className="form-grid">
                                            {/* Full Name */}
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Họ và tên <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    required
                                                    minLength={2}
                                                    maxLength={64}
                                                    className="form-input"
                                                    placeholder="Nhập họ và tên"
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Số điện thoại <span className="required">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    pattern="^(0|\+84)(3|5|7|8|9)\d{8}$"
                                                    className="form-input"
                                                    placeholder="0901234567"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div className="form-group">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    readOnly
                                                    className="form-input"
                                                />
                                            </div>

                                            {/* Address */}
                                            <div className="form-group">
                                                <label className="form-label">Địa chỉ</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Nhập địa chỉ"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="btn btn-primary">
                                                <span>💾 Lưu chỉnh sửa</span>
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Documents Section */}
                            {activeSection === 'documents' && (
                                <motion.div
                                    key="documents"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="content-card">
                                        <h2 className="content-title">Giấy tờ tùy thân</h2>

                                        {userData.kycStatus === 'REJECTED' && (
                                            <div className="alert-box alert-danger">
                                                <span className="alert-icon">⚠️</span>
                                                <div className="alert-content">
                                                    <p className="alert-title">Giấy tờ bị từ chối, vui lòng liên hệ hỗ trợ.</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="documents-grid">
                                            {/* CCCD Card */}
                                            <div className="document-card">
                                                <div className="document-header">
                                                    <div className="document-icon document-icon-purple">
                                                        🪪
                                                    </div>
                                                    <div className="document-info">
                                                        <h3>Căn cước công dân</h3>
                                                        <p>CCCD/CMND</p>
                                                    </div>
                                                </div>

                                                {/* Image previews if available */}
                                                {userData.cccdFrontUrl && (
                                                    <div className="document-preview" style={{ marginTop: 12 }}>
                                                        <div className="document-preview-title">Ảnh mặt trước</div>

                                                        <div className="document-image-frame" aria-hidden>
                                                            <img
                                                                src={userData.cccdFrontUrl}
                                                                alt="cccd-front"
                                                                className="document-image"
                                                                onError={handleImageError}
                                                            />
                                                        </div>

                                                        <a
                                                            href={userData.cccdFrontUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="document-view-link"
                                                        >
                                                            Mở ảnh trong tab mới
                                                        </a>
                                                    </div>
                                                )}


                                                {userData.cccdBackUrl && (
                                                    <div className="document-preview" style={{ marginTop: 12 }}>
                                                        <div className="document-preview-title">Ảnh mặt sau</div>

                                                        <div className="document-image-frame" aria-hidden>
                                                            <img
                                                                src={userData.cccdBackUrl}
                                                                alt="cccd-back"
                                                                className="document-image"
                                                                onError={handleImageError}
                                                            />
                                                        </div>

                                                        <a
                                                            href={userData.cccdBackUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="document-view-link"
                                                        >
                                                            Mở ảnh trong tab mới
                                                        </a>
                                                    </div>
                                                )}

                                            </div>

                                            {/* GPLX Card */}
                                            <div className="document-card">
                                                <div className="document-header">
                                                    <div className="document-icon document-icon-orange">
                                                        🚗
                                                    </div>
                                                    <div className="document-info">
                                                        <h3>Giấy phép lái xe</h3>
                                                        <p>GPLX</p>
                                                    </div>
                                                </div>

                                                {userData.driverLicenseUrl && (
                                                    <div className="document-preview" style={{ marginTop: 12 }}>
                                                        <div className="document-preview-title">Ảnh GPLX</div>

                                                        <div className="document-image-frame" aria-hidden>
                                                            <img
                                                                src={userData.driverLicenseUrl}
                                                                alt="driver-license"
                                                                className="document-image"
                                                                onError={handleImageError}
                                                            />
                                                        </div>

                                                        <a
                                                            href={userData.driverLicenseUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="document-view-link"
                                                        >
                                                            Mở ảnh trong tab mới
                                                        </a>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Security Section */}
                            {activeSection === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="security-section"
                                >
                                    {/* Change Password */}
                                    <div className="security-card">
                                        <h2 className="content-title">Đổi mật khẩu</h2>

                                        <form onSubmit={handleChangePasswordSubmit} className="profile-form">
                                            <div className="form-group">
                                                <label className="form-label">Mật khẩu hiện tại</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    className="form-input"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Mật khẩu mới</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    minLength={6}
                                                    className="form-input"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Nhập lại mật khẩu mới</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    required
                                                    minLength={6}
                                                    className="form-input"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            <div className="form-actions">
                                                <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                                                    <span>{changingPassword ? 'Đang xử lý...' : '🔒 Cập nhật mật khẩu'}</span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* 2FA */}
                                    <div className="security-card">
                                        <h2 className="content-title">Xác thực 2 bước (2FA)</h2>

                                        <div className="toggle-row">
                                            <div className="toggle-info">
                                                <h3 className="toggle-title">Bật xác thực 2 bước</h3>
                                                <p className="toggle-description">Tăng cường bảo mật với OTP qua SMS/Email</p>
                                            </div>

                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={twoFactorEnabled}
                                                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Confirmation modal overlay */}
            {showConfirmModal && (
                <div
                    className="confirm-overlay"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1200,
                        padding: 20,
                    }}
                >
                    <div
                        className="confirm-card"
                        role="dialog"
                        aria-modal="true"
                        style={{
                            width: 420,
                            maxWidth: '100%',
                            background: '#fff',
                            borderRadius: 12,
                            padding: 20,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>Xác nhận đổi mật khẩu</h3>
                        <p>Bạn có chắc chắn muốn đổi mật khẩu không? Hành động này sẽ cập nhật mật khẩu tài khoản của bạn ngay lập tức.</p>

                        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                                onClick={cancelChangePassword}
                                className="btn"
                                style={{ padding: '8px 12px' }}
                                disabled={changingPassword}
                            >
                                Hủy
                            </button>

                            <button
                                onClick={confirmChangePassword}
                                className="btn btn-primary"
                                style={{ padding: '8px 12px' }}
                                disabled={changingPassword}
                            >
                                {changingPassword ? 'Đang cập nhật...' : 'Có, đổi mật khẩu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
