/**
 * Admin Vehicles API
 * 
 * NOTE: API endpoints cho trang quản lý xe
 * - Pagination, filter, search
 * - Không hardcode data
 */

import api from './client'

// Clean query params - remove undefined, null, empty strings
const cleanParams = (params) => {
  const cleaned = {}
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value
    }
  })
  return cleaned
}

/**
 * Get paginated vehicle list with filters
 * @param {object} query - { page, size, q, status, stationId, brand, model }
 * @returns {Promise} { content: [], totalElements, totalPages, number, size }
 */
export const getVehicleList = async (query = {}) => {
  try {
    const params = cleanParams({
      page: query.page !== undefined ? query.page : 0,
      size: query.size || 10,
      q: query.q || undefined,
      status: query.status || undefined,
      stationId: query.stationId || undefined,
      brand: query.brand || undefined,
      model: query.model || undefined,
    })

    console.log('[getVehicleList] Calling API with params:', params)
    const { data } = await api.get('/vehicle/vehicles', { params })
    console.log('[getVehicleList] Success:', data)
    return data
  } catch (error) {
    console.error('[getVehicleList] Error:', error)
    throw error
  }
}

/**
 * Get vehicle statistics by station
 * @param {number} stationId - 0 for all stations
 */
export const getVehicleStats = async (params = {}) => {
  try {
    const stationId = Number(params.stationId ?? 0)
    const { data } = await api.post('/vehicle', {
      action: 'getStatsByStation',
      stationId,
    })
    return data
  } catch (error) {
    console.error('[getVehicleStats] Error:', error)
    throw error
  }
}

/**
 * Get vehicle by ID
 */
export const getVehicleById = async (id) => {
  try {
    const { data } = await api.get(`/vehicle/vehicles/${id}`)
    return data
  } catch (error) {
    console.error('[getVehicleById] Error:', error)
    throw error
  }
}

/**
 * Get list of unique vehicle models
 */
export const getVehicleModels = async () => {
  try {
    const { data } = await api.get('/vehicle/models')
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('[getVehicleModels] fallback from /vehicle/models -> extracting from /vehicle/vehicles', error)
    try {
      const { data } = await api.get('/vehicle/vehicles', { params: { page: 0, size: 500 } })
      const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
      const unique = [...new Set(items.map(v => v?.model).filter(Boolean))]
      return unique
    } catch (e) {
      console.error('[getVehicleModels] fallback error:', e)
      return []
    }
  }
}

/**
 * Get list of vehicle brands
 */
export const getVehicleBrands = async () => {
  try {
    const { data } = await api.get('/vehicle/brands')
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('[getVehicleBrands] fallback from /vehicle/brands -> extracting from /vehicle/vehicles', error)
    try {
      const { data } = await api.get('/vehicle/vehicles', { params: { page: 0, size: 500 } })
      const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
      const unique = [...new Set(items.map(v => v?.brand).filter(Boolean))]
      return unique
    } catch (e) {
      console.error('[getVehicleBrands] fallback error:', e)
      return []
    }
  }
}

/**
 * Create new vehicle
 */
export const createVehicle = async (vehicleData) => {
  try {
    const { data } = await api.post('/vehicle/vehicles', vehicleData)
    return data
  } catch (error) {
    console.error('[createVehicle] Error:', error)
    throw error
  }
}

/**
 * Update vehicle
 */
export const updateVehicle = async (id, vehicleData) => {
  try {
    const { data } = await api.put(`/vehicle/vehicles/${id}`, vehicleData)
    return data
  } catch (error) {
    console.error('[updateVehicle] Error:', error)
    throw error
  }
}

/**
 * Delete vehicle
 */
export const deleteVehicle = async (id) => {
  try {
    const { data } = await api.delete(`/vehicle/vehicles/${id}`)
    return data
  } catch (error) {
    console.error('[deleteVehicle] Error:', error)
    throw error
  }
}

/**
 * Export vehicles to Excel
 */
export const exportVehicles = async (query = {}) => {
  try {
    const params = cleanParams(query)
    const { data } = await api.get('/vehicle/vehicles/export', {
      params,
      responseType: 'blob',
    })
    return data
  } catch (error) {
    console.error('[exportVehicles] Error:', error)
    throw error
  }
}
