import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import * as XLSX from 'xlsx'

import { getStaff, getStaffStats, getStations, deleteStaff } from '../../api/adminStaff'
import './AdminDashboardNew.css'
import './StaffManagement.css'

const stationLabel = (m) => {
  const id = m?.stationId ?? m?.station_id
  const name = m?.stationName ?? m?.station_name ?? m?.station
  if (name) return name
  if (id != null) return `Trạm #${id}`
  return '—'
}

const toLower = (s) => (s ?? '').toString().trim().toLowerCase()

const StaffManagement = () => {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [stationFilter, setStationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('active')
  const [viewMode, setViewMode] = useState('table') // mặc định table cho ổn định

  // State for API data
  const [staff, setStaff] = useState([])
  const [stations, setStations] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0 })

  // Loading states
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [loadingStations, setLoadingStations] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true)
        const data = await getStaff()
        setStaff(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('[StaffManagement] Error loading staff:', error)
        setStaff([])
      } finally {
        setLoadingStaff(false)
      }
    }
    fetchStaff()
  }, [])

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true)
        const data = await getStations()
        setStations(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('[StaffManagement] Error loading stations:', error)
        setStations([])
      } finally {
        setLoadingStations(false)
      }
    }
    fetchStations()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true)
        const data = await getStaffStats()
        const total = Number(data?.total ?? 0)
        const active = Number(data?.active ?? 0)
        setStats({ total, active })
      } catch (error) {
        console.error('[StaffManagement] Error loading stats:', error)
        setStats({ total: 0, active: 0 })
      } finally {
        setLoadingStats(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    // fallback cập nhật nhanh từ list
    const norm = (s) => (s ?? '').toString().trim().toLowerCase()
    setStats((old) => ({
      total: staff.length || old.total,
      active: staff.filter(x => norm(x.status) === 'active').length || old.active
    }))
  }, [staff])

  const stationFilterNum = stationFilter === 'all' ? 'all' : Number(stationFilter)

  const filteredStaff = staff.filter(s => {
    const q = toLower(searchTerm)
    const matchSearch = !q ||
      toLower(s.name).includes(q) ||
      toLower(s.email).includes(q) ||
      String(s.id ?? '').toLowerCase().includes(q)

    const stId = Number(s.stationId ?? s.station_id)
    const matchStation = stationFilterNum === 'all' || stId === stationFilterNum

    const matchStatus = statusFilter === 'all' || toLower(s.status) === toLower(statusFilter)

    return matchSearch && matchStation && matchStatus
  })

  const getStatusBadge = (status) => {
    const norm = toLower(status)
    if (norm === 'active') return <span className="staff-status active" style={{ whiteSpace: 'nowrap' }}>ĐANG LÀM VIỆC</span>
    if (norm === 'inactive') return <span className="staff-status inactive" style={{ whiteSpace: 'nowrap' }}>NGƯNG LÀM</span>
    return <span className="staff-status" style={{ whiteSpace: 'nowrap' }}>{status}</span>
  }

  const exportStaffExcel = () => {
    const rows = filteredStaff.map(s => ({
      ID: s.id ?? '',
      Name: s.name ?? '',
      Email: s.email ?? '',
      Position: s.position ?? '',
      Station: stationLabel(s),
      Phone: s.phone ?? '',
      JoinDate: s.joinDate ? new Date(s.joinDate).toLocaleDateString('vi-VN') : '',
      Status: (s.status ?? '').toString()
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Staff')
    const header = Object.keys(rows[0] || { ID:'', Name:'', Email:'', Position:'', Station:'', Phone:'', JoinDate:'', Status:'' })
    ws['!cols'] = header.map(() => ({ wch: 18 }))
    const ts = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `Staff-${ts}.xlsx`)
  }

  return (
    <ErrorBoundary>
      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <i className="fas fa-home"></i><span>Quản trị</span>
        <i className="fas fa-chevron-right"></i><span>Quản lý nhân viên</span>
      </div>

      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <i className="fas fa-user-tie"></i>
          </div>
          <div className="admin-page-title-group">
            <h1 className="admin-page-title">Quản lý Nhân viên</h1>
            <p className="admin-page-subtitle">Quản lý danh sách nhân viên trong hệ thống</p>
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/staff/new')}>
          <i className="fas fa-user-plus"></i>
          Thêm nhân viên
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="kpi-card-content">
            <span className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <i className="fas fa-users" style={{ color: '#3b82f6' }}></i>
            </span>
            <div className="kpi-info">
              <h3 className="kpi-title">TỔNG NHÂN VIÊN</h3>
              <div className="kpi-value">{loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.total}</div>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="kpi-card-content">
            <span className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <i className="fas fa-user-check" style={{ color: '#10b981' }}></i>
            </span>
            <div className="kpi-info">
              <h3 className="kpi-title">ĐANG LÀM VIỆC</h3>
              <div className="kpi-value">{loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.active}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="staff-toolbar">
        <div className="staff-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="staff-filters">
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            disabled={loadingStations}
          >
            <option value="all">{loadingStations ? 'Đang tải...' : 'Tất cả trạm'}</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="active">Đang làm việc</option>
            <option value="inactive">Ngưng làm</option>
            <option value="all">Tất cả trạng thái</option>
          </select>

          <div className="view-mode-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Xem dạng lưới">
              <i className="fas fa-th-large"></i>
            </button>
            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')} title="Xem dạng bảng">
              <i className="fas fa-list"></i>
            </button>
          </div>

          <button className="admin-btn admin-btn-primary" onClick={exportStaffExcel}>
            <i className="fas fa-file-excel"></i>
            Xuất danh sách ra Excel
          </button>
        </div>
      </div>

      {/* Content */}
      {loadingStaff ? (
        <div className="empty-state">
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#3b82f6' }}></i>
          <p>Đang tải danh sách nhân viên...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-user-tie"></i>
          <p>Không tìm thấy nhân viên nào</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="staff-grid">
          {filteredStaff.map((s) => (
            <div key={s.id} className="staff-card">
              <div className="staff-card-header">
                <div className="staff-avatar-large">
                  {s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                {getStatusBadge(s.status)}
              </div>

              <div className="staff-card-body">
                <h3 className="staff-card-name">{s.name}</h3>
                <p className="staff-card-id">ID: {s.id}</p>
                <p className="staff-card-position"><i className="fas fa-briefcase"></i>{s.position}</p>
                <p className="staff-card-station"><i className="fas fa-map-marker-alt"></i>{stationLabel(s)}</p>
                <p className="staff-card-contact"><i className="fas fa-envelope"></i>{s.email}</p>
                <p className="staff-card-contact"><i className="fas fa-phone"></i>{s.phone}</p>
                <p className="staff-card-join-date">
                  <i className="fas fa-calendar-alt"></i>
                  Tham gia: {s.joinDate ? new Date(s.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                </p>

                <div className="staff-card-footer">
                  <button className="staff-btn-detail" onClick={() => navigate(`/admin/staff/${s.id}`)}>
                    <i className="fas fa-eye"></i> Xem chi tiết
                  </button>
                  <button
                    className="staff-btn-danger"
                    onClick={async () => {
                      if (!window.confirm(`Xóa nhân viên "${s.name}" (ID: ${s.id})?`)) return
                      try {
                        await deleteStaff(s.id)
                        setStaff(prev => prev.filter(x => x.id !== s.id))
                      } catch (e) {
                        alert('❌ Không thể xóa nhân viên: ' + (e?.message || 'Lỗi không xác định'))
                      }
                    }}
                  >
                    <i className="fas fa-trash"></i> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="staff-table-container">
          <table className="staff-table modern">
            {/* Cố định độ rộng từng cột để thẳng hàng tuyệt đối */}
            <colgroup>
              <col style={{ width: '72px' }} />
              <col style={{ width: '260px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '280px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '120px' }} />
            </colgroup>

            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th className="col-name">Nhân viên</th>
                <th className="col-position">Vị trí</th>
                <th className="col-station">Điểm làm việc</th>
                <th className="col-phone">Số điện thoại</th>
                <th className="col-join">Ngày tham gia</th>
                <th className="col-status">Trạng thái</th>
                <th className="col-actions">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.map((s) => (
                <tr key={s.id}>
                  <td className="col-id staff-id">{s.id}</td>

                  <td className="col-name">
                    <div className="staff-info-table" style={{ minWidth: 0 }}>
                      <div className="staff-avatar-small">
                        {s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="cell-two-line" style={{ minWidth: 0 }}>
                        <div className="staff-name-table truncate">{s.name}</div>
                        <div className="staff-contact-table truncate">
                          <i className="fas fa-envelope"></i> {s.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="col-position truncate">{s.position}</td>

                  <td className="col-station">
                    <span className="station-badge" style={{ whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      <i className="fas fa-map-marker-alt"></i>
                      {stationLabel(s)}
                    </span>
                  </td>

                  <td className="col-phone truncate">{s.phone}</td>

                  <td className="col-join">
                    {s.joinDate ? new Date(s.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>

                  <td className="col-status">{getStatusBadge(s.status)}</td>

                  <td className="col-actions">
                    <div className="action-buttons">
                      <button className="btn-icon" title="Xem chi tiết" onClick={() => navigate(`/admin/staff/${s.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Xóa nhân viên"
                        onClick={async () => {
                          if (!window.confirm(`Xác nhận xóa nhân viên "${s.name}"?`)) return
                          try {
                            await deleteStaff(s.id)
                            setStaff(prev => prev.filter(x => x.id !== s.id))
                          } catch (err) {
                            alert('❌ Không thể xóa nhân viên: ' + (err?.message || 'Lỗi không xác định'))
                          }
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ErrorBoundary>
  )
}

export default StaffManagement
