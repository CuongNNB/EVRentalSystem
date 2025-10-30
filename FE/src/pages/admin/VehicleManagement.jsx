/**
 * VehicleManagement Component
 * 
 * Quản lý xe - GỌI API THẬT với Pagination
 * - Danh sách xe với pagination
 * - Filter và search
 * - Loading states
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVehicleList, getVehicleStats, getVehicleModels, getVehicleBrands } from '../../api/adminVehicles'
import { getStationOptions } from '../../api/adminDashboard'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './AdminDashboardNew.css'
import './VehicleManagement.css'

const VehicleManagement = () => {
  const navigate = useNavigate()
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [stationFilter, setStationFilter] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Data
  const [vehicles, setVehicles] = useState([])
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0, fixing: 0 })
  const [stations, setStations] = useState([])
  const [models, setModels] = useState([])
  const [brands, setBrands] = useState([])

  // UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(0) // Reset to first page on search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getVehicleList({
        page,
        size,
        q: debouncedSearch,
        status: statusFilter,
        stationId: stationFilter,
        brand: brandFilter,
        model: modelFilter,
      })

      setVehicles(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)

      // Fallback: if models/brands chưa có (API riêng lỗi), lấy từ danh sách
      const list = Array.isArray(data?.content) ? data.content : []
      if (list.length) {
        if (models.length === 0) {
          const mset = [...new Set(list.map(v => v?.model).filter(Boolean))]
          setModels(mset)
        }
        if (brands.length === 0) {
          const bset = [...new Set(list.map(v => v?.brand).filter(Boolean))]
          setBrands(bset)
        }
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError(err.message || 'Không thể tải danh sách xe')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [page, size, debouncedSearch, statusFilter, stationFilter, brandFilter, modelFilter])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await getVehicleStats({ stationId: stationFilter || 0 })
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [stationFilter])

  // Fetch dropdown options
  useEffect(() => {
    Promise.all([getStationOptions(), getVehicleModels(), getVehicleBrands()])
      .then(([stationsData, modelsData, brandsData]) => {
        setStations(stationsData)
        setModels(modelsData)
        setBrands(brandsData)
      })
      .catch((err) => console.error('Error fetching options:', err))
  }, [])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchVehicles()
    fetchStats()
  }, [fetchVehicles, fetchStats])

  // Handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  const handleRefresh = () => {
    fetchVehicles()
    fetchStats()
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setModelFilter('')
    setBrandFilter('')
    setStationFilter('')
    setPage(0)
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return 'vehicle-status--available'
      case 'RENTED':
        return 'vehicle-status--rented'
      case 'FIXING':
      case 'MAINTENANCE':
        return 'vehicle-status--fixing'
      default:
        return ''
    }
  }

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return 'Khả dụng'
      case 'RENTED':
        return 'Đang thuê'
      case 'FIXING':
      case 'MAINTENANCE':
        return 'Bảo trì'
      default:
        return status
    }
  }

  return (
    <ErrorBoundary>
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

      {/* KPI Cards */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="kpi-card-content">
            <span className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <i className="fas fa-car" style={{ color: '#3b82f6' }}></i>
            </span>
            <div className="kpi-info">
              <h3 className="kpi-title">TỔNG SỐ XE</h3>
              <div className="kpi-value">{stats.total || 0}</div>
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
              <div className="kpi-value">{stats.available || 0}</div>
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
              <div className="kpi-value">{stats.rented || 0}</div>
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
              <div className="kpi-value">{stats.fixing || 0}</div>
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
            placeholder="Tìm kiếm theo biển số, mã xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="vehicle-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Khả dụng</option>
            <option value="RENTED">Đang thuê</option>
            <option value="FIXING">Bảo trì</option>
          </select>

          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
            <option value="">Tất cả hãng</option>
            {brands.map((brand, i) => (
              <option key={i} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
            <option value="">Tất cả dòng xe</option>
            {models.map((model, i) => (
              <option key={i} value={model}>
                {model}
              </option>
            ))}
          </select>

          <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)}>
            <option value="">Tất cả trạm</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
              <i className="fas fa-th"></i>
            </button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>

        <div className="vehicle-actions">
          <button className="admin-btn admin-btn-secondary" onClick={handleResetFilters}>
            <i className="fas fa-redo"></i>
            <span>Reset</span>
          </button>
          <button className="admin-btn admin-btn-secondary" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="vehicles-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải dữ liệu xe...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Lỗi: {error}</p>
            <button className="admin-btn admin-btn-primary" onClick={handleRefresh}>
              <i className="fas fa-redo"></i>
              Thử lại
            </button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>Không tìm thấy xe nào</p>
            <button className="admin-btn admin-btn-secondary" onClick={handleResetFilters}>
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className={`vehicles-${viewMode}`}>
              {viewMode === 'grid'
                ? vehicles.map((v) => (
                    <article key={v.id} className="car-card">
                      <div className="car-card__media">
                        <img
                          src={v.imageUrl || v.image || `http://localhost:8084/EVRentalSystem${v.imagePath}` || `/anhxe/${v.model}.jpg`}
                          alt={v.model}
                          className="car-card__image"
                          loading="lazy"
                          onError={(e) => {
                            if (!e.currentTarget.dataset.fallback) {
                              e.currentTarget.dataset.fallback = '1'
                              e.currentTarget.src = `/anhxe/${v.model}.jpg`
                            } else if (e.currentTarget.dataset.fallback === '1') {
                              e.currentTarget.dataset.fallback = '2'
                              e.currentTarget.src = '/carpic/logo.png'
                            }
                          }}
                        />
                        <span className={`vehicle-status-badge ${getStatusBadgeClass(v.status)}`}>
                          {getStatusLabel(v.status)}
                        </span>
                      </div>

                      <div className="car-card__header">
                        <div>
                          <h3 className="car-card__name">{v.model}</h3>
                          <p className="car-card__subtitle">{v.brand || 'VinFast'}</p>
                        </div>
                      </div>

                      <div className="car-card__license">
                        <i className="fas fa-id-card"></i>
                        <span>{v.licensePlate}</span>
                      </div>

                      <ul className="car-card__features">
                        <li className="car-card__feature">
                          <i className="fas fa-map-marker-alt car-card__feature-icon"></i>
                          {v.stationName || 'N/A'}
                        </li>
                        <li className="car-card__feature">
                          <i className="fas fa-battery-three-quarters car-card__feature-icon"></i>
                          Pin: {v.battery || 0}%
                        </li>
                      </ul>

                      <div className="car-card__actions">
                        <button
                          className="car-card__cta car-card__cta--primary"
                          onClick={() => navigate(`/admin/vehicles/${v.id}`)}
                          aria-label={`Xem chi tiết xe ${v.licensePlate || v.id}`}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                          <span>Xem chi tiết</span>
                        </button>
                        <button
                          className="car-card__cta car-card__cta--secondary"
                          onClick={() => navigate(`/admin/vehicles/${v.id}/edit`)}
                          aria-label={`Chỉnh sửa xe ${v.licensePlate || v.id}`}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-pencil-alt"></i>
                          <span>Chỉnh sửa</span>
                        </button>
                      </div>
                    </article>
                  ))
                : null}

              {viewMode === 'list' ? (
                <table className="vehicles-table">
                  <thead>
                    <tr>
                      <th>Biển số</th>
                      <th>Model</th>
                      <th>Hãng</th>
                      <th>Trạm</th>
                      <th>Pin</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.id}>
                        <td className="vehicle-license-cell">{v.licensePlate}</td>
                        <td>{v.model}</td>
                        <td>{v.brand}</td>
                        <td>{v.stationName || 'N/A'}</td>
                        <td>
                          <span className="battery-indicator">
                            <i className="fas fa-battery-three-quarters"></i>
                            {v.battery || 0}%
                          </span>
                        </td>
                        <td>
                          <span className={`vehicle-status ${getStatusBadgeClass(v.status)}`}>
                            {getStatusLabel(v.status)}
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
              ) : null}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <div className="pagination-info">
                Hiển thị {page * size + 1}-{Math.min((page + 1) * size, totalElements)} / {totalElements} xe
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="pagination-current">
                  Trang {page + 1} / {totalPages || 1}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <select className="pagination-size" value={size} onChange={(e) => setSize(Number(e.target.value))}>
                <option value="10">10 / trang</option>
                <option value="20">20 / trang</option>
                <option value="50">50 / trang</option>
              </select>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default VehicleManagement
