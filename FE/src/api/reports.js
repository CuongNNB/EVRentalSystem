// src/api/reports.js
import api from '../utils/api';

// Create a vehicle incident report
// POST /api/report/create
// params: staffId, vehicleDetailId, description
export async function createReport({ staffId, vehicleDetailId, description, adminId }) {
  if (!staffId || !vehicleDetailId) {
    throw new Error('Missing required fields: staffId, vehicleDetailId');
  }
  const params = { staffId, vehicleDetailId, description };
  if (adminId) params.adminId = adminId;
  const response = await api.post('/api/report/create', null, {
    params,
  });
  return response?.data;
}
