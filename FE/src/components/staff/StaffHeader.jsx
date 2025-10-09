import React from "react";

const StaffHeader = ({ userName = "Ngô Tấn Thành" }) => {
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
