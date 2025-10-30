/**
 * CustomerManagement (child content only – no sidebar)
 */

import React, { useState } from 'react'
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './AdminDashboardNew.css'
import './CustomerManagement.css'

// Mock data
const MOCK_CUSTOMERS = [
  { id:'KH001', name:'Nguyễn Văn An', email:'nguyenvanan@gmail.com', phone:'0901234567', totalRentals:15, totalSpent:12500000, riskLevel:'low', violationCount:0, lastRental:'2024-01-20', joinDate:'2023-06-15', status:'active', rating:4.8 },
  { id:'KH002', name:'Trần Thị Bình', email:'tranthibinh@gmail.com', phone:'0912345678', totalRentals:8,  totalSpent:6800000,  riskLevel:'medium', violationCount:2, lastRental:'2024-01-18', joinDate:'2023-08-20', status:'active', rating:3.5 },
  { id:'KH003', name:'Phạm Văn Cường', email:'phamvancuong@gmail.com', phone:'0923456789', totalRentals:3,  totalSpent:2100000,  riskLevel:'high',   violationCount:5, lastRental:'2024-01-15', joinDate:'2023-11-10', status:'warning', rating:2.0 },
  { id:'KH004', name:'Lê Thị Diễm',   email:'lethidiem@gmail.com',   phone:'0934567890', totalRentals:22, totalSpent:18900000, riskLevel:'low', violationCount:0, lastRental:'2024-01-22', joinDate:'2023-03-05', status:'vip',    rating:5.0 },
  { id:'KH005', name:'Hoàng Văn Em',   email:'hoangvanem@gmail.com',  phone:'0945678901', totalRentals:5,  totalSpent:3500000,  riskLevel:'medium', violationCount:1, lastRental:'2024-01-19', joinDate:'2023-09-12', status:'active', rating:4.0 },
]

const MOCK_COMPLAINTS = [
  { id:'KN001', customerId:'KH002', customerName:'Trần Thị Bình', subject:'Xe bị hỏng giữa đường', content:'Xe VF 8 bị chết máy khi đang chạy trên đường', status:'processing', priority:'high',   createdAt:'2024-01-18 14:30', assignedTo:'NV003' },
  { id:'KN002', customerId:'KH003', customerName:'Phạm Văn Cường', subject:'Tính phí không đúng',   content:'Bị tính phí vượt quá thời gian thuê thực tế',    status:'resolved',   priority:'medium', createdAt:'2024-01-15 10:15', assignedTo:'NV001' },
]

const CustomerManagement = () => {
  const [activeTab, setActiveTab] = useState('all') // all | vip | risk | complaints
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  // Filter customers
  const filteredCustomers = MOCK_CUSTOMERS.filter((c) => {
    const matchSearch =
      !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchRisk = riskFilter === 'all' || c.riskLevel === riskFilter
    let matchTab = true
    if (activeTab === 'vip') matchTab = c.status === 'vip'
    if (activeTab === 'risk') matchTab = c.riskLevel === 'high' || c.violationCount >= 3
    return matchSearch && matchStatus && matchRisk && matchTab
  })

  const getRiskBadgeClass = (level) =>
    level === 'high' ? 'risk-badge-high' : level === 'medium' ? 'risk-badge-medium' : 'risk-badge-low'

  const getStatusBadgeClass = (status) =>
    status === 'vip'
      ? 'status-badge-vip'
      : status === 'warning'
      ? 'status-badge-warning'
      : status === 'blocked'
      ? 'status-badge-blocked'
      : 'status-badge-active'

  return (
    <ErrorBoundary>
      {/* KHÔNG có AdminSlideBar ở đây. Chỉ render phần content để layout cha chứa sidebar */}
      <main className="admin-main-content">
        {/* Breadcrumb */}
        <div className="admin-breadcrumb">
          <i className="fas fa-home"></i>
          <span>Quản trị</span>
          <i className="fas fa-chevron-right"></i>
          <span>Quản lý khách hàng</span>
        </div>

        {/* Header */}
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

        {/* Stats */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <i className="fas fa-users" style={{ color: '#3b82f6' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">TỔNG KHÁCH HÀNG</h3>
                <div className="kpi-value">{MOCK_CUSTOMERS.length}</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
                <i className="fas fa-crown" style={{ color: '#8b5cf6' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">KHÁCH VIP</h3>
                <div className="kpi-value">{MOCK_CUSTOMERS.filter((c) => c.status === 'vip').length}</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">RỦI RO CAO</h3>
                <div className="kpi-value">{MOCK_CUSTOMERS.filter((c) => c.riskLevel === 'high').length}</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
            <div className="kpi-card-content">
              <span className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <i className="fas fa-comment-dots" style={{ color: '#f59e0b' }}></i>
              </span>
              <div className="kpi-info">
                <h3 className="kpi-title">KHIẾU NẠI</h3>
                <div className="kpi-value">{MOCK_COMPLAINTS.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="customer-tabs">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            <i className="fas fa-users"></i>
            Tất cả khách hàng
          </button>
          <button className={`tab-btn ${activeTab === 'vip' ? 'active' : ''}`} onClick={() => setActiveTab('vip')}>
            <i className="fas fa-crown"></i>
            Khách VIP
          </button>
          <button className={`tab-btn ${activeTab === 'risk' ? 'active' : ''}`} onClick={() => setActiveTab('risk')}>
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

        {/* Search & Filters */}
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
                <option value="vip">VIP</option>
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
            <div className="complaints-list">
              {MOCK_COMPLAINTS.map((c) => (
                <div key={c.id} className="complaint-card">
                  <div className="complaint-header">
                    <div className="complaint-id">#{c.id}</div>
                    <span className={`complaint-status ${c.status === 'resolved' ? 'resolved' : 'processing'}`}>
                      {c.status === 'resolved' ? 'Đã giải quyết' : 'Đang xử lý'}
                    </span>
                    <span className={`complaint-priority priority-${c.priority}`}>
                      {c.priority === 'high' ? 'Ưu tiên cao' : 'Bình thường'}
                    </span>
                  </div>
                  <div className="complaint-body">
                    <h4>{c.subject}</h4>
                    <p className="complaint-customer">
                      <i className="fas fa-user"></i>
                      {c.customerName} ({c.customerId})
                    </p>
                    <p className="complaint-content">{c.content}</p>
                    <div className="complaint-footer">
                      <span className="complaint-time">
                        <i className="fas fa-clock"></i>
                        {c.createdAt}
                      </span>
                      <span className="complaint-assigned">
                        <i className="fas fa-user-tie"></i>
                        Phụ trách: {c.assignedTo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="customers-table-container">
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
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td className="customer-id">{c.id}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar">{c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                        <div>
                          <div className="customer-name">{c.name}</div>
                          <div className="customer-join">Tham gia: {c.joinDate}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="customer-contact">
                        <div>
                          <i className="fas fa-envelope"></i> {c.email}
                        </div>
                        <div>
                          <i className="fas fa-phone"></i> {c.phone}
                        </div>
                      </div>
                    </td>
                    <td className="customer-rentals">{c.totalRentals} lần</td>
                    <td className="customer-spent">{(c.totalSpent / 1000000).toFixed(1)}M VNĐ</td>
                    <td>
                      <span className={`violation-count ${c.violationCount > 0 ? 'has-violation' : ''}`}>
                        {c.violationCount}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge ${getRiskBadgeClass(c.riskLevel)}`}>
                        {c.riskLevel === 'high' ? 'Cao' : c.riskLevel === 'medium' ? 'TB' : 'Thấp'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(c.status)}`}>
                        {c.status === 'vip' ? 'VIP' : c.status === 'warning' ? 'Cảnh báo' : c.status === 'blocked' ? 'Khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td>
                      <div className="customer-rating">
                        <i className="fas fa-star" style={{ color: '#f59e0b' }}></i>
                        {c.rating.toFixed(1)}
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
          </div>
        )}
      </main>
    </ErrorBoundary>
  )
}

export default CustomerManagement
