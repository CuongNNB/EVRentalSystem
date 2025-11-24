import React from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./AdminDashboardNew.css";
import "../staff/StaffLayout.css";
import KpiCard from '../../components/admin/KpiCard'
import RevenueChart from '../../components/admin/RevenueChart'
import TopStations from '../../components/admin/TopStations'
import RecentRentals from '../../components/admin/RecentRentals'
import ActivityFeed from '../../components/admin/ActivityFeed'
import AdminSlideBar from '../../components/admin/AdminSlideBar'
import StationVehiclesCard from '../../components/admin/StationVehiclesCard'
import useAdminMetrics from './hooks/useAdminMetrics'
import { formatPercent, formatVND } from '../../utils/format'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { useAuth } from '../../contexts/AuthContext'
import { getVehicleStats } from '../../api/adminVehicles'
import * as XLSX from 'xlsx'

// AdminDashboard là layout component với sidebar và outlet cho các trang con
export default function AdminDashboard() {
  return (
    <ErrorBoundary>
      <div className="admin-layout">
        <AdminSlideBar />
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  );
}

// Component trang tổng quan (Overview/Dashboard)
export function AdminOverview() {
  const { data: m, loading, error, refetch } = useAdminMetrics();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // State để lưu tổng số xe từ vehicle stats API
  const [totalVehicles, setTotalVehicles] = React.useState(0);

  // Fetch tổng số xe từ danh sách xe thực tế (không tính xe đã xóa)
  const fetchVehicleTotal = React.useCallback(async () => {
    try {
      // Fetch toàn bộ danh sách xe để tính stats chính xác (không pagination)
      const response = await fetch(`http://localhost:8084/EVRentalSystem/api/vehicle/vehicles?page=0&size=10000`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const allVehicles = data?.content || (Array.isArray(data) ? data : []);
      
      // Filter out deleted vehicles - KHÔNG tính xe đã xóa
      const activeVehicles = allVehicles.filter(v => {
        const isDeleted = v?.deleted === true || 
                         v?.isDeleted === true || 
                         v?.deletedAt !== null && v?.deletedAt !== undefined ||
                         String(v?.status || '').toUpperCase() === 'DELETED' ||
                         String(v?.status || '').toUpperCase() === 'SOFT_DELETE';
        return !isDeleted;
      });
      
      // Tính tổng số xe từ danh sách đã filter (không tính xe đã xóa)
      const total = activeVehicles.length;
      console.log('[AdminOverview] Total vehicles (excluding deleted):', total);
      console.log('[AdminOverview] Total vehicles (including deleted):', allVehicles.length);
      setTotalVehicles(total);
    } catch (err) {
      console.error('[AdminOverview] Error fetching vehicle total from list:', err);
      // Fallback: Thử dùng API stats
      try {
        const stats = await getVehicleStats({ stationId: 0 });
        console.warn('[AdminOverview] Using API stats as fallback (may include deleted vehicles):', stats);
        setTotalVehicles(stats?.total || 0);
      } catch (fallbackErr) {
        console.error('[AdminOverview] Fallback API stats also failed:', fallbackErr);
        setTotalVehicles(0);
      }
    }
  }, []);

  // Fetch tổng số xe khi component mount
  React.useEffect(() => {
    fetchVehicleTotal();
  }, [fetchVehicleTotal]);

  // Listen for vehicle deletion event để refresh total vehicles
  React.useEffect(() => {
    const handleVehicleDeleted = () => {
      console.log('[AdminOverview] Vehicle deleted event received, refreshing total vehicles...');
      fetchVehicleTotal();
    };
    
    window.addEventListener('vehicleDeleted', handleVehicleDeleted);
    
    return () => {
      window.removeEventListener('vehicleDeleted', handleVehicleDeleted);
    };
  }, [fetchVehicleTotal]);

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
  const exportDashboardExcel = () => {
    if (!m) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    const data = [
      { Metric: 'Tổng doanh thu (tháng)', Value: formatVND(m.revenueMonth) },
      { Metric: 'Lượt thuê hôm nay', Value: m.rentalsToday },
      { Metric: 'Khách hàng', Value: m.customersTotal },
      { Metric: 'Tỷ lệ sử dụng TB', Value: formatPercent(m.utilizationRate) },
      { Metric: 'Tổng số xe', Value: totalVehicles },
      { Metric: 'Tăng trưởng doanh thu MoM', Value: formatPercent(m.deltaRevenueMoM) },
      { Metric: 'Tăng trưởng khách hàng MoM', Value: formatPercent(m.deltaCustomersMoM) },
      { Metric: 'Tăng trưởng tỷ lệ sử dụng WoW', Value: formatPercent(m.deltaUtilizationWoW) },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');

    ws['!cols'] = [{ wch: 35 }, { wch: 20 }];

    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `EVR-Dashboard-${ts}.xlsx`);
  };

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
          <button className="admin-btn admin-btn-success" onClick={exportDashboardExcel}>
            <i className="fas fa-file-excel"></i>
            <span>Xuất danh sách ra Excel</span>
          </button>

        </div>
      </div>

      {/* KPI */}
      <div className="admin-stats-grid">
        {error ? (
          <div className="stat-card" style={{
            gridColumn: "1 / -1", padding: "2rem", textAlign: "center",
            background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8
          }}>
            <h3 style={{ marginBottom: 12, color: "#856404" }}>⚠️ Không thể tải dữ liệu KPI</h3>
            <p style={{ marginBottom: 12, color: "#856404" }}>{error?.message || String(error)}</p>
            <button className="admin-btn admin-btn-primary" onClick={() => refetch({ from, to })}>🔄 Thử lại</button>
          </div>
        ) : (
          <>
            <KpiCard title="TỔNG DOANH THU" value={formatVND(num(m?.revenueMonth))}
              sub={m?.deltaRevenueMoM != null && `So với tháng trước: ${formatPercent(m?.deltaRevenueMoM)}`}
              icon="💰" gradient="linear-gradient(135deg,#667eea,#764ba2)" />
            <KpiCard title="LƯỢT THUÊ HÔM NAY" value={num(m?.rentalsToday)}
              sub={m?.deltaRentalsDoD != null && `So với hôm qua: ${formatPercent(m?.deltaRentalsDoD)}`}
              icon="📋" gradient="linear-gradient(135deg,#f093fb,#f5576c)" />
            <StationVehiclesCard totalAll={totalVehicles} />
            <KpiCard title="KHÁCH HÀNG" value={num(m?.customersTotal)}
              sub={m?.deltaCustomersMoM != null && `So với tháng trước: ${formatPercent(m?.deltaCustomersMoM)}`}
              icon="👥" gradient="linear-gradient(135deg,#4facfe,#00f2fe)" />
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
