import React from 'react';

// Thanh điều hướng đơn giản - dùng nếu cần menu
export default function Navbar({ children }) {
  return (
    <nav className="navbar">
      <div className="logo">MyApp</div>
      <div className="menu">{children}</div>
    </nav>
  );
}