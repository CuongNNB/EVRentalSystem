import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import StyleSwitcher from "../components/StyleSwitcher";
import { initializeStyle } from "../utils/styleSwitcher";
import api from "../utils/api"; // ✅ Đảm bảo đúng file api.js

export default function Register() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [gplx, setGplx] = useState(null);
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeStyle();
  }, []);

  const handleFileChange = (e, setter) => {
    const file = e.target.files?.[0];
    if (file) setter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !username ||
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !confirm
    ) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (!gplx || !cccdFront || !cccdBack) {
      setError("Vui lòng tải lên đầy đủ GPLX và CCCD (2 mặt).");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("password", password);
    formData.append("gplx", gplx);
    formData.append("cccdFront", cccdFront);
    formData.append("cccdBack", cccdBack);

    try {
      setLoading(true);
      const response = await api.post("/api/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        setError(response.data.message || "Đăng ký thất bại.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Lỗi hệ thống! Không thể đăng ký, vui lòng thử lại.");
    } finally {
      setLoading(false);
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
            {error && (
              <div
                className="error-message"
                style={{
                  color: "#e74c3c",
                  backgroundColor: "#fdf2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Thông tin cá nhân */}
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div className="form-group">
              <label>Họ và tên</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div className="form-group full">
              <label>Địa chỉ</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ đầy đủ của bạn"
                required
                rows="2"
                className="address-textarea"
                style={{ resize: "none" }}
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

            {/* Upload giấy tờ */}
            <div className="upload-section full">
              <h3 className="upload-title">Tải lên giấy tờ tùy thân</h3>

              <div className="document-group">
                <h4 className="document-title">Giấy phép lái xe (GPLX)</h4>
                <div className="upload-row">
                  <label className="file-input">
                    <div className="file-label">Ảnh GPLX</div>
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
                </div>
              </div>

              <div className="document-group">
                <h4 className="document-title">Căn cước công dân (CCCD)</h4>
                <div className="upload-row">
                  <label className="file-input">
                    <div className="file-label">Mặt trước CCCD</div>
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
                    <div className="file-label">Mặt sau CCCD</div>
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
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>

            <div className="signup" style={{ marginTop: 12 }}>
              Đã có tài khoản?{" "}
              <button className="link" onClick={() => navigate("/login")}>
                Đăng nhập ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
