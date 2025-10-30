import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';
import "./Orders/Orders.css"; // reuse Orders page styling for consistent staff sidebar/layout
import "./StaffReport.css";
import StaffHeader from "../../components/staff/StaffHeader";
import StaffSlideBar from "../../components/staff/StaffSlideBar";
import { getModelsByStation } from "../../api/vehicles";
// StaffReport: Station Staff Report Page
// Uses TailwindCSS classes. Mock data used for display.

const STATUS_COLORS = {
  green: "bg-emerald-50 text-emerald-800",
  yellow: "bg-amber-50 text-amber-800",
  red: "bg-rose-50 text-rose-800",
};

const batteryColorClass = (p) => {
  if (p < 30) return "bg-rose-50 text-rose-700"; // red-ish
  if (p <= 70) return "bg-amber-50 text-amber-700"; // yellow
  return "bg-emerald-50 text-emerald-700"; // green
};

// Helpers to avoid nested ternaries and make testable logic
function getCondition(i) {
  const mod = i % 3;
  if (mod === 0) return 'OK';
  if (mod === 1) return 'Minor';
  return 'Major';
}

function getTech(i) {
  const mod = i % 4;
  if (mod === 0) return 'OK';
  if (mod === 1) return 'Minor';
  return 'Needs Service';
}

function getStatus(i) {
  const mod = i % 3;
  if (mod === 0) return 'Available';
  if (mod === 1) return 'Rented';
  return 'Reserved';
}

function batteryStatusLabel(pct) {
  if (pct < 30) return 'Yếu';
  if (pct <= 70) return 'TB';
  return 'Tốt';
}
function batteryBadgeClass(pct) {
  if (pct < 30) return 'red';
  if (pct <= 70) return 'yellow';
  return 'green';
}

// Aggregate counts from models/vehicles returned by API
function countFromVehicles(vehicles) {
  let total = vehicles.length;
  let rented = 0, reserved = 0, needCharge = 0;
  for (const v of vehicles) {
    const st = (v.status || v.vehicleStatus || v.state || '') + '';
    const stl = st.toLowerCase();
    if (stl.includes('rent')) rented += 1;
    if (stl.includes('reserved') || stl.includes('reserve') || stl.includes('book')) reserved += 1;
    const battery = v.battery ?? v.batteryPercent ?? v.charge ?? null;
    if (typeof battery === 'number' && battery < 30) needCharge += 1;
  }
  return { total, rented, reserved, needCharge };
}

function aggregateFromModels(models) {
  let total = 0, rented = 0, reserved = 0, needCharge = 0;
  for (const m of models) {
    if (Array.isArray(m.vehicles)) {
      const c = countFromVehicles(m.vehicles);
      total += c.total;
      rented += c.rented;
      reserved += c.reserved;
      needCharge += c.needCharge;
    } else if (typeof m.count === 'number') {
      total += m.count;
    } else if (typeof m.available === 'number') {
      total += m.available;
    }
  }
  return { carsOnSite: total, carsRented: rented, carsReserved: reserved, carsNeedCharge: needCharge };
}
const mockSummary = {
  carsOnSite: 24,
  carsRented: 8,
  carsReserved: 6,
  carsNeedCharge: 5,
  incidents: 2,
  revenueToday: 4520000,
};

const mockTransactions = Array.from({ length: 8 }).map((_, i) => ({
  id: `TR-${20251029}-${100 + i}`,
  customer: ["Nguyễn A", "Trần B", "Lê C", "Phạm D"][i % 4],
  car: ["Model S - A1", "Model 3 - B2", "Eagle - C3"][i % 3],
  timeOut: `${7 + (i % 8)}:00`,
  timeIn: `${10 + (i % 8)}:00`,
  condition: getCondition(i),
  signed: i % 2 === 0 ? "Đã ký" : "Chưa ký",
  amount: (400000 + i * 120000),
}));

const mockCars = Array.from({ length: 12 }).map((_, i) => ({
  id: `CAR-${100 + i}`,
  plate: `30A-${100 + i}`,
  battery: Math.max(10, 100 - i * 6),
  tech: getTech(i),
  status: getStatus(i),
}));

const mockIncidents = Array.from({ length: 4 }).map((_, i) => ({
  id: `INC-${300 + i}`,
  carId: mockCars[i]?.id || `CAR-${300 + i}`,
  time: `2025-10-2${8 + i} 0${8 + i}:12`,
  desc: ["Vỡ đèn", "Trầy xước cửa", "Lỗi phanh", "Pin giảm bất thường"][i],
  img: null,
  status: i % 2 === 0 ? "Mới" : "Đang xử lý",
}));

const revenue7days = [
  { day: "23/10", value: 2000000 },
  { day: "24/10", value: 1500000 },
  { day: "25/10", value: 2400000 },
  { day: "26/10", value: 1800000 },
  { day: "27/10", value: 2100000 },
  { day: "28/10", value: 3000000 },
  { day: "29/10", value: 4520000 },
];

const donutData = [
  { name: "Thuê", value: 68 },
  { name: "Trả", value: 25 },
  { name: "Sự cố", value: 7 },
];

const COLORS = ["#2563EB", "#06B6D4", "#F59E0B"]; // blue, teal, amber

// Simple SVG bar chart (small, dependency-free)
function SimpleBarChart({ data, width = '100%', height = 240 }) {
  const max = Math.max(...data.map(d => d.value));
  const bars = data.map((d, i) => ({
    ...d,
    pct: d.value / max
  }));
  const barGap = 8;
  const barWidth = Math.max(12, Math.floor((300 - (data.length - 1) * barGap) / data.length));
  return (
    <div style={{width, height}} className="recharts-wrapper">
      <svg viewBox={`0 0 ${data.length * (barWidth + barGap)} ${height}`} preserveAspectRatio="none" width="100%" height="100%">
        {bars.map((b, i) => {
          const x = i * (barWidth + barGap);
          const barH = Math.max(4, Math.round(b.pct * (height - 40)));
          const y = (height - 20) - barH;
          return (
            <g key={b.day}>
              <rect x={x} y={y} width={barWidth} height={barH} fill={COLORS[i % COLORS.length]} rx="4" />
              <text x={x + barWidth/2} y={height - 4} fontSize="10" textAnchor="middle" fill="#475569">{b.day}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Simple SVG donut chart
function SimpleDonut({ data, colors = COLORS, size = 160, stroke = 26 }){
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - stroke) / 2;
  const cx = size/2, cy = size/2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div style={{width: size, height: size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const portion = d.value / total;
          const dash = portion * circumference;
          const dashArray = `${dash} ${circumference - dash}`;
          const rotation = (offset / circumference) * 360;
          offset += dash;
          return (
            <g key={d.name} transform={`rotate(${rotation} ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={radius} fill="none" stroke={colors[i % colors.length]} strokeWidth={stroke} strokeDasharray={dashArray} strokeLinecap="butt" transform={`translate(0,0)`} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={radius - stroke/2} fill="#fff" />
        <text x={cx} y={cy} textAnchor="middle" dy="4" fontSize="14" fill="#0f172a">{total}</text>
      </svg>
    </div>
  );
}

export default function StaffReport() {
  const [tab, setTab] = useState("Xe tại Trạm");
  const [now, setNow] = useState(new Date());
  const [reportType, setReportType] = useState("Sự cố");
  const [reportDesc, setReportDesc] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  // station/manual setup state (allow staff to enter station code like Orders page)
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualStationValue, setManualStationValue] = useState(null);
  const [connectionState, setConnectionState] = useState({
    status: "idle",
    message: "",
  });
  const [isEditingStation, setIsEditingStation] = useState(false);


  
useEffect(() => {
  const savedStation = localStorage.getItem("staff_station_id");
  if (savedStation) {
    setManualStationValue(savedStation);
    setManualInput(savedStation);
  } else {
    setIsEditingStation(true);
  }
}, []);
  // realtime clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // auto refresh mock data every 2 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setDataRefreshKey((k) => k + 1), 120000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // simple toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // no external chart dependency required — using simple SVG charts

  // stationName is derived from manualStationValue when set.
  const stationName = manualStationValue ? `Trạm ${manualStationValue}` : null;
  const shift = "Sáng (07:00–15:00)";

  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState("");

  // Derive display lists from models with safe fallbacks to mocks
  const vehiclesFromModels = useMemo(() => {
    if (!Array.isArray(models) || models.length === 0) return [];
    const out = [];
    for (const m of models) {
      const list = Array.isArray(m?.vehicles) ? m.vehicles : [];
      for (const v of list) {
        out.push({
          id: v?.id ?? v?.vehicleId ?? v?.code ?? v?.licensePlate ?? `CAR-${out.length + 1}`,
          plate: v?.plate ?? v?.plateNumber ?? v?.licensePlate ?? v?.registrationNumber ?? `--` ,
          battery: typeof v?.batteryPercent === 'number' ? v.batteryPercent : (typeof v?.battery === 'number' ? v.battery : (typeof v?.charge === 'number' ? v.charge : Math.floor(Math.random()*50)+30)),
          tech: v?.technicalStatus ?? v?.techStatus ?? 'OK',
          status: v?.status ?? v?.vehicleStatus ?? 'Available',
        });
      }
    }
    return out;
  }, [models]);

  const cars = useMemo(() => {
    return vehiclesFromModels.length > 0 ? vehiclesFromModels : mockCars;
  }, [vehiclesFromModels, dataRefreshKey]);

  const incidents = mockIncidents; // placeholder until backend incidents wiring
  const transactions = mockTransactions; // placeholder for recent transactions

  const summary = useMemo(() => {
  if (models && models.length > 0) {
    return { ...aggregateFromModels(models), ...mockSummary };
  }
  return mockSummary;
}, [models, dataRefreshKey]);

 

  const handleSendReport = (e) => {
    e.preventDefault();
    // mock submit
    console.log("Report sent", { reportType, reportDesc, reportFile });
    setReportType("Sự cố");
    setReportDesc("");
    setReportFile(null);
    setToast({ type: "success", message: "✅ Báo cáo đã gửi" });
  };

const handleManualSubmit = async (e) => {
  e.preventDefault();
  if (!manualInput?.trim()) {
    setManualError("Vui lòng nhập mã trạm hợp lệ.");
    return;
  }

  setConnectionState({ status: "loading", message: "Đang tải dữ liệu trạm..." });

  try {
    const data = await getModelsByStation(manualInput.trim());
    setModels(data);
    setManualStationValue(manualInput.trim());
    setManualError("");
    localStorage.setItem("staff_station_id", manualInput.trim());
    setConnectionState({
      status: "success",
      message: `Đã tải ${data?.length || 0} xe của trạm ${manualInput.trim()}.`,
    });
    setIsEditingStation(false);
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
    setConnectionState({
      status: "error",
      message: "Không tìm thấy trạm hoặc lỗi khi lấy dữ liệu.",
    });
  }
};




  const handleManualReset = () => {
  localStorage.removeItem("staff_station_id");
  setManualStationValue(null);
  setManualInput("");
  setIsEditingStation(true);
  setConnectionState({
    status: "idle",
    message: "",
  });
};


  // fetch models when station is configured
  useEffect(() => {
    let mounted = true;
    async function loadModels() {
      if (!manualStationValue) {
        setModels([]);
        return;
      }
      setModelsLoading(true);
      setModelsError("");
      try {
        const { getModelsByStation } = await import('../../api').then(m => m.vehicles);
        const data = await getModelsByStation(manualStationValue);
        if (!mounted) return;
        setModels(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setModelsError(err?.response?.data?.message || err.message || 'Lỗi khi tải mẫu xe');
      } finally {
        if (mounted) setModelsLoading(false);
      }
    }
    loadModels();
    return () => { mounted = false; };
  }, [manualStationValue]);

  

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
              <p className="staff-content__intro">Trạm quản lý & báo cáo vận hành — {stationName ? stationName : 'Chưa chọn trạm'} | Ca: {shift} | {now.toLocaleTimeString()}</p>
            </div>

            {/* Station not found / manual setup (copied behavior from Orders page) */}
            {!stationName && (
              <div>
                <div className="sr-station-alert">Chưa tìm thấy trạm. Vui lòng thiết lập thủ công.</div>
                {connectionState.status === 'success' && manualStationValue && (
                  <div className="station-success-box">
                    <p>✅ {connectionState.message}</p>
                  </div>
                )}
{manualStationValue && (
  <div className="station-info-box">
    <p>Đang sử dụng trạm: <strong>{manualStationValue}</strong></p>
    <button type="button" onClick={handleManualReset} className="btn-outline-orange">Thay đổi trạm</button>
  </div>
)}
                <form className="manual-station-form" onSubmit={handleManualSubmit}>
                  <div className="manual-station-field">
                    <label htmlFor="manual-station-id" className="manual-station-label">Nhập mã trạm cho nhân viên</label>
                    <input
                      id="manual-station-id"
                      type="text"
                      value={manualInput}
                      onChange={(event) => { setManualInput(event.target.value); setManualError(""); }}
                      className={`manual-station-input ${manualStationValue ? 'manual-station--active' : ''}`}
                      placeholder="Ví dụ: 1"
                    />
                    {manualError && <p className="manual-error">{manualError}</p>}
                  </div>
                  <div className="manual-actions">
                    <button type="submit" className="btn-primary-orange">Thiết lập trạm</button>
                    {manualStationValue && <button type="button" onClick={handleManualReset} className="btn-outline-orange">Xóa cấu hình</button>}
                  </div>
                                  {modelsLoading && <p className="manual-loading">Đang tải mẫu xe...</p>}
                                  {modelsError && <p className="manual-error">{modelsError}</p>}
                </form>
              </div>
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
  <div
    className="staff-orders__connection"
    style={{
      ...(connectionState.status === "success"
        ? { backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #6ee7b7" }
        : connectionState.status === "error"
        ? { backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }
        : { backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }),
      marginTop: "12px",
      marginBottom: "12px",
      padding: "10px 14px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 500,
      display: "inline-block",
    }}
  >
    {connectionState.message}
  </div>
)}

{/* 🔹 Khi đã có trạm, hiển thị trạng thái và nút đổi */}
{manualStationValue && !isEditingStation && (
  <div
    style={{
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
      backgroundColor: "#ecfdf5",
      border: "1px solid #6ee7b7",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "14px",
      color: "#047857",
    }}
  >
    <span>
      Đang sử dụng trạm: <strong>{manualStationValue}</strong>
    </span>
    <button
      type="button"
      onClick={() => {
        setManualInput(manualStationValue);
        setIsEditingStation(true);
        setConnectionState({ status: "idle", message: "" });
      }}
      style={{
        padding: "6px 14px",
        borderRadius: "6px",
        border: "1px solid #10b981",
        background: "#fff",
        color: "#047857",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Thay đổi trạm
    </button>
  </div>
)}

{/* 🔹 Form nhập mã trạm thủ công */}
{isEditingStation && (
  <form
    className="staff-orders__manual-station"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      marginBottom: "16px",
      backgroundColor: "#fff7ed",
      border: "1px dashed #fb923c",
      borderRadius: "12px",
      flexWrap: "wrap",
    }}
    onSubmit={handleManualSubmit}
  >
    <div style={{ flex: "1 1 220px" }}>
      <label
        htmlFor="manual-station-id"
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "6px",
          color: "#b45309",
        }}
      >
        Nhập mã trạm cho nhân viên
      </label>
      <input
        id="manual-station-id"
        type="text"
        value={manualInput}
        onChange={(event) => {
          setManualInput(event.target.value);
          setManualError("");
        }}
        placeholder="Ví dụ: 1"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid #f97316",
          fontSize: "14px",
        }}
      />
      {manualError && (
        <p
          style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "#b91c1c",
          }}
        >
          {manualError}
        </p>
      )}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <button
        type="submit"
        style={{
          padding: "10px 18px",
          borderRadius: "8px",
          border: "none",
          background: "#f97316",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Thiết lập trạm
      </button>
      {manualStationValue && (
        <button
          type="button"
          onClick={handleManualReset}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #f97316",
            background: "#fff",
            color: "#f97316",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Xóa cấu hình
        </button>
      )}
    </div>
  </form>
)}

            {/* Overview (framed like the table card below) */}
            <div className="orders-card">
              <div className="orders-card__header">
                <h2>Tổng quan</h2>
                <div />
              </div>
              <div className="orders-card__body">
                <section className="staff-overview">
                  <Card title="Xe tại điểm" value={summary.carsOnSite} emoji="🚗" accent="green" />
                  <Card title="Xe đang cho thuê" value={summary.carsRented} emoji="🔑" accent="yellow" />
                  <Card title="Xe sự cố" value={summary.incidents} emoji="⚠️" accent="red" />
                  <Card title="Doanh thu" value={new Intl.NumberFormat('vi-VN').format(summary.revenueToday) + ' ₫'} emoji="💸" accent="green" />
                </section>
              </div>
            </div>

            {/* models detail section removed — counts are aggregated into the overview cards */}

            {/* Tabs + content */}
            <div className="orders-card">
              <div className="orders-card__header">
                <div>
                  <h2>Hoạt động & thống kê</h2>
                  <Tabs tab={tab} onChange={setTab} />
                  <p className="staff-content__intro">Cập nhật nhanh các giao dịch, xe và sự cố</p>
                </div>
                <div className="auto-refresh-wrap">
                  <label className="small-muted auto-refresh-label"><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /> Auto-refresh</label>
                  <button className="staff-table__cta">Xuất PDF</button>
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
                      <th className="py-2">Mã xe</th>
                      <th>Biển số</th>
                      <th>Pin (%)</th>
                      <th>Tình trạng kỹ thuật</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody> 
                    {cars.map((c) => (
                      <tr key={c.id} className="odd:bg-slate-50">
                        <td className="py-2 font-medium">{c.id}</td>
                        <td>{c.plate}</td>
                        <td>
                          <span className={`sr-badge ${batteryBadgeClass(c.battery)}`}>
                            <strong>{c.battery}%</strong>
                            <span style={{opacity:0.6}}>|</span>
                            <small className="small-muted">{batteryStatusLabel(c.battery)}</small>
                          </span>
                        </td>
                        <td>{c.tech}</td>
                        <td>{c.status}</td>
                        <td>
                          <button className="text-sm px-3 py-1 bg-rose-500 text-white rounded hover:bg-rose-600">Báo sự cố</button>
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
                    {incidents.map((inc) => (
                      <tr key={inc.id} className="odd:bg-slate-50">
                        <td className="py-2 font-medium">{inc.id}</td>
                        <td>{inc.carId}</td>
                        <td>{inc.time}</td>
                        <td>{inc.desc}</td>
                        <td>{inc.img ? <img src={inc.img} alt="inc" className="w-16 h-12 object-cover rounded" /> : <span className="text-slate-400">—</span>}</td>
                        <td>{inc.status}</td>
                        <td><button className="px-2 py-1 bg-sky-600 text-white rounded text-sm hover:bg-sky-700">Cập nhật trạng thái</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "Doanh thu" && (
              <div className="sr-charts">
              <div className="col-span-2">
                <h3 className="text-sm font-medium mb-2">Doanh thu 7 ngày</h3>
                <SimpleBarChart data={revenue7days} />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Tỷ lệ</h3>
                <SimpleDonut data={donutData} colors={COLORS} />
              </div>

              <div className="col-span-3" style={{marginTop:12}}>
                <h3 className="text-sm font-medium mb-2">Giao dịch gần nhất</h3>
                <div style={{overflowX:'auto'}}>
                  <table className="sr-table">
                    <thead>
                      <tr className="text-left text-slate-600 border-b">
                        <th className="py-2">Mã</th>
                        <th>Khách</th>
                        <th>Xe</th>
                        <th>Số tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 6).map((t) => (
                        <tr key={t.id} className="odd:bg-slate-50">
                          <td className="py-2 font-medium">{t.id}</td>
                          <td>{t.customer}</td>
                          <td>{t.car}</td>
                          <td>{new Intl.NumberFormat('vi-VN').format(t.amount)} ₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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
              <button type="submit" className="sr-button">Gửi báo cáo</button>
              <button type="button" onClick={() => { setReportDesc(''); setReportFile(null); }} className="sr-button ghost">Hủy</button>
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

function Card({ title, value, emoji = "", accent = "green" }) {
  return (
    <article className={`staff-card staff-card--${accent}`}>
      <div>
        <h3 style={{margin:0,color:'#475569'}}>{title}</h3>
        <div className="staff-card__value">{value}</div>
      </div>
      <div className="staff-card__icon" aria-hidden="true">{emoji}</div>
    </article>
  );
}

function Tabs({ tab, onChange }) {
  const tabs = ["Xe tại Trạm", "Sự cố", "Doanh thu"];
  return (
    <nav className="flex items-center gap-2">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={`px-3 py-1 rounded ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          {t}
        </button>
      ))}
    </nav>
  );
}

Card.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  emoji: PropTypes.string,
  accent: PropTypes.string,
};

Tabs.propTypes = {
  tab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

SimpleBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({ day: PropTypes.string, value: PropTypes.number })).isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.number,
};

SimpleDonut.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, value: PropTypes.number })).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.number,
  stroke: PropTypes.number,
};
