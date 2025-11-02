import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './CreateReportForm.css';
import { createReport } from '../../api/reports';

export default function CreateReportForm({
  defaultStaffId = '',
  defaultVehicleDetailId = '',
  onCreated,
  className = ''
}) {
  // Prefill staff from stored session if possible
  const storageStaffId = useMemo(() => {
    // Prefer dedicated key saved during login
    const quick = localStorage.getItem('ev_staff_id');
    if (quick) return quick;
    try {
      const raw = localStorage.getItem('ev_user');
      if (!raw) return '';
      const u = JSON.parse(raw);
      return u?.staffId || u?.staff?.staffId || u?.staff?.id || '';
    } catch {
      return '';
    }
  }, []);

  const [staffId, setStaffId] = useState(String(defaultStaffId || storageStaffId || ''));
  const [vehicleDetailId, setVehicleDetailId] = useState(String(defaultVehicleDetailId || ''));
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const hasSavedStaffId = useMemo(() => Boolean(localStorage.getItem('ev_staff_id')), []);

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    const sId = Number(staffId);
    const vId = Number(vehicleDetailId);
    if (!sId || !vId) {
      setError('Vui lòng nhập đầy đủ mã nhân viên và mã chi tiết xe');
      return;
    }
    setLoading(true);
    try {
      const data = await createReport({ staffId: sId, vehicleDetailId: vId, description });
      const msg = data?.message || 'Tạo báo cáo thành công';
      setMessage(msg);
      setDescription('');
      if (typeof onCreated === 'function') onCreated(data);
    } catch (err) {
      const msg = err?.message || 'Không thể tạo báo cáo';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`crf-card max-w-xl w-full mx-auto p-5 ${className}`}>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="crf-grid">
          {hasSavedStaffId ? (
            <div className="crf-field">
              <span className="crf-label">Mã nhân viên</span>
              <div className="crf-input" style={{display:'flex',alignItems:'center',background:'#f8fafc'}}>
                Sẽ dùng mã nhân viên: <strong style={{marginLeft:6}}>{staffId}</strong>
              </div>
            </div>
          ) : (
            <div className="crf-field">
              <label htmlFor="crf-staff" className="crf-label">Mã nhân viên</label>
              <input
                id="crf-staff"
                type="number"
                placeholder="Nhập mã nhân viên"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="crf-input"
                required
              />
            </div>
          )}

          <div className="crf-field">
            <label htmlFor="crf-vehicle" className="crf-label">Mã chi tiết xe</label>
            <input
              id="crf-vehicle"
              type="number"
              placeholder="Nhập mã chi tiết xe"
              value={vehicleDetailId}
              onChange={(e) => setVehicleDetailId(e.target.value)}
              className="crf-input"
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
