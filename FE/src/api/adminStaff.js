// src/api/adminStaff.js
import api from "./client";

/** Chuẩn hoá dữ liệu API dạng mảng */
const asArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.content)) return payload.content;
  return [];
};

/** GET /api/admin/staff (list nhân viên) */
export async function getStaff(params = {}) {
  const { data } = await api.get("/admin/staff", { params });
  return asArray(data);
}

/** GET /api/admin/staff/:id */
export async function getStaffById(id) {
  const { data } = await api.get(`/admin/staff/${id}`);
  return data;
}

/** PATCH /api/admin/staff/:id — cập nhật thông tin cơ bản */
export async function patchStaff(id, payload) {
  const { data } = await api.patch(`/admin/staff/${id}`, payload);
  return data;
}

/** POST /api/admin/staff/:id/transfer-station — chuyển trạm */
export async function transferStation(staffId, stationId) {
  const { data } = await api.post(`/admin/staff/${staffId}/transfer-station`, {
    stationId: Number(stationId),
  });
  return data;
}

/** Lấy tất cả trạm từ /api/stations */
export async function getAllStationsAny() {
  try {
    const { data } = await api.get("/stations");
    if (!Array.isArray(data)) return [];
    return data.map((s) => ({
      id: s.stationId ?? s.id,
      name: s.stationName ?? s.name ?? `Trạm #${s.stationId ?? s.id}`,
    }));
  } catch {
    return [];
  }
}

/** Dành riêng cho dropdown chọn trạm */
// Lấy danh sách trạm chuẩn hoá cho combobox
export async function getStationsForSelect() {
  const fromStaff = await getStaff({ page: 1, size: 10000 }).catch(() => []);
  const mapA = new Map();
  for (const it of fromStaff) {
    const id = it.stationId ?? it.station_id;
    const name = it.stationName ?? it.station_name ?? (id != null ? `Trạm #${id}` : null);
    if (id != null && name) mapA.set(Number(id), { id: Number(id), name: String(name) });
  }

  // /api/stations (controller bạn vừa thêm)
  let fromAll = [];
  try {
    const { data } = await api.get('/stations');
    fromAll = Array.isArray(data) ? data : [];
  } catch { /* ignore */ }

  const norm = (arr) => (arr || []).map(s => ({
    id: s.id ?? s.stationId ?? s.station_id,
    name: s.name ?? s.stationName ?? s.station_name ?? `Trạm #${s.id ?? s.stationId}`,
  })).filter(x => x.id != null);

  const b = norm(fromAll);

  const map = new Map([...mapA.entries()]);
  b.forEach(x => map.set(Number(x.id), { id: Number(x.id), name: String(x.name) }));
  return [...map.values()].sort((x, y) => x.name.localeCompare(y.name, 'vi'));
}
// Tính stats từ list staff (không cần API riêng)
export async function getStaffStats(filters = {}) {
  try {
    // lấy thật nhiều để tính đủ
    const list = await getStaff({ ...filters, page: 1, size: 10000 });
    const norm = (s) => (s ?? "").toString().trim().toLowerCase();

    const total   = list.length;
    const active  = list.filter(x => norm(x.status) === "active").length;
    const onLeave = list.filter(x => norm(x.status) === "on-leave").length;

    return { total, active, onLeave };
  } catch {
    return { total: 0, active: 0, onLeave: 0 };
  }
}
export async function getStations(filters = {}) {
  return getStationsForSelect(filters);
}
