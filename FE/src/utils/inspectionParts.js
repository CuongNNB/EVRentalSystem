export const BASE_INSPECTION_SLOTS = [
  { id: "front", label: "Mặt trước", part: "Front_Side" },
  { id: "rear", label: "Mặt sau", part: "Back_Side" },
  { id: "left", label: "Bên trái", part: "Left_Side" },
  { id: "right", label: "Bên phải", part: "Right_Side" },
];

export const ROW_INSPECTION_SLOTS = [
  { id: "row1", label: "Hàng ghế trước", part: "Front_Row" },
  { id: "row2", label: "Hàng ghế thứ 2", part: "Second_Row" },
  { id: "row3", label: "Hàng ghế thứ 3", part: "Third_Row" },
];

export const VEHICLE_STATUS_SLOTS = [
  { id: "odometer", label: "Đồng hồ km", part: "Odometer" },
  { id: "battery", label: "Tình trạng pin", part: "Battery" },
];

const DEFAULT_ROW_IDS = ["row1", "row2"];

const SLOT_PART_LOOKUP = [...BASE_INSPECTION_SLOTS, ...ROW_INSPECTION_SLOTS, ...VEHICLE_STATUS_SLOTS].reduce(
  (acc, slot) => {
    acc[slot.id] = slot.part;
    return acc;
  },
  {}
);

export const buildInspectionSlots = (additionalRowIds = []) => {
  const uniqueRowIds = [...new Set([...DEFAULT_ROW_IDS, ...additionalRowIds])];
  const rowSlots = uniqueRowIds
    .map((rowId) => ROW_INSPECTION_SLOTS.find((slot) => slot.id === rowId))
    .filter(Boolean);
  return [...BASE_INSPECTION_SLOTS, ...rowSlots, ...VEHICLE_STATUS_SLOTS];
};

export const getInspectionPart = (slotId) => SLOT_PART_LOOKUP[slotId] || null;

export const DEFAULT_INSPECTION_STATUS = "PENDING";
