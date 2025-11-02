// src/api/reports.js
import api from '../utils/api';

// Create a vehicle incident report
// POST /api/report/create
// params: staffId, vehicleDetailId, description
export async function createReport({ staffId, vehicleDetailId, description }) {
  if (!staffId || !vehicleDetailId) {
    throw new Error('Missing required fields: staffId, vehicleDetailId');
  }
  const response = await api.post('/api/report/create', null, {
    params: { staffId, vehicleDetailId, description },
  });
  return response?.data;
}
