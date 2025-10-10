import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Xem xe có sẵn", href: "/cars" },
  { label: "Tìm xe theo trạm", href: "/station-cars" },
  { label: "Ưu đãi", href: "#promotions" },
  { label: "Demo Flow Hoàn Chỉnh", href: "/demo-flow" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Kiểm tra user trong localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setLocalUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLocalUser(null);
      }
    } else {
      setLocalUser(null);
    }
  }, []);

  return (
    <header className={`homepage-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon" aria-hidden>
            🚗
          </div>
          <div className="brand-copy">
            <span className="brand-name">EV Car Rental</span>
            <span className="brand-tagline">Thuê xe điện – lái tương lai</span>
          </div>
        </div>

        <nav className="header-nav">
          {menuItems.map((item) =>
            item.href.startsWith("#") ? (
              <a key={item.label} href={item.href} className="nav-link">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} to={item.href} className="nav-link">
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="header-actions">
          {(user || localUser) ? (
            <div className="user-menu">
              <span className="user-greeting">
                Xin chào, <strong>{(user || localUser)?.name || (user || localUser)?.email}</strong>
              </span>
              <button 
                className="btn text-btn" 
                onClick={() => {
                  // Xóa localStorage
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  
                  // Logout từ context
                  if (logout) {
                    logout();
                  }
                  
                  // Reset local state
                  setLocalUser(null);
                  
                  // Navigate về trang chủ
                  navigate('/');
                }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link className="btn text-btn" to="/login">
                Đăng nhập
              </Link>
              <Link className="btn primary-btn" to="/register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

