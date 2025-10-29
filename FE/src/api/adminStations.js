/**
 * Admin Stations API
 * 
 * NOTE: API endpoints cho trang quản lý điểm thuê
 * - Không hardcode data
 * - Chỉ gọi API thực từ backend
 */

import api from './client'

// Helper chuẩn hoá: luôn trả về array
const asArray = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.stations)) return payload.stations
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.content)) return payload.content
  return []
}

/**
 * Get station statistics (KPI metrics)
 * Endpoint: GET /admin/stations/stats
 */
export const getStationStats = async (params = {}) => {
  try {
    const { data } = await api.get('/admin/stations/stats', { params })
    console.debug?.('[getStationStats] raw:', data)
    return data
  } catch (error) {
    console.error('[getStationStats] error:', error)
    throw error
  }
}

/**
 * Get list of stations with filters
 * Endpoint: GET /admin/stations
 */
export const getStations = async (params = {}) => {
  try {
    const { data } = await api.get('/admin/stations', { params })
    console.debug?.('[getStations] raw:', data)
    return asArray(data)
  } catch (error) {
    console.error('[getStations] error:', error)
    throw error
  }
}

/**
 * Get station by ID
 * Endpoint: GET /admin/stations/:id
 */
export const getStationById = async (id) => {
  try {
    const { data } = await api.get(`/admin/stations/${id}`)
    return data
  } catch (error) {
    console.error('[getStationById] error:', error)
    throw error
  }
}

/**
 * Create new station
 * Endpoint: POST /admin/stations
 */
export const createStation = async (stationData) => {
  try {
    const { data } = await api.post('/admin/stations', stationData)
    return data
  } catch (error) {
    console.error('[createStation] error:', error)
    throw error
  }
}

/**
 * Update station
 * Endpoint: PUT /admin/stations/:id
 */
export const updateStation = async (id, stationData) => {
  try {
    const { data } = await api.put(`/admin/stations/${id}`, stationData)
    return data
  } catch (error) {
    console.error('[updateStation] error:', error)
    throw error
  }
}

/**
 * Delete station
 * Endpoint: DELETE /admin/stations/:id
 */
export const deleteStation = async (id) => {
  try {
    const { data } = await api.delete(`/admin/stations/${id}`)
    return data
  } catch (error) {
    console.error('[deleteStation] error:', error)
    throw error
  }
}

/**
 * Export stations to Excel
 * Endpoint: GET /admin/stations/export
 */
export const exportStations = (params = { format: 'xlsx' }) =>
  api.get('/admin/stations/export', { params, responseType: 'blob' }).then(r => r.data)

