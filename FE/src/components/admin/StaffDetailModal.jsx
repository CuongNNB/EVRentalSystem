/**
 * StaffDetailModal Component
 * 
 * Modal chi tiết nhân viên với 8 tabs:
 * 1. Tổng quan (Overview)
 * 2. Công việc hôm nay (Today)
 * 3. Lịch sử giao/nhận (History)
 * 4. Hiệu suất (Performance)
 * 5. Ca làm & khả dụng (Schedule)
 * 6. Đánh giá & phản hồi (Feedback)
 * 7. Sự cố & kỷ luật (Incidents)
 * 8. Thiết bị & giấy tờ (Assets)
 */

import React, { useState, useEffect } from 'react'
import './StaffDetailModal.css'

// Mock data
const STAFF_DETAIL_MOCK = {
  id: 'NV002',
  code: 'NV002',
  name: 'Trần Thị Bích',
  role: 'RUNNER',
  roleLabel: 'Nhân viên giao xe',
  phone: '0902222222',
  email: 'tranthibich@ev.com',
  station: {
    id: 3,
    name: 'Trạm Quận 3',
    area: 'Q3'
  },
  status: 'ACTIVE',
  lastActive: '2025-10-29T10:40:00',
  rating: 4.9
}

const STATS_MOCK = {
  delivered: 198,
  onTimeRate: 99,
  csat: 98,
  incidents: 0,
  lateShifts: 2,
  trend: [22, 18, 20, 25, 28, 26, 29]
}

const TODAY_TASKS = [
  {
    id: 't1',
    orderId: '#R123',
    type: 'DROP',
    stationFrom: 'Trạm Q3',
    stationTo: 'Trạm Q1',
    vehicleModel: 'Tesla Model 3',
    eta: '11:30',
    slaMins: 20,
    status: 'DOING',
    customerName: 'Nguyễn Văn A'
  },
  {
    id: 't2',
    orderId: '#R124',
    type: 'PICKUP',
    stationFrom: 'Trạm Q1',
    vehicleModel: 'VinFast VF 8',
    eta: '14:00',
    slaMins: 30,
    status: 'PENDING',
    customerName: 'Lê Thị B'
  },
  {
    id: 't3',
    orderId: '#R125',
    type: 'DROP',
    stationFrom: 'Trạm Q3',
    stationTo: 'Trạm Q7',
    vehicleModel: 'Tesla Model Y',
    eta: '16:30',
    slaMins: 25,
    status: 'DONE',
    customerName: 'Phạm Văn C'
  }
]

const HISTORY_MOCK = [
  {
    time: '2025-10-28T18:20',
    type: 'RETURN',
    vehicleCode: 'VX-078',
    vehicleModel: 'Tesla Model 3',
    station: 'Trạm Q3',
    note: 'Xe sạch sẽ, đầy đủ'
  },
  {
    time: '2025-10-28T15:45',
    type: 'PICKUP',
    vehicleCode: 'VX-092',
    vehicleModel: 'VinFast VF 8',
    station: 'Trạm Q1',
    note: 'Giao xe đúng giờ'
  },
  {
    time: '2025-10-28T10:30',
    type: 'MAINTENANCE',
    vehicleCode: 'VX-078',
    vehicleModel: 'Tesla Model 3',
    station: 'Trạm Q3',
    note: 'Kiểm tra định kỳ'
  },
  {
    time: '2025-10-27T17:00',
    type: 'TRANSFER',
    vehicleCode: 'VX-045',
    vehicleModel: 'Hyundai Ioniq 5',
    station: 'Trạm Q7 → Trạm Q3',
    note: 'Chuyển xe theo yêu cầu'
  }
]

const PERFORMANCE_MOCK = {
  monthly: {
    totalJobs: 198,
    onTimeRate: 99,
    completionRate: 99.5,
    csat: 98,
    avgResponseTime: 8.5
  },
  weekly: [
    { week: 'T1', jobs: 45, onTimeRate: 98 },
    { week: 'T2', jobs: 48, onTimeRate: 99 },
    { week: 'T3', jobs: 52, onTimeRate: 100 },
    { week: 'T4', jobs: 53, onTimeRate: 99 }
  ],
  lateReasons: [
    { reason: 'Tắc đường', count: 3 },
    { reason: 'Xe hỏng', count: 1 },
    { reason: 'Khách trễ', count: 2 }
  ],
  teamAverage: {
    onTimeRate: 95,
    csat: 93
  }
}

const SCHEDULE_MOCK = [
  { day: 'T2', date: '28/10', shift: 'MORNING', status: 'DONE' },
  { day: 'T3', date: '29/10', shift: 'MORNING', status: 'CURRENT' },
  { day: 'T4', date: '30/10', shift: 'AFTERNOON', status: 'SCHEDULED' },
  { day: 'T5', date: '31/10', shift: 'MORNING', status: 'SCHEDULED' },
  { day: 'T6', date: '01/11', shift: 'OFF', status: 'OFF' },
  { day: 'T7', date: '02/11', shift: 'AFTERNOON', status: 'SCHEDULED' },
  { day: 'CN', date: '03/11', shift: 'OFF', status: 'OFF' }
]

const FEEDBACK_MOCK = [
  {
    id: 'fb1',
    date: '2025-10-28',
    customerName: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Nhân viên nhiệt tình, giao xe đúng giờ, xe sạch sẽ!',
    orderId: '#R120'
  },
  {
    id: 'fb2',
    date: '2025-10-27',
    customerName: 'Lê Thị B',
    rating: 5,
    comment: 'Rất hài lòng, nhân viên chuyên nghiệp',
    orderId: '#R118'
  },
  {
    id: 'fb3',
    date: '2025-10-26',
    customerName: 'Trần Văn C',
    rating: 4,
    comment: 'Tốt, nhưng hơi trễ 5 phút',
    orderId: '#R115'
  }
]

const INCIDENTS_MOCK = [
  {
    id: 'inc1',
    date: '2025-10-20',
    type: 'LATE',
    severity: 'LOW',
    description: 'Trễ 10 phút do tắc đường',
    status: 'RESOLVED',
    action: 'Đã giải trình, lý do chính đáng'
  },
  {
    id: 'inc2',
    date: '2025-09-15',
    type: 'COMPLAINT',
    severity: 'MEDIUM',
    description: 'Khách hàng phàn nàn thái độ',
    status: 'RESOLVED',
    action: 'Đã coaching, cam kết cải thiện'
  }
]

const ASSETS_MOCK = {
  equipment: [
    { name: 'Điện thoại công ty', code: 'IP-078', status: 'GOOD', assignedDate: '2023-03-20' },
    { name: 'Thẻ từ', code: 'CARD-092', status: 'GOOD', assignedDate: '2023-03-20' },
    { name: 'Đồng phục', code: 'UNI-045', status: 'GOOD', assignedDate: '2023-03-20' }
  ],
  documents: [
    { name: 'CCCD', number: '079203001234', expiryDate: '2033-03-15', status: 'VALID' },
    { name: 'Bằng lái xe', number: 'B2-012345', expiryDate: '2028-05-20', status: 'VALID' },
    { name: 'Hợp đồng lao động', number: 'HĐLĐ-2023-045', expiryDate: '2025-03-20', status: 'EXPIRING' }
  ]
}

const StaffDetailModal = ({ staff, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [staffData, setStaffData] = useState(STAFF_DETAIL_MOCK)
  const [stats, setStats] = useState(STATS_MOCK)

  useEffect(() => {
    // TODO: Fetch staff detail from API
    // For now, use mock data
    if (staff) {
      setStaffData({ ...STAFF_DETAIL_MOCK, ...staff })
    }
  }, [staff])

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000 / 60) // minutes
    
    if (diff < 1) return 'Vừa xong'
    if (diff < 60) return `${diff} phút trước`
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`
    return `${Math.floor(diff / 1440)} ngày trước`
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { label: 'Đang làm việc', class: 'status-active' },
      'OFF': { label: 'Nghỉ phép', class: 'status-off' },
      'BUSY': { label: 'Bận', class: 'status-busy' }
    }
    const s = statusMap[status] || statusMap['ACTIVE']
    return <span className={`staff-status-badge ${s.class}`}>{s.label}</span>
  }

  const getTaskStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ thực hiện', class: 'task-pending' },
      'DOING': { label: 'Đang thực hiện', class: 'task-doing' },
      'DONE': { label: 'Hoàn tất', class: 'task-done' },
      'FAILED': { label: 'Thất bại', class: 'task-failed' }
    }
    const s = statusMap[status] || statusMap['PENDING']
    return <span className={`task-status-badge ${s.class}`}>{s.label}</span>
  }

  const renderOverview = () => (
    <div className="tab-content overview-tab">
      {/* Header Info */}
      <div className="staff-header-info">
        <div className="staff-avatar-large">
          {staffData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="staff-header-details">
          <h2>{staffData.name}</h2>
          <div className="staff-meta">
            <span className="staff-code">{staffData.code}</span>
            <span className="staff-role">{staffData.roleLabel}</span>
            {getStatusBadge(staffData.status)}
          </div>
          <div className="staff-last-active">
            <i className="fas fa-clock"></i>
            Last active: {getTimeAgo(staffData.lastActive)}
          </div>
        </div>
      </div>

      {/* Station Info */}
      <div className="staff-station-box">
        <div className="station-info">
          <i className="fas fa-map-marker-alt"></i>
          <div>
            <strong>{staffData.station.name}</strong>
            <span>Khu vực: {staffData.station.area}</span>
          </div>
        </div>
        <button className="btn-transfer-station">
          <i className="fas fa-exchange-alt"></i>
          Chuyển trạm
        </button>
      </div>

      {/* KPI Mini */}
      <div className="kpi-mini-grid">
        <div className="kpi-mini-card">
          <div className="kpi-mini-value">{stats.delivered}</div>
          <div className="kpi-mini-label">Giao/nhận</div>
        </div>
        <div className="kpi-mini-card">
          <div className="kpi-mini-value">
            <i className="fas fa-star" style={{ color: '#f59e0b' }}></i>
            {staffData.rating}
          </div>
          <div className="kpi-mini-label">Đánh giá</div>
        </div>
        <div className="kpi-mini-card">
          <div className="kpi-mini-value">{stats.onTimeRate}%</div>
          <div className="kpi-mini-label">Đúng giờ</div>
        </div>
        <div className="kpi-mini-card">
          <div className="kpi-mini-value">{stats.csat}%</div>
          <div className="kpi-mini-label">Hài lòng</div>
        </div>
        <div className="kpi-mini-card">
          <div className="kpi-mini-value">{stats.lateShifts}</div>
          <div className="kpi-mini-label">Ca muộn</div>
        </div>
        <div className="kpi-mini-card">
          <div className="kpi-mini-value">{stats.incidents}</div>
          <div className="kpi-mini-label">Sự cố</div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="trend-section">
        <h4>Xu hướng 7 ngày (giao/nhận mỗi ngày)</h4>
        <div className="sparkline">
          {stats.trend.map((value, index) => {
            const maxValue = Math.max(...stats.trend)
            const height = (value / maxValue) * 100
            return (
              <div key={index} className="sparkline-bar-container">
                <div 
                  className="sparkline-bar"
                  style={{ height: `${height}%` }}
                  title={`${value} giao/nhận`}
                ></div>
                <div className="sparkline-value">{value}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact Info */}
      <div className="contact-info">
        <h4>Thông tin liên hệ</h4>
        <div className="contact-items">
          <div className="contact-item">
            <i className="fas fa-phone"></i>
            <span>{staffData.phone}</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <span>{staffData.email}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h4>Hành động nhanh</h4>
        <div className="quick-actions-grid">
          <button className="quick-action-btn">
            <i className="fas fa-calendar-alt"></i>
            Phân ca
          </button>
          <button className="quick-action-btn">
            <i className="fas fa-exchange-alt"></i>
            Chuyển trạm
          </button>
          <button className="quick-action-btn">
            <i className="fas fa-eye-slash"></i>
            Tạm ẩn
          </button>
          <button className="quick-action-btn">
            <i className="fas fa-exclamation-triangle"></i>
            Báo cáo sự cố
          </button>
        </div>
      </div>
    </div>
  )

  const renderToday = () => (
    <div className="tab-content today-tab">
      <div className="tab-header">
        <h3>Công việc hôm nay</h3>
        <button className="btn-primary-small">
          <i className="fas fa-plus"></i>
          Giao thêm việc
        </button>
      </div>

      <div className="tasks-timeline">
        {TODAY_TASKS.map((task) => (
          <div key={task.id} className={`task-card ${task.status.toLowerCase()}`}>
            <div className="task-status-indicator"></div>
            <div className="task-content">
              <div className="task-header">
                <span className="task-order">{task.orderId}</span>
                {getTaskStatusBadge(task.status)}
                <span className="task-time">{task.eta}</span>
              </div>
              
              <div className="task-details">
                <div className="task-type">
                  <i className={`fas fa-${task.type === 'PICKUP' ? 'arrow-up' : 'arrow-down'}`}></i>
                  {task.type === 'PICKUP' ? 'Giao xe' : 'Nhận xe'}
                </div>
                <div className="task-vehicle">{task.vehicleModel}</div>
              </div>

              <div className="task-location">
                <i className="fas fa-map-marker-alt"></i>
                {task.stationFrom}
                {task.stationTo && (
                  <>
                    <i className="fas fa-arrow-right"></i>
                    {task.stationTo}
                  </>
                )}
              </div>

              <div className="task-customer">
                <i className="fas fa-user"></i>
                {task.customerName}
              </div>

              <div className="task-sla">
                <i className="fas fa-clock"></i>
                SLA: {task.slaMins} phút
              </div>
            </div>

            <div className="task-actions">
              <button className="btn-task-action">
                <i className="fas fa-check"></i>
              </button>
              <button className="btn-task-action">
                <i className="fas fa-user-friends"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderHistory = () => (
    <div className="tab-content history-tab">
      <div className="tab-header">
        <h3>Lịch sử giao/nhận</h3>
        <div className="history-filters">
          <select>
            <option value="">Tất cả sự kiện</option>
            <option value="PICKUP">Giao xe</option>
            <option value="RETURN">Nhận xe</option>
            <option value="TRANSFER">Chuyển trạm</option>
            <option value="MAINTENANCE">Bảo trì</option>
          </select>
          <input type="date" />
        </div>
      </div>

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Sự kiện</th>
              <th>Xe</th>
              <th>Trạm</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY_MOCK.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.time).toLocaleString('vi-VN')}</td>
                <td>
                  <span className={`event-type event-${item.type.toLowerCase()}`}>
                    {item.type === 'PICKUP' && 'Giao xe'}
                    {item.type === 'RETURN' && 'Nhận xe'}
                    {item.type === 'TRANSFER' && 'Chuyển trạm'}
                    {item.type === 'MAINTENANCE' && 'Bảo trì'}
                  </span>
                </td>
                <td>
                  <div className="vehicle-info">
                    <strong>{item.vehicleCode}</strong>
                    <span>{item.vehicleModel}</span>
                  </div>
                </td>
                <td>{item.station}</td>
                <td className="note-cell">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderPerformance = () => {
    const maxJobs = Math.max(...PERFORMANCE_MOCK.weekly.map(w => w.jobs))
    const maxLateReason = Math.max(...PERFORMANCE_MOCK.lateReasons.map(r => r.count))

    return (
      <div className="tab-content performance-tab">
        <h3>Hiệu suất làm việc</h3>

        {/* Monthly KPIs */}
        <div className="performance-kpis">
          <div className="perf-kpi-card">
            <div className="perf-kpi-value">{PERFORMANCE_MOCK.monthly.totalJobs}</div>
            <div className="perf-kpi-label">Tổng giao/nhận</div>
          </div>
          <div className="perf-kpi-card">
            <div className="perf-kpi-value">{PERFORMANCE_MOCK.monthly.onTimeRate}%</div>
            <div className="perf-kpi-label">Đúng giờ</div>
            <div className="perf-kpi-compare">
              +{PERFORMANCE_MOCK.monthly.onTimeRate - PERFORMANCE_MOCK.teamAverage.onTimeRate}% so với TB
            </div>
          </div>
          <div className="perf-kpi-card">
            <div className="perf-kpi-value">{PERFORMANCE_MOCK.monthly.completionRate}%</div>
            <div className="perf-kpi-label">Hoàn thành</div>
          </div>
          <div className="perf-kpi-card">
            <div className="perf-kpi-value">{PERFORMANCE_MOCK.monthly.csat}%</div>
            <div className="perf-kpi-label">CSAT</div>
            <div className="perf-kpi-compare">
              +{PERFORMANCE_MOCK.monthly.csat - PERFORMANCE_MOCK.teamAverage.csat}% so với TB
            </div>
          </div>
          <div className="perf-kpi-card">
            <div className="perf-kpi-value">{PERFORMANCE_MOCK.monthly.avgResponseTime}p</div>
            <div className="perf-kpi-label">Thời gian phản hồi TB</div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="performance-chart-section">
          <h4>Biểu đồ theo tuần</h4>
          <div className="weekly-chart">
            {PERFORMANCE_MOCK.weekly.map((week, index) => (
              <div key={index} className="weekly-bar-group">
                <div className="weekly-bars">
                  <div 
                    className="weekly-bar jobs"
                    style={{ height: `${(week.jobs / maxJobs) * 100}%` }}
                    title={`${week.jobs} công việc`}
                  >
                    <span className="bar-value">{week.jobs}</span>
                  </div>
                  <div 
                    className="weekly-bar ontime"
                    style={{ height: `${week.onTimeRate}%` }}
                    title={`${week.onTimeRate}% đúng giờ`}
                  >
                    <span className="bar-value">{week.onTimeRate}%</span>
                  </div>
                </div>
                <div className="weekly-label">{week.week}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span><i className="legend-dot jobs"></i> Số công việc</span>
            <span><i className="legend-dot ontime"></i> % Đúng giờ</span>
          </div>
        </div>

        {/* Late Reasons */}
        <div className="late-reasons-section">
          <h4>Nguyên nhân trễ</h4>
          <div className="late-reasons-chart">
            {PERFORMANCE_MOCK.lateReasons.map((reason, index) => (
              <div key={index} className="late-reason-item">
                <div className="late-reason-label">{reason.reason}</div>
                <div className="late-reason-bar-container">
                  <div 
                    className="late-reason-bar"
                    style={{ width: `${(reason.count / maxLateReason) * 100}%` }}
                  ></div>
                </div>
                <div className="late-reason-count">{reason.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderSchedule = () => (
    <div className="tab-content schedule-tab">
      <div className="tab-header">
        <h3>Ca làm & Khả dụng</h3>
        <div className="schedule-actions">
          <button className="btn-toggle-available">
            <i className="fas fa-toggle-on"></i>
            Khả dụng hôm nay
          </button>
          <button className="btn-primary-small">
            <i className="fas fa-calendar-plus"></i>
            Thêm ca
          </button>
        </div>
      </div>

      <div className="schedule-week">
        {SCHEDULE_MOCK.map((day, index) => (
          <div key={index} className={`schedule-day ${day.status.toLowerCase()}`}>
            <div className="schedule-day-header">
              <strong>{day.day}</strong>
              <span>{day.date}</span>
            </div>
            <div className="schedule-shift">
              {day.shift === 'MORNING' && (
                <>
                  <i className="fas fa-sun"></i>
                  <span>Ca sáng</span>
                  <span className="shift-time">6:00 - 14:00</span>
                </>
              )}
              {day.shift === 'AFTERNOON' && (
                <>
                  <i className="fas fa-cloud-sun"></i>
                  <span>Ca chiều</span>
                  <span className="shift-time">14:00 - 22:00</span>
                </>
              )}
              {day.shift === 'NIGHT' && (
                <>
                  <i className="fas fa-moon"></i>
                  <span>Ca đêm</span>
                  <span className="shift-time">22:00 - 6:00</span>
                </>
              )}
              {day.shift === 'OFF' && (
                <>
                  <i className="fas fa-bed"></i>
                  <span>Nghỉ</span>
                </>
              )}
            </div>
            {day.status === 'CURRENT' && (
              <div className="current-indicator">Đang diễn ra</div>
            )}
          </div>
        ))}
      </div>

      <div className="schedule-notes">
        <h4>Ghi chú</h4>
        <ul>
          <li><i className="fas fa-info-circle"></i> Tổng ca tháng này: 22/24</li>
          <li><i className="fas fa-clock"></i> Tổng giờ làm: 176h</li>
          <li><i className="fas fa-exclamation-triangle"></i> Số ca muộn: 2</li>
        </ul>
      </div>
    </div>
  )

  const renderFeedback = () => (
    <div className="tab-content feedback-tab">
      <div className="tab-header">
        <h3>Đánh giá & Phản hồi</h3>
        <div className="feedback-actions">
          <button className="btn-primary-small">
            <i className="fas fa-user-plus"></i>
            Tạo phiên coaching
          </button>
          <button className="btn-primary-small">
            <i className="fas fa-trophy"></i>
            Gửi khen thưởng
          </button>
        </div>
      </div>

      <div className="feedback-summary">
        <div className="feedback-rating">
          <div className="rating-large">
            <i className="fas fa-star"></i>
            {staffData.rating}
          </div>
          <div className="rating-label">Đánh giá trung bình</div>
          <div className="rating-count">{FEEDBACK_MOCK.length} đánh giá tháng này</div>
        </div>
      </div>

      <div className="feedback-list">
        {FEEDBACK_MOCK.map((feedback) => (
          <div key={feedback.id} className="feedback-card">
            <div className="feedback-header">
              <div className="feedback-customer">
                <div className="customer-avatar-small">
                  {feedback.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <strong>{feedback.customerName}</strong>
                  <span className="feedback-order">{feedback.orderId}</span>
                </div>
              </div>
              <div className="feedback-rating-stars">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`fas fa-star ${i < feedback.rating ? 'filled' : ''}`}
                  ></i>
                ))}
              </div>
            </div>
            <div className="feedback-comment">{feedback.comment}</div>
            <div className="feedback-date">
              <i className="fas fa-clock"></i>
              {feedback.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderIncidents = () => (
    <div className="tab-content incidents-tab">
      <div className="tab-header">
        <h3>Sự cố & Kỷ luật</h3>
        <button className="btn-primary-small">
          <i className="fas fa-plus"></i>
          Tạo báo cáo sự cố
        </button>
      </div>

      {INCIDENTS_MOCK.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-check-circle"></i>
          <p>Không có sự cố nào được ghi nhận</p>
        </div>
      ) : (
        <div className="incidents-list">
          {INCIDENTS_MOCK.map((incident) => (
            <div key={incident.id} className="incident-card">
              <div className="incident-header">
                <span className={`incident-severity severity-${incident.severity.toLowerCase()}`}>
                  {incident.severity === 'LOW' && 'Thấp'}
                  {incident.severity === 'MEDIUM' && 'Trung bình'}
                  {incident.severity === 'HIGH' && 'Cao'}
                </span>
                <span className={`incident-status status-${incident.status.toLowerCase()}`}>
                  {incident.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đang xử lý'}
                </span>
                <span className="incident-date">{incident.date}</span>
              </div>
              <div className="incident-type">
                <strong>
                  {incident.type === 'LATE' && '🕐 Trễ giờ'}
                  {incident.type === 'COMPLAINT' && '💬 Khiếu nại'}
                  {incident.type === 'DAMAGE' && '🔧 Hư hỏng'}
                </strong>
              </div>
              <div className="incident-description">{incident.description}</div>
              <div className="incident-action">
                <strong>Hành động:</strong> {incident.action}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAssets = () => (
    <div className="tab-content assets-tab">
      <h3>Thiết bị & Giấy tờ</h3>

      {/* Equipment */}
      <div className="assets-section">
        <h4>Thiết bị được cấp</h4>
        <div className="assets-list">
          {ASSETS_MOCK.equipment.map((item, index) => (
            <div key={index} className="asset-item">
              <i className="fas fa-mobile-alt"></i>
              <div className="asset-info">
                <strong>{item.name}</strong>
                <span>Mã: {item.code}</span>
                <span>Cấp ngày: {item.assignedDate}</span>
              </div>
              <span className={`asset-status status-${item.status.toLowerCase()}`}>
                {item.status === 'GOOD' && 'Tốt'}
                {item.status === 'DAMAGED' && 'Hỏng'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="assets-section">
        <h4>Giấy tờ</h4>
        <div className="documents-list">
          {ASSETS_MOCK.documents.map((doc, index) => (
            <div key={index} className="document-item">
              <i className="fas fa-id-card"></i>
              <div className="document-info">
                <strong>{doc.name}</strong>
                <span>Số: {doc.number}</span>
                <span>Hết hạn: {doc.expiryDate}</span>
              </div>
              <span className={`document-status status-${doc.status.toLowerCase()}`}>
                {doc.status === 'VALID' && '✓ Hợp lệ'}
                {doc.status === 'EXPIRING' && '⚠ Sắp hết hạn'}
                {doc.status === 'EXPIRED' && '✗ Hết hạn'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (!staff) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="staff-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Chi tiết nhân viên</h2>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-user"></i>
            Tổng quan
          </button>
          <button 
            className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            <i className="fas fa-tasks"></i>
            Hôm nay
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history"></i>
            Lịch sử
          </button>
          <button 
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <i className="fas fa-chart-line"></i>
            Hiệu suất
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <i className="fas fa-calendar-alt"></i>
            Ca làm
          </button>
          <button 
            className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <i className="fas fa-star"></i>
            Đánh giá
          </button>
          <button 
            className={`tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <i className="fas fa-exclamation-triangle"></i>
            Sự cố
          </button>
          <button 
            className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            <i className="fas fa-briefcase"></i>
            Thiết bị
          </button>
        </div>

        {/* Tabs Content */}
        <div className="modal-body">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'today' && renderToday()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'performance' && renderPerformance()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'feedback' && renderFeedback()}
          {activeTab === 'incidents' && renderIncidents()}
          {activeTab === 'assets' && renderAssets()}
        </div>
      </div>
    </div>
  )
}

export default StaffDetailModal

