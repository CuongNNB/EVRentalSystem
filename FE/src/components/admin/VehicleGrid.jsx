import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const VehicleGrid = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const BACKEND_BASE_URL = 'http://localhost:8084/EVRentalSystem'
  const SIZE = 10 // Constant size, không cần state

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(
        `${BACKEND_BASE_URL}/api/vehicle/vehicles?page=${page}&size=${SIZE}`
      )
      
      // Handle paginated response
      const data = response.data
      if (data.content && Array.isArray(data.content)) {
        setVehicles(data.content)
        setTotalPages(data.totalPages || 0)
      } else if (Array.isArray(data)) {
        setVehicles(data)
      } else {
        setVehicles([])
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError(err.message || 'Không thể tải danh sách xe')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Get image source with fallback logic
  const getImageSrc = (v) => {
    // 1. Ưu tiên: picture từ backend
    if (v?.picture != null && v.picture !== '' && v.picture !== 'null') {
      return `${BACKEND_BASE_URL}/carpic/${String(v.picture).trim()}`
    }
    // 2. Fallback: vehicleId từ backend
    const vehicleId = v?.vehicleId ?? v?.vehicle_id
    if (vehicleId != null && vehicleId !== '') {
      return `${BACKEND_BASE_URL}/carpic/${vehicleId}.jpg`
    }
    // 3. Fallback cuối cùng: default.jpg từ FE
    return '/carpic/default.jpg'
  }

  // Get status badge color
  const getStatusColor = (status) => {
    const statusUpper = String(status || '').toUpperCase()
    if (statusUpper === 'AVAILABLE') return 'bg-green-500'
    if (statusUpper === 'RENTED') return 'bg-orange-500'
    if (statusUpper === 'FIXING') return 'bg-red-500'
    return 'bg-gray-500'
  }

  // Get status label
  const getStatusLabel = (status) => {
    const statusUpper = String(status || '').toUpperCase()
    if (statusUpper === 'AVAILABLE') return 'Sẵn sàng'
    if (statusUpper === 'RENTED') return 'Đang thuê'
    if (statusUpper === 'FIXING') return 'Đang sửa'
    return status || 'Không xác định'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Lỗi tải dữ liệu</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchVehicles}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không có xe nào trong danh sách</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => {
          const vehicleId = v?.id ?? v?.vehicleId ?? v?.vehicle_id ?? 'N/A'
          const brand = v?.brand ?? 'N/A'
          const model = v?.model ?? 'N/A'
          const licensePlate = v?.licensePlate ?? 'N/A'
          const stationName = v?.stationName ?? 'N/A'
          const status = v?.status ?? 'UNKNOWN'
          const odo = v?.odo ?? 0
          const imageSrc = getImageSrc(v)

          return (
            <div
              key={vehicleId}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img
                  src={imageSrc}
                  alt={`${brand} ${model}`}
                  className="w-full h-full object-cover rounded-t-md"
                  loading="lazy"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallback) {
                      e.currentTarget.dataset.fallback = '1'
                      // Try vehicleId fallback
                      const fallbackVehicleId = v?.vehicleId ?? v?.vehicle_id
                      if (fallbackVehicleId && fallbackVehicleId !== vehicleId) {
                        e.currentTarget.src = `${BACKEND_BASE_URL}/carpic/${fallbackVehicleId}.jpg`
                        return
                      }
                      // Final fallback: default.jpg
                      e.currentTarget.dataset.fallback = '2'
                      e.currentTarget.src = '/carpic/default.jpg'
                    } else if (e.currentTarget.dataset.fallback === '1') {
                      e.currentTarget.dataset.fallback = '2'
                      e.currentTarget.src = '/carpic/default.jpg'
                    }
                  }}
                />
                {/* Status badge overlay */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`${getStatusColor(status)} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md`}
                  >
                    {getStatusLabel(status)}
                  </span>
                </div>
              </div>

              {/* Card content */}
              <div className="p-4 space-y-3">
                {/* Brand + Model */}
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                  {brand} {model}
                </h3>

                {/* License Plate */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Biển số:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {licensePlate}
                  </span>
                </div>

                {/* Station Name */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Trạm:</span>
                  <span className="text-sm text-gray-700 line-clamp-1">
                    {stationName}
                  </span>
                </div>

                {/* ODO */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Số km:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {odo.toLocaleString('vi-VN')} km
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Trước
          </button>
          <span className="text-gray-700">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}

export default VehicleGrid

