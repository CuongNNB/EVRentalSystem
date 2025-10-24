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

  if (loading) {
    return (
      <div className="staff-table">
        <div className="staff-table__header">
          <div>
            <h2>Đơn gần đây</h2>
            <p>Theo dõi trạng thái và doanh thu từng đơn hàng phát sinh.</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="staff-table">
        <div className="staff-table__header">
          <div>
            <h2>Đơn gần đây</h2>
            <p>Theo dõi trạng thái và doanh thu từng đơn hàng phát sinh.</p>
          </div>
        </div>
        <div className="p-4 text-center">
          <p className="text-red-600 text-sm mb-3">Lỗi: {String(error)}</p>
          <button
            onClick={refetch}
            className="staff-table__cta"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="staff-table">
      {/* Header */}
      <div className="staff-table__header">
        <div>
          <h2>Đơn gần đây</h2>
          <p>Theo dõi trạng thái và doanh thu từng đơn hàng phát sinh.</p>
        </div>
        <button type="button" className="staff-table__cta">
          Xem tất cả →
        </button>
      </div>

      {/* Table */}
      <div className="staff-table__scroll">
        <table className="staff-table__table">
          <thead>
            <tr>
              <th className="staff-table__align-left">
                <div className="flex items-center gap-1.5">
                  <HashIcon />
                  <span>Code</span>
                </div>
              </th>
              <th className="staff-table__align-left">Khách hàng</th>
              <th className="staff-table__align-left">
                <div className="flex items-center gap-1.5">
                  <MotorcycleIcon />
                  <span>Xe</span>
                </div>
              </th>
              <th className="staff-table__align-right">
                <div className="flex items-center justify-end gap-1.5">
                  <CalendarIcon />
                  <span>Thời gian</span>
                </div>
              </th>
              <th className="staff-table__align-right">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {items.length > 0 ? (
              items.map((r, idx) => {
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
                      <span className="staff-table__bold">
                        #{r.code || r.id || '--'}
                      </span>
                    </td>

                    {/* Khách hàng */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                          {initials}
                        </div>
                        <span className="staff-table__bold">{customerName}</span>
                      </div>
                    </td>

                    {/* Xe */}
                    <td>
                      <span>{r.vehicle || r.vehicleNumber || '--'}</span>
                    </td>

                    {/* Thời gian */}
                    <td className="staff-table__align-right">
                      <div>
                        <div className="staff-table__bold">{time}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>{date}</div>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="staff-table__align-right">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
