import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Header.css";

const baseMenuItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Xem xe có sẵn", href: "/cars" },
    { label: "Tìm xe theo trạm", href: "/map-stations" },
    { label: "Ưu đãi", href: "#promotions" },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [localUser, setLocalUser] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Conditionally add "Tài khoản" menu item only when user is logged in
    const menuItems = useMemo(() => {
        const items = [...baseMenuItems];
        if (user || localUser) {
            items.push({ label: "Tài khoản", href: "/dashboard" });
        }
        return items;
    }, [user, localUser]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem("ev_user");
        if (userData && userData !== "undefined" && userData !== "null") {
            try {
                setLocalUser(JSON.parse(userData));
            } catch {
                setLocalUser(null);
            }
        } else setLocalUser(null);
    }, []);

    return (
        <header className={`homepage-header ${isScrolled ? "scrolled" : ""}`}>
            <div className="header-container">
                {/* === CỘT TRÁI: LOGO === */}
                <div className="header-brand">
                    <div className="brand-icon" aria-hidden>
                        <img src="/carpic/logo.png" alt="" />
                    </div>
                    <div className="brand-copy">
                        <span className="brand-name">EV Car Rental</span>
                        <span className="brand-tagline">Thuê xe điện – lái tương lai</span>
                    </div>
                </div>

                {/* === CỘT GIỮA: MENU === */}
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

                {/* === CỘT PHẢI: USER === */}
                <div className="header-actions">
                    {(user || localUser) ? (
                        <div className="user-menu">
              <span className="user-greeting">
                Xin chào,{" "}
                  <strong>
                  {(user || localUser)?.fullName ||
                      (user || localUser)?.username ||
                      (user || localUser)?.email}
                </strong>
              </span>
                            <button
                                className="btn text-btn"
                                onClick={() => {
                                    localStorage.removeItem("ev_token");
                                    localStorage.removeItem("ev_user");
                                    logout?.();
                                    setLocalUser(null);
                                    navigate("/");
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
