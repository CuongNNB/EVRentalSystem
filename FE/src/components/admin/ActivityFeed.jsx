import React from 'react'
import useActivityFeed from '../../pages/admin/hooks/useActivityFeed'
import { formatDateTime } from '../../utils/format'

export default function ActivityFeed() {
  const { data, loading, error, refetch } = useActivityFeed(5) // ✅ Chỉ lấy 5 hoạt động gần nhất
  
  // DEBUG: Log data to check mapping
  React.useEffect(() => {
    console.log('🔍 [ActivityFeed] Debug:', {
      loading,
      error: error ? String(error) : null,
      data,
      dataType: Array.isArray(data) ? 'Array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      firstItem: Array.isArray(data) && data[0] ? data[0] : null
    })
  }, [data, loading, error])
  
  // DEBUG: Check if backend API exists
  React.useEffect(() => {
    if (error) {
      const errorMsg = error?.message || String(error)
      // Check if it's a 404 or 500 error (backend API not implemented)
      if (errorMsg.includes('404') || errorMsg.includes('500') || errorMsg.includes('Network Error')) {
        console.warn('⚠️ [ActivityFeed] Backend API chưa có: /admin/overview/activity')
      }
    }
  }, [error])
  
  if (loading) return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-title">Hoạt động gần đây</div>
      </div>
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        ⏳ Đang tải...
      </div>
    </div>
  )
  
  // If backend API not ready, hide component gracefully
  if (error) {
    const errorMsg = error?.message || String(error)
    const isBackendNotReady = errorMsg.includes('404') || errorMsg.includes('500') || errorMsg.includes('Network Error')
    
    if (isBackendNotReady) {
      // Return null to hide component if backend not ready
      return null
    }
    
    // For other errors, show error message
    return (
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-title">Hoạt động gần đây</div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ color: '#dc2626', marginBottom: '1rem' }}>⚠️ Lỗi tải dữ liệu</div>
          <button 
            onClick={refetch}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const feed = Array.isArray(data) ? data : []
  
  if (!feed.length) {
    return (
      <div className="stat-card activity-feed-card">
        <div className="chart-header">
          <div className="chart-title-wrapper">
            <h3 className="chart-title">
              <div className="chart-icon">
                <i className="fas fa-history"></i>
              </div>
              Hoạt động gần đây
            </h3>
            <p className="chart-subtitle">5 hoạt động mới nhất trong hệ thống</p>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          Không có hoạt động gần đây
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card activity-feed-card">
      {/* Header */}
      <div className="chart-header">
        <div className="chart-title-wrapper">
          <h3 className="chart-title">
            <div className="chart-icon">
              <i className="fas fa-history"></i>
            </div>
            Hoạt động gần đây
          </h3>
          <p className="chart-subtitle">5 hoạt động mới nhất trong hệ thống</p>
        </div>
      </div>
      
      {/* Activity List */}
      <div className="activity-feed-list">
        {feed.map((activity, index) => {
          // Determine professional icon and color based on type and message
          const getActivityStyle = (type, message) => {
            const typeStr = String(type || '').toLowerCase()
            const msgStr = String(message || '').toLowerCase()
            
            // 🚗 Thuê xe / Rental
            if (typeStr.includes('rental') || typeStr.includes('thuê') || msgStr.includes('thuê xe')) {
              return { icon: 'fa-car-side', color: '#10b981', bg: '#d1fae5', label: 'Thuê xe' }
            }
            
            // ✅ Trả xe / Return
            if (typeStr.includes('return') || typeStr.includes('trả') || msgStr.includes('trả xe')) {
              return { icon: 'fa-check-circle', color: '#06b6d4', bg: '#cffafe', label: 'Trả xe' }
            }
            
            // ✅ Hoàn tất / Complete
            if (typeStr.includes('complete') || typeStr.includes('hoàn tất') || msgStr.includes('hoàn tất')) {
              return { icon: 'fa-check-double', color: '#3b82f6', bg: '#dbeafe', label: 'Hoàn tất' }
            }
            
            // 💰 Thanh toán / Payment
            if (typeStr.includes('payment') || typeStr.includes('thanh toán') || msgStr.includes('thanh toán')) {
              return { icon: 'fa-credit-card', color: '#f59e0b', bg: '#fef3c7', label: 'Thanh toán' }
            }
            
            // 💵 Tiền / Money
            if (typeStr.includes('deposit') || typeStr.includes('cọc') || msgStr.includes('đặt cọc')) {
              return { icon: 'fa-money-bill-wave', color: '#14b8a6', bg: '#ccfbf1', label: 'Đặt cọc' }
            }
            
            // ❌ Hủy / Cancel
            if (typeStr.includes('cancel') || typeStr.includes('hủy') || msgStr.includes('hủy')) {
              return { icon: 'fa-times-circle', color: '#ef4444', bg: '#fee2e2', label: 'Hủy đơn' }
            }
            
            // 👤 Khách hàng / Customer
            if (typeStr.includes('customer') || typeStr.includes('user') || typeStr.includes('khách')) {
              return { icon: 'fa-user-circle', color: '#8b5cf6', bg: '#ede9fe', label: 'Khách hàng' }
            }
            
            // 📝 Đăng ký / Register
            if (typeStr.includes('register') || typeStr.includes('đăng ký') || msgStr.includes('đăng ký')) {
              return { icon: 'fa-user-plus', color: '#6366f1', bg: '#e0e7ff', label: 'Đăng ký' }
            }
            
            // 🔧 Bảo trì / Maintenance
            if (typeStr.includes('maintenance') || typeStr.includes('bảo trì') || msgStr.includes('bảo trì')) {
              return { icon: 'fa-wrench', color: '#f97316', bg: '#ffedd5', label: 'Bảo trì' }
            }
            
            // ⚠️ Cảnh báo / Warning
            if (typeStr.includes('warning') || typeStr.includes('cảnh báo') || msgStr.includes('cảnh báo')) {
              return { icon: 'fa-exclamation-triangle', color: '#eab308', bg: '#fef9c3', label: 'Cảnh báo' }
            }
            
            // 📍 Trạm / Station
            if (typeStr.includes('station') || typeStr.includes('trạm') || msgStr.includes('trạm')) {
              return { icon: 'fa-map-marker-alt', color: '#ec4899', bg: '#fce7f3', label: 'Trạm xe' }
            }
            
            // 🔔 Mặc định / Default
            return { icon: 'fa-bell', color: '#8b5cf6', bg: '#ede9fe', label: 'Thông báo' }
          }
          
          const style = getActivityStyle(activity.type, activity.message)
          
          return (
            <div key={activity.id ?? index} className="activity-item">
              <div className="activity-icon" style={{ 
                background: style.bg,
                color: style.color
              }}>
                <i className={`fas ${style.icon}`}></i>
              </div>
              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">
                  <i className="far fa-clock"></i>
                  {formatDateTime(activity.timestamp || activity.time)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
