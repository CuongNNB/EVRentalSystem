import React from "react";
import { Outlet } from "react-router-dom";
import "./AdminDashboardNew.css";
import "../staff/StaffLayout.css";

<<<<<<< HEAD
import KpiCard from "../../components/admin/KpiCard";
import RevenueChart from "../../components/admin/RevenueChart";
import TopStations from "../../components/admin/TopStations";
import RecentRentals from "../../components/admin/RecentRentals";
import ActivityFeed from "../../components/admin/ActivityFeed";
import ExportButtons from "../../components/admin/ExportButtons";
import AdminSlideBar from "../../components/admin/AdminSlideBar";
import StationVehiclesCard from "../../components/admin/StationVehiclesCard";
import useAdminMetrics from "./hooks/useAdminMetrics";
import { formatPercent, formatVND } from "../../utils/format";
import ErrorBoundary from "../../components/admin/ErrorBoundary";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminDashboard() {
=======

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboardNew.css'
import '../staff/StaffLayout.css'

// Debug: Log để xác nhận file được load
console.log('[AdminDashboard] Module loaded successfully')
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
import { getVehicleStats } from '../../api/adminVehicles'

export default function AdminDashboard() {
  console.log('[AdminDashboard] Component is rendering...')
  
  // NOTE: useAdminMetrics đã tự động fetch data khi mount
  const { data: m, loading, error, refetch } = useAdminMetrics()
  const { logout } = useAuth()
  const navigate = useNavigate()
  
  // State cho tổng số xe
  const [totalVehicles, setTotalVehicles] = useState(0)
  
  // Fetch tổng số xe từ API vehicle stats
  useEffect(() => {

    const fetchVehicleTotal = async () => {
      try {
        console.log('[AdminDashboard] Fetching vehicle stats...')
        
        // Gọi API với stationId = 0 để lấy tổng toàn hệ thống
        const stats = await getVehicleStats(0)
        console.log('[AdminDashboard] Vehicle stats:', stats)
        
        // Lấy tổng số xe từ stats
        const total = stats?.total || 0
        setTotalVehicles(total)
        
        console.log('[AdminDashboard] Total vehicles:', total)
      } catch (err) {
        console.error('[AdminDashboard] Error fetching vehicle total:', err)
        setTotalVehicles(0)
      }
    }
    
    fetchVehicleTotal()
  }, [])

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

  // Debug: Log state để kiểm tra
  console.log('[AdminDashboard] loading:', loading, 'error:', error, 'data:', m)

  // Fallback UI khi đang load toàn bộ trang lần đầu
  if (loading && !m) {
    console.log('[AdminDashboard] Rendering loading state...')
    return (
      <div className="admin-layout">
        <AdminSlideBar activeKey="overview" />
        <main className="admin-main-content" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>⏳ Đang tải dữ liệu dashboard...</h2>
          <p style={{ marginTop: '1rem', color: '#666' }}>Vui lòng đợi trong giây lát</p>
        </main>
      </div>
    )
  }
  
  console.log('[AdminDashboard] Rendering main content...')

>>>>>>> 7cefea0232f34a89af720f80fc2004aa7e70dd37
  return (
    <ErrorBoundary>
      <div className="admin-layout">
        <AdminSlideBar />
        <main className="admin-main-content">
<<<<<<< HEAD
          <Outlet />
        </main>
=======
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
            {/* Action Buttons - Đã bỏ search box và button Thêm xe */}
            <div className="admin-page-header-actions">
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
            <div className="stat-card" style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>
              <p>⏳ Đang tải dữ liệu KPI...</p>
            </div>
          ) : error ? (
            <div className="stat-card" style={{ 
              gridColumn: '1 / -1', 
              padding: '2rem', 
              textAlign: 'center',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#856404' }}>⚠️ Không thể tải dữ liệu KPI</h3>
              <p style={{ marginBottom: '1rem', color: '#856404' }}>
                {error?.message || String(error)}
              </p>
              <button 
                onClick={() => refetch({ from, to })}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Thử lại
              </button>
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                Lưu ý: Trang vẫn hoạt động bình thường, chỉ KPI metrics không load được
              </p>
            </div>
          ) : (
            <>
              {/* NOTE: Layout theo thứ tự giống trong ảnh, dữ liệu từ API với icons đẹp */}
              <KpiCard 
                title="TỔNG DOANH THU" 
                value={formatVND(num(m?.revenueMonth))} 
                sub={m?.deltaRevenueMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaRevenueMoM)}`}
                icon="💰"
                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
              <KpiCard 
                title="LƯỢT THUÊ HÔM NAY" 
                value={num(m?.rentalsToday)} 
                sub={m?.deltaRentalsDoD!=null && `So với hôm qua: ${formatPercent(m?.deltaRentalsDoD)}`}
                icon="📋"
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
              {/* NOTE: StationVehiclesCard có dropdown 7 trạm, khi chọn trạm sẽ hiển thị số xe của trạm đó */}
              <StationVehiclesCard totalAll={totalVehicles} />
              <KpiCard 
                title="KHÁCH HÀNG" 
                value={num(m?.customersTotal)} 
                sub={m?.deltaCustomersMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaCustomersMoM)}`}
                icon="👥"
                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
              <KpiCard 
                title="TỶ LỆ SỬ DỤNG" 
                value={formatPercent(num(m?.utilizationRate))} 
                sub={m?.deltaUtilizationWoW!=null && `So với tuần trước: ${formatPercent(m?.deltaUtilizationWoW)}`}
                icon="📊"
                gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              />
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
>>>>>>> 7cefea0232f34a89af720f80fc2004aa7e70dd37
      </div>
    </ErrorBoundary>
  );
}


export function AdminOverview() {
  const { data: m, loading, error, refetch } = useAdminMetrics();
  const { logout } = useAuth();

  const num = (v) => (typeof v === "number" ? v : 0);
  const ymd = (d) => d.toLocaleDateString("en-CA");
  const today = new Date();
  const to = ymd(today);
  const from = ymd(new Date(today.getFullYear(), today.getMonth(), 1));

  if (loading && !m) {
    return (
      <>
        <div className="admin-breadcrumb"><i className="fas fa-home"></i><span>Quản trị</span><i className="fas fa-chevron-right"></i><span>Tổng quan</span></div>
        <div style={{ padding: "2rem", textAlign: "center" }}>⏳ Đang tải dữ liệu dashboard...</div>
      </>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <i className="fas fa-home"></i>
        <span>Quản trị</span>
        <i className="fas fa-chevron-right"></i>
        <span>Tổng quan</span>
      </div>

      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <div className="admin-page-icon"><i className="fas fa-chart-pie" /></div>
          <div className="admin-page-title-group">
            <h1 className="admin-page-title">Tổng quan hệ thống</h1>
            <p className="admin-page-subtitle">Theo dõi và quản lý toàn bộ hoạt động của hệ thống thuê xe điện</p>
          </div>
        </div>
        <div className="admin-page-header-actions">
          <ExportButtons />
          <button className="admin-btn admin-btn-danger" onClick={() => logout()}>
            <i className="fas fa-sign-out-alt" /><span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="admin-stats-grid">
        {error ? (
          <div className="stat-card" style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center",
            background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8 }}>
            <h3 style={{ marginBottom: 12, color: "#856404" }}>⚠️ Không thể tải dữ liệu KPI</h3>
            <p style={{ marginBottom: 12, color: "#856404" }}>{error?.message || String(error)}</p>
            <button className="admin-btn admin-btn-primary" onClick={() => refetch({ from, to })}>🔄 Thử lại</button>
          </div>
        ) : (
          <>
            <KpiCard title="TỔNG DOANH THU" value={formatVND(num(m?.revenueMonth))}
                     sub={m?.deltaRevenueMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaRevenueMoM)}`}
                     icon="💰" gradient="linear-gradient(135deg,#667eea,#764ba2)" />
            <KpiCard title="LƯỢT THUÊ HÔM NAY" value={num(m?.rentalsToday)}
                     sub={m?.deltaRentalsDoD!=null && `So với hôm qua: ${formatPercent(m?.deltaRentalsDoD)}`}
                     icon="📋" gradient="linear-gradient(135deg,#f093fb,#f5576c)" />
            <StationVehiclesCard totalAll={num(m?.vehiclesTotal)} />
            <KpiCard title="KHÁCH HÀNG" value={num(m?.customersTotal)}
                     sub={m?.deltaCustomersMoM!=null && `So với tháng trước: ${formatPercent(m?.deltaCustomersMoM)}`}
                     icon="👥" gradient="linear-gradient(135deg,#4facfe,#00f2fe)" />
            <KpiCard title="TỶ LỆ SỬ DỤNG" value={formatPercent(num(m?.utilizationRate))}
                     sub={m?.deltaUtilizationWoW!=null && `So với tuần trước: ${formatPercent(m?.deltaUtilizationWoW)}`}
                     icon="📊" gradient="linear-gradient(135deg,#fa709a,#fee140)" />
          </>
        )}
      </div>

      {/* Charts & panels */}
      <div className="dashboard-grid">
        <div className="chart-container"><RevenueChart /></div>
        <div className="activity-feed"><ActivityFeed /></div>
      </div>
      <div className="panels-grid">
        <TopStations />
        <RecentRentals />
      </div>
    </>
  );
}
  