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
