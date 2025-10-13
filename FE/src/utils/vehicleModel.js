/**
 * Extracts vehicle model ID from booking object
 * @param {Object} booking - Booking object
 * @returns {number|null} Vehicle model ID
 */
export function extractVehicleModelId(booking) {
  if (!booking) return null;
  
  // Try different possible field names
  return (
    booking.vehicleModelId ||
    booking.vehicleModel?.vehicleId ||
    booking.vehicleModel?.id ||
    booking.vehicle?.modelId ||
    booking.vehicle?.id ||
    null
  );
}
