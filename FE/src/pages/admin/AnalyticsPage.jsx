import React, { useEffect, useMemo, useState } from 'react'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { getStaff, getStations } from '../../api/adminStaff'
import './AdminDashboardNew.css'
import './AnalyticsPage.css'

// helper
const toLower = (s) => (s ?? '').toString().trim().toLowerCase()
const stationLabel = (m) => {
  const id = m?.stationId ?? m?.station_id
  const name = m?.stationName ?? m?.station_name ?? m?.station
  if (name) return name
  if (id != null) return `Trạm #${id}`
  return '—'
}

const AnalyticsPage = () => {
  // filters
  const [keyword, setKeyword] = useState('')
  const [stationId, setStationId] = useState('all')
  const [status, setStatus] = useState('all')

  // data
  const [staff, setStaff] = useState([])
  const [stations, setStations] = useState([])

  // loading
  const [loadingList, setLoadingList] = useState(true)
  const [loadingStations, setLoadingStations] = useState(true)
  const [exporting, setExporting] = useState(false)

  // fetch staff list
  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      try {
        setLoadingList(true)
        const data = await getStaff()
        if (mounted) setStaff(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('[StaffReport] load staff error:', e)
        if (mounted) setStaff([])
      } finally {
        if (mounted) setLoadingList(false)
      }
    }
    fetch()
    return () => { mounted = false }
  }, [])

  // fetch stations (for dropdown)
  useEffect(() => {
    let mounted = true
    const fetch = async () => {
      try {
        setLoadingStations(true)
        const data = await getStations()
        if (mounted) setStations(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('[StaffReport] load stations error:', e)
        if (mounted) setStations([])
      } finally {
        if (mounted) setLoadingStations(false)
      }
    }
    fetch()
    return () => { mounted = false }
  }, [])

  // filter client-side (đơn giản, nhanh)
  const filtered = useMemo(() => {
    const stationNum = stationId === 'all' ? 'all' : Number(stationId)
    return staff.filter(s => {
      const matchKw =
        !keyword ||
        toLower(s.name).includes(toLower(keyword)) ||
        toLower(s.email).includes(toLower(keyword)) ||
        String(s.id).includes(keyword.trim())

      const sId = Number(s.stationId ?? s.station_id)
      const matchStation = stationNum === 'all' || sId === stationNum

      const matchStatus = status === 'all' || toLower(s.status) === toLower(status)

      return matchKw && matchStation && matchStatus
    })
  }, [staff, keyword, stationId, status])

  const exportExcel = async () => {
    try {
      setExporting(true)
      if (!filtered.length) {
        alert('Không có dữ liệu để xuất.')
        return
      }
      const XLSX = (await import('xlsx')).default

      const rows = filtered.map(s => ({
        ID: s.id ?? '',
        Name: s.name ?? '',
        Email: s.email ?? '',
        Position: s.position ?? '',
        Station: stationLabel(s),
        Phone: s.phone ?? '',
        JoinDate: s.joinDate
          ? new Date(s.joinDate).toLocaleDateString('vi-VN')
          : '',
        Status: s.status ?? ''
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Staff')

      // auto width cơ bản
      const headers = Object.keys(rows[0] || {
        ID: '', Name: '', Email: '', Position: '', Station: '', Phone: '', JoinDate: '', Status: ''
      })
      ws['!cols'] = headers.map(() => ({ wch: 20 }))

      const ts = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(wb, `Staff-Report-${ts}.xlsx`)
    } catch (e) {
      console.error(e)
      alert('Xuất Excel thất bại.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <ErrorBoundary>
      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
        <i className="fas fa-home"></i>
        <span>Quản trị</span>
        <i className="fas fa-chevron-right"></i>
        <span>Báo cáo & Phân tích (Staff)</span>
      </div>

      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="admin-page-title-group">
            <h1 className="admin-page-title">Báo cáo nhân viên</h1>
            <p className="admin-page-subtitle">Danh sách nhân viên</p>
          </div>
        </div>

        <div className="analytics-filters" style={{ gap: 12 }}>
          <div className="staff-search" style={{ minWidth: 260 }}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Từ khóa: tên, email, ID..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            disabled={loadingStations}
          >
            <option value="all">{loadingStations ? 'Đang tải...' : 'Tất cả trạm'}</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang làm việc</option>
            <option value="inactive">Ngưng làm</option>
          </select>

          <button className="admin-btn admin-btn-primary" onClick={exportExcel} disabled={exporting}>
            <i className="fas fa-file-excel"></i>
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>

      {/* Table only – no charts */}
      {loadingList ? (
        <div className="empty-state">
          <i className="fas fa-spinner fa-spin" style={{ fontSize: 36, color: '#3b82f6' }} />
          <p>Đang tải danh sách...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users" />
          <p>Không có dữ liệu phù hợp.</p>
        </div>
      ) : (
        <div className="staff-table-container">
          <table className="staff-table modern">
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th className="col-name">Nhân viên</th>
                <th className="col-email">Email</th>
                <th className="col-position">Vị trí</th>
                <th className="col-station">Điểm làm việc</th>
                <th className="col-phone">Điện thoại</th>
                <th className="col-join">Ngày tham gia</th>
                <th className="col-status">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="col-id">{s.id}</td>
                  <td className="col-name">{s.name}</td>
                  <td className="col-email">{s.email}</td>
                  <td className="col-position">{s.position}</td>
                  <td className="col-station">
                    <div className="station-badge">
                      <i className="fas fa-map-marker-alt"></i> {stationLabel(s)}
                    </div>
                  </td>
                  <td className="col-phone">{s.phone}</td>
                  <td className="col-join">
                    {s.joinDate ? new Date(s.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="col-status">{(s.status ?? '').toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ErrorBoundary>
  )
}

export default AnalyticsPage
