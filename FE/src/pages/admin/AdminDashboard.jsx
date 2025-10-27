/**
 * AdminDashboard Component
 * 
 * NOTE: File đã được sửa để loại bỏ các import không tồn tại và thêm các component mới
 * 
 * CÁC THÀNH PHẦN ĐÃ XÓA:
 * - VehicleCardList (component không tồn tại)
 * - useVehicles hook (hook không tồn tại)
 * - VehiclePreview function (function không sử dụng)
 * - Các import không dùng: useAuth, useNavigate
 * 
 * CÁC THÀNH PHẦN ĐÃ THÊM/TÁI TẠO:
 * - AdminSlideBar: Thanh điều hướng sidebar cho admin
 * - StationVehiclesCard: Khung hiển thị tổng số xe (đã tạo lại)
 * 
 * Trang này hiển thị tổng quan dashboard cho admin với các KPI metrics,
 * biểu đồ doanh thu, hoạt động gần đây, và thống kê.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'
import './AdminDashboardNew.css'
import '../staff/StaffLayout.css'
import KpiCard from '../../components/admin/KpiCard'
import RevenueChart from '../../components/admin/RevenueChart'
import TopStations from '../../components/admin/TopStations'
import RecentRentals from '../../components/admin/RecentRentals'
import ActivityFeed from '../../components/admin/ActivityFeed'
import ExportButtons from '../../components/admin/ExportButtons'
import AdminSlideBar from '../../components/admin/AdminSlideBar' // NOTE: Đã thêm import AdminSlideBar
import StationVehiclesCard from '../../components/admin/StationVehiclesCard' // NOTE: Đã tạo lại StationVehiclesCard
import useAdminMetrics from './hooks/useAdminMetrics'
import { formatPercent, formatVND } from '../../utils/format'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminDashboard() {
  // NOTE: useAdminMetrics đã tự động fetch data khi mount
  const { data: m, loading, error, refetch } = useAdminMetrics()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const num = (v) => (typeof v === 'number' ? v : 0)
  const params = new URLSearchParams(window.location.search)
  const showDebug = params.get('debug') === '1'
  
  // === from/to = đầu tháng -> hôm nay (chỉ dùng cho retry button) ===
  const ymd = (d) => d.toLocaleDateString('en-CA')
  const today = new Date()
  const to = ymd(today)
  const from = ymd(new Date(today.getFullYear(), today.getMonth(), 1))

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout() // Xóa token và thông tin user
    navigate('/') // Chuyển về trang homepage
  }

  return (
    <ErrorBoundary>
      <div className="admin-layout">
        {/* NOTE: AdminSlideBar đã được thêm vào layout */}
        <AdminSlideBar activeKey="overview" />
        <main className="admin-main-content">
          {/* Breadcrumb Navigation */}
          <div className="admin-breadcrumb">
            <i className="fas fa-home"></i>
            <span>Quản trị</span>
            <i className="fas fa-chevron-right"></i>
            <span>Tổng quan</span>
          </div>

          {/* Page Header with Icon and Title */}
          <div className="admin-page-header">
            <div className="admin-page-header-left">
              <div className="admin-page-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="admin-page-title-group">
                <h1 className="admin-page-title">Tổng quan hệ thống</h1>
                <p className="admin-page-subtitle">Theo dõi và quản lý toàn bộ hoạt động của hệ thống thuê xe điện</p>
              </div>
            </div>
          </div>

          {/* Search and Action Buttons */}
          <div className="admin-toolbar">
            <div className="admin-search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Tìm kiếm xe theo biển số, mã xe hoặc model..."
              />
            </div>
            <div className="admin-toolbar-actions">
              <button className="admin-btn admin-btn-primary">
                <i className="fas fa-plus"></i>
                <span>Thêm xe</span>
              </button>
              <ExportButtons />
              <button className="admin-btn admin-btn-danger" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* KPI Stats Grid */}
          <div className="admin-stats-grid">
          {loading ? (
            <div className="stat-card">Đang tải...</div>
          ) : error ? (
            <div className="stat-card">
              Lỗi KPI: {error?.message || String(error)}{' '}
              <button onClick={() => refetch({ from, to })}>Thử lại</button>
            </div>
          ) : (
            <>
              {/* NOTE: Layout theo thứ tự giống trong ảnh, dữ liệu từ API */}
              <KpiCard title="TỔNG DOANH THU" value={formatVND(num(m?.revenueMonth))} sub={m?.deltaRevenueMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaRevenueMoM)}`} />
              <KpiCard title="LƯỢT THUÊ HÔM NAY" value={num(m?.rentalsToday)} sub={m?.deltaRentalsDoD!=null && `So với hôm qua: ${formatPercent(m?.deltaRentalsDoD)}`} />
              {/* NOTE: StationVehiclesCard có dropdown 7 trạm, khi chọn trạm sẽ hiển thị số xe của trạm đó */}
              <StationVehiclesCard totalAll={num(m?.vehiclesTotal)} />
              <KpiCard title="KHÁCH HÀNG" value={num(m?.customersTotal)} sub={m?.deltaCustomersMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaCustomersMoM)}`} />
              <KpiCard title="TỶ LỆ SỬ DỤNG" value={formatPercent(num(m?.utilizationRate))} sub={m?.deltaUtilizationWoW!=null && `So với tuần trước: ${formatPercent(m?.deltaUtilizationWoW)}`} />
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

      </main>
      </div>
    </ErrorBoundary>
  )
}

