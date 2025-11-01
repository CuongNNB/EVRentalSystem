import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, createStaff } from "../../api/adminStaff";


export default function AddStaffPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    position: "STAFF",
    stationId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getStations();
        setStations(data);
      } catch {
        setError("Không tải được danh sách trạm");
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (f) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneDigits = (f.phone ?? "").replace(/\D/g, "");
    if (!f.username?.trim()) return "Tên đăng nhập là bắt buộc";
    if (!f.password?.trim()) return "Mật khẩu là bắt buộc";
    if (!f.fullName?.trim()) return "Họ và tên là bắt buộc";
    if (!f.email?.trim()) return "Email là bắt buộc";
    if (!emailRegex.test(f.email.trim())) return "Email không hợp lệ";
    if (!f.phone?.trim()) return "Số điện thoại là bắt buộc";
    if (phoneDigits.length < 9 || phoneDigits.length > 11) return "Số điện thoại phải dài 9–11 số";
    if (!f.address?.trim()) return "Địa chỉ là bắt buộc";
    if (!f.stationId) return "Vui lòng chọn trạm làm việc";
    return null; // hợp lệ
  };

  const sanitizeForm = (f) => ({
    username: f.username.trim(),
    password: f.password, 
    fullName: f.fullName.trim(),
    email: f.email.trim(),
    phone: f.phone.trim(),
    address: f.address.trim(),
    stationId: Number(f.stationId),
    // position không cần gửi (BE gán STAFF), nhưng giữ hidden cũng không sao
  });

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validateForm(form);
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      setError("");
      await createStaff(sanitizeForm(form));
      alert("✅ Thêm nhân viên thành công!");
      navigate("/admin/staff");
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể thêm nhân viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div className="icon">👤</div>
        <div>
          <div className="page-sub">Quản trị • Nhân viên</div>
          <div className="page-title">Thêm nhân viên mới</div>
        </div>
        <div className="spacer" />
        <button className="btn btn-light" onClick={() => navigate("/admin/staff")}>
          ← Quay lại
        </button>
      </div>

      {error && <div className="alert alert-error">Lỗi: {error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <div className="label">Tên đăng nhập</div>
          <input className="input" name="username" value={form.username} onChange={handleChange} required />
        </div>

        <div className="field">
          <div className="label">Mật khẩu</div>
          <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>

        <div className="field">
          <div className="label">Họ và tên</div>
          <input className="input" name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>

        <div className="field">
          <div className="label">Email</div>
          <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="field">
          <div className="label">Số điện thoại</div>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} required />
        </div>

        <div className="field">
          <div className="label">Địa chỉ</div>
          <input className="input" name="address" value={form.address} onChange={handleChange} required />
        </div>

        <div className="field">
          <div className="label">Vị trí</div>
          <input className="input" value="STAFF" disabled readOnly />
          <input type="hidden" name="position" value="STAFF" />
        </div>

        <div className="field">
          <div className="label">Trạm làm việc</div>
          <select className="input" name="stationId" value={form.stationId} onChange={handleChange} required>
            <option value="">— Chọn trạm —</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Đang lưu…" : "Thêm nhân viên"}
        </button>
      </form>
    </div>
  );
}
