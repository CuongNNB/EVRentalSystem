// src/api/vehicles.js
import api from '../utils/api';

export async function getAvailableVehicles(stationId) {
  // temporary mock data (replace with backend call when available)
  return [
    { id: 1, type: "Car", status: "Available", stationId },
    { id: 2, type: "Bike", status: "Available", stationId },
  ];
}

// Call backend endpoint: GET /api/vehicle-management/{stationId}/models
export async function getModelsByStation(stationId) {
  if (!stationId) return [];
  const res = await api.get(`/api/vehicle-management/${stationId}/models`);
  return res.data;
}

// Fetch stationId for a staff member by trying likely backend mappings
// Supports plain text ("Station ID: 5") and JSON shapes.
export async function fetchStaffStation(staffId) {
  if (!staffId) return null;
  const candidates = [
    `/api/report/${staffId}/get-station`, // as provided by backend
    `/api/staff/${staffId}/get-station`,
    `/staff/${staffId}/get-station`,
    `/api/staffs/${staffId}/get-station`,
  ];
  let lastError = null;
  for (const path of candidates) {
    try {
      const res = await api.get(path);
      const raw = res?.data;
      if (raw == null) return null;
      if (typeof raw === 'string') {
        const match = raw.match(/([A-Za-z0-9_-]+)\s*$/);
        return match ? match[1] : null;
      }
      if (typeof raw === 'object') {
        const candidate = raw.stationId ?? raw.stationID ?? raw.id ?? raw?.data?.stationId;
        return candidate != null ? String(candidate) : null;
      }
      return null;
    } catch (e) {
      lastError = e;
      // eslint-disable-next-line no-console
      console.warn(`fetchStaffStation: ${path} failed`, e?.response?.status, e?.response?.data || e.message);
      continue;
    }
  }
  // eslint-disable-next-line no-console
  console.warn('fetchStaffStation error (all candidates failed):', lastError?.response?.data || lastError?.message || lastError);
  return null;
}
