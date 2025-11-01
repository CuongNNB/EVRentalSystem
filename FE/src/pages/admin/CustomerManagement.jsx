import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx' //npm install xlsx
import ErrorBoundary from '../../components/admin/ErrorBoundary'
import './AdminDashboardNew.css'
import './CustomerManagement.css'

const CustomerManagement = () => {
    const [activeTab, setActiveTab] = useState('all') // all, risk, complaints
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [riskFilter, setRiskFilter] = useState('all')
    const navigate = useNavigate()

    // State for API data
    const [customers, setCustomers] = useState([])
    const [complaints, setComplaints] = useState([])
    const [stats, setStats] = useState({
        total: 0,
        highRisk: 0,
        normalCount: 0
    })

    // Loading states
    const [loadingCustomers, setLoadingCustomers] = useState(true)
    const [loadingComplaints, setLoadingComplaints] = useState(true)
    const [loadingStats, setLoadingStats] = useState(true)

    // --- Helper to map backend status -> local status keys used by UI
    const mapStatus = (backendStatus) => {
        if (!backendStatus) return 'active'
        const s = backendStatus.toString().toUpperCase()
        if (s === 'ACTIVE') return 'active'
        if (s === 'VIP') return 'vip'
        if (s === 'WARNING' || s === 'WARN') return 'warning'
        if (s === 'BLOCKED' || s === 'INACTIVE' || s === 'BANNED') return 'blocked'
        return s.toLowerCase()
    }

    // Fetch customers (renters) from API when component mounts
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoadingCustomers(true)
                console.log('[CustomerManagement] Fetching renters from backend...')

                const res = await fetch('http://localhost:8084/EVRentalSystem/api/user-management/renters')
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()

                // map backend response to the shape used by the table
                // backend sample: { userId, username, fullName, email, phone, address, status, createdAt, role }
                const mapped = (Array.isArray(data) ? data : []).map(u => {
                    // safe parsing of createdAt -> readable joinDate
                    let joinDate = u.createdAt
                    try {
                        joinDate = u.createdAt ? new Date(u.createdAt).toLocaleString() : ''
                    } catch (e) {
                        joinDate = u.createdAt || ''
                    }

                    return {
                        id: u.userId,
                        username: u.username,
                        name: u.fullName || u.username || `User-${u.userId}`,
                        email: u.email || '',
                        phone: u.phone || '',
                        address: u.address || '',
                        status: mapStatus(u.status),
                        joinDate,
                        // the following fields may not be provided by your renters API — set defaults so UI works
                        totalRentals: u.totalRentals ?? 0,
                        totalSpent: u.totalSpent ?? 0,
                        violationCount: u.violationCount ?? 0,
                        risky: u.risky,
                        rating: u.rating ?? 4.5
                    }
                })

                setCustomers(mapped)
            } catch (error) {
                console.error('[CustomerManagement] Error loading renters:', error)
                setCustomers([])
            } finally {
                setLoadingCustomers(false)
            }
        }

        fetchCustomers()
    }, [])

    // --- If you have endpoints for complaints/stats keep original calls (left as placeholders)
    useEffect(() => {
        // Placeholder: keep existing behavior but do nothing if you don't have endpoints
        const fetchComplaints = async () => {
            setLoadingComplaints(true)
            try {
                // if you have an endpoint, fetch here. For now leave empty.
                setComplaints([])
            } catch (err) {
                setComplaints([])
            } finally {
                setLoadingComplaints(false)
            }
        }
        fetchComplaints()
    }, [])

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true)
            try {
                // compute stats from customers already fetched:
                const total = customers.length

                // Count customers where risky === true
                const highRisk = customers.filter(c => Boolean(c.risky) === true).length

                // Count customers where risky === false (treat undefined as false)
                const normalCount = customers.filter(c => !Boolean(c.risky)).length

                setStats({ total, highRisk, normalCount })
            } catch (e) {
                setStats({ total: 0, highRisk: 0, normalCount: 0 })
            } finally {
                setLoadingStats(false)
            }
        }
        fetchStats()
    }, [customers])

    const filteredCustomers = React.useMemo(() => {
        let result = customers.filter(customer => {
            const matchSearch =
                searchTerm === '' ||
                customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone?.includes(searchTerm)

            const matchStatus =
                statusFilter === 'all' || customer.status === statusFilter

            // Tab filtering:
            // - risk: only risky === true
            // - normal: only risky === false
            // - default (all): no filter
            let matchTab = true
            if (activeTab === 'risk') matchTab = customer.risky === true
            else if (activeTab === 'normal') matchTab = customer.risky !== true // false or undefined

            return matchSearch && matchStatus && matchTab
        })

        // Sorting:
        // - If in 'risk' tab: bring risky true to top (though all should be true)
        // - If in 'normal' tab: bring risky false to top (all should be false) but keep stable sort
        if (activeTab === 'risk') {
            result.sort((a, b) => {
                if (a.risky === b.risky) return 0
                return a.risky ? -1 : 1
            })
        } else if (activeTab === 'normal') {
            result.sort((a, b) => {
                if (Boolean(a.risky) === Boolean(b.risky)) return 0
                return !Boolean(a.risky) ? -1 : 1 // risky false first
            })
        }

        return result
    }, [customers, activeTab, searchTerm, statusFilter])

    // Export filteredCustomers -> Excel
    const exportToExcel = (filename = 'customers.xlsx') => {
        try {
            // map data to rows you want in Excel
            const rows = filteredCustomers.map(c => ({
                ID: c.id,
                Tên: c.name,
                Username: c.username,
                Email: c.email,
                SĐT: c.phone,
                Địa_chỉ: c.address,
                Rủi_ro: c.risky ? 'Rủi ro' : 'Bình thường',
                Trạng_thái: c.status === 'vip' ? 'VIP' : (c.status === 'warning' ? 'Cảnh báo' : (c.status === 'blocked' ? 'Khóa' : 'Hoạt động')),
                Ngày_tham_gia: c.joinDate
            }))

            // create worksheet & workbook
            const ws = XLSX.utils.json_to_sheet(rows)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Customers')

            // write file (this will prompt download in browser)
            XLSX.writeFile(wb, filename)
        } catch (err) {
            console.error('Export to Excel error', err)
            alert('Lỗi khi xuất Excel: ' + (err.message || err))
        }
    }


    const getRiskBadgeClass = (level) => {
        switch (level) {
            case 'high': return 'risk-badge-high'
            case 'medium': return 'risk-badge-medium'
            default: return 'risk-badge-low'
        }
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
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
            <span className="kpi-icon" style={{ background: 'rgba(161, 190, 236, 0.1)' }}>
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
                            <h3 className="kpi-title">RỦI RO</h3>
                            <div className="kpi-value">
                                {loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.highRisk}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ borderTop: '4px solid #b4fac3ff' }}>
                    <div className="kpi-card-content">
            <span className="kpi-icon" style={{ background: 'rgba(122, 206, 160, 0.1)' }}>
              <i className="fas fa-smile" style={{ color: '#16a34a' }}></i>
            </span>
                        <div className="kpi-info">
                            <h3 className="kpi-title">BÌNH THƯỜNG</h3>
                            <div className="kpi-value">
                                {loadingStats ? <i className="fas fa-spinner fa-spin"></i> : stats.normalCount}
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
                    className={`tab-btn ${activeTab === 'normal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('normal')}
                >
                    <i className="fas fa-smile"></i>
                    Bình thường
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
                        <button className="admin-btn admin-btn-primary" onClick={() => exportToExcel()}>
                            <i className="fas fa-file-export"></i>
                            Xuất danh sách ra Excel
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            {activeTab === 'normal' ? (
                // Hiển thị bảng nhưng filteredCustomers đã đảm nhiệm lọc normal
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
                        // reuse same table markup as before (thead/tbody) — filteredCustomers already contains only normal ones
                        <table className="customers-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Liên hệ</th>
                                <th>Rủi ro</th>
                                <th>Trạng thái</th>
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

                                    <td>
                      <span className={`risk-indicator ${customer.risky ? 'danger' : 'normal'}`}>
                        {customer.risky ? 'Rủi ro' : 'Bình thường'}
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
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon"
                                                title="Xem chi tiết"
                                                onClick={() => navigate(`/admin/customers/${customer.id}`)}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                // Các tab khác (all, risk) vẫn dùng same customers-table-container but filteredCustomers will show appropriate rows
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
                        // reuse same table markup as above (or if you already have one table block, keep single table and rely on filteredCustomers)
                        <table className="customers-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Liên hệ</th>
                                <th>Rủi ro</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredCustomers.map((customer) => (
                                /* same row as above */
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

                                    <td>
                      <span className={`risk-indicator ${customer.risky ? 'danger' : 'normal'}`}>
                        {customer.risky ? 'Rủi ro' : 'Bình thường'}
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
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon"
                                                title="Xem chi tiết"
                                                onClick={() => navigate(`/admin/customers/${customer.id}`)}
                                            >
                                                <i className="fas fa-eye"></i>
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
