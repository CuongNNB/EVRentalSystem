import React, { useMemo } from "react";
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
  const { user } = useAuth();

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

  return (
    <header className="staff-header">
      <div className="staff-header__brand">
        <div className="staff-header__logo">EV Car Rental</div>
        <span className="staff-header__badge">Staff</span>
      </div>

      <button type="button" className="staff-header__profile">
        {userName}
      </button>
    </header>
  );
};

export default StaffHeader;
