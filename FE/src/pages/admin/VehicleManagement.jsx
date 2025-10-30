// pages/admin/VehicleManagement.jsx
/**
 * VehicleManagement – trang con trong /admin (KHÔNG render sidebar/layout)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { getVehicleStats, getVehicles, getVehicleModels, exportVehicles } from '../../api/adminVehicles'
import { getStationOptions } from '../../api/adminDashboard'
import './AdminDashboardNew.css'
import './VehicleManagement.css'

const VehicleManagement = () => {
  // --- state & filters ---
  const [stats, setStats] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [stations, setStations] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [stationFilter, setStationFilter] = useState('0')
  const [batteryFilter, setBatteryFilter] = useState('all')

  // --- fetchers ---
  const fetchStats = useCallback(async () => {
    try {
      const stationId = Number(stationFilter || 0)
      const data = await getVehicleStats({ stationId })
      setStats(data)
    } catch (err) {
      console.error('[VehicleManagement] fetch stats:', err)
      setError(err.message || 'Không thể tải thống kê')
    }
  }, [stationFilter])

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
      setVehicles(Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[VehicleManagement] fetch vehicles:', err)
      setError(err.message || 'Không thể tải dữ liệu xe')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, modelFilter, stationFilter, batteryFilter, searchTerm])

  const fetchStations = useCallback(async () => {
    try {
      const data = await getStationOptions()
      setStations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[VehicleManagement] fetch stations:', err)
      setStations([])
    }
  }, [])

  const fetchVehicleModels = useCallback(async () => {
    try {
      const data = await getVehicleModels()
      setVehicleModels(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[VehicleManagement] fetch models:', err)
      setVehicleModels([])
    }
  }, [])

  // --- effects ---
  const didInitialMount = useRef(false)
  useEffect(() => {
    if (didInitialMount.current) return
    didInitialMount.current = true
    fetchStations()
    fetchVehicleModels()
    fetchStats()
    fetchVehicles()
  }, [fetchStations, fetchVehicleModels, fetchStats, fetchVehicles])

  useEffect(() => {
    // refetch khi đổi filter
    fetchStats()
    fetchVehicles()
  }, [fetchStats, fetchVehicles])

  // --- actions ---
  const handleRefresh = () => {
    fetchStats()
    fetchStations()
    fetchVehicleModels()
    fetchVehicles()
  }

  const handleExport = async () => {
    try {
      alert('Export sẽ bật khi backend có API.')
      // const blob = await exportVehicles(params)
      // ... download blob
    } catch (err) {
      console.error('[VehicleManagement] export:', err)
      alert('Không thể xuất file Excel. Vui lòng thử lại.')
    }
  }

  const handleAddVehicle = () => {
    alert('Create/Update/Delete sẽ bật khi backend mở thêm action.')
  }

  return (
    <ErrorBoundary>
      {/* KHÔNG có AdminSlideBar / .admin-layout / <main> ở đây */}
      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <i className="fas fa-home"></i>
        <span>Quản trị</span>
        <i className="fas fa-chevron-right"></i>
        <span>Quản lý xe</span>
      </div>

      {/* Header */}
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

      {/* KPI */}
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
              <div className="kpi-value">{stats?.fixing ?? stats?.maintenance ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
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
            {vehicleModels.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>

          <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)}>
            <option value="0">Tất cả điểm thuê</option>
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select value={batteryFilter} onChange={(e) => setBatteryFilter(e.target.value)}>
            <option value="all">Mức pin</option>
            <option value="high">80-100%</option>
            <option value="medium">50-79%</option>
            <option value="low">0-49%</option>
          </select>

          <div className="view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Grid view">
              <i className="fas fa-th"></i>
            </button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="List view">
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        <div className="vehicle-actions">
          <button className="admin-btn admin-btn-secondary" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i><span>Làm mới</span>
          </button>
          <button className="admin-btn admin-btn-success" onClick={handleExport}>
            <i className="fas fa-file-excel"></i><span>Xuất Excel</span>
          </button>
          <button className="admin-btn admin-btn-primary" onClick={handleAddVehicle}>
            <i className="fas fa-plus"></i><span>Thêm xe</span>
          </button>
        </div>
      </div>

      {/* List/Grid */}
      <div className="vehicles-container">
        {loading ? (
          <div className="loading-state"><i className="fas fa-spinner fa-spin"></i><p>Đang tải...</p></div>
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Không thể tải dữ liệu xe</p>
            <button className="admin-btn admin-btn-primary" onClick={handleRefresh}>Thử lại</button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state"><i className="fas fa-inbox"></i><p>Không có xe nào</p></div>
        ) : (
          <div className={`vehicles-${viewMode}`}>
            {viewMode === 'grid' ? (
              vehicles.map(v => (
                <div key={v.id} className="vehicle-card">
                  <div className="vehicle-card-header">
                    <img
                      src={v.image || `/anhxe/${v.model}.jpg`}
                      alt={v.model}
                      className="vehicle-image"
                      onError={(e) => { e.currentTarget.src = '/carpic/logo.png' }}
                    />
                    <span className={`vehicle-status vehicle-status--${v.status?.toLowerCase()}`}>
                      {v.status === 'available' ? 'Khả dụng' :
                       v.status === 'rented' ? 'Đang thuê' :
                       v.status === 'maintenance' ? 'Bảo trì' : v.status}
                    </span>
                  </div>
                  <div className="vehicle-card-body">
                    <h3 className="vehicle-model">{v.model}</h3>
                    <p className="vehicle-license">{v.licensePlate}</p>
                    <div className="vehicle-meta">
                      <span><i className="fas fa-map-marker-alt"></i>{v.stationName || 'N/A'}</span>
                      <span><i className="fas fa-battery-three-quarters"></i>{v.battery}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>Biển số</th><th>Model</th><th>Điểm thuê</th><th>Pin</th><th>Trạng thái</th><th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v.id}>
                      <td className="vehicle-license-cell">{v.licensePlate}</td>
                      <td>{v.model}</td>
                      <td>{v.stationName || 'N/A'}</td>
                      <td><span className="battery-indicator"><i className="fas fa-battery-three-quarters"></i>{v.battery}%</span></td>
                      <td>
                        <span className={`vehicle-status vehicle-status--${v.status?.toLowerCase()}`}>
                          {v.status === 'available' ? 'Khả dụng' :
                           v.status === 'rented' ? 'Đang thuê' :
                           v.status === 'maintenance' ? 'Bảo trì' : v.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" title="Xem chi tiết"><i className="fas fa-eye"></i></button>
                        <button className="btn-icon" title="Chỉnh sửa"><i className="fas fa-edit"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default VehicleManagement
