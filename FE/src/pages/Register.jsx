import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import hero from '../picture/ảnh nền login.png';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [gplx, setGplx] = useState(null);
  const [cccd, setCccd] = useState(null);
  const navigate = useNavigate();

  function handleFileChange(e, setter) {
    const file = e.target.files && e.target.files[0];
    if (file) setter(file);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) return alert("Mật khẩu xác nhận không khớp");
    if (!gplx || !cccd) return alert('Vui lòng tải lên GPLX và CCCD');
    alert(`Đăng ký thành công: ${name || email}`);
    navigate('/login');
  };

  return (
    <div className="register-page-layout">
      <div className="register-left">
        <div className="login-card">
          <header className="card-header">
            <div className="brand">
              <div className="logo">EV</div>
              <div className="brand-text">
                <div className="brand-title">EV-Rental</div>
                <div className="brand-sub">Tham gia EV-Rental ngay hôm nay</div>
              </div>
            </div>
            <div className="page-title">Tham gia EV-Rental ngay hôm nay</div>
          </header>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên Đăng Ký</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập Tên Đăng Ký" />
            </div>

            <div className="form-group">
              <label>Email của bạn</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập Email bạn tại đây" />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại tại đây" />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu" />
            </div>

            <div className="upload-row">
              <label className="file-input">
                <div className="file-label">GPLX</div>
                <div className="file-control">
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setGplx)} />
                  <div className="file-name">{gplx ? gplx.name : 'Chưa chọn file'}</div>
                </div>
              </label>

              <label className="file-input">
                <div className="file-label">CCCD</div>
                <div className="file-control">
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setCccd)} />
                  <div className="file-name">{cccd ? cccd.name : 'Chưa chọn file'}</div>
                </div>
              </label>
            </div>

            <button className="btn-primary" type="submit">Đăng Ký</button>

            <div className="signup" style={{ marginTop: 12 }}>
              Đã có tài khoản? <button className="link" onClick={() => navigate('/login')}>Đăng nhập ngay</button>
            </div>
          </form>
        </div>
      </div>

      <div className="register-right">
        <div className="login-illustration" style={{ backgroundImage: `url(${hero})` }}></div>
      </div>
    </div>
  );
}
