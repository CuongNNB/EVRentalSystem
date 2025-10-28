/**
 * TopStations Component - Clean & Modern Design
 * 
 * Hiển thị top 5 trạm xe với doanh thu cao nhất
 * - API: GET /admin/overview/top-stations
 * - Sắp xếp theo số lượt thuê
 */

import React from 'react'
import useTopStations from '../../pages/admin/hooks/useTopStations'
import { formatVND } from '../../utils/format'

export default function TopStations() {
  const { data, loading, error, refetch } = useTopStations({ limit: 5 })
  
  // DEBUG: Uncomment để kiểm tra API
  // React.useEffect(() => {
  //   console.log('=== TOP STATIONS DEBUG ===')
  //   console.log('Loading:', loading)
  //   console.log('Error:', error)
  //   console.log('Raw Data:', data)
  //   console.log('Data Type:', Array.isArray(data) ? 'Array' : typeof data)
  //   console.log('Data Length:', Array.isArray(data) ? data.length : 'N/A')
  //   if (data && Array.isArray(data) && data.length > 0) {
  //     console.log('First Station:', data[0])
  //   }
  //   console.log('=========================')
  // }, [data, loading, error])
  
  // Sắp xếp và lấy top 5 - memoized để tránh re-calculation
  const stations = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    return [...data]
      .sort((a, b) => (b.rentals || 0) - (a.rentals || 0))
      .slice(0, 5)
  }, [data])
  
  // Render loading state
  if (loading && stations.length === 0) {
    return (
      <div className="stat-card top-stations-card">
        <div className="chart-header">
          <div className="chart-title-wrapper">
            <h3 className="chart-title">
              <div className="chart-icon">
                <i className="fas fa-trophy"></i>
              </div>
              Top 5 Trạm Xe
            </h3>
            <p className="chart-subtitle">Xếp hạng theo số lượt thuê tháng này</p>
          </div>
        </div>
        <div className="top-stations-list">
          <div className="top-stations-loading">
            <i className="fas fa-spinner"></i>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="stat-card top-stations-card">
        <div className="chart-header">
          <div className="chart-title-wrapper">
            <h3 className="chart-title">
              <div className="chart-icon">
                <i className="fas fa-trophy"></i>
              </div>
              Top 5 Trạm Xe
            </h3>
            <p className="chart-subtitle">Xếp hạng theo số lượt thuê tháng này</p>
          </div>
        </div>
        <div className="top-stations-list">
          <div className="top-stations-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error?.message || 'Không thể tải dữ liệu'}</p>
            <button className="admin-btn admin-btn-primary" onClick={refetch}>
              <i className="fas fa-redo"></i>
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render main content
  return (
    <div className="stat-card top-stations-card">
      <div className="chart-header">
        <div className="chart-title-wrapper">
          <h3 className="chart-title">
            <div className="chart-icon">
              <i className="fas fa-trophy"></i>
            </div>
            Top {stations.length} Trạm Xe
          </h3>
          <p className="chart-subtitle">Xếp hạng theo số lượt thuê tháng này</p>
        </div>
      </div>

      <div className="top-stations-list">
        {stations.length > 0 ? (
          <div className="stations-grid">
            {stations.map((station, index) => (
              <div key={station.id || index} className="station-item">
                <div className="station-layout">
                  {/* Rank Badge */}
                  <div className={`station-rank rank-${index + 1}`}>
                    {index + 1}
                  </div>

                  {/* Station Info */}
                  <div className="station-info">
                    <h4 className="station-name">{station.name || 'N/A'}</h4>
                    <div className="station-stats">
                      <div className="stat-item">
                        <i className="fas fa-car"></i>
                        <span>{station.rentals || 0} lượt thuê</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="station-revenue">
                    <div className="revenue-amount">
                      {formatVND(station.revenue || 0)}
                    </div>
                    <div className="revenue-label">Doanh thu</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="top-stations-empty">
            <i className="fas fa-inbox"></i>
            <p>Chưa có dữ liệu trạm xe</p>
          </div>
        )}
      </div>
    </div>
  )
}
