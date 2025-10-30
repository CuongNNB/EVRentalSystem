/**
 * Admin Staff API
 * 
 * NOTE: API endpoints cho trang quản lý nhân viên
 */

import api from './client'

// Helper: luôn trả về array từ nhiều dạng wrapper khác nhau
const asArray = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.staff)) return payload.staff
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.content)) return payload.content
  return []
}

const buildParams = (params = {}) => {
  const {
    search,
    stationId,
    position, // = role
    status,
    page = 1,
    size = 1000, // đủ lớn để tính stats/stations
  } = params

  const p = {}
  if (search) p.search = search
  if (stationId != null) p.stationId = stationId
  if (position) p.position = position
  if (status) p.status = status
  p.page = page
  p.size = size
  return p
}

const toLower = (s) => (s ?? '').toString().trim().toLowerCase()

/**
 * Get list of staff members (array)
 * Endpoint: GET /admin/staff
 * @param {Object} params { search, stationId, position, status, page, size }
 * @returns {Promise<Array>}
 */
export async function getStaff(params = {}) {
  const { data: resp } = await api.get('/admin/staff', { params: buildParams(params) })
  return asArray(resp)
}

/**
 * Get staff statistics (tính từ dữ liệu thật của /admin/staff)
 * KHÔNG cần endpoint /admin/staff/stats
 * @param {Object} filters { search, stationId, position, status }
 * @returns {Promise<{total:number, active:number, onLeave:number}>}
 */
export const getStaffStats = async (filters = {}) => {
  try {
    console.log('[getStaffStats] Aggregating from /admin/staff')
    const { data: resp } = await api.get('/admin/staff', {
      params: buildParams({ ...filters, page: 1, size: 10000 }),
    })
    const list = asArray(resp)

    const total = list.length
    const active = list.filter(it => toLower(it.status) === 'active').length
    const onLeave = list.filter(it => toLower(it.status) === 'on-leave').length

    return { total, active, onLeave }
  } catch (error) {
    console.error('[getStaffStats] error:', error?.response?.status || error.message)
    return { total: 0, active: 0, onLeave: 0 }
  }
}

/**
 * Get list of stations (suy ra từ /admin/staff)
 * KHÔNG cần endpoint /admin/stations
 * @param {Object} filters { search, position, status }  // không filter theo station ở đây
 * @returns {Promise<Array<{id:number,name:string}>>}
 */
export const getStations = async (filters = {}) => {
  try {
    console.log('[getStations] Deriving from /admin/staff')
    const { data: resp } = await api.get('/admin/staff', {
      params: buildParams({ ...filters, page: 1, size: 10000 }),
    })
    const list = asArray(resp)

    // hỗ trợ cả camelCase và snake_case
    const map = new Map()
    for (const it of list) {
      const id = it.stationId ?? it.station_id
      const name = it.stationName ?? it.station_name ?? (id != null ? `Station #${id}` : null)
      if (id != null && name) {
        map.set(Number(id), { id: Number(id), name: String(name) })
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  } catch (error) {
    console.error('[getStations] error:', error?.response?.status || error.message)
    return []
  }
}

/**
 * Get staff member by ID
 * Endpoint: GET /admin/staff/:id
 */
export const getStaffById = async (id) => {
  try {
    console.log('[getStaffById] ID:', id)
    const { data } = await api.get(`/admin/staff/${id}`)
    return data
  } catch (error) {
    console.error('[getStaffById] error:', error?.response?.status || error.message)
    throw error
  }
}

/**
 * Create new staff member
 * Endpoint: POST /admin/staff
 */
export const createStaff = async (staffData) => {
  try {
    console.log('[createStaff] data:', staffData)
    const { data } = await api.post('/admin/staff', staffData)
    return data
  } catch (error) {
    console.error('[createStaff] error:', error?.response?.status || error.message)
    throw error
  }
}

/**
 * Update staff member
 * Endpoint: PUT /admin/staff/:id
 */
export const updateStaff = async (id, staffData) => {
  try {
    console.log('[updateStaff] ID:', id)
    const { data } = await api.put(`/admin/staff/${id}`, staffData)
    return data
  } catch (error) {
    console.error('[updateStaff] error:', error?.response?.status || error.message)
    throw error
  }
}

/**
 * Delete staff member
 * Endpoint: DELETE /admin/staff/:id
 */
export const deleteStaff = async (id) => {
  try {
    console.log('[deleteStaff] ID:', id)
    await api.delete(`/admin/staff/${id}`)
    console.log('[deleteStaff] Success')
  } catch (error) {
    console.error('[deleteStaff] error:', error?.response?.status || error.message)
    throw error
  }
}

/**
 * Export staff to Excel
 * Endpoint: GET /admin/staff/export
 * @returns {Promise<Blob>}
 */
export const exportStaff = async (params = {}) => {
  try {
    const { data } = await api.get('/admin/staff/export', {
      params,
      responseType: 'blob',
    })
    return data
  } catch (error) {
    console.error('[exportStaff] error:', error?.response?.status || error.message)
    throw error
  }
}
