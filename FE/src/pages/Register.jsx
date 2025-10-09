import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import StyleSwitcher from '../components/StyleSwitcher';
import { initializeStyle } from '../utils/styleSwitcher';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [gplxFront, setGplxFront] = useState(null);
  const [gplxBack, setGplxBack] = useState(null);
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  useEffect(() => {
    initializeStyle();
  }, []);

  function handleFileChange(e, setter) {
    const file = e.target.files && e.target.files[0];
    if (file) setter(file);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!name || !email || !phone || !password || !confirm) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    if (!gplxFront || !gplxBack || !cccdFront || !cccdBack) {
      setError('Vui lòng tải lên đầy đủ GPLX (2 mặt) và CCCD (2 mặt)');
      return;
    }

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('gplxFront', gplxFront);
    formData.append('gplxBack', gplxBack);
    formData.append('cccdFront', cccdFront);
    formData.append('cccdBack', cccdBack);

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Lưu thông tin user vào localStorage để sử dụng khi đăng nhập
        const userInfo = {
          name: name,
          email: email,
          phone: phone,
          role: 'USER'
        };
        localStorage.setItem('registeredUser', JSON.stringify(userInfo));
        
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate('/login');
      } else {
        setError(result.message || "Đăng ký thất bại");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
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
                <div className="brand-sub">Thuê xe điện thông minh – tiết kiệm – xanh sạch</div>
              </div>
            </div>
            <div className="page-title">Đăng ký tài khoản</div>
          </header>

          <form className="form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" style={{ 
                color: '#e74c3c', 
                backgroundColor: '#fdf2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '6px', 
                padding: '12px', 
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Tên Đăng Ký</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập Tên Đăng Ký" required />
            </div>

            <div className="form-group">
              <label>Email của bạn</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập Email bạn tại đây" required />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại tại đây" required />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu" required />
            </div>

            <div className="upload-section full">
              <h3 className="upload-title">Tải lên giấy tờ tùy thân</h3>
              
              <div className="document-group">
                <h4 className="document-title">Giấy phép lái xe (GPLX)</h4>
                <div className="upload-row">
                  <label className="file-input">
                    <div className="file-label">Mặt trước GPLX</div>
                    <div className="file-control">
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setGplxFront)} required />
                      <div className="file-name">{gplxFront ? gplxFront.name : 'Chưa chọn file'}</div>
                    </div>
                  </label>

                  <label className="file-input">
                    <div className="file-label">Mặt sau GPLX</div>
                    <div className="file-control">
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setGplxBack)} required />
                      <div className="file-name">{gplxBack ? gplxBack.name : 'Chưa chọn file'}</div>
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
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setCccdFront)} required />
                      <div className="file-name">{cccdFront ? cccdFront.name : 'Chưa chọn file'}</div>
                    </div>
                  </label>

                  <label className="file-input">
                    <div className="file-label">Mặt sau CCCD</div>
                    <div className="file-control">
                      <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setCccdBack)} required />
                      <div className="file-name">{cccdBack ? cccdBack.name : 'Chưa chọn file'}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng Ký"}
            </button>

            <div className="signup" style={{ marginTop: 12 }}>
              Đã có tài khoản? <button className="link" onClick={() => navigate('/login')}>Đăng nhập ngay</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
