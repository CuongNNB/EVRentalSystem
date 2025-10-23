import { useAsync } from './useAsync'
import { getRecentRentals } from '../../../api/adminDashboard'
import { lastNDays } from '../../../utils/dateRange'

export default function useRecentRentals(params = {}) {
  const def = lastNDays(7)
  const p = { limit: params.limit ?? 10, ...(params || {}), ...def }

  return useAsync(async (signal) => {
    const res = await getRecentRentals(p.limit, { from: p.from, to: p.to }, { signal })
    // backend may return { rentals: [...] } or an array
    const raw = res?.rentals || res?.data?.rentals || (Array.isArray(res) ? res : [])

    return raw.map(r => ({
      code: r.rentalId ?? r.id ?? 'N/A',
      customer: r.customerName ?? r.customer ?? 'Unknown',
      vehicle: r.vehicleCode || r.vehicle || '--',
      amount: Number(r.price ?? r.amount ?? 0) || 0,
      time: r.endTime ?? r.startTime ?? r.createdAt ?? null,
      status: r.status ?? r.state ?? '',
    }))
  }, [p.limit, p.from, p.to])
}
