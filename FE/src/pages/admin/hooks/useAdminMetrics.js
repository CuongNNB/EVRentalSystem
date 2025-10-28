import { useCallback, useEffect, useRef, useState } from 'react'
import { getOverviewMetrics } from '../../../api/adminDashboard'
import { thisMonthRange } from '../../../utils/dateRange'

export default function useAdminMetrics(initialParams) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initialRef = useRef(initialParams)

  const fetcher = useCallback(async (overrides = {}) => {
    // NOTE: Tạo defaultRange bên trong callback để tránh stale closure
    const defaultRange = thisMonthRange()
    const params = { ...defaultRange, ...(initialRef.current || {}), ...(overrides || {}) }
    setLoading(true)
    setError(null)
    console.log('[useAdminMetrics] fetching with params:', params)
    try {
      // Nếu getOverviewMetrics trả Axios response, dùng: const raw = (await getOverviewMetrics(params))?.data
      const raw = await getOverviewMetrics(params)
      console.log('[useAdminMetrics] received raw data:', raw)

      const n = (v) => (v == null ? 0 : Number(v)) // optional: ép số an toàn

      const mapped = {
        revenueMonth: n(raw?.revenueMonth ?? raw?.totalRevenue),
        rentalsToday: n(raw?.rentalsToday ?? raw?.todayRentals),

        // thêm cả snake_case fallback:
        vehiclesTotal: n(raw?.vehiclesTotal ?? raw?.totalVehicles ?? raw?.total_vehicles),
        vehiclesActive: n(raw?.vehiclesActive ?? raw?.activeVehicles ?? raw?.active_vehicles),
        vehiclesMaint: n(
          raw?.vehiclesMaint ?? raw?.maintenanceVehicles ?? raw?.fixingVehicles ?? raw?.maintenance_vehicles
        ),

        customersTotal: n(raw?.customersTotal ?? raw?.totalCustomers ?? raw?.total_customers),
        utilizationRate: Number(raw?.utilizationRate ?? raw?.utilization ?? 0),

        deltaRevenueMoM: raw?.deltaRevenueMoM ?? raw?.delta?.revenue ?? null,
        deltaRentalsDoD: raw?.deltaRentalsDoD ?? raw?.delta?.rentals ?? null,
        deltaCustomersMoM: raw?.deltaCustomersMoM ?? null,
        deltaUtilizationWoW: raw?.deltaUtilizationWoW ?? null,
      }

      setData(mapped)
      console.debug?.('[useAdminMetrics] mapped metrics:', mapped)
      return mapped
    } catch (err) {
      console.error('[useAdminMetrics] error:', err)
      setError(err)
      // Don't throw - let component render with error state
      return null
    } finally {
      setLoading(false)
    }
  }, []) // NOTE: deps rỗng là ổn vì tất cả dependencies được tạo bên trong hoặc dùng ref

  useEffect(() => {
    console.log('[useAdminMetrics] mounting, will fetch data')
    fetcher().catch((e) => {
      console.error('[useAdminMetrics] fetch failed:', e)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error, refetch: fetcher }
}
