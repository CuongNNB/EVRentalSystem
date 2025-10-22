import React from 'react'
import useRecentRentals from '../../pages/admin/hooks/useRecentRentals'
import { formatVND, formatDateTime } from '../../utils/format'

export default function RecentRentals() {
  const { data, loading, error, refetch } = useRecentRentals(10)
  if (loading) return <div className="skeleton table">Đang tải đơn...</div>
  if (error) return <div> Lỗi đơn: <button onClick={refetch}>Retry</button></div>

  const items = Array.isArray(data) ? data : []
  return (
    <div className="stat-card">
      <div className="stat-header"><div className="stat-title">Đơn gần đây</div></div>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{textAlign:'left'}}><th>Code</th><th>Customer</th><th>Vehicle</th><th>Amount</th><th>Time</th></tr></thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={r.id ?? i} style={{borderTop:'1px solid #f1f5f9'}}>
              <td>{r.code}</td>
              <td>{r.customerName}</td>
              <td>{r.vehicleCode}</td>
              <td>{formatVND(r.amount ?? 0)}</td>
              <td>{formatDateTime(r.createdAt)}</td>
            </tr>
          ))}
          {!items.length && (
            <tr><td colSpan={5}>Không có dữ liệu</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
