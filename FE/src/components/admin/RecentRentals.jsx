import React from 'react'
import useRecentRentals from '../../pages/admin/hooks/useRecentRentals'

const formatCurrency = v =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

// Format time: return object with time and date separated
const formatDateTime = (dateString) => {
  if (!dateString) return { time: '--', date: '' }
  const date = new Date(dateString)
  const timeStr = date.toLocaleTimeString('vi-VN', { hour12: false })
  const dateStr = date.toLocaleDateString('vi-VN')
  return { time: timeStr, date: dateStr }
}

// Simple icons using SVG
const ReceiptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)

const HashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </svg>
)

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

const MotorcycleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="18" r="3" />
    <circle cx="19" cy="18" r="3" />
    <path d="M5 18h14" />
    <path d="M9 10h6l2 8" />
    <path d="M12 10V5" />
    <path d="M12 5h3" />
  </svg>
)

function StatusBadge({ status }) {
  if (!status) {
    return (
      <span className="status-badge status-badge--default">
        <ClockIcon />
        Không rõ
      </span>
    )
  }
  const normalized = String(status).toLowerCase()
  if (normalized.includes('hoàn tất') || normalized.includes('complete')) {
    return (
      <span className="status-badge status-badge--success">
        <CheckCircleIcon />
        Hoàn tất
      </span>
    )
  }
  return (
    <span className="status-badge status-badge--warning">
      <ClockIcon />
      Đang chờ
    </span>
  )
}

export default function RecentRentals() {
  const { data = [], loading, error, refetch } = useRecentRentals({ limit: 10 })
  const items = Array.isArray(data) ? data : []

  // Check if backend API exists
  React.useEffect(() => {
    if (error) {
      const errorMsg = error?.message || String(error)
      if (errorMsg.includes('404') || errorMsg.includes('500') || errorMsg.includes('Network Error')) {
        console.warn('⚠️ [RecentRentals] Backend API chưa có: /admin/overview/recent-rentals')
      }
    }
  }, [error])

  if (loading) {
    return (
      <div className="stat-card recent-rentals-card">
        <div className="chart-header">
          <div className="chart-title-wrapper">
            <h3 className="chart-title">
              <div className="chart-icon">
                <i className="fas fa-receipt"></i>
              </div>
              Đơn Gần Đây
            </h3>
            <p className="chart-subtitle">Theo dõi trạng thái và doanh thu từng đơn hàng phát sinh</p>
          </div>
        </div>
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
          Đang tải...
        </div>
      </div>
    )
  }

  // If backend API not ready, hide component
  if (error) {
    const errorMsg = error?.message || String(error)
    const isBackendNotReady = errorMsg.includes('404') || errorMsg.includes('500') || errorMsg.includes('Network Error')
    
    if (isBackendNotReady) return null
    
    return (
      <div className="stat-card recent-rentals-card">
        <div className="chart-header">
          <div className="chart-title-wrapper">
            <h3 className="chart-title">
              <div className="chart-icon">
                <i className="fas fa-receipt"></i>
              </div>
              Đơn Gần Đây
            </h3>
            <p className="chart-subtitle">Theo dõi trạng thái và doanh thu từng đơn hàng phát sinh</p>
          </div>
        </div>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', marginBottom: '12px' }}>
            Lỗi: {String(error)}
          </div>
          <button className="admin-btn admin-btn-primary" onClick={refetch}>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card recent-rentals-card">
      {/* Header */}
      <div className="chart-header">
        <div className="chart-title-wrapper">
          <h3 className="chart-title">
            <div className="chart-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <i className="fas fa-clipboard-list"></i>
            </div>
            Đơn Gần Đây
          </h3>
          <p className="chart-subtitle">Theo dõi trạng thái và thông tin đơn hàng phát sinh</p>
        </div>
      </div>

      {/* Table */}
      <div className="recent-rentals-scroll">
        {items.length > 0 ? (
          <table className="recent-rentals-table">
            <thead>
              <tr>
                <th className="rental-col-code">#MÃ</th>
                <th className="rental-col-customer">KHÁCH HÀNG</th>
                <th className="rental-col-vehicle">
                  <i className="fas fa-car"></i>
                  <span>XE</span>
                </th>
                <th className="rental-col-time">
                  <i className="fas fa-clock"></i>
                  <span>THỜI GIAN</span>
                </th>
                <th className="rental-col-status">TRẠNG THÁI</th>
              </tr>
            </thead>

            <tbody>
              {items.map((r, idx) => {
                const { time, date } = formatDateTime(r.time)
                const customerName = r.customer || r.booker || 'N/A'
                const initials = customerName
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <tr key={idx}>
                    {/* Code */}
                    <td>
                      <span className="rental-code">
                        #{r.code || idx + 1}
                      </span>
                    </td>

                    {/* Khách hàng */}
                    <td>
                      <div className="rental-customer">
                        <span className="rental-initials">{initials}</span>
                        <span className="rental-customer-name">{customerName}</span>
                      </div>
                    </td>

                    {/* Xe */}
                    <td>
                      <span className="rental-vehicle">
                        {r.vehicle || r.vehicleNumber || 'N/A'}
                      </span>
                    </td>

                    {/* Thời gian */}
                    <td>
                      <div className="rental-time">
                        <div className="rental-time-value">{time}</div>
                        <div className="rental-date-value">{date}</div>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Chưa có đơn hàng</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Chưa có đơn hàng nào gần đây trong hệ thống
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
