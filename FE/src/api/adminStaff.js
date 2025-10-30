/**
 * Admin Staff API
 * 
 * NOTE: API endpoints cho trang quản lý nhân viên
 */

import api from './client'

// Helper: Đảm bảo luôn trả về array
const asArray = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.staff)) return payload.staff
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.content)) return payload.content
  return []
}

/**
 * Get list of staff members
 * Endpoint: GET /admin/staff
 * @returns {Promise<Array>}
 */
export const getStaff = async (params = {}) => {
  try {
    console.log('[getStaff] Calling API with params:', params)
    
    const { data } = await api.get('/admin/staff', { params })
    
    console.log('[getStaff] Response:', data)
    
    return asArray(data)
  } catch (error) {
    console.error('[getStaff] API error:', error.status || error.message)
    return []
  }
}

/**
 * Get staff statistics
 * Endpoint: GET /admin/staff/stats
 * @returns {Promise<{total: number, active: number, onLeave: number}>}
 */
export const getStaffStats = async () => {
  try {
    console.log('[getStaffStats] Calling API')
    
    const { data } = await api.get('/admin/staff/stats')
    
    console.log('[getStaffStats] Response:', data)
    
    return {
      total: Number(data.total || 0),
      active: Number(data.active || 0),
      onLeave: Number(data.onLeave || 0)
    }
  } catch (error) {
    console.error('[getStaffStats] API error:', error.status || error.message)
    return { total: 0, active: 0, onLeave: 0 }
  }
}

/**
 * Get list of stations (for filter dropdown)
 * Endpoint: GET /admin/stations
 * @returns {Promise<Array>}
 */
export const getStations = async () => {
  try {
    console.log('[getStations] Calling API')
    
    const { data } = await api.get('/admin/stations')
    
    console.log('[getStations] Response:', data)
    
    return asArray(data)
  } catch (error) {
    console.error('[getStations] API error:', error.status || error.message)
    return []
  }
}

/**
 * Get staff member by ID
 * Endpoint: GET /admin/staff/:id
 * @param {string} id - Staff ID
 * @returns {Promise<Object>}
 */
export const getStaffById = async (id) => {
  try {
    console.log('[getStaffById] Calling API with ID:', id)
    
    const { data } = await api.get(`/admin/staff/${id}`)
    
    console.log('[getStaffById] Response:', data)
    
    return data
  } catch (error) {
    console.error('[getStaffById] API error:', error.status || error.message)
    throw error
  }
}

/**
 * Create new staff member
 * Endpoint: POST /admin/staff
 * @param {Object} staffData - Staff data
 * @returns {Promise<Object>}
 */
export const createStaff = async (staffData) => {
  try {
    console.log('[createStaff] Calling API with data:', staffData)
    
    const { data } = await api.post('/admin/staff', staffData)
    
    console.log('[createStaff] Response:', data)
    
    return data
  } catch (error) {
    console.error('[createStaff] API error:', error.status || error.message)
    throw error
  }
}

/**
 * Update staff member
 * Endpoint: PUT /admin/staff/:id
 * @param {string} id - Staff ID
 * @param {Object} staffData - Staff data to update
 * @returns {Promise<Object>}
 */
export const updateStaff = async (id, staffData) => {
  try {
    console.log('[updateStaff] Calling API with ID:', id)
    
    const { data } = await api.put(`/admin/staff/${id}`, staffData)
    
    console.log('[updateStaff] Response:', data)
    
    return data
  } catch (error) {
    console.error('[updateStaff] API error:', error.status || error.message)
    throw error
  }
}

/**
 * Delete staff member
 * Endpoint: DELETE /admin/staff/:id
 * @param {string} id - Staff ID
 * @returns {Promise<void>}
 */
export const deleteStaff = async (id) => {
  try {
    console.log('[deleteStaff] Calling API with ID:', id)
    
    await api.delete(`/admin/staff/${id}`)
    
    console.log('[deleteStaff] Success')
  } catch (error) {
    console.error('[deleteStaff] API error:', error.status || error.message)
    throw error
  }
}

/**
 * Export staff to Excel
 * Endpoint: GET /admin/staff/export
 * @returns {Promise<Blob>}
 */
export const exportStaff = async (params = { format: 'xlsx' }) => {
  try {
    const { data } = await api.get('/admin/staff/export', { 
      params, 
      responseType: 'blob' 
    })
    return data
  } catch (error) {
    console.error('[exportStaff] API error:', error.status || error.message)
    throw error
  }
}

