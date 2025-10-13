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

const DEFAULT_ROW_IDS = ["row1"];

const SLOT_PART_LOOKUP = [...BASE_INSPECTION_SLOTS, ...ROW_INSPECTION_SLOTS].reduce(
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
  return [...BASE_INSPECTION_SLOTS, ...rowSlots];
};

export const getInspectionPart = (slotId) => SLOT_PART_LOOKUP[slotId] || null;

export const DEFAULT_INSPECTION_STATUS = "PENDING";
