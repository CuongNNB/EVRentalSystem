// src/api/stations.js
export async function searchStationsByDistrict(district) {
  // TODO: thay bằng call backend thật, ví dụ:
  // const res = await fetch(`/api/stations?district=${encodeURIComponent(district)}`);
  // return res.json();
  return [
    { id: 1, name: "Station A", district },
    { id: 2, name: "Station B", district },
  ];
}
