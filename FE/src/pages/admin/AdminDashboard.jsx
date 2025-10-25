import React, { useEffect } from 'react'
import './AdminDashboard.css'
import '../staff/StaffLayout.css'
import KpiCard from '../../components/admin/KpiCard'
import RevenueChart from '../../components/admin/RevenueChart'
import TopStations from '../../components/admin/TopStations'
import RecentRentals from '../../components/admin/RecentRentals'
import ActivityFeed from '../../components/admin/ActivityFeed'
import ExportButtons from '../../components/admin/ExportButtons'
import StationVehiclesCard from '../../components/admin/StationVehiclesCard'
import AdminSlideBar from '../../components/admin/AdminSlideBar'
import useAdminMetrics from './hooks/useAdminMetrics'
import useVehicles from './hooks/useVehicles'
import VehicleCardList from '../../components/admin/VehicleCardList'
import { formatPercent, formatVND } from '../../utils/format'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { data: m, loading, error, refetch } = useAdminMetrics()

  // === from/to = đầu tháng -> hôm nay (YYYY-MM-DD local time) ===
  // Use local date (toLocaleDateString('en-CA')) to avoid UTC shift when using toISOString()
  const ymd = (d) => d.toLocaleDateString('en-CA')
  const today = new Date()
  const to = ymd(today)
  const from = ymd(new Date(today.getFullYear(), today.getMonth(), 1))

  // Gọi API với from/to khi mount (retry cũng truyền same range)
  useEffect(() => {
    console.log('[AdminDashboard] mounted — fetching metrics for', { from, to })
    refetch({ from, to }) // => GET /admin/overview/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD
  }, [refetch])

  const num = (v) => (typeof v === 'number' ? v : 0)
  const params = new URLSearchParams(window.location.search)
  const showDebug = params.get('debug') === '1'
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <ErrorBoundary>
      <div className="admin-layout">
        <AdminSlideBar activeKey="overview" />

        <main className="main-content">
          <header className="header">
            <div className="search-container" style={{flex:1, maxWidth: 720}}>
              <i className="fas fa-search" style={{marginRight:8, color:'#94a3b8'}} />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm xe theo biển số, mã xe hoặc model..."
                style={{width: '100%', borderRadius: 8}}
              />
            </div>
            <div className="header-actions" style={{display:'flex', gap:12, alignItems:'center'}}>
              <ExportButtons />
              <button className="quick-btn" onClick={() => console.log('Add new vehicle')}>
                <i className="fas fa-plus"></i>
                <span>Thêm xe mới</span>
              </button>
            </div>
          </header>

       

  <div className="stats-grid">
          {loading ? (
            <div className="stat-card">Đang tải...</div>
          ) : error ? (
            <div className="stat-card">
              Lỗi KPI: {error?.message || String(error)}{' '}
              <button onClick={() => refetch({ from, to })}>Thử lại</button>
            </div>
          ) : (
            <>
              <KpiCard title="Tổng doanh thu (tháng)" value={formatVND(num(m?.revenueMonth))} sub={m?.deltaRevenueMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaRevenueMoM)}`} />
              <KpiCard title="Lượt thuê hôm nay" value={num(m?.rentalsToday)} sub={m?.deltaRentalsDoD!=null && `So với hôm qua: ${formatPercent(m?.deltaRentalsDoD)}`} />
              <StationVehiclesCard />
              <KpiCard title="Khách hàng" value={num(m?.customersTotal)} sub={m?.deltaCustomersMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaCustomersMoM)}`} />
              <KpiCard title="Tỷ lệ sử dụng" value={formatPercent(num(m?.utilizationRate))} sub={m?.deltaUtilizationWoW!=null && `So với tuần trước: ${formatPercent(m?.deltaUtilizationWoW)}`} />
            </>
          )}
        </div>

        {showDebug && (
          <div style={{padding:12,background:'#fff',border:'1px solid #eee',marginTop:12}}>
            <h4>Debug: mapped metrics</h4>
            <pre style={{fontSize:12}}>{JSON.stringify(m, null, 2)}</pre>
          </div>
        )}

        {/* Vehicles content card (preview) */}
     

        <div className="dashboard-grid">
          <div className="chart-container"><RevenueChart /></div>
          <div className="activity-feed"><ActivityFeed /></div>
        </div>

        <div className="panels-grid">
          <TopStations />
          <RecentRentals />
        </div>

        <ExportButtons />
      </main>
      </div>
    </ErrorBoundary>
  )
}

function VehiclePreview() {
  // small preview using vehicles hook
  const { data: vehicles, loading } = useVehicles({ filters: {}, pagination: { page: 1, limit: 8 } })
  return <VehicleCardList vehicles={vehicles} loading={loading} />
}
