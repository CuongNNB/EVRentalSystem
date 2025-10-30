/**
 * AnalyticsPage (child content only – no sidebar)
 */
import React, { useState, useMemo } from 'react'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './AdminDashboardNew.css'
import './AnalyticsPage.css'

// ===== Helpers an toàn cho mảng rỗng =====
const safeSum = (arr, pick = (x) => x) =>
  Array.isArray(arr) && arr.length ? arr.reduce((a, c) => a + pick(c), 0) : 0
const safeAvg = (arr, pick = (x) => x) =>
  Array.isArray(arr) && arr.length ? safeSum(arr, pick) / arr.length : 0
const safeMax = (arr, pick = (x) => x) =>
  Array.isArray(arr) && arr.length ? Math.max(...arr.map(pick)) : 0
const firstOr = (arr, fallback) =>
  Array.isArray(arr) && arr.length ? arr[0] : fallback

// ===== Mock data (có thể thay bằng API sau) =====
const REVENUE_BY_STATION = [
  { stationId: 'T001', name: 'Trạm Quận 1', revenue: 245000000, growth: 12.5, rentals: 156 },
  { stationId: 'T002', name: 'Trạm Quận 3', revenue: 198000000, growth: 8.3, rentals: 132 },
  { stationId: 'T003', name: 'Trạm Quận 7', revenue: 167000000, growth: -3.2, rentals: 98 },
  { stationId: 'T004', name: 'Trạm Thủ Đức', revenue: 134000000, growth: 15.7, rentals: 87 }
]

const VEHICLE_USAGE = [
  { model: 'VinFast VF 8', totalVehicles: 15, inUse: 12, utilizationRate: 80 },
  { model: 'Tesla Model 3', totalVehicles: 10, inUse: 9, utilizationRate: 90 },
  { model: 'Tesla Model Y', totalVehicles: 8, inUse: 6, utilizationRate: 75 },
  { model: 'VinFast VF 5', totalVehicles: 12, inUse: 7, utilizationRate: 58 },
  { model: 'Hyundai Ioniq 5', totalVehicles: 6, inUse: 5, utilizationRate: 83 }
]

const PEAK_HOURS = [
  { hour: '06:00', rentals: 12, returns: 8 },
  { hour: '07:00', rentals: 24, returns: 15 },
  { hour: '08:00', rentals: 45, returns: 18 },
  { hour: '09:00', rentals: 38, returns: 22 },
  { hour: '10:00', rentals: 28, returns: 25 },
  { hour: '11:00', rentals: 32, returns: 20 },
  { hour: '12:00', rentals: 35, returns: 28 },
  { hour: '13:00', rentals: 30, returns: 32 },
  { hour: '14:00', rentals: 26, returns: 30 },
  { hour: '15:00', rentals: 22, returns: 25 },
  { hour: '16:00', rentals: 28, returns: 35 },
  { hour: '17:00', rentals: 42, returns: 48 },
  { hour: '18:00', rentals: 56, returns: 52 },
  { hour: '19:00', rentals: 38, returns: 45 },
  { hour: '20:00', rentals: 25, returns: 38 }
]

const MONTHLY_TREND = [
  { month: 'T1', revenue: 580000000, rentals: 456 },
  { month: 'T2', revenue: 620000000, rentals: 489 },
  { month: 'T3', revenue: 595000000, rentals: 472 },
  { month: 'T4', revenue: 680000000, rentals: 523 },
  { month: 'T5', revenue: 720000000, rentals: 567 },
  { month: 'T6', revenue: 744000000, rentals: 583 }
]

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('30days')
  const [selectedStation, setSelectedStation] = useState('all')

  // ===== Tính toán an toàn =====
  const totalRevenue = useMemo(
    () => safeSum(REVENUE_BY_STATION, s => s.revenue),
    []
  )
  const totalRentals = useMemo(
    () => safeSum(REVENUE_BY_STATION, s => s.rentals),
    []
  )
  const avgUtilization = useMemo(
    () => Math.round(safeAvg(VEHICLE_USAGE, v => v.utilizationRate)),
    []
  )
  const peakHour = useMemo(() => {
    const fallback = { hour: '--', rentals: 0, returns: 0 }
    if (!PEAK_HOURS.length) return fallback
    return PEAK_HOURS.slice(1).reduce(
      (max, h) => (h.rentals > max.rentals ? h : max),
      firstOr(PEAK_HOURS, fallback)
    )
  }, [])
  const maxRentals = useMemo(() => safeMax(PEAK_HOURS, h => h.rentals), [])
  const maxReturns = useMemo(() => safeMax(PEAK_HOURS, h => h.returns), [])

  const getUtilizationColor = (rate) =>
    rate >= 80 ? '#10b981' : rate >= 60 ? '#3b82f6' : rate >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <ErrorBoundary>
      {/* KHÔNG bọc bởi .admin-layout và KHÔNG có AdminSlideBar ở trang con */}
      <main className="admin-main-content">
        {/* Breadcrumb */}
        <div className="admin-breadcrumb">
          <i className="fas fa-home"></i>
          <span>Quản trị</span>
          <i className="fas fa-chevron-right"></i>
          <span>Báo cáo & Phân tích</span>
        </div>

        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-page-header-left">
            <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="admin-page-title-group">
              <h1 className="admin-page-title">Báo cáo & Phân tích</h1>
              <p className="admin-page-subtitle">Thống kê doanh thu, tỷ lệ sử dụng và xu hướng</p>
            </div>
          </div>

          <div className="analytics-filters">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
              <option value="year">Năm nay</option>
            </select>

            <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}>
              <option value="all">Tất cả trạm</option>
              {REVENUE_BY_STATION.map(st => (
                <option key={st.stationId} value={st.stationId}>{st.name}</option>
              ))}
            </select>

            <button className="admin-btn admin-btn-primary">
              <i className="fas fa-download"></i>
              Tải báo cáo
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <i className="fas fa-dollar-sign" style={{ color: '#10b981' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">TỔNG DOANH THU</h3>
                <div className="kpi-value">{(totalRevenue / 1_000_000).toFixed(0)}M</div>
                <div className="kpi-subtitle">VNĐ (30 ngày)</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <i className="fas fa-car" style={{ color: '#3b82f6' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">TỶ LỆ SỬ DỤNG TB</h3>
                <div className="kpi-value">{avgUtilization}%</div>
                <div className="kpi-subtitle">Trung bình toàn hệ thống</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <i className="fas fa-clock" style={{ color: '#f59e0b' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">GIỜ CAO ĐIỂM</h3>
                <div className="kpi-value">{peakHour.hour}</div>
                <div className="kpi-subtitle">{peakHour.rentals} lượt thuê</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <i className="fas fa-file-contract" style={{ color: '#8b5cf6' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">TỔNG ĐƠN THUÊ</h3>
                <div className="kpi-value">{totalRentals}</div>
                <div className="kpi-subtitle">Đơn (30 ngày)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Doanh thu theo điểm thuê */}
        <div className="analytics-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <i className="fas fa-chart-bar"></i>
                Doanh thu theo điểm thuê
              </h2>
              <p className="section-subtitle">So sánh hiệu quả kinh doanh giữa các trạm</p>
            </div>
          </div>

          <div className="revenue-cards-grid">
            {REVENUE_BY_STATION.map((station) => (
              <div key={station.stationId} className="revenue-card">
                <div className="revenue-card-header">
                  <div className="station-name">{station.name}</div>
                  <div className={`growth-badge ${station.growth >= 0 ? 'positive' : 'negative'}`}>
                    <i className={`fas fa-arrow-${station.growth >= 0 ? 'up' : 'down'}`}></i>
                    {Math.abs(station.growth)}%
                  </div>
                </div>
                <div className="revenue-amount">
                  {(station.revenue / 1_000_000).toFixed(1)}M VNĐ
                </div>
                <div className="revenue-details">
                  <div className="revenue-detail-item">
                    <i className="fas fa-file-contract"></i>
                    {station.rentals} đơn thuê
                  </div>
                  <div className="revenue-detail-item">
                    <i className="fas fa-calculator"></i>
                    {(station.revenue / Math.max(1, station.rentals) / 1000).toFixed(0)}K/đơn
                  </div>
                </div>
                <div className="revenue-bar">
                  <div
                    className="revenue-bar-fill"
                    style={{
                      width: `${(station.revenue / Math.max(1, REVENUE_BY_STATION[0]?.revenue || 1)) * 100}%`,
                      background: station.growth >= 0
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : 'linear-gradient(90deg, #3b82f6, #2563eb)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2 cột: Tỷ lệ sử dụng & Xu hướng 6 tháng */}
        <div className="analytics-two-column">
          {/* Utilization */}
          <div className="analytics-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <i className="fas fa-tachometer-alt"></i>
                  Tỷ lệ sử dụng xe
                </h2>
                <p className="section-subtitle">Hiệu suất sử dụng theo dòng xe</p>
              </div>
            </div>

            <div className="utilization-list">
              {VEHICLE_USAGE.map((vehicle, index) => (
                <div key={index} className="utilization-item">
                  <div className="utilization-info">
                    <div className="vehicle-model-name">{vehicle.model}</div>
                    <div className="vehicle-stats">
                      {vehicle.inUse}/{vehicle.totalVehicles} xe đang sử dụng
                    </div>
                  </div>
                  <div className="utilization-rate">
                    <div className="utilization-percentage" style={{ color: getUtilizationColor(vehicle.utilizationRate) }}>
                      {vehicle.utilizationRate}%
                    </div>
                  </div>
                  <div className="utilization-bar-container">
                    <div
                      className="utilization-bar-fill"
                      style={{
                        width: `${vehicle.utilizationRate}%`,
                        background: getUtilizationColor(vehicle.utilizationRate)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend 6 tháng */}
          <div className="analytics-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <i className="fas fa-chart-line"></i>
                  Xu hướng 6 tháng
                </h2>
                <p className="section-subtitle">Doanh thu và số lượt thuê</p>
              </div>
            </div>

            <div className="trend-chart">
              {MONTHLY_TREND.map((month, index) => {
                const maxRevenue = safeMax(MONTHLY_TREND, m => m.revenue)
                const height = maxRevenue ? (month.revenue / maxRevenue) * 100 : 0
                return (
                  <div key={index} className="trend-bar-item">
                    <div className="trend-bar-container">
                      <div
                        className="trend-bar"
                        style={{
                          height: `${height}%`,
                          background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)'
                        }}
                        title={`${(month.revenue / 1_000_000).toFixed(0)}M VNĐ`}
                      >
                        <div className="trend-value">{(month.revenue / 1_000_000).toFixed(0)}M</div>
                      </div>
                    </div>
                    <div className="trend-label">{month.month}</div>
                    <div className="trend-rentals">{month.rentals} đơn</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Phân tích giờ cao điểm */}
        <div className="analytics-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <i className="fas fa-business-time"></i>
                Phân tích giờ cao điểm
              </h2>
              <p className="section-subtitle">Lượt thuê và trả xe theo từng giờ trong ngày</p>
            </div>
          </div>

          <div className="peak-hours-chart">
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                Lượt thuê
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#10b981' }}></span>
                Lượt trả
              </div>
            </div>

            <div className="peak-hours-bars">
              {PEAK_HOURS.map((hour, index) => (
                <div key={index} className="peak-hour-item">
                  <div className="peak-hour-bars-container">
                    <div
                      className="peak-bar rentals"
                      style={{ height: `${maxRentals ? (hour.rentals / maxRentals) * 100 : 0}%` }}
                      title={`${hour.rentals} lượt thuê`}
                    ></div>
                    <div
                      className="peak-bar returns"
                      style={{ height: `${maxReturns ? (hour.returns / maxReturns) * 100 : 0}%` }}
                      title={`${hour.returns} lượt trả`}
                    ></div>
                  </div>
                  <div className="peak-hour-label">{hour.hour}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  )
}

export default AnalyticsPage
