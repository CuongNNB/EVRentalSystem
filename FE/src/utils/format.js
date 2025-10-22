export const formatVND = (n) =>
  typeof n === 'number' ? n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '--'

export const formatPercent = (p) =>
  typeof p === 'number' ? `${(p * 100).toFixed(1)}%` : '--'

export const formatDateTime = (iso) => {
  if (!iso) return '--'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
// Utility functions for formatting
export const formatCurrency = (amount, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(new Date(date));
};

export const formatPhone = (phone) => {
  // Format Vietnamese phone number
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('84')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+84${cleaned.slice(1)}`;
  }
  return `+84${cleaned}`;
};

export const formatBookingId = (id) => {
  return `BK_${id.toString().padStart(6, '0')}`;
};

export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const generateQRData = (bookingId, verificationCode) => {
  return JSON.stringify({
    bookingId,
    verificationCode,
    timestamp: Date.now()
  });
};
