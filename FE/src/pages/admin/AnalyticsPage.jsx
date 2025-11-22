import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { getAllReports, updateReportStatus, getStationIdByStaff } from "../../api/reportAdmin";
import "./AnalyticsPage.css";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function AnalyticsPage() {
  const [adminId, setAdminId] = useState(1);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [staffLookup, setStaffLookup] = useState("");
  const [stationLookupMsg, setStationLookupMsg] = useState("");

  const loadReports = async () => {
    if (!adminId) return setError("Vui lòng nhập adminId");
    setLoading(true);
    setError("");
    try {
      const data = await getAllReports(adminId);
      setReports(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) || data.length === 0) setError("Không có báo cáo nào.");
    } catch (e) {
      setError(e.userMessage || e.message || "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    const t = setInterval(loadReports, 20000);
    return () => clearInterval(t);
  }, [adminId]);

  const stats = useMemo(() => {
    const total = reports.length;
    const byStatus = reports.reduce((acc, r) => {
      const k = (r.status || "").toUpperCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return { total, byStatus };
  }, [reports]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      const inStatus = statusFilter === "ALL" || (r.status || "").toUpperCase() === statusFilter;
      const hay = [
        r.description,
        r.licensePlate,
        r.staffName,
        r.stationName,
        String(r.reportId),
        r.createdAt,
      ]
        .filter(Boolean)
        .map(String);
      const inText = !q ? true : hay.some((x) => x.toLowerCase().includes(q));
      return inStatus && inText;
    });
  }, [reports, search, statusFilter]);

  // sort mới nhất lên đầu
  const sorted = useMemo(() => {
    const toTime = (v) => {
      const t = new Date(v).getTime();
      return Number.isFinite(t) ? t : -Infinity;
    };
    return [...filtered].sort((a, b) => toTime(b?.createdAt) - toTime(a?.createdAt));
  }, [filtered]);

  const doUpdateStatus = async (reportId, newStatus) => {
    try {
      await updateReportStatus({ reportId, status: newStatus, adminId: Number(adminId) });
      setReports((prev) => prev.map((r) => (r.reportId === reportId ? { ...r, status: newStatus } : r)));
      toast(`✅ Cập nhật ${reportId} → ${newStatus}`);
    } catch (e) {
      toast(`❌ ${e.userMessage || e.message}`);
    }
  };

  const doLookupStation = async () => {
    setStationLookupMsg("");
    if (!staffLookup) return;
    try {
      const id = await getStationIdByStaff(staffLookup);
      setStationLookupMsg(id ? `Station ID: ${id}` : "Không tìm thấy station");
      if (id) setSearch(String(id));
    } catch {
      setStationLookupMsg("Lỗi tra cứu station");
    }
  };

  // Xuất Excel theo danh sách đang hiển thị (đã lọc + sort)
  const exportReportsExcel = () => {
    const rows = sorted.map((r) => ({
      ReportID: r.reportId ?? "",
      Description: r.description ?? "",
      Status: (r.status ?? "").toString(),
      CreatedAt: r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : "",
      StaffName: r.staffName ?? "",
      StaffID: r.staffId ?? "",
      LicensePlate: r.licensePlate ?? "",
      Station: r.stationName ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    const header =
      Object.keys(rows[0] || { ReportID: "", Description: "", Status: "", CreatedAt: "", StaffName: "", StaffID: "", LicensePlate: "", Station: "" });
    ws["!cols"] = header.map(() => ({ wch: 20 }));
    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Reports-${ts}.xlsx`);
  };

  return (
    <div className="analytics">
      {/* HERO header giống trang Quản lý nhân viên */}
      <div className="hero">
        <div className="hero__left">
          <div className="hero__icon">
            <span className="bar bar-1" />
            <span className="bar bar-2" />
            <span className="bar bar-3" />
          </div>
          <div className="hero__text">
            <h1>Admin Report Analytics</h1>
            <p>Theo dõi và cập nhật tình trạng báo cáo từ nhân viên</p>
          </div>
        </div>
        <div className="hero__right">
          <button className="btn btn--excel" onClick={exportReportsExcel}>
            Xuất danh sách ra Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <section className="stats">
        <StatCard label="Tổng báo cáo" value={stats.total} />
        {Object.entries(stats.byStatus).map(([k, v]) => (
          <StatCard key={k} label={k} value={v} />
        ))}
      </section>

      {/* Filters */}
      <section className="filters card">
        <input
          className="input input--grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mô tả / biển số / nhân viên / trạm / mã báo cáo"
        />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn" onClick={() => { setSearch(""); setStatusFilter("ALL"); }}>
          Xoá lọc
        </button>
      </section>

      {/* Table */}
      <section className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Nhân viên</th>
                <th>Biển số</th>
                <th>Trạm</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="muted center">Đang tải...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={8} className="muted center">{error || "Không có dữ liệu"}</td></tr>
              ) : (
                sorted.map((r, idx) => (
                  <tr key={r.reportId}>
                    <td className="mono">{idx + 1}</td>
                    <td className="ellipsis" title={r.description}>{r.description}</td>
                    <td>
                      <span className={`badge badge--${(r.status || "PENDING").toLowerCase()}`}>
                        {(r.status || "").toUpperCase()}
                      </span>
                    </td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>
                      <div className="stack">
                        <span className="strong">{r.staffName}</span>
                        <span className="muted">ID: {r.staffId}</span>
                      </div>
                    </td>
                    <td>{r.licensePlate || "-"}</td>
                    <td className="ellipsis" title={r.stationName}>{r.stationName}</td>
                    <td>
                      <RowAction
                        currentStatus={(r.status || "").toUpperCase()}
                        onUpdate={(s) => doUpdateStatus(r.reportId, s)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function RowAction({ currentStatus, onUpdate }) {
  const [value, setValue] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(currentStatus), [currentStatus]);

  const save = async () => {
    if (value === currentStatus) return;
    setSaving(true);
    try { await onUpdate(value); } finally { setSaving(false); }
  };

  return (
    <div className="row-action">
      <select className="input" value={value} onChange={(e) => setValue(e.target.value)}>
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button className="btn btn--success" disabled={saving || value === currentStatus} onClick={save}>
        {saving ? "Đang lưu..." : "Cập nhật"}
      </button>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat">
      <div className="stat__label">{label}</div>
      <div className="stat__value">{value}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch { return String(iso); }
}

function toast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = "toast";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}
