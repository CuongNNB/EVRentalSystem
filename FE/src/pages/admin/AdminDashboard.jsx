import React, { useEffect } from 'react'
import './AdminDashboard.css'
import KpiCard from '../../components/admin/KpiCard'
import RevenueChart from '../../components/admin/RevenueChart'
import TopStations from '../../components/admin/TopStations'
import RecentRentals from '../../components/admin/RecentRentals'
import ActivityFeed from '../../components/admin/ActivityFeed'
import ExportButtons from '../../components/admin/ExportButtons'
import useAdminMetrics from './hooks/useAdminMetrics'
import { formatPercent, formatVND } from '../../utils/format'
import ErrorBoundary from '../../components/admin/ErrorBoundary'

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

  return (
    <ErrorBoundary>
      <div className="container" style={{ padding: 16, color: '#111', background: '#fff', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <div data-test="marker">MARKER: AdminDashboard is rendering</div>
      <aside className="sidebar">
        <div className="logo"><h1><i className="fas fa-bolt" /> <span className="logo-text">EV-Rental Admin</span></h1></div>
        <nav>
          <div className="nav-item active"><i className="fas fa-chart-pie" /> Tổng quan</div>
          <div className="nav-item"><i className="fas fa-car" /> Quản lý xe</div>
          <div className="nav-item"><i className="fas fa-map-marker-alt" /> Quản lý điểm thuê</div>
          <div className="nav-item"><i className="fas fa-users" /> Quản lý khách hàng</div>
          <div className="nav-item"><i className="fas fa-user-tie" /> Quản lý nhân viên</div>
          <div className="nav-section"><div className="nav-section-title">Analytics</div></div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="welcome-section">
            <div className="breadcrumb">
              <i className="fas fa-home" /> <span>Dashboard</span>
              {/* Hiển thị range đang dùng cho dễ kiểm tra */}
              <span style={{marginLeft: 8, color: '#666'}}>• {from} → {to}</span>
            </div>
            <h1 className="welcome-title">Xin chào, Admin!</h1>
            <p className="welcome-subtitle">Chào mừng bạn đến với EV Rental Dashboard</p>
          </div>
          <div className="header-right"><div className="date-time"><div className="current-date">--</div><div className="current-time">--</div></div><div className="admin-avatar">AD</div></div>
        </header>

        <div className="quick-actions">
          <button className="quick-btn"><i className="fas fa-plus-circle" /> Thêm xe mới</button>
          <button className="quick-btn"><i className="fas fa-user-plus" /> Đăng ký KH</button>
          <button className="quick-btn"><i className="fas fa-map-marker-alt" /> Thêm điểm thuê</button>
          <button className="quick-btn"><i className="fas fa-file-export" /> Xuất báo cáo</button>
        </div>

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
              <KpiCard title="Tổng số xe" value={num(m?.vehiclesTotal)} sub={`${num(m?.vehiclesActive)} hoạt động • ${num(m?.vehiclesMaint)} bảo trì`} />
              <KpiCard title="Khách hàng" value={num(m?.customersTotal)} sub={m?.deltaCustomersMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaCustomersMoM)}`} />
              <KpiCard title="Tỷ lệ sử dụng" value={formatPercent(num(m?.utilizationRate))} sub={m?.deltaUtilizationWoW!=null && `So với tuần trước: ${formatPercent(m?.deltaUtilizationWoW)}`} />
            </>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="chart-container"><RevenueChart /></div>
          <div className="activity-feed"><ActivityFeed /></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:24, marginBottom:24}}>
          <TopStations />
          <RecentRentals />
        </div>

        <ExportButtons />
      </main>
      </div>
    </ErrorBoundary>
  )
}
