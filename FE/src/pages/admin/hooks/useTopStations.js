import { useMemo } from 'react'
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

export default function useTopStations(params = {}) {
  const def = useMemo(() => thisMonthRange(), [])
  const p = useMemo(() => ({ limit: 5, ...def, ...(params || {}) }), [def, params?.limit, params?.from, params?.to])

  return useAsync(
    async (signal) => {
      const res = await getTopStations(p, { signal })
      const stations = Array.isArray(res?.stations) ? res.stations : Array.isArray(res) ? res : []
      const mapped = mapStations({ data: stations })
      try { console.debug && console.debug('[useTopStations] mapped:', mapped) } catch {}
      return mapped
    },
    [p.limit, p.from, p.to]
  )
}
