/**
 * AdminSlideBar Component
 * 
 * NOTE: File được tạo mới để cung cấp thanh điều hướng sidebar cho trang Admin
 * - Hiển thị menu điều hướng (chỉ active cho các trang đã có)
 * - Sử dụng react-router-dom để điều hướng giữa các trang
 * - Hỗ trợ active state để highlight menu đang được chọn
 * - Responsive design cho mobile và desktop
 * - Các menu chưa có route sẽ bị disabled
 * 
 * @param {string} activeKey - Key của menu item đang active (mặc định: "overview")
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminSlideBar.css";

const MENU_ITEMS = [
  { key: "overview", label: "Tổng quan", icon: "📊", to: "/admin", enabled: true },
  { key: "vehicles", label: "Quản lý xe", icon: "🚘", to: "/admin/vehicles", enabled: true },
  { key: "stations", label: "Quản lý điểm thuê", icon: "📍", to: "/admin/stations", enabled: true },
  { key: "customers", label: "Quản lý khách hàng", icon: "👥", to: "/admin/customers", enabled: false },
  { key: "staff", label: "Quản lý nhân viên", icon: "👔", to: "/admin/staff", enabled: false },
  { key: "analytics", label: "Analytics", icon: "📈", to: "/admin/analytics", enabled: false },
];

const AdminSlideBar = ({ activeKey = "overview" }) => {
  const navigate = useNavigate();

  const handleNavigate = (item) => {
    // Chỉ navigate nếu menu được enable
    if (item.enabled && item.to) {
      navigate(item.to);
    }
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <h1>
          <i className="fas fa-bolt" />
          <span className="admin-sidebar__logo-text">EV-Rental Admin</span>
        </h1>
      </div>
      
      <nav className="admin-sidebar__nav">
        {MENU_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          const isDisabled = !item.enabled;
          return (
            <button
              key={item.key}
              type="button"
              className={`admin-sidebar__item${
                isActive ? " admin-sidebar__item--active" : ""
              }${isDisabled ? " admin-sidebar__item--disabled" : ""}`}
              onClick={() => handleNavigate(item)}
              disabled={isDisabled}
              title={isDisabled ? "Tính năng đang phát triển" : item.label}
            >
              <span className="admin-sidebar__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="admin-sidebar__label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSlideBar;

