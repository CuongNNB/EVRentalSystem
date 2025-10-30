import React, { useState } from 'react'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import StaffDetailModal from '../../components/admin/StaffDetailModal'
import './AdminDashboardNew.css'
import './StaffManagement.css'

// Mock data
const MOCK_STAFF = [/* giữ nguyên như bạn đang có */]
const STATIONS = [
  { id: 'T001', name: 'Trạm Quận 1' },
  { id: 'T002', name: 'Trạm Quận 3' },
  { id: 'T003', name: 'Trạm Quận 7' },
  { id: 'T004', name: 'Trạm Thủ Đức' }
]

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [stationFilter, setStationFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedStaff, setSelectedStaff] = useState(null)

  const filteredStaff = MOCK_STAFF.filter(staff => {
    const matchSearch =
      !searchTerm ||
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStation = stationFilter === 'all' || staff.stationId === stationFilter
    const matchPosition = positionFilter === 'all' || staff.position === positionFilter
    const matchStatus = statusFilter === 'all' || staff.status === statusFilter
    return matchSearch && matchStation && matchPosition && matchStatus
  })

  const getPerformanceColor = (v) => (v >= 95 ? '#10b981' : v >= 85 ? '#3b82f6' : v >= 70 ? '#f59e0b' : '#ef4444')
  const getStatusBadge = (s) =>
    s === 'active' ? <span className="staff-status active">Đang làm việc</span> :
    s === 'on-leave' ? <span className="staff-status on-leave">Nghỉ phép</span> :
    s === 'inactive' ? <span className="staff-status inactive">Ngưng làm</span> :
    <span className="staff-status">{s}</span>

  const positions = [...new Set(MOCK_STAFF.map(s => s.position))]

  return (
    <ErrorBoundary>
      {/* KHÔNG render AdminSlideBar ở trang con */}
      <main className="admin-main-content">
        {/* Breadcrumb */}
        <div className="admin-breadcrumb">
          <i className="fas fa-home"></i>
          <span>Quản trị</span>
          <i className="fas fa-chevron-right"></i>
          <span>Quản lý nhân viên</span>
        </div>

        {/* Header */}
        <div className="admin-page-header">
          <div className="admin-page-header-left">
            <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="admin-page-title-group">
              <h1 className="admin-page-title">Quản lý Nhân viên</h1>
              <p className="admin-page-subtitle">Theo dõi danh sách và hiệu suất làm việc</p>
            </div>
          </div>
          <button className="admin-btn admin-btn-primary">
            <i className="fas fa-user-plus"></i>
            Thêm nhân viên
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <i className="fas fa-users" style={{ color: '#3b82f6' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">TỔNG NHÂN VIÊN</h3>
                <div className="kpi-value">{MOCK_STAFF.length}</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                <i className="fas fa-user-check" style={{ color: '#10b981' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">ĐANG LÀM VIỆC</h3>
                <div className="kpi-value">{MOCK_STAFF.filter(s => s.status === 'active').length}</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <i className="fas fa-star" style={{ color: '#f59e0b' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">ĐÁNH GIÁ TB</h3>
                <div className="kpi-value">
                  {(MOCK_STAFF.reduce((a, s) => a + s.performance.avgRating, 0) / MOCK_STAFF.length).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
                <i className="fas fa-handshake" style={{ color: '#8b5cf6' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">GIAO NHẬN (THÁNG)</h3>
                <div className="kpi-value">
                  {MOCK_STAFF.reduce((a, s) => a + s.performance.handovers, 0)}
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
            <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)}>
              <option value="all">Tất cả trạm</option>
              {STATIONS.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>

            <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
              <option value="all">Tất cả vị trí</option>
              {[...new Set(MOCK_STAFF.map(s => s.position))].map(pos => (
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
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Xem dạng lưới">
                <i className="fas fa-th-large"></i>
              </button>
              <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')} title="Xem dạng bảng">
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
        {viewMode === 'grid' ? (
          <div className="staff-grid">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="staff-card">
                <div className="staff-card-header">
                  <div className="staff-avatar-large">
                    {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  {getStatusBadge(staff.status)}
                </div>

                <div className="staff-card-body">
                  <h3 className="staff-card-name">{staff.name}</h3>
                  <p className="staff-card-id">ID: {staff.id}</p>
                  <p className="staff-card-position"><i className="fas fa-briefcase"></i>{staff.position}</p>
                  <p className="staff-card-station"><i className="fas fa-map-marker-alt"></i>{staff.station}</p>

                  <div className="staff-card-divider"></div>

                  <div className="staff-performance-grid">
                    <div className="perf-item"><div className="perf-label">Giao nhận</div><div className="perf-value">{staff.performance.handovers}</div></div>
                    <div className="perf-item"><div className="perf-label">Đánh giá</div><div className="perf-value"><i className="fas fa-star" style={{ color: '#f59e0b', fontSize: 12 }}></i>{staff.performance.avgRating}</div></div>
                    <div className="perf-item"><div className="perf-label">Đúng giờ</div><div className="perf-value" style={{ color: getPerformanceColor(staff.performance.onTimeRate) }}>{staff.performance.onTimeRate}%</div></div>
                    <div className="perf-item"><div className="perf-label">Hài lòng</div><div className="perf-value" style={{ color: getPerformanceColor(staff.performance.customerSatisfaction) }}>{staff.performance.customerSatisfaction}%</div></div>
                  </div>

                  <div className="staff-card-divider"></div>

                  <div className="staff-card-footer">
                    <button className="staff-btn-detail" onClick={() => setSelectedStaff(staff)}>
                      <i className="fas fa-chart-line"></i> Xem chi tiết
                    </button>
                    <button className="staff-btn-edit">
                      <i className="fas fa-edit"></i>
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
                  <th>ID</th><th>Nhân viên</th><th>Vị trí</th><th>Điểm làm việc</th>
                  <th>Giao nhận</th><th>Đánh giá</th><th>Đúng giờ</th><th>Hài lòng</th>
                  <th>Ca làm tháng</th><th>Trạng thái</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td className="staff-id">{staff.id}</td>
                    <td>
                      <div className="staff-info-table">
                        <div className="staff-avatar-small">
                          {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="staff-name-table">{staff.name}</div>
                          <div className="staff-contact-table"><i className="fas fa-envelope"></i> {staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{staff.position}</td>
                    <td><div className="station-badge"><i className="fas fa-map-marker-alt"></i>{staff.station}</div></td>
                    <td className="staff-handovers">{staff.performance.handovers}</td>
                    <td><div className="staff-rating-table"><i className="fas fa-star" style={{ color: '#f59e0b' }}></i>{staff.performance.avgRating}</div></td>
                    <td>
                      <span className="performance-badge"
                        style={{
                          background: `${getPerformanceColor(staff.performance.onTimeRate)}15`,
                          color: getPerformanceColor(staff.performance.onTimeRate),
                          border: `1px solid ${getPerformanceColor(staff.performance.onTimeRate)}30`
                        }}>
                        {staff.performance.onTimeRate}%
                      </span>
                    </td>
                    <td>
                      <span className="performance-badge"
                        style={{
                          background: `${getPerformanceColor(staff.performance.customerSatisfaction)}15`,
                          color: getPerformanceColor(staff.performance.customerSatisfaction),
                          border: `1px solid ${getPerformanceColor(staff.performance.customerSatisfaction)}30`
                        }}>
                        {staff.performance.customerSatisfaction}%
                      </span>
                    </td>
                    <td className="staff-shifts">{staff.shifts.thisMonth}/{staff.shifts.total}</td>
                    <td>{getStatusBadge(staff.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Xem chi tiết" onClick={() => setSelectedStaff(staff)}>
                          <i className="fas fa-chart-line"></i>
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
      </main>

      {/* Modal */}
      {selectedStaff && (
        <StaffDetailModal staff={selectedStaff} onClose={() => setSelectedStaff(null)} />
      )}
    </ErrorBoundary>
  )
}

export default StaffManagement
