/**
 * VehicleManagement Component
 * 
 * Trang quản lý xe điện trong hệ thống
 * - Lấy dữ liệu từ API thực tế (không có mock data)
 * - KPI: Tổng xe, Xe khả dụng, Xe đang thuê, Xe bảo trì
 * - Filters: Trạng thái, Dòng xe, Điểm thuê, Mức pin
 * - View: Grid/List
 * 
 * Required Backend APIs:
 * - GET /api/admin/vehicles/stats
 * - GET /api/admin/vehicles/models
 * - GET /api/admin/stations/options
 * - GET /api/admin/vehicles (with filters)
 * - POST /api/admin/vehicles
 * - PUT /api/admin/vehicles/{id}
 * - DELETE /api/admin/vehicles/{id}
 * - GET /api/admin/vehicles/export
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSlideBar from '../../components/admin/AdminSlideBar'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { getVehicleStats, getVehicles, getVehicleModels, exportVehicles } from '../../api/adminVehicles'
import { getStationOptions } from '../../api/adminDashboard'
import './AdminDashboardNew.css'
import './VehicleManagement.css'

const VehicleManagement = () => {
  const navigate = useNavigate()
  
  // State
  const [stats, setStats] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [stations, setStations] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [stationFilter, setStationFilter] = useState('all')
  const [batteryFilter, setBatteryFilter] = useState('all')

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const data = await getVehicleStats()
      setStats(data)
    } catch (err) {
      console.error('[VehicleManagement] Failed to fetch stats:', err)
      setError(err.message || 'Không thể tải thống kê')
    }
  }, [])

  // Fetch vehicles from API with filters
  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        model: modelFilter !== 'all' ? modelFilter : undefined,
        stationId: stationFilter !== 'all' ? stationFilter : undefined,
        battery: batteryFilter !== 'all' ? batteryFilter : undefined,
        search: searchTerm || undefined
      }
      
      const data = await getVehicles(params)
      
      // Handle both paginated and non-paginated response
      if (data && data.content) {
        // Paginated response
        setVehicles(Array.isArray(data.content) ? data.content : [])
      } else {
        // Direct array response
        setVehicles(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('[VehicleManagement] Failed to fetch vehicles:', err)
      setError(err.message || 'Không thể tải dữ liệu xe')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, modelFilter, stationFilter, batteryFilter, searchTerm])

  // Fetch stations from API
  const fetchStations = useCallback(async () => {
    try {
      const data = await getStationOptions()
      setStations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[VehicleManagement] Failed to fetch stations:', err)
      setStations([])
    }
  }, [])

  // Fetch vehicle models from database
  const fetchVehicleModels = useCallback(async () => {
    try {
      const data = await getVehicleModels()
      console.log('[VehicleManagement] Vehicle models from DB:', data)
      setVehicleModels(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[VehicleManagement] Failed to fetch vehicle models:', err)
      setVehicleModels([])
    }
  }, [])

  // FIX: avoid duplicate requests - use useRef guard to prevent StrictMode double-run
  const didInitialMount = useRef(false)
  useEffect(() => {
    if (didInitialMount.current) return
    didInitialMount.current = true
    
    fetchStats()
    fetchStations()
    fetchVehicleModels() // Fetch vehicle models from database
    fetchVehicles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount
  
  // Re-fetch vehicles when filters change (skip initial mount)
  const didFirstRender = useRef(true)
  useEffect(() => {
    if (didFirstRender.current) {
      didFirstRender.current = false
      return
    }
    fetchVehicles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, modelFilter, stationFilter, batteryFilter, searchTerm])

  // Handle refresh
  const handleRefresh = () => {
    fetchStats()
    fetchStations()
    fetchVehicleModels()
    fetchVehicles()
  }

  // Handle export to Excel
  const handleExport = async () => {
    try {
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        model: modelFilter !== 'all' ? modelFilter : undefined,
        stationId: stationFilter !== 'all' ? stationFilter : undefined,
        battery: batteryFilter !== 'all' ? batteryFilter : undefined,
        search: searchTerm || undefined
      }
      
      const blob = await exportVehicles(params)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vehicles_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('[VehicleManagement] Export successful')
    } catch (err) {
      console.error('[VehicleManagement] Export failed:', err)
      alert('Không thể xuất file Excel. Vui lòng thử lại.')
    }
  }

  // Handle add vehicle
  const handleAddVehicle = () => {
    // TODO: Open modal or navigate to form
    alert('Chức năng thêm xe đang được phát triển')
  }

  return (
    <ErrorBoundary>
      <div className="admin-layout">
        <AdminSlideBar activeKey="vehicles" />
        
        <main className="admin-main-content">
          {/* Breadcrumb */}
          <div className="admin-breadcrumb">
            <i className="fas fa-home"></i>
            <span>Quản trị</span>
            <i className="fas fa-chevron-right"></i>
            <span>Quản lý xe</span>
          </div>

          {/* Page Header */}
          <div className="admin-page-header">
            <div className="admin-page-header-left">
              <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                <i className="fas fa-car"></i>
              </div>
              <div className="admin-page-title-group">
                <h1 className="admin-page-title">Quản lý xe điện</h1>
                <p className="admin-page-subtitle">Quản lý và theo dõi toàn bộ đội xe trong hệ thống</p>
              </div>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <i className="fas fa-car" style={{ color: '#3b82f6' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">TỔNG SỐ XE</h3>
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
                  <h3 className="kpi-title">XE KHẢ DỤNG</h3>
                  <div className="kpi-value">{stats?.available ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <i className="fas fa-key" style={{ color: '#f59e0b' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">XE ĐANG THUÊ</h3>
                  <div className="kpi-value">{stats?.rented ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <i className="fas fa-tools" style={{ color: '#ef4444' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">XE BẢO TRÌ</h3>
                  <div className="kpi-value">{stats?.maintenance ?? 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="vehicle-toolbar">
            <div className="vehicle-search">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm xe theo biển số, mã xe hoặc model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="vehicle-filters">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Khả dụng</option>
                <option value="rented">Đang thuê</option>
                <option value="maintenance">Bảo trì</option>
              </select>

              <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
                <option value="all">Tất cả dòng xe</option>
                {vehicleModels.map((model, index) => (
                  <option key={index} value={model}>
                    {model}
                  </option>
                ))}
              </select>

              <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)}>
                <option value="all">Tất cả điểm thuê</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select value={batteryFilter} onChange={(e) => setBatteryFilter(e.target.value)}>
                <option value="all">Mức pin</option>
                <option value="high">80-100%</option>
                <option value="medium">50-79%</option>
                <option value="low">0-49%</option>
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

            <div className="vehicle-actions">
              <button className="admin-btn admin-btn-secondary" onClick={handleRefresh}>
                <i className="fas fa-sync-alt"></i>
                <span>Làm mới</span>
              </button>
              <button className="admin-btn admin-btn-success" onClick={handleExport}>
                <i className="fas fa-file-excel"></i>
                <span>Xuất Excel</span>
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleAddVehicle}>
                <i className="fas fa-plus"></i>
                <span>Thêm xe</span>
              </button>
            </div>
          </div>

          {/* Vehicles Grid/List */}
          <div className="vehicles-container">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Đang tải...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Không thể tải dữ liệu xe</p>
                <button className="admin-btn admin-btn-primary" onClick={handleRefresh}>
                  Thử lại
                </button>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>Không có xe nào</p>
              </div>
            ) : (
              <div className={`vehicles-${viewMode}`}>
                {viewMode === 'grid' ? (
                  vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="vehicle-card">
                      <div className="vehicle-card-header">
                        <img
                          src={vehicle.image || `/anhxe/${vehicle.model}.jpg`}
                          alt={vehicle.model}
                          className="vehicle-image"
                          onError={(e) => {
                            e.target.src = '/carpic/logo.png'
                          }}
                        />
                        <span className={`vehicle-status vehicle-status--${vehicle.status?.toLowerCase()}`}>
                          {vehicle.status === 'available' ? 'Khả dụng' : 
                           vehicle.status === 'rented' ? 'Đang thuê' : 
                           vehicle.status === 'maintenance' ? 'Bảo trì' : vehicle.status}
                        </span>
                      </div>
                      <div className="vehicle-card-body">
                        <h3 className="vehicle-model">{vehicle.model}</h3>
                        <p className="vehicle-license">{vehicle.licensePlate}</p>
                        <div className="vehicle-meta">
                          <span>
                            <i className="fas fa-map-marker-alt"></i>
                            {vehicle.stationName || 'N/A'}
                          </span>
                          <span>
                            <i className="fas fa-battery-three-quarters"></i>
                            {vehicle.battery}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <table className="vehicles-table">
                    <thead>
                      <tr>
                        <th>Biển số</th>
                        <th>Model</th>
                        <th>Điểm thuê</th>
                        <th>Pin</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td className="vehicle-license-cell">{vehicle.licensePlate}</td>
                          <td>{vehicle.model}</td>
                          <td>{vehicle.stationName || 'N/A'}</td>
                          <td>
                            <span className="battery-indicator">
                              <i className="fas fa-battery-three-quarters"></i>
                              {vehicle.battery}%
                            </span>
                          </td>
                          <td>
                            <span className={`vehicle-status vehicle-status--${vehicle.status?.toLowerCase()}`}>
                              {vehicle.status === 'available' ? 'Khả dụng' : 
                               vehicle.status === 'rented' ? 'Đang thuê' : 
                               vehicle.status === 'maintenance' ? 'Bảo trì' : vehicle.status}
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

export default VehicleManagement

