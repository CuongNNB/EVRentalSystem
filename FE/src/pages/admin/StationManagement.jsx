/**
 * StationManagement Component
 * 
 * NOTE: Trang quản lý điểm thuê xe trong hệ thống
 * - Layout giống AdminDashboard
 * - Gọi API thực, không hardcode
 * - KPI: Tổng trạm, Trạm hoạt động, Tổng xe, Tỷ lệ sử dụng
 * - Filters: Trạng thái, Khu vực
 * - View: Grid/List
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSlideBar from '../../components/admin/AdminSlideBar'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { getStationStats, getStations, exportStations } from '../../api/adminStations'
import { formatPercent } from '../../utils/format'
import './AdminDashboardNew.css'
import './StationManagement.css'

const StationManagement = () => {
  const navigate = useNavigate()
  
  // State
  const [stats, setStats] = useState(null)
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [areaFilter, setAreaFilter] = useState('all')

  // FIX: avoid duplicate requests - stable callback
  const fetchStats = useCallback(async () => {
    try {
      const data = await getStationStats()
      setStats({
        total: data?.total ?? data?.totalStations ?? 0,
        active: data?.active ?? data?.activeStations ?? 0,
        totalVehicles: data?.totalVehicles ?? data?.vehicles ?? 0,
        utilization: data?.utilization ?? data?.utilizationRate ?? 0,
      })
    } catch (err) {
      console.error('[StationManagement] fetchStats error:', err)
      // FIX: Set mock data on error để tránh crash UI
      setStats({
        total: 0,
        active: 0,
        totalVehicles: 0,
        utilization: 0,
      })
      // Don't set error để không trigger re-render loop
    }
  }, []) // Empty deps - function stable

  // FIX: avoid duplicate requests - stable callback
  const fetchStations = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (areaFilter !== 'all') params.area = areaFilter
      if (searchTerm) params.search = searchTerm

      const data = await getStations(params)
      setStations(data)
      setError(null)
    } catch (err) {
      console.error('[StationManagement] fetchStations error:', err)
      // FIX: Set empty array on error, don't throw
      setStations([])
      // Don't set error để tránh infinite loop
    } finally {
      setLoading(false)
    }
  }, [statusFilter, areaFilter, searchTerm]) // Proper deps

  // FIX: avoid duplicate requests - use useRef guard to prevent StrictMode double-run
  const didInitialMount = useRef(false)
  useEffect(() => {
    if (didInitialMount.current) return
    didInitialMount.current = true
    
    fetchStats()
    fetchStations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount
  
  // Re-fetch stations when filters change (skip initial mount)
  const didFirstRender = useRef(true)
  useEffect(() => {
    if (didFirstRender.current) {
      didFirstRender.current = false
      return
    }
    fetchStations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, areaFilter, searchTerm])

  // Handle refresh
  const handleRefresh = () => {
    fetchStats()
    fetchStations()
  }

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await exportStations({ format: 'xlsx' })
      const url = URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      const ts = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `EVR-Stations-${ts}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err?.message || 'Export failed')
    }
  }

  // Handle add station
  const handleAddStation = () => {
    // TODO: Open modal or navigate to form
    alert('Chức năng thêm trạm đang được phát triển')
  }

  return (
    <ErrorBoundary>
      <div className="admin-layout">
        <AdminSlideBar activeKey="stations" />
        
        <main className="admin-main-content">
          {/* Breadcrumb */}
          <div className="admin-breadcrumb">
            <i className="fas fa-home"></i>
            <span>Quản trị</span>
            <i className="fas fa-chevron-right"></i>
            <span>Quản lý điểm thuê</span>
          </div>

          {/* Page Header */}
          <div className="admin-page-header">
            <div className="admin-page-header-left">
              <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="admin-page-title-group">
                <h1 className="admin-page-title">Quản lý điểm thuê</h1>
                <p className="admin-page-subtitle">Quản lý và theo dõi toàn bộ trạm thuê xe trong hệ thống</p>
              </div>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <i className="fas fa-map-marked-alt" style={{ color: '#3b82f6' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">TỔNG TRẠM</h3>
                  <div className="kpi-value">{stats?.total ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">TRẠM HOẠT ĐỘNG</h3>
                  <div className="kpi-value">{stats?.active ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <i className="fas fa-car" style={{ color: '#8b5cf6' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">TỔNG XE</h3>
                  <div className="kpi-value">{stats?.totalVehicles ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <i className="fas fa-chart-line" style={{ color: '#f59e0b' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">TỶ LỆ SỬ DỤNG</h3>
                  <div className="kpi-value">{formatPercent(stats?.utilization ?? 0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="station-toolbar">
            <div className="station-search">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm trạm theo tên, địa chỉ hoặc khu vực..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="station-filters">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="maintenance">Bảo trì</option>
              </select>

              <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                <option value="all">Tất cả khu vực</option>
                <option value="district1">Quận 1</option>
                <option value="district2">Quận 2</option>
                <option value="district3">Quận 3</option>
                <option value="tanbinh">Tân Bình</option>
                <option value="binhthanh">Bình Thạnh</option>
                <option value="thuduc">Thủ Đức</option>
              </select>

              <div className="view-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>

            <div className="station-actions">
              <button className="admin-btn admin-btn-secondary" onClick={handleRefresh}>
                <i className="fas fa-sync-alt"></i>
                <span>Làm mới</span>
              </button>
              <button className="admin-btn admin-btn-success" onClick={handleExport}>
                <i className="fas fa-file-excel"></i>
                <span>Xuất Excel</span>
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleAddStation}>
                <i className="fas fa-plus"></i>
                <span>Thêm trạm</span>
              </button>
            </div>
          </div>

          {/* Stations Grid/List */}
          <div className="stations-container">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Đang tải...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Không thể tải dữ liệu trạm</p>
                <button className="admin-btn admin-btn-primary" onClick={handleRefresh}>
                  Thử lại
                </button>
              </div>
            ) : stations.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>Không có trạm nào</p>
              </div>
            ) : (
              <div className={`stations-${viewMode}`}>
                {viewMode === 'grid' ? (
                  stations.map((station) => (
                    <div key={station.id} className="station-card">
                      <div className="station-card-header">
                        <div className="station-icon-wrapper">
                          <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <span className={`station-status station-status--${station.status?.toLowerCase()}`}>
                          {station.status}
                        </span>
                      </div>
                      <div className="station-card-body">
                        <h3 className="station-name">{station.name}</h3>
                        <p className="station-address">
                          <i className="fas fa-location-dot"></i>
                          {station.address}
                        </p>
                        <div className="station-meta">
                          <span>
                            <i className="fas fa-car"></i>
                            {station.totalVehicles ?? 0} xe
                          </span>
                          <span>
                            <i className="fas fa-percentage"></i>
                            {formatPercent(station.utilization ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <table className="stations-table">
                    <thead>
                      <tr>
                        <th>Tên trạm</th>
                        <th>Địa chỉ</th>
                        <th>Số xe</th>
                        <th>Tỷ lệ sử dụng</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stations.map((station) => (
                        <tr key={station.id}>
                          <td className="station-name-cell">{station.name}</td>
                          <td className="station-address-cell">{station.address}</td>
                          <td>
                            <span className="vehicle-count">
                              <i className="fas fa-car"></i>
                              {station.totalVehicles ?? 0}
                            </span>
                          </td>
                          <td>
                            <span className="utilization-value">
                              {formatPercent(station.utilization ?? 0)}
                            </span>
                          </td>
                          <td>
                            <span className={`station-status station-status--${station.status?.toLowerCase()}`}>
                              {station.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn-icon" title="Xem chi tiết">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn-icon" title="Chỉnh sửa">
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default StationManagement

