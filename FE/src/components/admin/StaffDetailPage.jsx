// src/components/admin/StaffDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StaffDetailPage.css";
import {
  getStaffById,
  getStationsForSelect,
  patchStaff,
  transferStation,
} from "../../api/adminStaff";

export default function StaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [edit, setEdit] = useState({});
  const [original, setOriginal] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  // ====== LOAD STAFF DETAIL + STATIONS ======
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        const staff = await getStaffById(id);
        if (!alive) return;

        const init = {
          email: staff?.email || "",
          phone: staff?.phone || "",
          status: (staff?.status || "ACTIVE").toUpperCase(),
          stationId:
            staff?.stationId == null ? null : Number(staff.stationId),
        };

        setData(staff || {});
        setEdit(init);
        setOriginal(init);

        const stationList = await getStationsForSelect();
        if (alive) setStations(stationList);
      } catch (err) {
        setError(err?.message || "Không tải được dữ liệu");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // ====== AUTO ẨN THÔNG BÁO SAU 3S ======
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  // ====== CHECK CÓ THAY ĐỔI KHÔNG ======
  const normalize = (obj = {}) => ({
    email: (obj.email ?? "").trim(),
    phone: (obj.phone ?? "").trim(),
    status: (obj.status ?? "ACTIVE").toUpperCase(),
    stationId:
      obj.stationId === "" || obj.stationId == null
        ? null
        : Number(obj.stationId),
  });

  const isDirty = useMemo(() => {
    if (!original) return false;
    return (
      JSON.stringify(normalize(edit)) !==
      JSON.stringify(normalize(original))
    );
  }, [edit, original]);

  // ====== SAVE FUNCTION ======
  const onSave = async () => {
    try {
      if (!isDirty) {
        setNotice({ type: "info", text: "Không có thay đổi để lưu." });
        return;
      }

      setSaving(true);
      setError("");

      const prev = normalize(original);
      const curr = normalize(edit);
      const stationChanged = prev.stationId !== curr.stationId;

      if (stationChanged) {
        await transferStation(id, curr.stationId);
      }

      const profileChanged =
        prev.email !== curr.email ||
        prev.phone !== curr.phone ||
        prev.status !== curr.status;

      if (profileChanged) {
        await patchStaff(id, {
          email: curr.email,
          phone: curr.phone,
          status: curr.status,
        });
      }

      const selected = stations.find((s) => s.id === curr.stationId);
      setData((prev) => ({
        ...prev,
        ...curr,
        stationName: selected ? selected.name : prev?.stationName,
      }));
      setOriginal(curr);

      if (stationChanged && selected) {
        setNotice({
          type: "success",
          text: `Lưu thành công. Chuyển nhân viên thành công qua trạm "${selected.name}".`,
        });
      } else {
        setNotice({ type: "success", text: "Lưu thành công." });
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  };

  // ====== TOGGLE STATUS ======
  const toggleStatus = async () => {
    const cur = (edit.status || "").toUpperCase();
    const next = cur === "ACTIVE" ? "ON-LEAVE" : "ACTIVE";
    if (!window.confirm(`Đổi trạng thái sang "${next}"?`)) return;
    setEdit((s) => ({ ...s, status: next }));
    await onSave();
  };

  // ====== INITIALS ======
  const initials = useMemo(() => {
    const n = (data?.name || "NA").trim();
    return n
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [data]);

  // ====== UI ======
  return (
    <div className="page-wrap">
      <div className="page-header">
        <div className="icon">👤</div>
        <div>
          <div className="page-sub">Quản trị • Nhân viên</div>
          <div className="page-title">Chi tiết nhân viên</div>
        </div>
        <div className="spacer" />
        <button className="btn btn-light" onClick={() => navigate("/admin/staff")}>
          Danh sách
        </button>
      </div>

      {/* ===== Alerts ===== */}
      {notice && (
        <div
          className={`alert ${
            notice.type === "success"
              ? "alert-success"
              : notice.type === "info"
              ? "alert-info"
              : "alert-error"
          }`}
          style={{ margin: "12px 0" }}
        >
          {notice.text}
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ margin: "12px 0" }}>
          Lỗi: {error}
        </div>
      )}

      {/* ===== Content ===== */}
      {loading && <div className="box">Đang tải…</div>}
      {!loading && !error && data && (
        <>
          <div className="card">
            <div className="row head">
              <div className="avatar-lg">{initials}</div>
              <div className="col">
                <h1 className="title">{data.name}</h1>
                <div className="meta">
                  <span className="chip chip-neutral">ID: {data.id}</span>
                  {data.position && <span className="chip">{data.position}</span>}
                  <span
                    className={`chip ${
                      edit.status === "ACTIVE"
                        ? "chip-success"
                        : edit.status === "ON-LEAVE"
                        ? "chip-warn"
                        : "chip-danger"
                    }`}
                  >
                    {edit.status}
                  </span>
                </div>
              </div>
              <div className="spacer" />
              <div className="actions">
                <button className="btn btn-outline" onClick={toggleStatus}>
                  {edit.status === "ACTIVE" ? "Cho nghỉ tạm" : "Kích hoạt lại"}
                </button>
                <button className="btn" disabled={saving} onClick={onSave}>
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </div>

            <div className="grid">
              <div className="field">
                <div className="label">Điểm làm việc</div>
                <select
                  className="input"
                  value={edit.stationId ?? ""}
                  onChange={(e) =>
                    setEdit((s) => ({
                      ...s,
                      stationId:
                        e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                >
                  <option value="">— Chưa gán —</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="label">Email</div>
                <input
                  className="input"
                  value={edit.email}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, email: e.target.value }))
                  }
                />
              </div>

              <div className="field">
                <div className="label">Số điện thoại</div>
                <input
                  className="input"
                  value={edit.phone}
                  onChange={(e) =>
                    setEdit((s) => ({ ...s, phone: e.target.value }))
                  }
                />
              </div>

              <div className="field">
                <div className="label">Ngày tham gia</div>
                <div className="value">
                  {data.joinDate
                    ? new Date(data.joinDate).toLocaleDateString("vi-VN")
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="kpi-val">{data.tasks7d ?? 0}</div>
              <div className="kpi-lab">Giao/nhận 7 ngày</div>
            </div>
            <div className="kpi">
              <div className="kpi-val">{data.incidents30d ?? 0}</div>
              <div className="kpi-lab">Sự cố 30 ngày</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
