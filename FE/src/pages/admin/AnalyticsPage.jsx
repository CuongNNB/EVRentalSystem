/**
 * AnalyticsPage Component
 * 
 * Báo cáo & Phân tích - GỌI API THẬT
 * - Doanh thu theo điểm thuê
 * - Tỷ lệ sử dụng xe
 * - Giờ cao điểm
 * - Xu hướng thuê xe
 */

import React, { useState, useEffect } from 'react'
import AdminSlideBar from '../../components/admin/AdminSlideBar'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { 
  getRevenueByStation, 
  getVehicleUsage, 
  getPeakHours, 
  getMonthlyTrend, 
  getAnalyticsSummary 
} from '../../api/adminAnalytics'
import './AdminDashboardNew.css'
import './AnalyticsPage.css'

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('30days')
  const [selectedStation, setSelectedStation] = useState('all')
  
  // State for API data
  const [revenueByStation, setRevenueByStation] = useState([])
  const [vehicleUsage, setVehicleUsage] = useState([])
  const [peakHours, setPeakHours] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    avgUtilization: 0,
    peakHour: { hour: '--:--', rentals: 0 },
    totalRentals: 0
  })
  
  // Loading states
  const [loadingRevenue, setLoadingRevenue] = useState(true)
  const [loadingUsage, setLoadingUsage] = useState(true)
  const [loadingPeakHours, setLoadingPeakHours] = useState(true)
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [loadingSummary, setLoadingSummary] = useState(true)

  // Fetch revenue by station from API
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoadingRevenue(true)
        console.log('[AnalyticsPage] Fetching revenue by station...')
        
        const data = await getRevenueByStation({ dateRange, stationId: selectedStation })
        setRevenueByStation(data)
      } catch (error) {
        console.error('[AnalyticsPage] Error loading revenue:', error)
        setRevenueByStation([])
      } finally {
        setLoadingRevenue(false)
      }
    }
    
    fetchRevenue()
  }, [dateRange, selectedStation])

  // Fetch vehicle usage from API
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoadingUsage(true)
        console.log('[AnalyticsPage] Fetching vehicle usage...')
        
        const data = await getVehicleUsage({ dateRange })
        setVehicleUsage(data)
      } catch (error) {
        console.error('[AnalyticsPage] Error loading usage:', error)
        setVehicleUsage([])
      } finally {
        setLoadingUsage(false)
      }
    }
    
    fetchUsage()
  }, [dateRange])

  // Fetch peak hours from API
  useEffect(() => {
    const fetchPeakHours = async () => {
      try {
        setLoadingPeakHours(true)
        console.log('[AnalyticsPage] Fetching peak hours...')
        
        const data = await getPeakHours({ dateRange })
        setPeakHours(data)
      } catch (error) {
        console.error('[AnalyticsPage] Error loading peak hours:', error)
        setPeakHours([])
      } finally {
        setLoadingPeakHours(false)
      }
    }
    
    fetchPeakHours()
  }, [dateRange])

  // Fetch monthly trend from API
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoadingTrend(true)
        console.log('[AnalyticsPage] Fetching monthly trend...')
        
        const data = await getMonthlyTrend()
        setMonthlyTrend(data)
      } catch (error) {
        console.error('[AnalyticsPage] Error loading trend:', error)
        setMonthlyTrend([])
      } finally {
        setLoadingTrend(false)
      }
    }
    
    fetchTrend()
  }, [])

  // Fetch summary stats from API
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true)
        console.log('[AnalyticsPage] Fetching summary stats...')
        
        const data = await getAnalyticsSummary({ dateRange })
        setSummary(data)
      } catch (error) {
        console.error('[AnalyticsPage] Error loading summary:', error)
        setSummary({
          totalRevenue: 0,
          avgUtilization: 0,
          peakHour: { hour: '--:--', rentals: 0 },
          totalRentals: 0
        })
      } finally {
        setLoadingSummary(false)
      }
    }
    
    fetchSummary()
  }, [dateRange])

  const getUtilizationColor = (rate) => {
    if (rate >= 80) return '#10b981'
    if (rate >= 60) return '#3b82f6'
    if (rate >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const maxRentals = peakHours.length > 0 ? Math.max(...peakHours.map(h => h.rentals || 0)) : 1
  const maxReturns = peakHours.length > 0 ? Math.max(...peakHours.map(h => h.returns || 0)) : 1
  const maxRevenue = revenueByStation.length > 0 ? Math.max(...revenueByStation.map(s => s.revenue || 0)) : 1
  const maxTrendRevenue = monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map(m => m.revenue || 0)) : 1

  return (
    <ErrorBoundary>
      <div className="admin-layout">
        <AdminSlideBar activeKey="analytics" />
        
        <main className="admin-main-content">
          {/* Breadcrumb */}
          <div className="admin-breadcrumb">
            <i className="fas fa-home"></i>
            <span>Quản trị</span>
            <i className="fas fa-chevron-right"></i>
            <span>Báo cáo & Phân tích</span>
          </div>

          {/* Page Header */}
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
                {revenueByStation.map(station => (
                  <option key={station.stationId} value={station.stationId}>{station.name}</option>
                ))}
              </select>

              <button className="admin-btn admin-btn-primary">
                <i className="fas fa-download"></i>
                Tải báo cáo
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <i className="fas fa-dollar-sign" style={{ color: '#10b981' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">TỔNG DOANH THU</h3>
                  <div className="kpi-value">
                    {loadingSummary ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      `${(summary.totalRevenue / 1000000).toFixed(0)}M`
                    )}
                  </div>
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
                  <div className="kpi-value">
                    {loadingSummary ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      `${summary.avgUtilization}%`
                    )}
                  </div>
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
                  <div className="kpi-value">
                    {loadingSummary ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      summary.peakHour.hour
                    )}
                  </div>
                  <div className="kpi-subtitle">{summary.peakHour.rentals} lượt thuê</div>
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
                  <div className="kpi-value">
                    {loadingSummary ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      summary.totalRentals
                    )}
                  </div>
                  <div className="kpi-subtitle">Đơn (30 ngày)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Station */}
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

            {loadingRevenue ? (
              <div className="empty-state">
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '36px', color: '#3b82f6' }}></i>
                <p>Đang tải dữ liệu doanh thu...</p>
              </div>
            ) : revenueByStation.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-chart-bar"></i>
                <p>Không có dữ liệu doanh thu</p>
              </div>
            ) : (
              <div className="revenue-cards-grid">
                {revenueByStation.map((station) => (
                  <div key={station.stationId} className="revenue-card">
                    <div className="revenue-card-header">
                      <div className="station-name">{station.name}</div>
                      <div className={`growth-badge ${station.growth >= 0 ? 'positive' : 'negative'}`}>
                        <i className={`fas fa-arrow-${station.growth >= 0 ? 'up' : 'down'}`}></i>
                        {Math.abs(station.growth)}%
                      </div>
                    </div>
                    <div className="revenue-amount">
                      {(station.revenue / 1000000).toFixed(1)}M VNĐ
                    </div>
                    <div className="revenue-details">
                      <div className="revenue-detail-item">
                        <i className="fas fa-file-contract"></i>
                        {station.rentals} đơn thuê
                      </div>
                      <div className="revenue-detail-item">
                        <i className="fas fa-calculator"></i>
                        {(station.revenue / station.rentals / 1000).toFixed(0)}K/đơn
                      </div>
                    </div>
                    <div className="revenue-bar">
                      <div 
                        className="revenue-bar-fill"
                        style={{ 
                          width: `${(station.revenue / maxRevenue) * 100}%`,
                          background: station.growth >= 0 
                            ? 'linear-gradient(90deg, #10b981, #059669)' 
                            : 'linear-gradient(90deg, #3b82f6, #2563eb)'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="analytics-two-column">
            {/* Vehicle Utilization */}
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

              {loadingUsage ? (
                <div className="empty-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '36px', color: '#3b82f6' }}></i>
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : vehicleUsage.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-tachometer-alt"></i>
                  <p>Không có dữ liệu sử dụng</p>
                </div>
              ) : (
                <div className="utilization-list">
                  {vehicleUsage.map((vehicle, index) => (
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
              )}
            </div>

            {/* Monthly Trend */}
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

              {loadingTrend ? (
                <div className="empty-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '36px', color: '#3b82f6' }}></i>
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : monthlyTrend.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-chart-line"></i>
                  <p>Không có dữ liệu xu hướng</p>
                </div>
              ) : (
                <div className="trend-chart">
                  {monthlyTrend.map((month, index) => {
                    const height = (month.revenue / maxTrendRevenue) * 100
                    
                    return (
                      <div key={index} className="trend-bar-item">
                        <div className="trend-bar-container">
                          <div 
                            className="trend-bar"
                            style={{ 
                              height: `${height}%`,
                              background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)'
                            }}
                            title={`${(month.revenue / 1000000).toFixed(0)}M VNĐ`}
                          >
                            <div className="trend-value">{(month.revenue / 1000000).toFixed(0)}M</div>
                          </div>
                        </div>
                        <div className="trend-label">{month.month}</div>
                        <div className="trend-rentals">{month.rentals} đơn</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Peak Hours Analysis */}
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

            {loadingPeakHours ? (
              <div className="empty-state">
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '36px', color: '#3b82f6' }}></i>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : peakHours.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-business-time"></i>
                <p>Không có dữ liệu giờ cao điểm</p>
              </div>
            ) : (
              <>
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

                <div className="peak-hours-chart">
                  <div className="peak-hours-bars">
                    {peakHours.map((hour, index) => (
                      <div key={index} className="peak-hour-item">
                        <div className="peak-hour-bars-container">
                          <div 
                            className="peak-bar rentals"
                            style={{ height: `${(hour.rentals / maxRentals) * 100}%` }}
                            title={`${hour.rentals} lượt thuê`}
                          ></div>
                          <div 
                            className="peak-bar returns"
                            style={{ height: `${(hour.returns / maxReturns) * 100}%` }}
                            title={`${hour.returns} lượt trả`}
                          ></div>
                        </div>
                        <div className="peak-hour-label">{hour.hour}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default AnalyticsPage
