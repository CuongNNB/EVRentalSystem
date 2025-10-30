
import React, { useState, useEffect } from 'react'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import { getCustomers, getCustomerStats, getComplaints } from '../../api/adminCustomers'
import './AdminDashboardNew.css'
import './CustomerManagement.css'

const CustomerManagement = () => {
  const [activeTab, setActiveTab] = useState('all') // all, risk, complaints
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  
  // State for API data
  const [customers, setCustomers] = useState([])
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    totalComplaints: 0
  })
  
  // Loading states
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingComplaints, setLoadingComplaints] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true)
        console.log('[CustomerManagement] Fetching customers...')
        
        const data = await getCustomers()
        setCustomers(data)
      } catch (error) {
        console.error('[CustomerManagement] Error loading customers:', error)
        setCustomers([])
      } finally {
        setLoadingCustomers(false)
      }
    }
    
    fetchCustomers()
  }, [])

  // Fetch complaints from API
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoadingComplaints(true)
        console.log('[CustomerManagement] Fetching complaints...')
        
        const data = await getComplaints()
        setComplaints(data)
      } catch (error) {
        console.error('[CustomerManagement] Error loading complaints:', error)
        setComplaints([])
      } finally {
        setLoadingComplaints(false)
      }
    }
    
    fetchComplaints()
  }, [])

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true)
        console.log('[CustomerManagement] Fetching stats...')
        
        const data = await getCustomerStats()
        setStats(data)
      } catch (error) {
        console.error('[CustomerManagement] Error loading stats:', error)
        setStats({ total: 0, highRisk: 0, totalComplaints: 0 })
      } finally {
        setLoadingStats(false)
      }
    }
    
    fetchStats()
  }, [])

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchSearch = searchTerm === '' || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    
    const matchStatus = statusFilter === 'all' || customer.status === statusFilter
    const matchRisk = riskFilter === 'all' || customer.riskLevel === riskFilter
    
    let matchTab = true
    if (activeTab === 'risk') matchTab = customer.riskLevel === 'high' || customer.violationCount >= 3

    return matchSearch && matchStatus && matchRisk && matchTab
  })

  const getRiskBadgeClass = (level) => {
    switch(level) {
      case 'high': return 'risk-badge-high'
      case 'medium': return 'risk-badge-medium'
      default: return 'risk-badge-low'
    }
  }

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'vip': return 'status-badge-vip'
      case 'warning': return 'status-badge-warning'
      case 'blocked': return 'status-badge-blocked'
      default: return 'status-badge-active'
    }
  }

  return (
    <ErrorBoundary>
      {/* Breadcrumb */}
      <div className="admin-breadcrumb">
            <i className="fas fa-home"></i>
            <span>Quản trị</span>
            <i className="fas fa-chevron-right"></i>
            <span>Quản lý khách hàng</span>
          </div>

          {/* Page Header */}
          <div className="admin-page-header">
            <div className="admin-page-header-left">
              <div className="admin-page-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}>
                <i className="fas fa-users"></i>
              </div>
              <div className="admin-page-title-group">
                <h1 className="admin-page-title">Quản lý Khách hàng</h1>
                <p className="admin-page-subtitle">Theo dõi hồ sơ, lịch sử thuê và xử lý khiếu nại</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <i className="fas fa-users" style={{ color: '#3b82f6' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">TỔNG KHÁCH HÀNG</h3>
                  <div className="kpi-value">
                    {loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.total}
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">RỦI RO CAO</h3>
                  <div className="kpi-value">
                    {loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.highRisk}
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div className="kpi-card-content">
                <span className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <i className="fas fa-comment-dots" style={{ color: '#f59e0b' }}></i>
                </span>
                <div className="kpi-info">
                  <h3 className="kpi-title">KHIẾU NẠI</h3>
                  <div className="kpi-value">
                    {loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.totalComplaints}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="customer-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <i className="fas fa-users"></i>
              Tất cả khách hàng
            </button>
            <button 
              className={`tab-btn ${activeTab === 'risk' ? 'active' : ''}`}
              onClick={() => setActiveTab('risk')}
            >
              <i className="fas fa-exclamation-triangle"></i>
              Khách hàng rủi ro
            </button>
            <button 
              className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={() => setActiveTab('complaints')}
            >
              <i className="fas fa-comment-dots"></i>
              Khiếu nại
            </button>
          </div>

          {/* Search and Filters */}
          {activeTab !== 'complaints' && (
            <div className="customer-toolbar">
              <div className="customer-search">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="customer-filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="warning">Cảnh báo</option>
                  <option value="blocked">Bị khóa</option>
                </select>

                <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
                  <option value="all">Tất cả mức rủi ro</option>
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>

                <button className="admin-btn admin-btn-primary">
                  <i className="fas fa-file-export"></i>
                  Xuất Excel
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === 'complaints' ? (
            <div className="complaints-container">
              {loadingComplaints ? (
                <div className="empty-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#3b82f6' }}></i>
                  <p>Đang tải danh sách khiếu nại...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-comment-dots"></i>
                  <p>Không có khiếu nại nào</p>
                </div>
              ) : (
                <div className="complaints-list">
                  {complaints.map((complaint) => (
                    <div key={complaint.id} className="complaint-card">
                      <div className="complaint-header">
                        <div className="complaint-id">#{complaint.id}</div>
                        <span className={`complaint-status ${complaint.status === 'resolved' ? 'resolved' : 'processing'}`}>
                          {complaint.status === 'resolved' ? 'Đã giải quyết' : 'Đang xử lý'}
                        </span>
                        <span className={`complaint-priority priority-${complaint.priority}`}>
                          {complaint.priority === 'high' ? 'Ưu tiên cao' : 'Bình thường'}
                        </span>
                      </div>
                      <div className="complaint-body">
                        <h4>{complaint.subject}</h4>
                        <p className="complaint-customer">
                          <i className="fas fa-user"></i>
                          {complaint.customerName} ({complaint.customerId})
                        </p>
                        <p className="complaint-content">{complaint.content}</p>
                        <div className="complaint-footer">
                          <span className="complaint-time">
                            <i className="fas fa-clock"></i>
                            {complaint.createdAt}
                          </span>
                          <span className="complaint-assigned">
                            <i className="fas fa-user-tie"></i>
                            Phụ trách: {complaint.assignedTo}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="customers-table-container">
              {loadingCustomers ? (
                <div className="empty-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#3b82f6' }}></i>
                  <p>Đang tải danh sách khách hàng...</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-users"></i>
                  <p>Không tìm thấy khách hàng nào</p>
                </div>
              ) : (
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Khách hàng</th>
                      <th>Liên hệ</th>
                      <th>Tổng thuê</th>
                      <th>Chi tiêu</th>
                      <th>Vi phạm</th>
                      <th>Mức rủi ro</th>
                      <th>Trạng thái</th>
                      <th>Đánh giá</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="customer-id">{customer.id}</td>
                        <td>
                          <div className="customer-info">
                            <div className="customer-avatar">
                              {customer.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="customer-name">{customer.name}</div>
                              <div className="customer-join">Tham gia: {customer.joinDate}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="customer-contact">
                            <div><i className="fas fa-envelope"></i> {customer.email}</div>
                            <div><i className="fas fa-phone"></i> {customer.phone}</div>
                          </div>
                        </td>
                        <td className="customer-rentals">{customer.totalRentals} lần</td>
                        <td className="customer-spent">{(customer.totalSpent / 1000000).toFixed(1)}M VNĐ</td>
                        <td>
                          <span className={`violation-count ${customer.violationCount > 0 ? 'has-violation' : ''}`}>
                            {customer.violationCount}
                          </span>
                        </td>
                        <td>
                          <span className={`risk-badge ${getRiskBadgeClass(customer.riskLevel)}`}>
                            {customer.riskLevel === 'high' ? 'Cao' : customer.riskLevel === 'medium' ? 'TB' : 'Thấp'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(customer.status)}`}>
                            {customer.status === 'vip' ? 'VIP' : 
                             customer.status === 'warning' ? 'Cảnh báo' : 
                             customer.status === 'blocked' ? 'Khóa' : 'Hoạt động'}
                          </span>
                        </td>
                        <td>
                          <div className="customer-rating">
                            <i className="fas fa-star" style={{ color: '#f59e0b' }}></i>
                            {customer.rating?.toFixed(1)}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon" title="Xem chi tiết">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn-icon" title="Lịch sử">
                              <i className="fas fa-history"></i>
                            </button>
                            <button className="btn-icon" title="Chỉnh sửa">
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
    </ErrorBoundary>
  )
}

export default CustomerManagement
