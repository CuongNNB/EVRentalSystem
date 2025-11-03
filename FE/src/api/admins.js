import api from '../utils/api';

// Gọi đúng endpoint backend: /api/staff/all-admins
export async function getAllAdmins() {
  try {
    const res = await api.get('/api/report/all-admins');
    // Backend trả về List<GetAllAdminResponse> => mảng
    return Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    console.error('Không thể tải danh sách admin:', e);
    const msg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách admin';
    throw new Error(msg);
  }
}
