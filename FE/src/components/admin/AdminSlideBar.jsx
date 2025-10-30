import { NavLink } from "react-router-dom";
import "./AdminSlideBar.css";

const MENU_ITEMS = [
  { key: "overview",  label: "Tổng quan",            icon: "📊", to: "/admin",           enabled: true  },
  { key: "vehicles",  label: "Quản lý xe",           icon: "🚘", to: "/admin/vehicles",  enabled: true  },
  { key: "stations",  label: "Quản lý điểm thuê",    icon: "📍", to: "/admin/stations",  enabled: false }, // <- nếu chưa có trang thì để false
  { key: "customers", label: "Quản lý khách hàng",   icon: "👥", to: "/admin/customers", enabled: true  },
  { key: "staff",     label: "Quản lý nhân viên",    icon: "👔", to: "/admin/staff",     enabled: true  },
  { key: "analytics", label: "Báo cáo & Phân tích",  icon: "📈", to: "/admin/analytics", enabled: true  },
];

const AdminSlideBar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <h1>
          <i className="fas fa-bolt" />
          <span className="admin-sidebar__logo-text">EV-Rental Admin</span>
        </h1>
      </div>

      <nav className="admin-sidebar__nav">
        {MENU_ITEMS.map((item) =>
          item.enabled === false ? (
            <button
              key={item.key}
              type="button"
              className="admin-sidebar__item admin-sidebar__item--disabled"
              disabled
              title="Tính năng đang phát triển"
            >
              <span className="admin-sidebar__icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-sidebar__label">{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                "admin-sidebar__item" + (isActive ? " admin-sidebar__item--active" : "")
              }
              title={item.label}
            >
              <span className="admin-sidebar__icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-sidebar__label">{item.label}</span>
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
};

export default AdminSlideBar;
