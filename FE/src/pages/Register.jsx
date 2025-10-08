import api from "../api/axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import StyleSwitcher from "../components/StyleSwitcher";
import { initializeStyle } from "../utils/styleSwitcher";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [gplx, setGplx] = useState(null);
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeStyle();
  }, []);

  function handleFileChange(e, setter) {
    const file = e.target.files && e.target.files[0];
    if (file) setter(file);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) return alert("Mật khẩu xác nhận không khớp!");
    if (!gplx || !cccdFront || !cccdBack)
      return alert("Vui lòng tải lên GPLX và cả 2 mặt CCCD!");

    try {
      const formData = new FormData();
      formData.append("username", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("password", password);
      formData.append("fullName", name.trim());
      formData.append("address", address.trim());
      formData.append("gplx", gplx);
      formData.append("cccdFront", cccdFront);
      formData.append("cccdBack", cccdBack);

      const res = await api.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { success, message } = res.data || {};
      if (success) {
        alert(message || "Đăng ký thành công!");
        navigate("/login");
      } else {
        alert(message || "Đăng ký thất bại!");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert(
        err.response?.data?.message ||
        "Máy chủ đang gặp sự cố. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <div className="register-page-layout">
      <StyleSwitcher />
      <div className="login-form-wrapper">
        <div className="login-card">
          <header className="card-header">
            <div className="brand">
              <div className="logo">EV</div>
              <div className="brand-text">
                <div className="brand-title">EV Car Rental</div>
                <div className="brand-sub">
                  Thuê xe điện thông minh – tiết kiệm – xanh sạch
                </div>
              </div>
            </div>
            <div className="page-title">Đăng ký tài khoản</div>
          </header>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên Đăng Ký</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập Tên Đăng Ký"
                required
              />
            </div>

            <div className="form-group">
              <label>Email của bạn</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập Email của bạn tại đây"
                required
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại tại đây"
                required
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ của bạn"
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            <div className="upload-row">
              <label className="file-input">
                <div className="file-label">GPLX</div>
                <div className="file-control">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, setGplx)}
                    required
                  />
                  <div className="file-name">
                    {gplx ? gplx.name : "Chưa chọn file"}
                  </div>
                </div>
              </label>

              <label className="file-input">
                <div className="file-label">CCCD (mặt trước)</div>
                <div className="file-control">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, setCccdFront)}
                    required
                  />
                  <div className="file-name">
                    {cccdFront ? cccdFront.name : "Chưa chọn file"}
                  </div>
                </div>
              </label>

              <label className="file-input">
                <div className="file-label">CCCD (mặt sau)</div>
                <div className="file-control">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, setCccdBack)}
                    required
                  />
                  <div className="file-name">
                    {cccdBack ? cccdBack.name : "Chưa chọn file"}
                  </div>
                </div>
              </label>
            </div>

            <button className="btn-primary" type="submit">
              Đăng Ký
            </button>

            <div className="signup" style={{ marginTop: 12 }}>
              Đã có tài khoản?{" "}
              <button
                type="button"
                className="link"
                onClick={() => navigate("/login")}
              >
                Đăng nhập ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
