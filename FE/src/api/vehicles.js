// src/api/vehicles.js
export async function getAvailableVehicles(stationId) {
  // TODO: thay bằng call backend thật
  return [
    { id: 1, type: "Car", status: "Available", stationId },
    { id: 2, type: "Bike", status: "Available", stationId },
  ];
}
