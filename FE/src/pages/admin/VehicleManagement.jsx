/**
 * VehicleManagement Component
 * 
 * NOTE: Trang quản lý xe điện trong hệ thống
 * - Layout giống AdminDashboard
 * - MOCK DATA (backend chưa có API)
 * - KPI: Tổng xe, Xe khả dụng, Xe đang thuê, Xe bảo trì
 * - Filters: Trạng thái, Dòng xe, Điểm thuê, Mức pin
 * - View: Grid/List
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSlideBar from '../../components/admin/AdminSlideBar'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
// NOTE: API imports removed - backend chưa có endpoint
// import { getVehicleStats, getVehicles, exportVehicles } from '../../api/adminVehicles'
// import { getStationOptions } from '../../api/adminDashboard'
import './AdminDashboardNew.css'
import './VehicleManagement.css'

// ============================================================
// MOCK DATA - Backend chưa có API
// ============================================================
const MOCK_STATS = {
  total: 28,
  available: 15,
  rented: 10,
  maintenance: 3
}

const MOCK_STATIONS = [
  { id: 1, name: 'Trạm Quận 1 - Nguyễn Huệ' },
  { id: 2, name: 'Trạm Quận 3 - Võ Văn Tần' },
  { id: 3, name: 'Trạm Bình Thạnh - Điện Biên Phủ' },
  { id: 4, name: 'Trạm Phú Nhuận - Hoàng Văn Thụ' },
  { id: 5, name: 'Trạm Tân Bình - Cộng Hòa' }
]

const MOCK_VEHICLES = [
  { 
    id: 'VF001', 
    model: 'VinFast VF 8', 
    status: 'available', 
    battery: 85, 
    stationId: 1,
    stationName: 'Trạm Quận 1',
    licensePlate: '51F-12345',
    lastMaintenance: '2024-01-15'
  },
  { 
    id: 'VF002', 
    model: 'VinFast VF 5', 
    status: 'rented', 
    battery: 62, 
    stationId: 2,
    stationName: 'Trạm Quận 3',
    licensePlate: '51F-12346',
    lastMaintenance: '2024-01-10'
  },
  { 
    id: 'TM001', 
    model: 'Tesla Model 3', 
    status: 'available', 
    battery: 95, 
    stationId: 1,
    stationName: 'Trạm Quận 1',
    licensePlate: '51F-12347',
    lastMaintenance: '2024-01-20'
  },
  { 
    id: 'TM002', 
    model: 'Tesla Model Y', 
    status: 'maintenance', 
    battery: 15, 
    stationId: 3,
    stationName: 'Trạm Bình Thạnh',
    licensePlate: '51F-12348',
    lastMaintenance: '2024-01-05'
  },
  { 
    id: 'VF003', 
    model: 'VinFast VF e34', 
    status: 'available', 
    battery: 78, 
    stationId: 4,
    stationName: 'Trạm Phú Nhuận',
    licensePlate: '51F-12349',
    lastMaintenance: '2024-01-12'
  },
  { 
    id: 'HY001', 
    model: 'Hyundai Ioniq 5', 
    status: 'rented', 
    battery: 55, 
    stationId: 2,
    stationName: 'Trạm Quận 3',
    licensePlate: '51F-12350',
    lastMaintenance: '2024-01-18'
  }
]

const VehicleManagement = () => {
  const navigate = useNavigate()
  
  // State
  const [stats, setStats] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [stationFilter, setStationFilter] = useState('all')
  const [batteryFilter, setBatteryFilter] = useState('all')

  // MOCK: Load stats from mock data (backend chưa có API)
  const fetchStats = useCallback(() => {
    setTimeout(() => {
      setStats(MOCK_STATS)
    }, 300) // Simulate network delay
  }, [])

  // MOCK: Filter vehicles from mock data (backend chưa có API)
  const fetchVehicles = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      let filtered = [...MOCK_VEHICLES]
      
      // Apply filters
      if (statusFilter !== 'all') {
        filtered = filtered.filter(v => v.status === statusFilter)
      }
      if (modelFilter !== 'all') {
        filtered = filtered.filter(v => v.model === modelFilter)
      }
      if (stationFilter !== 'all') {
        filtered = filtered.filter(v => v.stationId === parseInt(stationFilter))
      }
      if (batteryFilter !== 'all') {
        if (batteryFilter === 'low') {
          filtered = filtered.filter(v => v.battery < 30)
        } else if (batteryFilter === 'medium') {
          filtered = filtered.filter(v => v.battery >= 30 && v.battery < 70)
        } else if (batteryFilter === 'high') {
          filtered = filtered.filter(v => v.battery >= 70)
        }
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filtered = filtered.filter(v => 
          v.id.toLowerCase().includes(term) ||
          v.model.toLowerCase().includes(term) ||
          v.licensePlate.toLowerCase().includes(term)
        )
      }
      
      setVehicles(filtered)
      setError(null)
      setLoading(false)
    }, 500) // Simulate network delay
  }, [statusFilter, modelFilter, stationFilter, batteryFilter, searchTerm])

  // MOCK: Load stations from mock data (backend chưa có API)
  const fetchStations = useCallback(() => {
    setTimeout(() => {
      setStations(MOCK_STATIONS)
    }, 200) // Simulate network delay
  }, [])

  // FIX: avoid duplicate requests - use useRef guard to prevent StrictMode double-run
  const didInitialMount = useRef(false)
  useEffect(() => {
    if (didInitialMount.current) return
    didInitialMount.current = true
    
    fetchStats()
    fetchStations()
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
    fetchVehicles()
  }

  // MOCK: Export disabled (backend chưa có API)
  const handleExport = () => {
    alert('⚠️ Chức năng Export đang chờ backend hoàn thành API')
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
                <option value="VF8">VinFast VF8</option>
                <option value="VF9">VinFast VF9</option>
                <option value="VFe34">VinFast VF e34</option>
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
                          src={vehicle.image || '/placeholder-car.png'}
                          alt={vehicle.model}
                          className="vehicle-image"
                        />
                        <span className={`vehicle-status vehicle-status--${vehicle.status?.toLowerCase()}`}>
                          {vehicle.status}
                        </span>
                      </div>
                      <div className="vehicle-card-body">
                        <h3 className="vehicle-model">{vehicle.model}</h3>
                        <p className="vehicle-license">{vehicle.licensePlate}</p>
                        <div className="vehicle-meta">
                          <span>
                            <i className="fas fa-map-marker-alt"></i>
                            {vehicle.stationName}
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
                          <td>{vehicle.stationName}</td>
                          <td>
                            <span className="battery-indicator">
                              <i className="fas fa-battery-three-quarters"></i>
                              {vehicle.battery}%
                            </span>
                          </td>
                          <td>
                            <span className={`vehicle-status vehicle-status--${vehicle.status?.toLowerCase()}`}>
                              {vehicle.status}
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

