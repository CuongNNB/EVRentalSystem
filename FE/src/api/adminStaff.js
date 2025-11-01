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

/** Làm sạch params trước khi gửi */
const buildParams = (params = {}) => {
  const p = { ...params };

  // status: 'active' | 'inactive' | 'all' -> BE nhận 'ACTIVE'/'INACTIVE' hoặc bỏ qua
  if (p.status) {
    if (String(p.status).toLowerCase() === "all") delete p.status;
    else p.status = String(p.status).toUpperCase();
  }

  // stationId: 'all' -> bỏ, còn lại ép về number
  if (p.stationId != null && p.stationId !== "all") {
    p.stationId = Number(p.stationId);
  } else {
    delete p.stationId;
  }

  // search
  if (p.search && !String(p.search).trim()) delete p.search;

  return p;
};

/** GET /admin/staff (list nhân viên) */
export async function getStaff(params = {}) {
  const cleaned = buildParams(params);
  const { data } = await api.get("/admin/staff", { params: cleaned });
  // KHÔNG lọc cứng ACTIVE nữa
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

/** Lấy tất cả trạm (any shape) */
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

/** Dropdown trạm */
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

/** Stats đơn giản – tính từ cả ACTIVE & INACTIVE */
export async function getStaffStats() {
  const [active, inactive] = await Promise.all([
    getStaff({ status: "ACTIVE", page: 1, size: 10000 }),
    getStaff({ status: "INACTIVE", page: 1, size: 10000 }),
  ]);
  const a = active.length;
  const i = inactive.length;
  return { total: a + i, active: a };
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

export async function deleteStaff(id) {
  const res = await api.delete(`/admin/staff/${id}`);
  return res.status >= 200 && res.status < 300;
}
