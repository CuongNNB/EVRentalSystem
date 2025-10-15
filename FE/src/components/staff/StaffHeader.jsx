import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const resolveDisplayName = (userData) => {
  if (!userData || typeof userData !== "object") {
    return "Nhân viên";
  }

  const account = userData.account || {};
  const profile = userData.profile || {};

  const nestedName =
    account.fullName ||
    account.name ||
    account.displayName ||
    profile.fullName ||
    profile.name ||
    profile.displayName;

  return (
    nestedName ||
    userData.fullName ||
    userData.name ||
    userData.displayName ||
    userData.username ||
    userData.email ||
    userData.phone ||
    "Nhân viên"
  );
};

const StaffHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fallbackUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    const stored =
      localStorage.getItem("ev_user") || localStorage.getItem("user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn("Unable to parse stored user", error);
      return null;
    }
  }, []);

  const userName = resolveDisplayName(user || fallbackUser);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="staff-header">
      <div className="staff-header__brand">
        <div className="staff-header__logo">EV Car Rental</div>
        <span className="staff-header__badge">Staff</span>
      </div>

      <div className="staff-header__actions">
        <button type="button" className="staff-header__profile">
          {userName}
        </button>
        <button 
          type="button" 
          className="staff-header__logout"
          onClick={handleLogout}
          title="Đăng xuất"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default StaffHeader;
