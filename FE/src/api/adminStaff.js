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

/** GET /admin/staff (list nhân viên) */
export async function getStaff(params = {}) {
  const { data } = await api.get("/admin/staff", { params });
  return asArray(data);
}

/** GET /admin/staff/:id */
export async function getStaffById(id) {
  const { data } = await api.get(`/admin/staff/${id}`);
  return data;
}

/** PATCH /admin/staff/:id — cập nhật thông tin cơ bản */
export async function patchStaff(id, payload) {
  const { data } = await api.patch(`/admin/staff/${id}`, payload);
  return data;
}

/** POST /admin/staff/:id/transfer-station — chuyển trạm */
export async function transferStation(staffId, stationId) {
  const { data } = await api.post(`/admin/staff/${staffId}/transfer-station`, {
    stationId: Number(stationId),
  });
  return data;
}

export async function getAllStationsAny() {
  try {
    const { data } = await api.get("/stations");
    const arr = Array.isArray(data) ? data : asArray(data);
    return arr.map((s) => ({
      id: s.stationId ?? s.id,
      name: s.stationName ?? s.name ?? `Trạm #${s.stationId ?? s.id}`,
    }));
  } catch {
    return [];
  }
}

/** Dành cho dropdown chọn trạm (chuẩn hoá + sort) */
export async function getStationsForSelect() {
  const stations = await getAllStationsAny();
  return stations
    .filter((x) => x.id != null)
    .map((x) => ({ id: Number(x.id), name: String(x.name) }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export async function getStations(filters = {}) {
  return getStationsForSelect(filters);
}

export async function getStaffStats(filters = {}) {
  try {
    const list = await getStaff({ ...filters, page: 1, size: 10000 });
    const norm = (s) => (s ?? "").toString().trim().toLowerCase();
    const total = list.length;
    const active = list.filter((x) => norm(x.status) === "active").length;
    const onLeave = list.filter((x) => norm(x.status) === "on-leave").length;
    return { total, active, onLeave };
  } catch {
    return { total: 0, active: 0, onLeave: 0 };
  }
}

export async function createStaff(payload) {
  const body = {
    username: payload.username?.trim(),
    password: payload.password, 
    fullName: payload.fullName?.trim(),
    email: payload.email || null,
    phone: payload.phone || null,
    address: payload.address || null,
    stationId: Number(payload.stationId),
  };
  const { data } = await api.post("/admin/staff", body);
  return data;
}
