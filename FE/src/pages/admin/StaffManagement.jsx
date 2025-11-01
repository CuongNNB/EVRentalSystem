import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import * as XLSX from 'xlsx'


import { getStaff, getStaffStats, getStations, deleteStaff } from '../../api/adminStaff'
import './AdminDashboardNew.css'
import './StaffManagement.css'

const stationLabel = (m) => {
  const id = m?.stationId ?? m?.station_id;
  const name = m?.stationName ?? m?.station_name ?? m?.station;
  if (name) return name;
  if (id != null) return `Trạm #${id}`;
  return '—';
};

const toLower = (s) => (s ?? '').toString().trim().toLowerCase()

const StaffManagement = () => {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [stationFilter, setStationFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState("active");
  const [viewMode, setViewMode] = useState('grid')


  // State for API data
  const [staff, setStaff] = useState([])
  const [stations, setStations] = useState([])
  const [positions, setPositions] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0 });

  // Loading states
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [loadingStations, setLoadingStations] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true)
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

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true)
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true)
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

  useEffect(() => {
    if (staff.length > 0) {
      const uniquePositions = [...new Set(
        staff.map(s => s.position).filter(Boolean)
      )];
      setPositions(uniquePositions);
    }
  }, [staff]);

  useEffect(() => {
    const norm = (s) => (s ?? "").toString().trim().toLowerCase();
    setStats({
      total: staff.length,
      active: staff.filter(x => norm(x.status) === "active").length,
    });
  }, [staff]);

  const stationFilterNum = stationFilter === 'all' ? 'all' : Number(stationFilter)

  const filteredStaff = staff.filter(staffMember => {
    const matchSearch =
      !searchTerm ||
      toLower(staffMember.name).includes(toLower(searchTerm)) ||
      toLower(staffMember.email).includes(toLower(searchTerm)) ||
      String(staffMember.id).toLowerCase().includes(toLower(searchTerm))

    const thisStationId = Number(staffMember.stationId ?? staffMember.station_id)
    const matchStation =
      stationFilterNum === 'all' || thisStationId === stationFilterNum

    const matchPosition =
      positionFilter === 'all' ||
      toLower(staffMember.position) === toLower(positionFilter);

    const matchStatus =
      statusFilter === 'all' || toLower(staffMember.status) === toLower(statusFilter)

    return matchSearch && matchStation && matchPosition && matchStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="staff-status active">Đang làm việc</span>;
      case 'inactive':
        return <span className="staff-status inactive">Ngưng làm</span>;
      default:
        return <span className="staff-status">{status}</span>;
    }
  };
  // đặt trong component StaffManagement (cùng cấp với các handler khác)
  const exportStaffExcel = () => {
    // map dữ liệu gọn – chỉ vài cột cần thiết
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

    // tạo worksheet & workbook
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Staff')

    // auto width đơn giản
    const header = Object.keys(rows[0] || {
      ID: '', Name: '', Email: '', Position: '', Station: '', Phone: '', JoinDate: '', Status: ''
    })
    ws['!cols'] = header.map(() => ({ wch: 18 }))

    // file name
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
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => navigate("/admin/staff/new")}
        >
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
            <option value="all">
              {loadingStations ? 'Đang tải...' : 'Tất cả trạm'}
            </option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
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

          <button className="admin-btn admin-btn-primary" onClick={exportStaffExcel}>
            <i className="fas fa-file-excel"></i>
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
                {getStatusBadge(toLower(staffMember.status))}
              </div>

              <div className="staff-card-body">
                <h3 className="staff-card-name">{staffMember.name}</h3>
                <p className="staff-card-id">ID: {staffMember.id}</p>
                <p className="staff-card-position"><i className="fas fa-briefcase"></i>{staffMember.position}</p>
                <p className="staff-card-station"><i className="fas fa-map-marker-alt"></i>{stationLabel(staffMember)}</p>
                <p className="staff-card-contact"><i className="fas fa-envelope"></i>{staffMember.email}</p>
                <p className="staff-card-contact"><i className="fas fa-phone"></i>{staffMember.phone}</p>
                <p className="staff-card-join-date">
                  <i className="fas fa-calendar-alt"></i>
                  Tham gia: {staffMember.joinDate ? new Date(staffMember.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                </p>

                <div className="staff-card-footer">
                  <button
                    className="staff-btn-detail"
                    onClick={() => navigate(`/admin/staff/${staffMember.id}`)}
                  >
                    <i className="fas fa-eye"></i>
                    Xem chi tiết
                  </button>

                  <button
                    className="staff-btn-danger"
                    onClick={async () => {
                      if (!window.confirm(`Xóa nhân viên "${staffMember.name}" (ID: ${staffMember.id})?`)) return;
                      try {
                        await deleteStaff(staffMember.id);
                        setStaff(prev => prev.filter(s => s.id !== staffMember.id));
                      } catch (e) {
                        alert("❌ Không thể xóa nhân viên: " + (e?.message || "Lỗi không xác định"));
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
                      {stationLabel(staffMember)}
                    </div>
                  </td>
                  <td className="staff-phone">{staffMember.phone}</td>
                  <td className="staff-join-date">
                    {staffMember.joinDate ? new Date(staffMember.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td>{getStatusBadge(toLower(staffMember.status))}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        title="Xem chi tiết"
                        onClick={() => navigate(`/admin/staff/${staffMember.id}`)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>

                      <button
                        className="btn-icon danger"
                        title="Xóa nhân viên"
                        onClick={async () => {
                          if (!window.confirm(`Xác nhận xóa nhân viên "${staffMember.name}"?`)) return;
                          try {
                            await deleteStaff(staffMember.id);
                            setStaff(prev => prev.filter(s => s.id !== staffMember.id));
                          } catch (err) {
                            alert("❌ Không thể xóa nhân viên: " + err.message);
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
