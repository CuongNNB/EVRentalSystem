import React from 'react'
import useTopStations from '../../pages/admin/hooks/useTopStations'
import { formatVND, formatPercent } from '../../utils/format'

export default function TopStations() {
  const { data, loading, error, refetch } = useTopStations({ limit: 5 })
  if (loading) return <div className="skeleton list">Đang tải trạm...</div>
  if (error) return <div> Lỗi trạm: <button onClick={refetch}>Retry</button></div>

  const stations = Array.isArray(data) ? data : []

  return (
    <div className="stat-card">
      <div className="stat-header"><div className="stat-title">Top trạm</div></div>
      <ul style={{padding:'12px'}}>
        {stations.map((s, i) => (
          <li key={s.stationId ?? i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}>
            <span>{s.stationName ?? '--'}</span>
            <span>{s.rentals ?? '-'}</span>
            <span>{formatVND(s.revenue ?? 0)}</span>
          </li>
        ))}
        {!stations.length && <li>Không có dữ liệu</li>}
      </ul>
    </div>
  )
}
