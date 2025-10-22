import React from 'react'
import useActivityFeed from '../../pages/admin/hooks/useActivityFeed'
import { formatDateTime } from '../../utils/format'

export default function ActivityFeed() {
  const { data, loading, error, refetch } = useActivityFeed(10)
  if (loading) return <div className="skeleton list">Đang tải hoạt động...</div>
  if (error) return <div> Lỗi hoạt động: <button onClick={refetch}>Retry</button></div>

  const feed = Array.isArray(data) ? data : []
  if (!feed.length) return <div>Không có hoạt động gần đây</div>

  return (
    <div className="stat-card">
      <div className="stat-header"><div className="stat-title">Hoạt động gần đây</div></div>
      <ul style={{padding:'12px'}}>
        {feed.map((a, i) => (
          <li key={a.id ?? i} style={{padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}>
            <div style={{fontWeight:600}}>{a.message}</div>
            <div style={{color:'#64748b',fontSize:12}}>{formatDateTime(a.timestamp)}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
