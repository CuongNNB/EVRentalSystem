import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
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
  
  const [notifications, setNotifications] = useState({
    bookingUpdates: true, 
    returnReminder: true, 
    promo: false, 
    analytics: true 
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('ev_user');
    const token = localStorage.getItem('ev_token');

    if (!token || !storedUser || storedUser === "undefined" || storedUser === "null") {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      
      // Set user data with fallback values
      const user = {
        avatarUrl: parsedUser.avatarUrl || "",
        fullName: parsedUser.fullName || parsedUser.name || "Người dùng",
        email: parsedUser.email || "",
        phone: parsedUser.phone || parsedUser.phoneNumber || "",
        address: parsedUser.address || "",
        joinedDate: parsedUser.joinedDate || "Tháng 1, 2025",
        cccd: parsedUser.cccd || parsedUser.identityCard || "079123456789",
        gplx: parsedUser.gplx || parsedUser.drivingLicense || "A123456789",
        kycStatus: parsedUser.kycStatus || "VERIFIED", // VERIFIED | PENDING | REJECTED
      };

      setUserData(user);
      setFormData({
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        address: user.address,
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('ev_user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
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

  // Handle form change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle password change
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
    alert('Đã lưu thông tin cá nhân (mock)');
  };

  // Change password
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    alert('Đổi mật khẩu thành công (mock)');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

  // No user data
  if (!userData) {
    return null;
  }

  const kycBadge = getKycBadge(userData.kycStatus);

  // Sidebar menu items
  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'personal', label: 'Thông tin cá nhân', icon: '👤' },
    { id: 'documents', label: 'Giấy tờ (CCCD/GPLX)', icon: '📄' },
    { id: 'security', label: 'Bảo mật', icon: '🔒' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
    { id: 'danger', label: 'Khu vực nguy hiểm', icon: '⚠️' },
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
              <p className="user-joined">Tham gia từ {userData.joinedDate}</p>
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
                  <h2 className="content-title">Tổng quan tài khoản</h2>
                  
                  <div className="overview-grid">
                    <div className="overview-card overview-card-emerald">
                      <div className="overview-label">Trạng thái KYC</div>
                      <div className="overview-value">{kycBadge.text}</div>
                    </div>
                    
                    <div className="overview-card overview-card-blue">
                      <div className="overview-label">Số điện thoại</div>
                      <div className="overview-value">{userData.phone}</div>
                    </div>
                    
                    <div className="overview-card overview-card-purple">
                      <div className="overview-label">CCCD</div>
                      <div className="overview-value">{userData.cccd}</div>
                    </div>
                    
                    <div className="overview-card overview-card-orange">
                      <div className="overview-label">GPLX</div>
                      <div className="overview-value">{userData.gplx}</div>
                    </div>
                  </div>
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
                        
                        <div className="form-group">
                          <label className="form-label">Số CCCD</label>
                          <input
                            type="text"
                            value={userData.cccd}
                            readOnly
                            className="form-input document-number"
                          />
                        </div>
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
                        
                        <div className="form-group">
                          <label className="form-label">Số GPLX</label>
                          <input
                            type="text"
                            value={userData.gplx}
                            readOnly
                            className="form-input document-number"
                          />
                        </div>
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
                    
                    <form onSubmit={handleChangePassword} className="profile-form">
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
                        <button type="submit" className="btn btn-primary">
                          <span>🔒 Cập nhật mật khẩu</span>
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

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="content-card"
                >
                  <h2 className="content-title">Cài đặt thông báo</h2>
                  
                  <div className="notifications-list">
                    {/* Booking Updates */}
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <h3 className="toggle-title">Thông báo trạng thái đơn thuê</h3>
                        <p className="toggle-description">Nhận thông báo khi đơn thuê thay đổi trạng thái</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.bookingUpdates}
                          onChange={() => handleNotificationToggle('bookingUpdates')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    {/* Return Reminder */}
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <h3 className="toggle-title">Nhắc sớm trả xe</h3>
                        <p className="toggle-description">Nhận nhắc nhở trước 24h khi đến hạn trả xe</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.returnReminder}
                          onChange={() => handleNotificationToggle('returnReminder')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    {/* Promo */}
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <h3 className="toggle-title">Khuyến mãi & ưu đãi</h3>
                        <p className="toggle-description">Nhận thông tin về các chương trình khuyến mãi</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.promo}
                          onChange={() => handleNotificationToggle('promo')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    {/* Analytics */}
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <h3 className="toggle-title">Cho phép phân tích ẩn danh</h3>
                        <p className="toggle-description">Giúp cải thiện trải nghiệm dịch vụ</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={notifications.analytics}
                          onChange={() => handleNotificationToggle('analytics')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button onClick={handleSaveNotifications} className="btn btn-primary">
                      <span>💾 Lưu cài đặt</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Danger Zone */}
              {activeSection === 'danger' && (
                <motion.div
                  key="danger"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="danger-zone"
                >
                  <h2 className="content-title" style={{ color: '#dc2626' }}>⚠️ Khu vực nguy hiểm</h2>
                  
                  <div className="danger-zone-content">
                    <h3 className="danger-title">Xóa tài khoản vĩnh viễn</h3>
                    <p className="danger-description">
                      Khi bạn xóa tài khoản, tất cả dữ liệu cá nhân, lịch sử đặt xe, và thông tin liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.
                    </p>
                    
                    <ul className="danger-list">
                      <li>Bạn sẽ mất quyền truy cập vào tài khoản ngay lập tức</li>
                      <li>Các đơn thuê đang hoạt động sẽ bị hủy</li>
                      <li>Không thể hoàn tác sau khi xác nhận</li>
                    </ul>

                    <button onClick={handleDeleteAccount} className="btn btn-danger" style={{ width: '100%' }}>
                      <span>🗑️ Xóa tài khoản</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
