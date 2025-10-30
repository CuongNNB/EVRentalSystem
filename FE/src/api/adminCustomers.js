/**
 * Admin Customers API
 * 
 * NOTE: API endpoints cho trang quản lý khách hàng
 */

import api from './client'

// Helper: Đảm bảo luôn trả về array
const asArray = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.customers)) return payload.customers
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.content)) return payload.content
  return []
}

/**
 * Get list of customers
 * Endpoint: GET /admin/customers
 * @returns {Promise<Array>}
 */
export const getCustomers = async (params = {}) => {
  try {
    console.log('[getCustomers] Calling API with params:', params)
    
    const { data } = await api.get('/admin/customers', { params })
    
    console.log('[getCustomers] Response:', data)
    
    return asArray(data)
  } catch (error) {
    console.error('[getCustomers] API error:', error.status || error.message)
    return []
  }
}

/**
 * Get customer statistics
 * Endpoint: GET /admin/customers/stats
 * @returns {Promise<{total: number, highRisk: number, totalComplaints: number}>}
 */
export const getCustomerStats = async () => {
  try {
    console.log('[getCustomerStats] Calling API')
    
    const { data } = await api.get('/admin/customers/stats')
    
    console.log('[getCustomerStats] Response:', data)
    
    return {
      total: Number(data.total || 0),
      highRisk: Number(data.highRisk || 0),
      totalComplaints: Number(data.totalComplaints || 0)
    }
  } catch (error) {
    console.error('[getCustomerStats] API error:', error.status || error.message)
    return { total: 0, highRisk: 0, totalComplaints: 0 }
  }
}

/**
 * Get list of complaints
 * Endpoint: GET /admin/customers/complaints
 * @returns {Promise<Array>}
 */
export const getComplaints = async (params = {}) => {
  try {
    console.log('[getComplaints] Calling API with params:', params)
    
    const { data } = await api.get('/admin/customers/complaints', { params })
    
    console.log('[getComplaints] Response:', data)
    
    return asArray(data)
  } catch (error) {
    console.error('[getComplaints] API error:', error.status || error.message)
    return []
  }
}

/**
 * Get customer by ID
 * Endpoint: GET /admin/customers/:id
 * @param {string} id - Customer ID
 * @returns {Promise<Object>}
 */
export const getCustomerById = async (id) => {
  try {
    console.log('[getCustomerById] Calling API with ID:', id)
    
    const { data } = await api.get(`/admin/customers/${id}`)
    
    console.log('[getCustomerById] Response:', data)
    
    return data
  } catch (error) {
    console.error('[getCustomerById] API error:', error.status || error.message)
    throw error
  }
}

/**
 * Update customer
 * Endpoint: PUT /admin/customers/:id
 * @param {string} id - Customer ID
 * @param {Object} customerData - Customer data to update
 * @returns {Promise<Object>}
 */
export const updateCustomer = async (id, customerData) => {
  try {
    console.log('[updateCustomer] Calling API with ID:', id)
    
    const { data } = await api.put(`/admin/customers/${id}`, customerData)
    
    console.log('[updateCustomer] Response:', data)
    
    return data
  } catch (error) {
    console.error('[updateCustomer] API error:', error.status || error.message)
    throw error
  }
}

/**
 * Export customers to Excel
 * Endpoint: GET /admin/customers/export
 * @returns {Promise<Blob>}
 */
export const exportCustomers = async (params = { format: 'xlsx' }) => {
  try {
    const { data } = await api.get('/admin/customers/export', { 
      params, 
      responseType: 'blob' 
    })
    return data
  } catch (error) {
    console.error('[exportCustomers] API error:', error.status || error.message)
    throw error
  }
}

