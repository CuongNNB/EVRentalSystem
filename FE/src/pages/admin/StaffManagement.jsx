/**
 * StaffManagement Component
 * 
 * Quản lý nhân viên - GỌI API THẬT
 * - Danh sách nhân viên tại các điểm
 * - Quản lý thông tin nhân viên cơ bản
 */

import React, { useState, useEffect } from 'react'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import StaffDetailModal from '../../components/admin/StaffDetailModal'
import { getStaff, getStaffStats, getStations } from '../../api/adminStaff'
import './AdminDashboardNew.css'
import './StaffManagement.css'

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [stationFilter, setStationFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or table
  const [selectedStaff, setSelectedStaff] = useState(null)
  
  // State for API data
  const [staff, setStaff] = useState([])
  const [stations, setStations] = useState([])
  const [positions, setPositions] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0
  })
  
  // Loading states
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [loadingStations, setLoadingStations] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true)
        console.log('[StaffManagement] Fetching staff...')
        
        const data = await getStaff()
        setStaff(data)
      } catch (error) {
        console.error('[StaffManagement] Error loading staff:', error)
        setStaff([])
      } finally {
        setLoadingStaff(false)
      }
    }
    
    fetchStaff()
  }, [])

  // Fetch stations from API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true)
        console.log('[StaffManagement] Fetching stations...')
        
        const data = await getStations()
        setStations(data)
      } catch (error) {
        console.error('[StaffManagement] Error loading stations:', error)
        setStations([])
      } finally {
        setLoadingStations(false)
      }
    }
    
    fetchStations()
  }, [])

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true)
        console.log('[StaffManagement] Fetching stats...')
        
        const data = await getStaffStats()
        setStats(data)
      } catch (error) {
        console.error('[StaffManagement] Error loading stats:', error)
        setStats({ total: 0, active: 0, onLeave: 0 })
      } finally {
        setLoadingStats(false)
      }
    }
    
    fetchStats()
  }, [])

  // Extract unique positions from staff data
  useEffect(() => {
    if (staff.length > 0) {
      const uniquePositions = [...new Set(staff.map(s => s.position).filter(Boolean))]
      setPositions(uniquePositions)
    }
  }, [staff])

  // Filter staff
  const filteredStaff = staff.filter(staffMember => {
    const matchSearch = searchTerm === '' || 
      staffMember.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStation = stationFilter === 'all' || staffMember.stationId === stationFilter
    const matchPosition = positionFilter === 'all' || staffMember.position === positionFilter
    const matchStatus = statusFilter === 'all' || staffMember.status === statusFilter

    return matchSearch && matchStation && matchPosition && matchStatus
  })

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="staff-status active">Đang làm việc</span>
      case 'on-leave':
        return <span className="staff-status on-leave">Nghỉ phép</span>
      case 'inactive':
        return <span className="staff-status inactive">Ngưng làm</span>
      default:
        return <span className="staff-status">{status}</span>
    }
  }

  return (
    <ErrorBoundary>
      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
            <i className="fas fa-home"></i>
            <span>Quản trị</span>
            <i className="fas fa-chevron-right"></i>
            <span>Quản lý nhân viên</span>
          </div>

          {/* Page Header */}
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
            <button className="admin-btn admin-btn-primary">
              <i className="fas fa-user-plus"></i>
              Thêm nhân viên
            </button>
          </div>

          {/* Stats Cards */}
          <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <i className="fas fa-users" style={{ color: '#3b82f6' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">TỔNG NHÂN VIÊN</h3>
                  <div className="kpi-value">
                    {loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.total}
                  </div>
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
                  <div className="kpi-value">
                    {loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.active}
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <i className="fas fa-user-clock" style={{ color: '#f59e0b' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">NGHỈ PHÉP</h3>
                  <div className="kpi-value">
                    {loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.onLeave}
                  </div>
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
                <option value="all">
                  {loadingStations ? 'Đang tải...' : 'Tất cả trạm'}
                </option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>

              <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
                <option value="all">Tất cả vị trí</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang làm việc</option>
                <option value="on-leave">Nghỉ phép</option>
                <option value="inactive">Ngưng làm</option>
              </select>

              <div className="view-mode-toggle">
                <button 
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Xem dạng lưới"
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button 
                  className={viewMode === 'table' ? 'active' : ''}
                  onClick={() => setViewMode('table')}
                  title="Xem dạng bảng"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>

              <button className="admin-btn admin-btn-primary">
                <i className="fas fa-file-export"></i>
                Xuất Excel
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
              {filteredStaff.map((staffMember) => (
                <div key={staffMember.id} className="staff-card">
                  <div className="staff-card-header">
                    <div className="staff-avatar-large">
                      {staffMember.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    {getStatusBadge(staffMember.status)}
                  </div>

                  <div className="staff-card-body">
                    <h3 className="staff-card-name">{staffMember.name}</h3>
                    <p className="staff-card-id">ID: {staffMember.id}</p>
                    <p className="staff-card-position">
                      <i className="fas fa-briefcase"></i>
                      {staffMember.position}
                    </p>
                    <p className="staff-card-station">
                      <i className="fas fa-map-marker-alt"></i>
                      {staffMember.station}
                    </p>
                    <p className="staff-card-contact">
                      <i className="fas fa-envelope"></i>
                      {staffMember.email}
                    </p>
                    <p className="staff-card-contact">
                      <i className="fas fa-phone"></i>
                      {staffMember.phone}
                    </p>
                    <p className="staff-card-join-date">
                      <i className="fas fa-calendar-alt"></i>
                      Tham gia: {staffMember.joinDate ? new Date(staffMember.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>

                    <div className="staff-card-footer">
                      <button 
                        className="staff-btn-detail"
                        onClick={() => setSelectedStaff(staffMember)}
                      >
                        <i className="fas fa-eye"></i>
                        Xem chi tiết
                      </button>
                      <button className="staff-btn-edit">
                        <i className="fas fa-edit"></i>
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="staff-table-container">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nhân viên</th>
                    <th>Vị trí</th>
                    <th>Điểm làm việc</th>
                    <th>Số điện thoại</th>
                    <th>Ngày tham gia</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staffMember) => (
                    <tr key={staffMember.id}>
                      <td className="staff-id">{staffMember.id}</td>
                      <td>
                        <div className="staff-info-table">
                          <div className="staff-avatar-small">
                            {staffMember.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="staff-name-table">{staffMember.name}</div>
                            <div className="staff-contact-table">
                              <i className="fas fa-envelope"></i> {staffMember.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{staffMember.position}</td>
                      <td>
                        <div className="station-badge">
                          <i className="fas fa-map-marker-alt"></i>
                          {staffMember.station}
                        </div>
                      </td>
                      <td className="staff-phone">{staffMember.phone}</td>
                      <td className="staff-join-date">
                        {staffMember.joinDate ? new Date(staffMember.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td>{getStatusBadge(staffMember.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            title="Xem chi tiết"
                            onClick={() => setSelectedStaff(staffMember)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn-icon" title="Chỉnh sửa">
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <StaffDetailModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </ErrorBoundary>
  )
}

export default StaffManagement
