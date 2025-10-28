import { useMemo, useCallback, useRef } from 'react'
import { useAsync } from './useAsync'
import { getTopStations } from '../../../api/adminDashboard'
import { thisMonthRange } from '../../../utils/dateRange'

// Chuẩn hóa dữ liệu trả về từ BE
function mapStations(data) {
  const raw = Array.isArray(data?.stations)
    ? data.stations
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []

  return raw.map(s => ({
    id: s.stationId ?? s.id,
    name: s.stationName ?? s.name,
    rentals: s.rentals ?? s.totalRentals ?? 0,
    revenue: s.revenue ?? 0,
    utilization: s.utilizationRate ?? s.utilization ?? 0,
  }))
}

// Request ID để track requests
let requestId = 0

export default function useTopStations(params = {}) {
  const def = useMemo(() => thisMonthRange(), [])
  const currentRequestId = useRef(0)
  
  // Stable values for deps
  const limit = params?.limit || 5
  const from = params?.from || def.from
  const to = params?.to || def.to
  
  const fetchStations = useCallback(async (signal) => {
    // Increment request ID
    requestId++
    const thisRequestId = requestId
    currentRequestId.current = thisRequestId
    
    const p = { limit, from, to }
    
    try {
      const res = await getTopStations(p, { signal })
      
      // Only process if this is still the latest request
      if (currentRequestId.current !== thisRequestId) {
        return []
      }
      
      const stations = Array.isArray(res?.stations) 
        ? res.stations 
        : Array.isArray(res) 
        ? res 
        : []
      
      const mapped = mapStations({ data: stations })
      return mapped
    } catch (error) {
      // Ignore cancellation errors
      if (error?.name === 'AbortError' || 
          error?.name === 'CanceledError' || 
          error?.message === 'canceled') {
        return []
      }
      throw error
    }
  }, [limit, from, to])

  return useAsync(fetchStations, [limit, from, to])
}
