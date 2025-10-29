/**
 * Admin Vehicles API
 * 
 * NOTE: API endpoints cho trang quản lý xe
 * - Không hardcode data
 * - Chỉ gọi API thực từ backend
 */

import api from './client'

// Helper chuẩn hoá: luôn trả về array
const asArray = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.vehicles)) return payload.vehicles
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.content)) return payload.content
  return []
}

/**
 * Get vehicle statistics (KPI metrics)
 * Endpoint: GET /admin/vehicles/stats
 */
export const getVehicleStats = async (params = {}) => {
  try {
    const { data } = await api.get('/admin/vehicles/stats', { params })
    console.debug?.('[getVehicleStats] raw:', data)
    return data
  } catch (error) {
    console.error('[getVehicleStats] error:', error)
    throw error
  }
}

/**
 * Get list of vehicles with filters
 * Endpoint: GET /admin/vehicles
 */
export const getVehicles = async (params = {}) => {
  try {
    const { data } = await api.get('/admin/vehicles', { params })
    console.debug?.('[getVehicles] raw:', data)
    return asArray(data)
  } catch (error) {
    console.error('[getVehicles] error:', error)
    throw error
  }
}

/**
 * Get vehicle by ID
 * Endpoint: GET /admin/vehicles/:id
 */
export const getVehicleById = async (id) => {
  try {
    const { data } = await api.get(`/admin/vehicles/${id}`)
    return data
  } catch (error) {
    console.error('[getVehicleById] error:', error)
    throw error
  }
}

/**
 * Create new vehicle
 * Endpoint: POST /admin/vehicles
 */
export const createVehicle = async (vehicleData) => {
  try {
    const { data } = await api.post('/admin/vehicles', vehicleData)
    return data
  } catch (error) {
    console.error('[createVehicle] error:', error)
    throw error
  }
}

/**
 * Update vehicle
 * Endpoint: PUT /admin/vehicles/:id
 */
export const updateVehicle = async (id, vehicleData) => {
  try {
    const { data } = await api.put(`/admin/vehicles/${id}`, vehicleData)
    return data
  } catch (error) {
    console.error('[updateVehicle] error:', error)
    throw error
  }
}

/**
 * Delete vehicle
 * Endpoint: DELETE /admin/vehicles/:id
 */
export const deleteVehicle = async (id) => {
  try {
    const { data } = await api.delete(`/admin/vehicles/${id}`)
    return data
  } catch (error) {
    console.error('[deleteVehicle] error:', error)
    throw error
  }
}

/**
 * Export vehicles to Excel
 * Endpoint: GET /admin/vehicles/export
 */
export const exportVehicles = (params = { format: 'xlsx' }) =>
  api.get('/admin/vehicles/export', { params, responseType: 'blob' }).then(r => r.data)

