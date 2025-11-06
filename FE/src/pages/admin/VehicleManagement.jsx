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
import { getVehicleStats, getVehicleModels, getVehicleBrands } from '../../api/adminVehicles'
import { getStationOptions } from '../../api/adminDashboard'
import * as XLSX from 'xlsx'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './AdminDashboardNew.css'
import './VehicleManagement.css'

const VehicleManagement = () => {
  const navigate = useNavigate()

  // Backend URL cho ảnh
  const BACKEND_BASE_URL = 'http://localhost:8084/EVRentalSystem'

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [stationFilter, setStationFilter] = useState('')



  // helper functions (từ VehicleManagement-Test)
  function formatStatusText(status) {
    if (!status) return 'Không rõ'
    const s = status.toString().toUpperCase()
    if (s === 'AVAILABLE') return 'Có sẵn'
    if (s === 'RENTED') return 'Đang thuê'
    if (s === 'FIXING') return 'Đang bảo trì'
    return s
  }

  function statusBadgeClass(status) {
    if (!status) return 'unknown'
    return status.toString().toLowerCase()
  }

  // (tuỳ chọn) station / brand demo arrays từ Test (nếu bạn muốn mặc định)
  const stationOptions = [
    { id: 'all', name: 'Tất cả trạm' },
    { id: 1, name: 'Thảo Điền' },
    { id: 2, name: 'Tân Cảng' },
    { id: 3, name: 'Quận 1' },
    { id: 4, name: 'Quận 7' },
    { id: 5, name: 'Gò Vấp' },
    { id: 6, name: 'Phú Nhuận' }
  ]
  const brandOptions = ['All', 'Vinfast', 'Tesla', 'Hyundai', 'Kia', 'Nissan', 'BMW', 'Mercedes-Benz', 'Porsche']


  // Pagination
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)

  const [vehiclesRaw, setVehiclesRaw] = useState([])    // thay thế / song song với vehicles nếu muốn
  const [detailsFlat, setDetailsFlat] = useState([])    // mảng flat mỗi row tương ứng 1 detail (dễ hiển thị bảng)
  const [currentPage, setCurrentPage] = useState(1)     // pagination client-side
  const pageSize = 10

  // ====== Pagination & Filter logic (copy từ VehicleManagement-Test) ======

  // Lọc danh sách theo filter & search
  const filtered = detailsFlat.filter(row => {
    if (brandFilter && brandFilter !== 'All' && row.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
    if (stationFilter && stationFilter !== 'all' && String(row.stationId) !== String(stationFilter)) return false;
    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.trim().toLowerCase();
      const match =
        (row.licensePlate || '').toLowerCase().includes(q) ||
        (row.brand || '').toLowerCase().includes(q) ||
        (row.model || '').toLowerCase().includes(q) ||
        (row.stationName || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleNavigateDetail = (detailId) => {
    navigate(`/admin/vehicles/${detailId}`)
  }

    const handleNavigateModel = (modelId) => {
    if (!modelId) return
    navigate(`/admin/vehicles/model/${modelId}`)
  }

  // Reset trang khi bộ lọc hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, brandFilter, stationFilter]);

  // Pagination client-side
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = filtered.slice(startIndex, endIndex);


  // Data
  const [vehicles, setVehicles] = useState([])
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0, fixing: 0 })
  const [stations, setStations] = useState([])
  const [models, setModels] = useState([])
  const [brands, setBrands] = useState([])

  // --- NEW: toggle to view models instead of vehicles
  const [isViewModel, setIsViewModel] = useState(false)

  // Data for models-table (from /vehicle-management/models)
  const [modelsTableData, setModelsTableData] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState(null)


  // UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('list')

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(0) // Reset to first page on search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch vehicles - Gọi API trực tiếp theo yêu cầu
  // Thay thế toàn bộ body của fetchVehicles bằng đoạn này
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Nếu bạn có constant API, dùng nó, ví dụ VEHICLES_API; 
      // nếu không, thay trực tiếp URL phù hợp với backend bạn.
      const res = await fetch('http://localhost:8084/EVRentalSystem/vehicle-management/vehicles')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      console.log('[VehicleManagement] raw response:', json)

      // ===== Normalize response to an array (handles many shapes) =====
      let vehiclesArray = []
      if (Array.isArray(json)) {
        vehiclesArray = json
      } else if (json && Array.isArray(json.vehicles)) {
        vehiclesArray = json.vehicles
      } else if (json && Array.isArray(json.data)) {
        vehiclesArray = json.data
      } else {
        // fallback: find any key in root object that is an array
        const possibleKey = Object.keys(json || {}).find(k => Array.isArray(json[k]))
        vehiclesArray = possibleKey ? json[possibleKey] : []
      }

      setVehiclesRaw(vehiclesArray) // lưu raw để debug / reuse

      // ===== Flatten vehicleDetails into a row-per-detail array =====
      const flat = []
      vehiclesArray.forEach(v => {
        // Null-safe vehicle id / brand / model / price / seats
        const vehicleId = v.vehicleId ?? v.id ?? null
        const brand = v.brand || ''
        const model = v.model || ''
        const price = v.price ?? ''
        const seats = v.seats ?? ''
        // vehicleDetails có thể là [] hoặc undefined
        const details = Array.isArray(v.vehicleDetails) ? v.vehicleDetails : []

        if (details.length === 0) {
          // nếu không có detail, vẫn tạo 1 dòng đại diện để hiển thị
          flat.push({
            vehicleId,
            detailId: null,
            brand,
            model,
            price,
            seats,
            licensePlate: '',
            batteryCapacity: '',
            odo: '',
            status: 'UNKNOWN',
            color: '',
            stationId: '',
            stationName: ''
          })
        } else {
          details.forEach(d => {
            flat.push({
              vehicleId,
              detailId: d.id ?? null,
              brand,
              model,
              price,
              seats,
              licensePlate: d.licensePlate || '',
              batteryCapacity: d.batteryCapacity || '',
              odo: d.odo ?? '',
              // normalize status to uppercase for consistent filtering
              status: (d.status || 'UNKNOWN').toString().toUpperCase(),
              color: d.color || '',
              stationId: d.stationId ?? '',
              stationName: d.stationName || ''
            })
          })
        }
      })

      setDetailsFlat(flat)
    } catch (err) {
      console.error('[VehicleManagement] fetch error', err)
      setError(err.message || 'Lỗi khi tải dữ liệu')
      setVehiclesRaw([])
      setDetailsFlat([])
    } finally {
      setLoading(false)
    }
  }, [])

  // --- NEW: fetch models list from the provided endpoint
  const fetchModelsFromEndpoint = useCallback(async () => {
    try {
      setModelsLoading(true)
      setModelsError(null)

      const res = await fetch('http://localhost:8084/EVRentalSystem/vehicle-management/models')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      // Normalize: nếu response trực tiếp là array thì dùng luôn
      let arr = []
      if (Array.isArray(json)) {
        arr = json
      } else if (json && Array.isArray(json.data)) {
        arr = json.data
      } else {
        // fallback: tìm array trong root object
        const key = Object.keys(json || {}).find(k => Array.isArray(json[k]))
        arr = key ? json[key] : []
      }

      // map/normalize fields to consistent keys (modelId, brand, model, price, seats)
      const normalized = arr.map(item => ({
        modelId: item.modelId ?? item.id ?? null,
        brand: item.brand ?? item.make ?? '',
        model: item.model ?? item.name ?? '',
        price: item.price ?? '',
        seats: item.seats ?? ''
      }))

      setModelsTableData(normalized)
      setIsViewModel(true) // bật view models
    } catch (err) {
      console.error('fetchModelsFromEndpoint error', err)
      setModelsError(err.message || 'Lỗi khi tải danh sách model')
      setModelsTableData([])
    } finally {
      setModelsLoading(false)
    }
  }, [])

  // --- đưa vào component, ví dụ ngay dưới các helper functions ---
  const formatVND = (value) => {
    // nếu null/undefined/chuỗi rỗng -> trả dấu '-' (hoặc tùy bạn)
    if (value === null || value === undefined || value === '') return '-'

    // chuyển sang number an toàn (loại bỏ dấu phẩy / dấu chấm nếu có)
    const cleaned = String(value).replace(/[^\d.-]/g, '')
    const num = Number(cleaned)
    if (Number.isNaN(num)) return String(value)

    // nhân 1000 theo yêu cầu
    const v = num * 1000

    // format không có thập phân, locale vi-VN dùng dấu '.' cho phân nghìn
    return v.toLocaleString('vi-VN', { maximumFractionDigits: 0 })
  }
  const exportVehiclesExcel = () => {
    try {
      // Lấy dữ liệu từ state/biến filtered (sửa tên nếu file bạn dùng khác)
      // rowsToExport nên là array of objects, mỗi object là 1 hàng
      const rowsToExport = (filtered || []).map((r, idx) => {
        // Giá số (số nguyên VND) để Excel hiểu là số
        const rawPriceNumber = (r.price === null || r.price === undefined || r.price === '')
          ? null
          : Math.round(Number(String(r.price).replace(/[^\d.-]/g, '')) * 1000)

        return {
          'STT': startIndex + idx + 1,            // nếu bạn có startIndex cho phân trang
          'ID': r.id ?? r.vehicleId ?? '',
          'Biển số': r.licensePlate ?? '',
          'Thương hiệu': r.brand ?? '',
          'Model': r.model ?? '',
          'Trạm': r.stationName ?? '',
          'Dung lượng pin': r.batteryCapacity ?? '',
          'Số km (odo)': r.odo ?? '',
          // Giá xuất 2 cột: 1 numeric (VND) cho Excel, 1 string đã format
          'Giá (VND) - Số': rawPriceNumber,
          'Giá (VND) - Hiển thị': rawPriceNumber != null ? rawPriceNumber.toLocaleString('vi-VN') : '-',
          'Màu': r.color ?? '',
          'Trạng thái': formatStatusText ? formatStatusText(r.status) : (r.status ?? '')
        }
      })

      if (!rowsToExport.length) {
        alert('Không có dữ liệu để xuất.')
        return
      }

      // Tạo worksheet từ JSON
      const ws = XLSX.utils.json_to_sheet(rowsToExport, { skipHeader: false })

      // Optionally: set column widths (ví dụ)
      const wscols = [
        { wpx: 40 },  // STT
        { wpx: 70 },  // ID
        { wpx: 100 }, // Biển số
        { wpx: 140 }, // Thương hiệu
        { wpx: 160 }, // Model
        { wpx: 160 }, // Trạm
        { wpx: 100 }, // Dung lượng pin
        { wpx: 90 },  // Odo
        { wpx: 120 }, // Giá số
        { wpx: 160 }, // Giá hiển thị
        { wpx: 100 }, // Màu
        { wpx: 120 }  // Trạng thái
      ]
      ws['!cols'] = wscols

      // Tạo workbook và append sheet
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Vehicles')

      // Ghi file: tên có ngày
      const filename = `vehicles_${new Date().toISOString().slice(0, 10)}.xlsx`
      XLSX.writeFile(wb, filename)
    } catch (err) {
      console.error('Export to Excel failed', err)
      alert('Xuất file thất bại — kiểm tra console để biết thêm.')
    }
  }
  // Fetch stats - Tính stats từ danh sách xe đã filter (loại bỏ xe đã xóa)
  const fetchStats = useCallback(async () => {
    try {
      // Fetch toàn bộ danh sách xe để tính stats chính xác (không pagination)
      // Điều này đảm bảo tính đúng tổng số xe, không bị ảnh hưởng bởi pagination
      const params = new URLSearchParams()
      params.append('page', '0')
      params.append('size', '10000') // Lấy tất cả xe
      if (stationFilter) params.append('stationId', stationFilter.toString())

      console.log('[VehicleManagement] Fetching all vehicles for stats calculation...')
      const response = await fetch(`http://localhost:8084/EVRentalSystem/api/vehicle/vehicles?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const allVehicles = data?.content || (Array.isArray(data) ? data : [])

      // Filter out deleted vehicles - KHÔNG tính xe đã xóa
      const activeVehicles = allVehicles.filter(v => {
        const isDeleted = v?.deleted === true ||
          v?.isDeleted === true ||
          v?.deletedAt !== null && v?.deletedAt !== undefined ||
          String(v?.status || '').toUpperCase() === 'DELETED' ||
          String(v?.status || '').toUpperCase() === 'SOFT_DELETE'
        return !isDeleted
      })

      // Tính stats từ danh sách xe đã filter (không tính xe đã xóa)
      const calculatedStats = {
        total: activeVehicles.length,
        available: activeVehicles.filter(v => String(v?.status || '').toUpperCase() === 'AVAILABLE').length,
        rented: activeVehicles.filter(v => String(v?.status || '').toUpperCase() === 'RENTED').length,
        fixing: activeVehicles.filter(v =>
          String(v?.status || '').toUpperCase() === 'FIXING' ||
          String(v?.status || '').toUpperCase() === 'MAINTENANCE'
        ).length
      }

      console.log('[VehicleManagement] Stats calculated from active vehicles:', calculatedStats)
      console.log('[VehicleManagement] Total vehicles (including deleted):', allVehicles.length)
      console.log('[VehicleManagement] Active vehicles (excluding deleted):', activeVehicles.length)

      setStats(calculatedStats)
    } catch (err) {
      console.error('[VehicleManagement] Error calculating stats from vehicle list:', err)
      // Fallback: Thử dùng API stats (nhưng có thể vẫn đếm xe đã xóa)
      try {
        const stationId = stationFilter || 0
        const data = await getVehicleStats({ stationId })
        console.warn('[VehicleManagement] Using API stats as fallback (may include deleted vehicles):', data)
        setStats({
          total: data?.total || 0,
          available: data?.available || 0,
          rented: data?.rented || 0,
          fixing: data?.fixing || data?.maintenance || 0
        })
      } catch (fallbackErr) {
        console.error('[VehicleManagement] Fallback API stats also failed:', fallbackErr)
        // Giữ nguyên stats hiện tại nếu cả 2 cách đều lỗi
      }
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

  // Listen for vehicle deletion event và refresh stats
  useEffect(() => {
    const handleVehicleDeleted = () => {
      console.log('[VehicleManagement] Vehicle deleted event received, refreshing stats...')
      // Refresh cả vehicles và stats
      fetchVehicles()
      fetchStats()
    }

    window.addEventListener('vehicleDeleted', handleVehicleDeleted)

    return () => {
      window.removeEventListener('vehicleDeleted', handleVehicleDeleted)
    }
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
        <div className="admin-page-header-right">
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => navigate('/admin/vehicles/add')}
          >
            <i className="fas fa-car"></i>
            <span>Thêm xe</span>
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => navigate('/admin/vehicles/add-model')}
          >
            <i className="fas fa-car"></i>
            <span>Thêm model</span>
          </button>
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
          <button
            className={`admin-btn-toggle ${!isViewModel ? 'active' : ''}`}
            onClick={() => { setIsViewModel(false); setModelsTableData([]); }}
            title="Hiển thị các xe"
          >
            <i className="fas fa-list"></i>
            <span>Hiển thị các chi tiết xe</span>
          </button>
          <button
            className={`admin-btn-toggle ${isViewModel ? 'active' : ''}`}
            onClick={() => fetchModelsFromEndpoint()}
            title="Hiển thị các model xe"
          >
            <i className="fas fa-car"></i>
            <span>Hiển thị các model xe</span>
          </button>
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
          <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)}>
            <option value="">Tất cả trạm</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button className="admin-btn admin-btn-secondary" onClick={handleResetFilters}>
            <i className="fas fa-redo"></i>
            <span>Reset</span>
          </button>
          <button className="admin-btn admin-btn-secondary" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i>
            <span>Làm mới</span>
          </button>
          <button className="admin-btn admin-btn-primary" onClick={exportVehiclesExcel}>
            <i className="fas fa-file-excel"></i>
            <span>Xuất danh sách ra Excel</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {/* ===================== VEHICLES-TABLE-CONTAINER ===================== */}
      <div className="vehicles-table-container">
        {isViewModel ? (
          // === MODELS TABLE VIEW ===
          modelsLoading ? (
            <div className="empty-state">
              <i
                className="fas fa-spinner fa-spin"
                style={{ fontSize: '48px', color: '#06b6d4' }}
              ></i>
              <p>Đang tải danh sách model...</p>
            </div>
          ) : modelsError ? (
            <div className="empty-state">
              <i className="fas fa-exclamation-triangle"></i>
              <p>Lỗi tải dữ liệu: {modelsError}</p>
            </div>
          ) : modelsTableData.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-list"></i>
              <p>Không tìm thấy model phù hợp</p>
            </div>
          ) : (
            <>
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hãng</th>
                    <th>Model</th>
                    <th>Chỗ ngồi</th>
                    <th>Giá (VND)</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {modelsTableData.map((m, idx) => (
                    <tr key={m.modelId ?? idx}>
                      <td>{idx + 1}</td>
                      <td>{m.brand || '-'}</td>
                      <td>{m.model || '-'}</td>
                      <td>{m.seats ?? '-'}</td>
                      <td>{formatVND(m.price)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            title="Xem chi tiết model"
                            onClick={() => handleNavigateModel(m.modelId)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )
        ) : (
          // === VEHICLES TABLE VIEW ===
          <>
            {loading ? (
              <div className="empty-state">
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ fontSize: '48px', color: '#06b6d4' }}
                ></i>
                <p>Đang tải danh sách xe...</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Lỗi tải dữ liệu: {error}</p>
              </div>
            ) : detailsFlat.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-car"></i>
                <p>Không tìm thấy xe phù hợp</p>
              </div>
            ) : (
              <>
                <table className="vehicles-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tên xe</th>
                      <th>Chỗ ngồi</th>
                      <th>Biển số</th>
                      <th>Trạm</th>
                      <th>Dung lượng pin</th>
                      <th>ODO</th>
                      <th>Giá (VND)</th>
                      <th>Màu</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((r, idx) => (
                      <tr key={`${r.vehicleId}-${r.detailId ?? 'vn'}`}>
                        <td className="vehicle-id">{startIndex + idx + 1}</td>
                        <td>
                          <div className="vehicle-name-cell">
                            <div className="vehicle-name">
                              {r.brand} {r.model}
                            </div>
                          </div>
                        </td>
                        <td>{r.seats ?? '-'}</td>
                        <td>{r.licensePlate || '-'}</td>
                        <td>{r.stationName || '-'}</td>
                        <td>{r.batteryCapacity || '-'}</td>
                        <td>{r.odo ?? '-'}</td>
                        <td>{formatVND(r.price)}</td>
                        <td>{r.color || '-'}</td>
                        <td>
                          <span className={`status-badge ${statusBadgeClass(r.status)}`}>
                            {formatStatusText(r.status)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              title="Xem chi tiết"
                              onClick={() => handleNavigateDetail(r.detailId)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="table-footer">
                  <div className="pagination-info">
                    Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} / {totalItems}
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(safeCurrentPage - 1)}
                      disabled={safeCurrentPage <= 1}
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          className={`page-btn page-num ${pageNum === safeCurrentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(safeCurrentPage + 1)}
                      disabled={safeCurrentPage >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      {/* ===================== END VEHICLES-TABLE-CONTAINER ===================== */}
    </ErrorBoundary>
  )
}

export default VehicleManagement
