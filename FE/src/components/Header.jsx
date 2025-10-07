import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const menuItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Xem xe có sẵn", href: "/cars" },
  { label: "Tìm xe theo trạm", href: "#stations" },
  { label: "Ưu đãi", href: "#promotions" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          <Link className="btn text-btn" to="/login">
            Đăng nhập
          </Link>
          <Link className="btn primary-btn" to="/register">
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}

