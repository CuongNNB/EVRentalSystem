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
    console.log('[createVehicle] Creating vehicle with data:', vehicleData)
    const { data } = await api.post('/vehicle/vehicles', vehicleData)
    console.log('[createVehicle] Success:', data)
    return data
  } catch (error) {
    console.error('[createVehicle] Error:', error)
    // Sử dụng userMessage từ interceptor hoặc tạo message mặc định
    if (!error.userMessage) {
      error.userMessage = error.response?.data?.message || 
                         `Không thể tạo xe mới: ${error.message}`
    }
    throw error
  }
}

/**
 * Update vehicle
 */
export const updateVehicle = async (id, vehicleData) => {
  try {
    console.log(`[updateVehicle] Updating vehicle ${id} with data:`, vehicleData)
    const { data } = await api.put(`/vehicle/vehicles/${id}`, vehicleData)
    console.log('[updateVehicle] Success:', data)
    return data
  } catch (error) {
    console.error('[updateVehicle] Error:', error)
    // Sử dụng userMessage từ interceptor hoặc tạo message mặc định
    if (!error.userMessage) {
      error.userMessage = error.response?.data?.message || 
                         `Không thể cập nhật xe: ${error.message}`
    }
    throw error
  }
}

/**
 * Delete vehicle
 */
export const deleteVehicle = async (id) => {
  try {
    console.log(`[deleteVehicle] Deleting vehicle ${id}`)
    const { data } = await api.delete(`/vehicle/vehicles/${id}`)
    console.log('[deleteVehicle] Success:', data)
    return data
  } catch (error) {
    console.error('[deleteVehicle] Error:', error)
    // Sử dụng userMessage từ interceptor hoặc tạo message mặc định
    if (!error.userMessage) {
      error.userMessage = error.response?.data?.message || 
                         `Không thể xóa xe: ${error.message}`
    }
    throw error
  }
}

/**
 * Upload vehicle image
 * Returns filename or throws error
 */
export const uploadVehicleImage = async (file) => {
  try {
    console.log('[uploadVehicleImage] Uploading image:', file.name)
    const formData = new FormData()
    formData.append('picture', file)
    
    const { data } = await api.post('/vehicle/vehicles/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    console.log('[uploadVehicleImage] Success:', data)
    // Backend có thể trả về { filename: '...', url: '...' } hoặc chỉ filename
    return data.filename || data.url || data.picture || file.name
  } catch (error) {
    console.error('[uploadVehicleImage] Error:', error)
    
    // Helper: Sanitize filename but preserve extension
    const sanitizeFilename = (originalName) => {
      // Get extension
      const lastDot = originalName.lastIndexOf('.')
      const ext = lastDot > 0 ? originalName.substring(lastDot) : ''
      // Get name without extension
      const nameWithoutExt = lastDot > 0 ? originalName.substring(0, lastDot) : originalName
      // Sanitize name (keep alphanumeric, dots, dashes, underscores)
      const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9._-]/g, '_')
      // Return sanitized name with original extension
      return sanitized + ext
    }
    
    // Check if it's CORS error
    if (error.message?.includes('CORS') || 
        error.code === 'ERR_NETWORK' ||
        (error.response === undefined && error.message?.includes('Network'))) {
      console.warn('[uploadVehicleImage] CORS or Network error detected, using sanitized filename as fallback')
      // Return sanitized filename with preserved extension
      return sanitizeFilename(file.name)
    }
    
    // Fallback: nếu API không có (404), trả về tên file gốc đã sanitize
    if (error.response?.status === 404 || error.response?.status === 405) {
      console.warn('[uploadVehicleImage] Upload endpoint not found (404/405), using sanitized filename as fallback')
      return sanitizeFilename(file.name)
    }
    
    // For other errors (500, etc), still return filename but with warning
    if (error.response?.status >= 500) {
      console.warn('[uploadVehicleImage] Server error, using sanitized filename as fallback')
      return sanitizeFilename(file.name)
    }
    
    // Sử dụng userMessage từ interceptor hoặc tạo message mặc định
    if (!error.userMessage) {
      error.userMessage = error.response?.data?.message || 
                         `Không thể upload ảnh: ${error.message}`
    }
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
