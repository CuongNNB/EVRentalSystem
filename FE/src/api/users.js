/**
 * User-related API helpers
 * Reuses axios instance from client.js (baseURL already includes /api)
 */
import api from './client';

/**
 * Fetch renter detail (KYC documents) by userId
 * Endpoint: GET /users/{userId}/renter-detail
 * Returns raw response data (server may wrap in ApiResponse)
 */
export const getRenterDetail = async (userId) => {
  if (!userId) throw new Error('userId is required');
  try {
    const { data } = await api.get(`/users/${userId}/renter-detail`);
    // If server wraps inside { success, data }, unwrap for convenience
    return data?.data ?? data;
  } catch (error) {
    console.error('[getRenterDetail] error:', error.userMessage || error.message);
    throw error;
  }
};

/**
 * Map various possible backend field names to a normalized shape
 */
export const mapRenterDetail = (payload = {}) => {
  return {
    userId: payload.userId ?? payload.id ?? null,
    fullName: payload.fullName ?? payload.name ?? '',
    email: payload.email ?? '',
    phoneNumber: payload.phone ?? payload.phoneNumber ?? '',
    verificationStatus: payload.verificationStatus ?? 'PENDING',
    cccdFrontUrl: payload.cccdFrontUrl ?? payload.frontCccd ?? null,
    cccdBackUrl: payload.cccdBackUrl ?? payload.backCccd ?? null,
    driverLicenseUrl: payload.driverLicenseUrl ?? payload.gplx ?? payload.driverLicenseImageUrl ?? null,
    driverLicenseNumber: payload.driverLicenseNumber ?? payload.gplxNumber ?? null,
  };
};
