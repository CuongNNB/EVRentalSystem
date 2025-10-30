/**
 * Admin Analytics API
 * 
 * NOTE: API endpoints cho trang báo cáo & phân tích
 */

import api from './client'

// Helper: Đảm bảo luôn trả về array
const asArray = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.content)) return payload.content
  return []
}

/**
 * Get revenue by station
 * Endpoint: GET /admin/analytics/revenue-by-station
 * @param {Object} params - Query parameters (dateRange, stationId)
 * @returns {Promise<Array>}
 */
export const getRevenueByStation = async (params = {}) => {
  try {
    console.log('[getRevenueByStation] Calling API with params:', params)
    
    const { data } = await api.get('/admin/analytics/revenue-by-station', { params })
    
    console.log('[getRevenueByStation] Response:', data)
    
    return asArray(data)
  } catch (error) {
    console.error('[getRevenueByStation] API error:', error.status || error.message)
    return []
  }
}

/**
 * Get vehicle usage statistics
 * Endpoint: GET /admin/analytics/vehicle-usage
 * @param {Object} params - Query parameters (dateRange)
 * @returns {Promise<Array>}
 */
export const getVehicleUsage = async (params = {}) => {
  try {
    console.log('[getVehicleUsage] Calling API with params:', params)
    
    const { data } = await api.get('/admin/analytics/vehicle-usage', { params })
    
    console.log('[getVehicleUsage] Response:', data)
    
    return asArray(data)
  } catch (error) {
    console.error('[getVehicleUsage] API error:', error.status || error.message)
    return []
  }
}

/**
 * Get peak hours analysis
 * Endpoint: GET /admin/analytics/peak-hours
 * @param {Object} params - Query parameters (dateRange)
 * @returns {Promise<Array>}
 */
export const getPeakHours = async (params = {}) => {
  try {
    console.log('[getPeakHours] Calling API with params:', params)
    
    const { data } = await api.get('/admin/analytics/peak-hours', { params })
    
    console.log('[getPeakHours] Response:', data)
    
    return asArray(data)
  } catch (error) {
    console.error('[getPeakHours] API error:', error.status || error.message)
    return []
  }
}

/**
 * Get monthly trend
 * Endpoint: GET /admin/analytics/monthly-trend
 * @param {Object} params - Query parameters (months)
 * @returns {Promise<Array>}
 */
export const getMonthlyTrend = async (params = { months: 6 }) => {
  try {
    console.log('[getMonthlyTrend] Calling API with params:', params)
    
    const { data } = await api.get('/admin/analytics/monthly-trend', { params })
    
    console.log('[getMonthlyTrend] Response:', data)
    
    return asArray(data)
  } catch (error) {
    console.error('[getMonthlyTrend] API error:', error.status || error.message)
    return []
  }
}

/**
 * Get analytics summary statistics
 * Endpoint: GET /admin/analytics/summary
 * @param {Object} params - Query parameters (dateRange)
 * @returns {Promise<Object>}
 */
export const getAnalyticsSummary = async (params = {}) => {
  try {
    console.log('[getAnalyticsSummary] Calling API with params:', params)
    
    const { data } = await api.get('/admin/analytics/summary', { params })
    
    console.log('[getAnalyticsSummary] Response:', data)
    
    return {
      totalRevenue: Number(data.totalRevenue || 0),
      avgUtilization: Number(data.avgUtilization || 0),
      peakHour: data.peakHour || { hour: '--:--', rentals: 0 },
      totalRentals: Number(data.totalRentals || 0)
    }
  } catch (error) {
    console.error('[getAnalyticsSummary] API error:', error.status || error.message)
    return {
      totalRevenue: 0,
      avgUtilization: 0,
      peakHour: { hour: '--:--', rentals: 0 },
      totalRentals: 0
    }
  }
}

/**
 * Download analytics report
 * Endpoint: GET /admin/analytics/export
 * @param {Object} params - Query parameters (dateRange, format)
 * @returns {Promise<Blob>}
 */
export const exportAnalyticsReport = async (params = { format: 'pdf' }) => {
  try {
    console.log('[exportAnalyticsReport] Calling API with params:', params)
    
    const { data } = await api.get('/admin/analytics/export', { 
      params, 
      responseType: 'blob' 
    })
    
    return data
  } catch (error) {
    console.error('[exportAnalyticsReport] API error:', error.status || error.message)
    throw error
  }
}

