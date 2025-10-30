import React from "react";
import { useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  { key: "orders", label: "Đơn hàng", icon: "🧾", to: "/staff/orders" },
  { key: "reports", label: "Báo cáo", icon: "📈", to: "/staff/report" },
];

const StaffSlideBar = ({ activeKey = "overview" }) => {
  const navigate = useNavigate();

  const handleNavigate = (item) => {
    if (item.to) {
      navigate(item.to);
    }
  };

  return (
    <aside className="staff-sidebar">
      <nav className="staff-sidebar__nav">
        {MENU_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              className={`staff-sidebar__item${
                isActive ? " staff-sidebar__item--active" : ""
              }`}
              onClick={() => handleNavigate(item)}
            >
              <span className="staff-sidebar__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="staff-sidebar__label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default StaffSlideBar;
