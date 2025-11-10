import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import "./Orders/Orders.css"; // reuse Orders page styling for consistent staff sidebar/layout
import "./StaffReport.css";
import StaffHeader from "../../components/staff/StaffHeader";
import StaffSlideBar from "../../components/staff/StaffSlideBar";
import StaffOverview from "../../components/staff/StaffOverview";
import { getModelsByStation } from "../../api/vehicles";
import { useAuth } from "../../contexts/AuthContext";
// StaffReport: Station Staff Report Page
// Uses TailwindCSS classes. Mock data used for display.

const STATUS_COLORS = {
  green: "bg-emerald-50 text-emerald-800",
  yellow: "bg-amber-50 text-amber-800",
  red: "bg-rose-50 text-rose-800",
};

// Basic color resolver to display vehicle color consistently (VN/EN)
const COLOR_MAP = {
  // Vietnamese
  'đỏ': '#ef4444', 'xanh dương': '#3b82f6', 'xanh lá': '#10b981', 'trắng': '#f8fafc', 'đen': '#111827',
  'bạc': '#c0c0c0', 'xám': '#94a3b8', 'vàng': '#f59e0b', 'cam': '#f97316', 'nâu': '#92400e',
  // English
  'red': '#ef4444', 'blue': '#3b82f6', 'green': '#10b981', 'white': '#f8fafc', 'black': '#111827',
  'silver': '#c0c0c0', 'gray': '#94a3b8', 'grey': '#94a3b8', 'yellow': '#f59e0b', 'orange': '#f97316', 'brown': '#92400e',
};
function resolveColor(raw) {
  if (!raw) return { label: '—', hex: '#e5e7eb' };
  const label = String(raw).trim();
  const key = label.toLowerCase();
  const hex = COLOR_MAP[key] || '#e5e7eb';
  return { label, hex };
}

// battery helpers kept for potential future use; not used in current table



// No mock data — rely solely on backend responses


export default function StaffReport() {
  const navigate = useNavigate();
  const { stationId } = useAuth();
  const [tab, setTab] = useState("Xe tại Trạm");
  const [now, setNow] = useState(new Date());
  const [reportType, setReportType] = useState("Sự cố");
  const [reportDesc, setReportDesc] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [toast, setToast] = useState(null);
  // sorting
  const [sortField, setSortField] = useState('id'); // 'id' | 'status'
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'
  // connection state for auto-resolved stationId
  const [connectionState, setConnectionState] = useState({ status: stationId ? 'idle' : 'error', message: stationId ? '' : 'Chưa xác định được trạm cho nhân viên.' });

  // removed manual station init; stationId comes from AuthContext/localStorage
  // realtime clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

 

  // simple toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // no external chart dependency required — using simple SVG charts

  // stationName is derived from context stationId or fallback localStorage key
  const stationName = stationId ? `Trạm ${stationId}` : (() => {
    if (typeof window !== 'undefined') {
      const savedStation = window.localStorage.getItem('ev_station_id');
      if (savedStation && savedStation.trim()) return `Trạm ${savedStation.trim()}`;
    }
    return null;
  })();
  const shift = "Sáng (07:00–15:00)";

  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState("");

  // small helpers
  const formatStatus = (raw) => {
    const s = String(raw ?? '').toLowerCase();
    if (s.includes('avail')) return 'Sẵn sàng';
    if (s.includes('fix')) return 'Sửa chữa';
    if (s === 'rented' || s.includes('rent')) return 'Đang thuê';
    return raw ?? '—';
  };
  // battery extraction removed from table usage; can be reintroduced if needed

  // Derive display lists from models with safe fallbacks to mocks
  const vehiclesFromModels = useMemo(() => {
    if (!Array.isArray(models) || models.length === 0) return [];
    const out = [];

    const pickList = (m) => {
      if (Array.isArray(m?.vehicles)) return m.vehicles;
      if (Array.isArray(m?.vehicleDetails)) return m.vehicleDetails;
      if (Array.isArray(m?.vehicleDetailResponses)) return m.vehicleDetailResponses;
      if (Array.isArray(m?.vehicleDetailList)) return m.vehicleDetailList;
      if (Array.isArray(m?.items)) return m.items;
      if (Array.isArray(m?.list)) return m.list;
      // Fallback: find the first array-like field that contains objects with plate/id
      const arrays = Object.values(m).filter(Array.isArray);
      for (const arr of arrays) {
        if (arr.length && typeof arr[0] === 'object') return arr;
      }
      return [];
    };

    const normalize = (raw) => {
      const node = raw?.vehicleDetail || raw?.vehicle || raw; // common nesting
      const id = node?.code ?? node?.vehicleCode ?? node?.detailCode ?? node?.licensePlate ?? node?.id ?? node?.vehicleId ?? `CAR-${out.length + 1}`;
      const vehicleDetailId = node?.vehicleDetailId ?? (Number.isInteger(node?.id) ? node.id : null);
      const plate = node?.plate ?? node?.plateNumber ?? node?.licensePlate ?? node?.registrationNumber ?? '--';
      const status = node?.status ?? node?.vehicleStatus ?? node?.state ?? node?.currentStatus ?? 'Available';
      const colorRaw = node?.color ?? node?.vehicleColor ?? node?.colorName ?? node?.exteriorColor ?? node?.paint ?? null;
      const { label: color, hex: colorHex } = resolveColor(colorRaw);
      return { id, vehicleDetailId, plate, color, colorHex, status };
    };

    for (const m of models) {
      const list = pickList(m);
      for (const v of list) out.push(normalize(v));
    }
    return out;
  }, [models]);

  const cars = useMemo(() => vehiclesFromModels, [vehiclesFromModels]);

  // Count vehicleDetailId occurrences for overview display
  const vehicleDetailsCount = useMemo(() => {
    if (vehiclesFromModels.length > 0) {
      return vehiclesFromModels.reduce((acc, v) => acc + (v?.vehicleDetailId ? 1 : 0), 0);
    }
    // fallback when using mocks (no vehicleDetailId in mocks): use total cars length
    return cars.length;
  }, [vehiclesFromModels, cars]);

  // Count AVAILABLE vehicles for overview
  const availableCount = useMemo(() => {
    const countAvail = (list) => list.reduce((acc, v) => {
      const st = String(v?.status ?? '').toLowerCase();
      return acc + (st.includes('avail') ? 1 : 0);
    }, 0);
    if (vehiclesFromModels.length > 0) return countAvail(vehiclesFromModels);
    return countAvail(cars);
  }, [vehiclesFromModels, cars]);

  // Count RENTED vehicles for overview
  const rentedCount = useMemo(() => {
    const countRented = (list) => list.reduce((acc, v) => {
      const st = String(v?.status ?? '').toLowerCase();
      // Prefer exact 'rented' match but allow broader 'rent' includes to be robust
      return acc + ((st === 'rented' || st.includes('rent')) ? 1 : 0);
    }, 0);
    if (vehiclesFromModels.length > 0) return countRented(vehiclesFromModels);
    return countRented(cars);
  }, [vehiclesFromModels, cars]);

  // Count FIXING/maintenance/repair vehicles for overview (Xe sự cố)
  const incidentCount = useMemo(() => {
    const countFixing = (list) => list.reduce((acc, v) => {
      const st = String(v?.status ?? '').toLowerCase();
      // Match common variants: fixing, repair, maintenance, under_maintenance, broken
      return acc + (
        st.includes('fix') ||
        st.includes('repair') ||
        st.includes('maint') ||
        st.includes('broken')
          ? 1
          : 0
      );
    }, 0);
    if (vehiclesFromModels.length > 0) return countFixing(vehiclesFromModels);
    return countFixing(cars);
  }, [vehiclesFromModels, cars]);

  // helpers for sorting
  const extractCodeNumber = (code) => {
    const m = String(code ?? '').match(/(\d+)/g);
    if (!m || m.length === 0) return Number.MAX_SAFE_INTEGER;
    return Number.parseInt(m.at(-1), 10);
  };
  const statusRank = (s) => {
    const k = String(s ?? '').toLowerCase();
    // customizable order: Available < Reserved < Rented
    if (k.includes('avail')) return 0;
    if (k.includes('reserv')) return 1;
    if (k.includes('rent')) return 2;
    return 99;
  };
  const sortedCars = useMemo(() => {
    const arr = [...cars];
    if (sortField === 'id') {
      const getSortId = (c) => (Number.isInteger(c?.vehicleDetailId) ? c.vehicleDetailId : extractCodeNumber(c?.id));
      arr.sort((a, b) => getSortId(a) - getSortId(b));
    } else if (sortField === 'status') {
      arr.sort((a, b) => statusRank(a.status) - statusRank(b.status));
    }
    if (sortDir === 'desc') arr.reverse();
    return arr;
  }, [cars, sortField, sortDir]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const [incidents] = useState([]); // placeholder for future backend incidents wiring
  // revenue/transactions removed

 

  const handleSendReport = (e) => {
    e.preventDefault();
    // mock submit
    console.log("Report sent", { reportType, reportDesc, reportFile });
    setReportType("Sự cố");
    setReportDesc("");
    setReportFile(null);
    setToast({ type: "success", message: "✅ Báo cáo đã gửi" });
  };


  // removed manual station submit/reset handlers






  // fetch models when stationId or fallback localStorage station exists
  useEffect(() => {
    let mounted = true;
    async function loadModels() {
      const effectiveStation = stationId || (typeof window !== 'undefined' ? window.localStorage.getItem('ev_station_id') : '');
      if (!effectiveStation) {
        setModels([]);
        setConnectionState({ status: 'error', message: 'Chưa xác định được trạm cho nhân viên.' });
        return;
      }
      setModelsLoading(true);
      setModelsError('');
      setConnectionState({ status: 'loading', message: `Đang tải dữ liệu xe của trạm ${effectiveStation}...` });
      try {
        const data = await getModelsByStation(effectiveStation);
        if (!mounted) return;
        setModels(Array.isArray(data) ? data : []);
        setConnectionState({ status: 'success', message: `Đã tải ${data?.length || 0} xe của trạm ${effectiveStation}.` });
      } catch (err) {
        if (!mounted) return;
        setModelsError(err?.response?.data?.message || err.message || 'Lỗi khi tải mẫu xe');
        setConnectionState({ status: 'error', message: `Không thể tải dữ liệu xe cho trạm ${effectiveStation}.` });
      } finally {
        if (mounted) setModelsLoading(false);
      }
    }
    loadModels();
    return () => { mounted = false; };
  }, [stationId]);

  

  return (
    <div className="staff-shell">
      <StaffHeader />
      <div className="staff-layout">
        <StaffSlideBar activeKey="reports" />
        <main className="staff-main">
          <section className="staff-content">
            <div className="staff-content__heading">
              <p className="staff-content__eyebrow">Báo cáo</p>
              <h1>Báo cáo nhân viên tại điểm thuê xe</h1>
              <p className="staff-content__intro">Trạm quản lý & báo cáo vận hành — {stationName || 'Chưa chọn trạm'} | Ca: {shift} | {now.toLocaleTimeString()}</p>
            </div>

            {/* Station info banner */}
            {!stationName && (
              <div className="sr-station-alert">Chưa xác định được trạm cho nhân viên. Vui lòng đăng nhập lại tài khoản STAFF hoặc kiểm tra server trả về stationId.</div>
            )}

          {toast && (
            <div className={`staff-toast staff-toast--success`}>
              <div className="staff-toast__icon">✅</div>
              <div className="staff-toast__body">
                <div className="staff-toast__title">Thành công</div>
                <div className="staff-toast__message">{toast.message}</div>
              </div>
            </div>
          )}
{/* 🔹 Hiển thị trạng thái kết nối trạm */}
{connectionState.status !== "idle" && (
  (() => {
    const base = {
      marginTop: "12px",
      marginBottom: "12px",
      padding: "10px 14px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 500,
      display: "inline-block",
    };
    let tone = { backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" };
    if (connectionState.status === "success") tone = { backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #6ee7b7" };
    if (connectionState.status === "error") tone = { backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" };
    return (
      <div className="staff-orders__connection" style={{ ...base, ...tone }}>
        {connectionState.message}
      </div>
    );
  })()
)}

            {/* Current station banner */}
            {stationId && (
              <div
                style={{
                  marginBottom: "12px",
                  display: "inline-block",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #6ee7b7",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: "#047857",
                }}
              >
                Đang sử dụng trạm: <strong>{stationId}</strong>
              </div>
            )}

{/* 🔹 Form nhập mã trạm thủ công */}
            {/* Manual station form removed */}

            {/* Overview moved to component */}
            <StaffOverview
              vehicleDetailsCount={vehicleDetailsCount}
              availableCount={availableCount}
              rentedCount={rentedCount}
              incidentCount={incidentCount}
            />

            {/* models detail section removed — counts are aggregated into the overview cards */}

            {/* Tabs + content */}
            <div className="orders-card">
              <div className="orders-card__header">
                <div>
                  <h2>Hoạt động & thống kê</h2>
                  <Tabs tab={tab} onChange={setTab} />
                  <p className="staff-content__intro">Cập nhật nhanh các giao dịch, xe và sự cố</p>
                </div>
                
              </div>

              {/* detailed models list removed — counts reflected in overview cards */}

              <div>
          {tab === "Xe tại Trạm" && (
            <div>
              <div style={{overflowX:'auto'}}>
                <table className="sr-table">
                  <thead>
                    <tr className="text-left text-slate-600 border-b">
                      <th className="py-2 sr-sortable" onClick={() => handleSort('id')}>
                        Mã xe {sortField==='id' && <span className="sr-sort-ind">{sortDir==='asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th>Biển số</th>
                      <th>Màu xe</th>
                      <th className="sr-sortable" onClick={() => handleSort('status')}>
                        Trạng thái {sortField==='status' && <span className="sr-sort-ind">{sortDir==='asc' ? '▲' : '▼'}</span>}
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody> 
                    {sortedCars.map((c) => (
                      <tr key={c.id} className="odd:bg-slate-50">
                        <td className="py-2 font-medium">{Number.isInteger(c?.vehicleDetailId) ? c.vehicleDetailId : c.id}</td>
                        <td>{c.plate}</td>
                        <td>
                          <span className="sr-color-chip">
                            <span className="sr-color-dot" style={{ backgroundColor: c.colorHex }} aria-hidden="true" />
                            <span>{c.color || '—'}</span>
                          </span>
                        </td>
                        <td>{formatStatus(c.status)}</td>
                        <td>
                          <button
                            className="sr-btn sr-btn--danger sr-btn--sm"
                            onClick={() => navigate('/staff/report/create', { state: { vehicleDetailId: c.vehicleDetailId, plate: c.plate, id: c.id } })}
                          >
                            Báo sự cố
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "Sự cố" && (
            <div>
              <div style={{overflowX:'auto'}}>
                <table className="sr-table">
                  <thead>
                    <tr className="text-left text-slate-600 border-b">
                      <th className="py-2">Mã sự cố</th>
                      <th>Mã xe</th>
                      <th>Thời gian</th>
                      <th>Mô tả</th>
                      <th>Ảnh</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-3 text-center text-slate-400">Chưa có sự cố</td>
                      </tr>
                    ) : (
                      incidents.map((inc) => (
                        <tr key={inc.id} className="odd:bg-slate-50">
                          <td className="py-2 font-medium">{inc.id}</td>
                          <td>{inc.carId}</td>
                          <td>{inc.time}</td>
                          <td>{inc.desc}</td>
                          <td>{inc.img ? <img src={inc.img} alt="inc" className="w-16 h-12 object-cover rounded" /> : <span className="text-slate-400">—</span>}</td>
                          <td>{inc.status}</td>
                          <td><button className="sr-btn sr-btn--primary sr-btn--sm">Cập nhật trạng thái</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Revenue tab removed */}
        </div>
      </div>

      {/* Quick report form */}
      <section style={{marginTop:24}}>
        <div style={{background:'#fff',borderRadius:10,padding:16,boxShadow:'0 1px 3px rgba(15,23,42,0.06)'}}>
          <h3 style={{fontWeight:600,marginBottom:12}}>Báo cáo nhanh</h3>
          <form onSubmit={handleSendReport} className="sr-form">
            <div>
              <label htmlFor="reportType" className="small-muted">Loại báo cáo</label>
              <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} className="sr-select">
                <option> Sự cố</option>
                <option> Pin yếu</option>
                <option> Thiếu xe</option>
                <option> Khác</option>
              </select>
            </div>

            <div>
              <label htmlFor="reportDesc" className="small-muted">Mô tả</label>
              <textarea id="reportDesc" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={3} className="sr-textarea" />
            </div>

            <div>
              <label htmlFor="reportFile" className="small-muted">Ảnh</label>
              <input id="reportFile" type="file" onChange={(e) => setReportFile(e.target.files?.[0] ?? null)} />
            </div>

            <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
              <button type="submit" className="sr-btn sr-btn--primary">Gửi báo cáo</button>
              <button type="button" onClick={() => { setReportDesc(''); setReportFile(null); }} className="sr-btn sr-btn--ghost">Hủy</button>
            </div>
          </form>
        </div>
      </section>
          </section>
        </main>
      </div>
    </div>
  );
}

// Card moved to StaffOverview component

function Tabs({ tab, onChange }) {
  const tabs = ["Xe tại Trạm", "Sự cố"]; // removed Doanh thu
  return (
    <nav className="sr-tabs">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={`sr-tab ${tab === t ? 'active' : ''}`}>
          {t}
        </button>
      ))}
    </nav>
  );
}

// Card propTypes defined within StaffOverview component

Tabs.propTypes = {
  tab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

// charts removed
