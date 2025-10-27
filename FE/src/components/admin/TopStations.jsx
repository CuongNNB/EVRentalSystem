/**
 * TopStations Component
 * 
 * NOTE: Component hiển thị top 5 trạm với doanh thu cao nhất
 * - Gọi API: GET /admin/overview/top-stations
 * - Dữ liệu được map từ useTopStations hook
 * - Hiển thị: Tên trạm, Số lượt thuê, Doanh thu
 */

import React from 'react'
import useTopStations from '../../pages/admin/hooks/useTopStations'
import { formatVND } from '../../utils/format'

export default function TopStations() {
  const { data, loading, error, refetch } = useTopStations({ limit: 5 })
  
  if (loading) {
    return (
      <div className="stat-card">
        <div className="chart-header">
          <h3 className="chart-title">Top 5 Trạm</h3>
        </div>
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
          Đang tải...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="stat-card">
        <div className="chart-header">
          <h3 className="chart-title">Top 5 Trạm</h3>
        </div>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ color: '#ef4444', marginBottom: '12px' }}>
            Lỗi tải dữ liệu: {error?.message || 'Unknown error'}
          </div>
          <button className="admin-btn admin-btn-primary" onClick={refetch}>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const stations = Array.isArray(data) ? data : []

  // Tìm max revenue để tính % cho progress bar
  const maxRevenue = stations.length > 0 ? Math.max(...stations.map(s => s.revenue)) : 0

  return (
    <div className="stat-card top-stations-card">
      <div className="chart-header">
        <div className="chart-title-wrapper">
          <h3 className="chart-title">
            <div className="chart-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            Top 5 Trạm Xe
          </h3>
          <p className="chart-subtitle">Xếp hạng theo doanh thu tháng này</p>
        </div>
      </div>
      
      <div className="top-stations-list">
        {stations.length > 0 ? (
          <div className="stations-grid">
            {stations.map((station, index) => {
              const percentage = maxRevenue > 0 ? (station.revenue / maxRevenue) * 100 : 0
              const rankColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']
              const rankColor = rankColors[index] || '#64748b'
              
              return (
                <div key={station.id ?? index} className="station-card">
                  <div className="station-card-header">
                    <div className="station-rank-badge" style={{ background: rankColor }}>
                      {index + 1}
                    </div>
                    <div className="station-info">
                      <h4 className="station-name">{station.name ?? 'N/A'}</h4>
                      <div className="station-meta">
                        <span className="station-rentals">
                          <i className="fas fa-car"></i>
                          {station.rentals ?? 0} lượt thuê
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="station-revenue-wrapper">
                    <div className="station-revenue-label">
                      <span>Doanh thu</span>
                      <span className="station-revenue-value">{formatVND(station.revenue ?? 0)}</span>
                    </div>
                    <div className="station-progress">
                      <div 
                        className="station-progress-bar" 
                        style={{ 
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${rankColor}, ${rankColor}dd)`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>Không có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  )
}
