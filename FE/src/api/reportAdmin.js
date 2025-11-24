import api from "../api/client";
export const REPORT_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

export const VALID_REPORT_STATUS_TRANSITIONS = {
  [REPORT_STATUS.PENDING]: [
    REPORT_STATUS.IN_PROGRESS,
    REPORT_STATUS.REJECTED,
  ],
  [REPORT_STATUS.IN_PROGRESS]: [
    REPORT_STATUS.RESOLVED,
    REPORT_STATUS.REJECTED,
  ],
  [REPORT_STATUS.RESOLVED]: [],
  [REPORT_STATUS.REJECTED]: [],
};

export function canChangeReportStatus(fromStatus, toStatus) {
  const allowed = VALID_REPORT_STATUS_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}
export function getAvailableNextStatuses(currentStatus) {
  return VALID_REPORT_STATUS_TRANSITIONS[currentStatus] || [];
}
export async function getAllReports(adminId) {
  if (!adminId) throw new Error("Thiếu adminId");
  try {
    const res = await api.get("/reports/all-reports", { params: { userId: adminId } });
    return res.data;
  } catch (err) {
    console.error("[getAllReports] Error:", err);
    throw new Error(err.userMessage || "Không thể tải danh sách báo cáo.");
  }
}

export async function updateReportStatus({ reportId, status, adminId }) {
  if (!reportId || !status || !adminId) {
    throw new Error("Thiếu dữ liệu cập nhật trạng thái");
  }
  try {
    const res = await api.put("/reports/update-status", {
      reportId,
      status,
      adminId,
    });
    return res.data;
  } catch (err) {
    console.error("[updateReportStatus] Error:", err);
    throw new Error(err.userMessage || "Không thể cập nhật trạng thái báo cáo.");
  }
}

export async function getStationIdByStaff(staffId) {
  if (!staffId) throw new Error("Thiếu staffId");
  try {
    const res = await api.get(`/report/${staffId}/get-station`);
    const text = String(res.data);
    const match = text.match(/(\d+)/);
    return match ? Number(match[1]) : null;
  } catch (err) {
    console.error("[getStationIdByStaff] Error:", err);
    throw new Error(err.userMessage || "Không thể lấy station ID từ staffId.");
  }
}
