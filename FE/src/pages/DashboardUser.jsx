import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './DashboardUser.css';

const DashboardUser = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy thông tin user từ localStorage (đúng key theo AuthContext)
        const userData = localStorage.getItem('ev_user');
        const token = localStorage.getItem('ev_token');

        if (!token || !userData || userData === "undefined" || userData === "null") {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('ev_user'); // dọn dữ liệu hỏng
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const dashboardCards = [
        {
            id: 'bookings',
            title: 'Đặt xe của tôi',
            description: 'Xem lịch sử và quản lý đặt xe',
            icon: '🚗',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            href: '/my-bookings'
        },
        {
            id: 'contracts',
            title: 'Hợp đồng điện tử',
            description: 'Xem và quản lý hợp đồng đã ký',
            icon: '📄',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            href: '/user-contract'
        },
        {
            id: 'profile',
            title: 'Tài khoản cá nhân',
            description: 'Chỉnh sửa thông tin và cài đặt',
            icon: '⚙️',
            color: 'from-gray-500 to-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            href: '/account'
        }
    ];

    const handleCardClick = (href) => {
        navigate(href);
    };

    const handleLogout = () => {
        localStorage.removeItem('ev_token');
        localStorage.removeItem('ev_user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <Header />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dashboard...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <Header />

            <div className="dashboard-container">
                {/* Welcome Section */}
                <motion.div
                    className="welcome-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="welcome-content">
                        <h1 className="welcome-title">
                            Xin chào, {user?.fullName || user?.name || user?.username || "Khách hàng"} 👋
                        </h1>
                        <p className="welcome-subtitle">
                            Chào mừng bạn đến với EV Rental Dashboard
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        Đăng xuất
                    </button>
                </motion.div>

                {/* Quick Stats removed per request */}

                {/* Dashboard Cards */}
                <div className="dashboard-cards-wrapper">
                <motion.div
                    className="dashboard-cards"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2 className="cards-title">Quản lý tài khoản</h2>
                    <div className="cards-grid">
                        {dashboardCards.map((card, index) => (
                            <motion.div
                                key={card.id}
                                className={`dashboard-card ${card.bgColor} ${card.borderColor}`}
                                onClick={() => handleCardClick(card.href)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="card-icon">
                                    <span className="icon-emoji">{card.icon}</span>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{card.title}</h3>
                                    <p className="card-description">{card.description}</p>
                                </div>
                                <div className="card-arrow">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M9 18l6-6-6-6"/>
                                    </svg>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
                </div>

                {/* Recent Activity removed per request */}
            </div>

            <Footer />
        </div>
    );
};

export default DashboardUser;
