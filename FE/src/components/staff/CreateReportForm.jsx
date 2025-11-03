import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './CreateReportForm.css';
import { createReport } from '../../api/reports';
import { getAllAdmins } from '../../api/admins';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateReportForm({
  defaultStaffId = '',
  defaultVehicleDetailId = '',
  onCreated,
  className = ''
}) {
  const { user: contextUser } = useAuth();
  // Resolve user like BookingPage: prefer context, then localStorage
  const user = useMemo(() => {
    if (contextUser) return contextUser;
    try {
      const raw = localStorage.getItem('ev_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, [contextUser]);

  // Prefill staff from session/localStorage
  const storageStaffId = useMemo(() => {
    const saved = localStorage.getItem('ev_staff_id');
    if (saved) return saved;
    const u = user || {};
    const candidate = u?.staffId || u?.userId || u?.id || u?.staff?.staffId || u?.staff?.id;
    return candidate ? String(candidate) : '';
  }, [user]);

  // Keep a local read-only snapshot for display; submission will also fallback to storageStaffId
  const [staffId] = useState(String(defaultStaffId || storageStaffId || ''));
  const [vehicleDetailId, setVehicleDetailId] = useState(String(defaultVehicleDetailId || ''));
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const hasSavedStaffId = useMemo(() => Boolean(storageStaffId || defaultStaffId), [storageStaffId, defaultStaffId]);
  const [admins, setAdmins] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminId, setAdminId] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadAdmins = async () => {
      setAdminLoading(true);
      setAdminError('');
      try {
        const data = await getAllAdmins();
        if (!mounted) return;
  const list = Array.isArray(data) ? data : (data?.data || data?.content || []);
        setAdmins(list);
        // Pre-select first admin if available
  if (list.length > 0) setAdminId(String(list[0]?.adminId ?? list[0]?.id ?? list[0]?.userId ?? ''));
      } catch (e) {
        if (!mounted) return;
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách admin';
        setAdminError(msg);
      } finally {
        if (mounted) setAdminLoading(false);
      }
    };
    loadAdmins();
    return () => { mounted = false; };
  }, []);

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    // Prefer derived staff id; no manual entry required
    const sIdRaw = (staffId || storageStaffId || '').toString().trim();
    const vIdRaw = (vehicleDetailId || '').toString().trim();
    if (!sIdRaw || !vIdRaw) {
      setError('Không tìm thấy mã nhân viên hoặc mã chi tiết xe. Vui lòng đăng nhập tài khoản nhân viên và chọn xe.');
      return;
    }
    const sId = Number.isNaN(Number(sIdRaw)) ? sIdRaw : Number(sIdRaw);
    const vId = Number.isNaN(Number(vIdRaw)) ? vIdRaw : Number(vIdRaw);
    setLoading(true);
    try {
      const data = await createReport({ staffId: sId, vehicleDetailId: vId, description, adminId: Number(adminId) || undefined });
      const msg = data?.message || 'Tạo báo cáo thành công';
      setMessage(msg);
      setDescription('');
      if (typeof onCreated === 'function') onCreated(data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo báo cáo';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`crf-card max-w-xl w-full mx-auto p-5 ${className}`}>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="crf-grid">
          <div className="crf-field">
            <span className="crf-label">Mã nhân viên</span>
            {hasSavedStaffId ? (
              <div className="crf-input" style={{display:'flex',alignItems:'center',background:'#f8fafc'}}>
               <strong style={{marginLeft:6}}>{staffId || storageStaffId}</strong>
              </div>
            ) : (
              <div className="crf-msg error" style={{marginTop:0}}>
                Không tìm thấy mã nhân viên trong phiên đăng nhập. Vui lòng đăng nhập bằng tài khoản nhân viên.
              </div>
            )}
          </div>

          <div className="crf-field">
            <label htmlFor="crf-vehicle" className="crf-label">Mã chi tiết xe</label>
            <input
              id="crf-vehicle"
              type="number"
              placeholder="Nhập mã chi tiết xe"
              value={vehicleDetailId}
              onChange={(e) => setVehicleDetailId(e.target.value)}
              className="crf-input"
              readOnly
              aria-readonly="true"
              style={{ background:'#f8fafc', cursor:'not-allowed' }}
              required
            />
          </div>
        </div>

        <div className="crf-field">
          <label htmlFor="crf-desc" className="crf-label">Mô tả</label>
          <textarea
            id="crf-desc"
            placeholder="Mô tả ngắn gọn về sự cố…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="crf-textarea"
          />
        </div>

        {/* Admin selection */}
        <div className="crf-field">
          <label htmlFor="crf-admin" className="crf-label">Chọn admin phụ trách</label>
          <select
            id="crf-admin"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="crf-input"
            disabled={adminLoading}
          >
            {adminLoading && <option>Đang tải danh sách...</option>}
            {!adminLoading && admins.length === 0 && (
              <option>Không có admin</option>
            )}
            {!adminLoading && admins.length > 0 && admins.map((a) => (
              <option key={a.adminId ?? a.id ?? a.userId} value={a.adminId ?? a.id ?? a.userId}>
              {a.fullName || a.name || a.username || `Admin #${a.adminId ?? a.id ?? a.userId}`}
              </option>
            ))}
          </select>
          {adminError && <div className="crf-msg error" style={{marginTop:6}}>{adminError}</div>}
        </div>

        <div className="crf-actions">
          <button type="submit" className="crf-btn primary" disabled={loading}>
            {loading ? 'Đang tạo…' : 'Tạo báo cáo'}
          </button>
        </div>
      </form>

      {message && (
        <div className="crf-msg success">{message}</div>
      )}
      {error && (
        <div className="crf-msg error">{error}</div>
      )}
    </div>
  );
}

CreateReportForm.propTypes = {
  defaultStaffId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultVehicleDetailId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCreated: PropTypes.func,
  className: PropTypes.string,
};
