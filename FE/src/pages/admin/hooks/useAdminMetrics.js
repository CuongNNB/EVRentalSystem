/**
 * useAdminMetrics Hook
 * 
 * NOTE: Custom hook để fetch và quản lý dữ liệu metrics cho Admin Dashboard
 * 
 * CHỨC NĂNG:
 * - Tự động fetch dữ liệu KPI khi component mount
 * - Map các field từ backend API sang format hiển thị
 * - Hỗ trợ nhiều format dữ liệu từ backend (camelCase, snake_case)
 * - Cung cấp refetch function để load lại dữ liệu
 * 
 * API ENDPOINT: GET /admin/overview/metrics
 * 
 * DỮ LIỆU TRẢ VỀ:
 * - revenueMonth: Tổng doanh thu tháng này
 * - rentalsToday: Số lượt thuê hôm nay
 * - vehiclesTotal: Tổng số xe trong hệ thống
 * - vehiclesActive: Số xe đang hoạt động
 * - vehiclesMaint: Số xe đang bảo trì
 * - customersTotal: Tổng số khách hàng
 * - utilizationRate: Tỷ lệ sử dụng xe (0-1)
 * - deltaRevenueMoM: % thay đổi doanh thu so với tháng trước
 * - deltaRentalsDoD: % thay đổi lượt thuê so với hôm qua
 * 
 * @param {object} initialParams - Tham số khởi tạo (optional)
 * @returns {object} { data, loading, error, refetch }
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { getOverviewMetrics } from '../../../api/adminDashboard'
import { thisMonthRange } from '../../../utils/dateRange'

export default function useAdminMetrics(initialParams) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // NOTE: Dùng ref để lưu initialParams tránh re-render không cần thiết
  const initialRef = useRef(initialParams)

  const fetcher = useCallback(async (overrides = {}) => {
    // NOTE: Tạo defaultRange bên trong callback để tránh stale closure
    // thisMonthRange() trả về: { from: "2025-10-01", to: "2025-10-28" }
    const defaultRange = thisMonthRange()
    const params = { ...defaultRange, ...(initialRef.current || {}), ...(overrides || {}) }
    
    setLoading(true)
    setError(null)
    console.log('[useAdminMetrics] fetching with params:', params)
    
    try {
      // NOTE: Gọi API để lấy dữ liệu metrics
      // API sẽ trả về object với các field như: revenueMonth, rentalsToday, vehiclesTotal, etc.
      const raw = await getOverviewMetrics(params)
      console.log('[useAdminMetrics] received raw data:', raw)

      // NOTE: Helper function để convert value sang number an toàn
      const n = (v) => (v == null ? 0 : Number(v))

      // NOTE: Map dữ liệu từ backend sang format chuẩn cho frontend
      // Hỗ trợ nhiều format field names (camelCase, snake_case) để tương thích với nhiều backend
      const mapped = {
        // Doanh thu tháng này
        revenueMonth: n(raw?.revenueMonth ?? raw?.totalRevenue),
        
        // Số lượt thuê hôm nay
        rentalsToday: n(raw?.rentalsToday ?? raw?.todayRentals),

        // Thông tin xe - hỗ trợ cả camelCase và snake_case
        vehiclesTotal: n(raw?.vehiclesTotal ?? raw?.totalVehicles ?? raw?.total_vehicles),
        vehiclesActive: n(raw?.vehiclesActive ?? raw?.activeVehicles ?? raw?.active_vehicles),
        vehiclesMaint: n(
          raw?.vehiclesMaint ?? raw?.maintenanceVehicles ?? raw?.fixingVehicles ?? raw?.maintenance_vehicles
        ),

        // Tổng số khách hàng
        customersTotal: n(raw?.customersTotal ?? raw?.totalCustomers ?? raw?.total_customers),
        
        // Tỷ lệ sử dụng xe (0-1, ví dụ: 0.75 = 75%)
        utilizationRate: Number(raw?.utilizationRate ?? raw?.utilization ?? 0),

        // Delta metrics (% thay đổi so với kỳ trước) - có thể null nếu backend không trả về
        deltaRevenueMoM: raw?.deltaRevenueMoM ?? raw?.delta?.revenue ?? null,      // Month over Month
        deltaRentalsDoD: raw?.deltaRentalsDoD ?? raw?.delta?.rentals ?? null,      // Day over Day
        deltaCustomersMoM: raw?.deltaCustomersMoM ?? null,                         // Month over Month
        deltaUtilizationWoW: raw?.deltaUtilizationWoW ?? null,                     // Week over Week
      }

      // NOTE: Lưu dữ liệu đã map vào state
      setData(mapped)
      console.debug?.('[useAdminMetrics] mapped metrics:', mapped)
      return mapped
      
    } catch (err) {
      // NOTE: Xử lý lỗi - set error state nhưng không throw để component vẫn render được
      console.error('[useAdminMetrics] error:', err)
      setError(err)
      return null
      
    } finally {
      // NOTE: Luôn set loading = false bất kể success hay error
      setLoading(false)
    }
  }, []) // NOTE: deps rỗng là ổn vì tất cả dependencies được tạo bên trong hoặc dùng ref

  // NOTE: Auto-fetch khi component mount
  useEffect(() => {
    console.log('[useAdminMetrics] mounting, will fetch data')
    fetcher().catch((e) => {
      console.error('[useAdminMetrics] fetch failed:', e)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // NOTE: Return object với data, loading state, error, và refetch function
  return { data, loading, error, refetch: fetcher }
}
