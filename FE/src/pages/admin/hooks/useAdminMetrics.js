import { useCallback, useEffect, useRef, useState } from 'react'
import { getOverviewMetrics } from '../../../api/adminDashboard'
import { thisMonthRange } from '../../../utils/dateRange'

export default function useAdminMetrics(initialParams) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const defaultRange = thisMonthRange()
  // store initialParams in a ref so it doesn't create a new dependency each render
  const initialRef = useRef(initialParams)

  const fetcher = useCallback(async (overrides = {}) => {
    const params = { ...defaultRange, ...(initialRef.current || {}), ...(overrides || {}) }
    setLoading(true)
    setError(null)
    try {
      const raw = await getOverviewMetrics(params)

      const mapped = {
        revenueMonth: raw?.revenueMonth ?? raw?.totalRevenue ?? 0,
        rentalsToday: raw?.rentalsToday ?? raw?.todayRentals ?? 0,

        vehiclesTotal: raw?.vehiclesTotal ?? raw?.totalVehicles ?? 0,
        vehiclesActive: raw?.vehiclesActive ?? raw?.activeVehicles ?? 0,
        vehiclesMaint: raw?.vehiclesMaint ?? raw?.maintenanceVehicles ?? raw?.fixingVehicles ?? 0,

        customersTotal: raw?.customersTotal ?? raw?.totalCustomers ?? 0,
        utilizationRate: raw?.utilizationRate ?? raw?.utilization ?? 0,

        deltaRevenueMoM: raw?.deltaRevenueMoM ?? raw?.delta?.revenue ?? null,
        deltaRentalsDoD: raw?.deltaRentalsDoD ?? raw?.delta?.rentals ?? null,
        deltaCustomersMoM: raw?.deltaCustomersMoM ?? null,
        deltaUtilizationWoW: raw?.deltaUtilizationWoW ?? null,
      }

      setData(mapped)
      return mapped
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // fetch on mount once
    fetcher().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error, refetch: fetcher }
}
