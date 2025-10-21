import React, { useEffect, useRef, useState } from 'react'
import './AdminDashboard.css'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

// register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
)

function formatVND(value) {
  if (value == null) return '--'
  if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace('.', ',') + ' tỷ ₫'
  if (value >= 1000000) return (value / 1000000).toFixed(0) + ' triệu ₫'
  return value.toLocaleString('vi-VN') + ' ₫'
}

const AdminDashboard = () => {
  const canvasRef = useRef(null)
  const [chart, setChart] = useState(null)
  const [chartTotal, setChartTotal] = useState('--')

  // load admin user name
  const [displayName, setDisplayName] = useState('Admin')
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ev_user')
      if (raw) {
        const u = JSON.parse(raw)
        setDisplayName(u.fullName || u.username || u.name || 'Admin')
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // date/time reactive
  const [nowText, setNowText] = useState({ date: '', time: '' })
  useEffect(() => {
    function update() {
      const now = new Date()
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const timeOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }
      setNowText({ date: now.toLocaleDateString('vi-VN', dateOptions), time: now.toLocaleTimeString('vi-VN', timeOptions) + ' ICT' })
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // initial labels & data
    const labels = (() => {
      const arr = []
      const now = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        arr.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }))
      }
      return arr
    })()
    const data = Array.from({ length: labels.length }, () => Math.floor(Math.random() * (6000000 - 2000000) + 2000000))

    const gradient = ctx.createLinearGradient(0, 0, 0, 320)
    gradient.addColorStop(0, 'rgba(11, 185, 127, 0.3)')
    gradient.addColorStop(1, 'rgba(11, 185, 127, 0.02)')

    const cfg = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Doanh thu',
            data,
            backgroundColor: gradient,
            borderColor: '#0bb97f',
            pointBackgroundColor: '#fff',
            pointBorderColor: '#0bb97f',
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBorderWidth: 2,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            borderColor: '#0bb97f',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return 'Doanh thu: ' + formatVND(context.parsed.y)
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748b' } },
          y: { beginAtZero: true, ticks: { callback: (v) => formatVND(Number(v)), color: '#64748b' }, grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false } },
        },
      },
    }

    let myChart
    try {
      myChart = new Chart(ctx, cfg)
      setChart(myChart)
      setChartTotal(formatVND(myChart.data.datasets[0].data.reduce((a, b) => a + b, 0)))
    } catch (e) {
      console.error('Chart init failed', e)
    }

    // simulate small live updates
    const interval = setInterval(() => {
      try {
        const ds = myChart.data.datasets[0].data
        const last = ds[ds.length - 1]
        const delta = Math.round((Math.random() - 0.5) * 300000)
        ds[ds.length - 1] = Math.max(0, last + delta)
        myChart.update('none')
        setChartTotal(formatVND(myChart.data.datasets[0].data.reduce((a, b) => a + b, 0)))
      } catch (e) { /* ignore */ }
    }, 30000)

    return () => {
      clearInterval(interval)
      if (myChart) myChart.destroy()
    }
  }, [])

  // sample static activity + metrics for UI
  const activities = [
    { icon: 'fa-car', title: 'Xe VF001 được thuê bởi Nguyễn Văn A', time: '5 phút trước' },
    { icon: 'fa-credit-card', title: 'Thanh toán 450.000 ₫ đã hoàn tất', time: '12 phút trước' },
    { icon: 'fa-tools', title: 'Xe HV123 được đưa vào bảo dưỡng', time: '1 giờ trước' },
    { icon: 'fa-exclamation-triangle', title: 'Pin xe VF045 xuống dưới 20%', time: '2 giờ trước' },
    { icon: 'fa-car-side', title: 'Xe VF200 được trả muộn 30 phút', time: '3 giờ trước' },
  ]

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="logo">
          <h1>
            <i className="fas fa-bolt" />
            <span className="logo-text">EV-Rental Admin</span>
          </h1>
        </div>
        <nav>
          <div className="nav-item active"><i className="fas fa-chart-pie" /> Tổng quan</div>
          <div className="nav-item"><i className="fas fa-car" /> Quản lý xe</div>
          <div className="nav-item"><i className="fas fa-map-marker-alt" /> Quản lý điểm thuê</div>
          <div className="nav-item"><i className="fas fa-users" /> Quản lý khách hàng</div>
          <div className="nav-item"><i className="fas fa-user-tie" /> Quản lý nhân viên</div>
          <div className="nav-item"><i className="fas fa-cog" /> Cài đặt</div>

          <div className="nav-section">
            <div className="nav-section-title">Analytics</div>
            <div className="nav-item"><i className="fas fa-chart-bar" /> Báo cáo doanh thu</div>
            <div className="nav-item"><i className="fas fa-chart-line" /> Thống kê sử dụng</div>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="welcome-section">
            <div className="breadcrumb"><i className="fas fa-home" /> <span>Dashboard</span></div>
            <h1 className="welcome-title">Xin chào, {displayName}!</h1>
            <p className="welcome-subtitle">Chào mừng bạn đến với EV Rental Dashboard</p>
          </div>
          <div className="header-right">
            <div className="date-time">
              <div className="current-date">{nowText.date}</div>
              <div className="current-time">{nowText.time}</div>
            </div>
            <div className="admin-avatar" title={displayName} aria-hidden>
              {displayName.split(' ').map(s => s[0]).slice(0,2).join('')}
            </div>
          </div>
        </header>

        <div className="quick-actions">
          <button className="quick-btn"><i className="fas fa-plus-circle" /> Thêm xe mới</button>
          <button className="quick-btn"><i className="fas fa-user-plus" /> Đăng ký KH</button>
          <button className="quick-btn"><i className="fas fa-map-marker-alt" /> Thêm điểm thuê</button>
          <button className="quick-btn"><i className="fas fa-file-export" /> Xuất báo cáo</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-content">
                <div className="stat-label">Tổng doanh thu</div>
                <div className="stat-value">2,8 tỷ ₫</div>
                <div className="stat-subtext">Tháng này</div>
                <div className="stat-trend"><i className="fas fa-arrow-up" /> +18,5% so với tháng trước</div>
              </div>
              <div className="stat-icon"><i className="fas fa-chart-line" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-content">
                <div className="stat-label">Lượt thuê hôm nay</div>
                <div className="stat-value">1.247</div>
                <div className="stat-subtext">Tổng số lượt</div>
                <div className="stat-trend"><i className="fas fa-arrow-up" /> +24,3% so với hôm qua</div>
              </div>
              <div className="stat-icon"><i className="fas fa-car" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-content">
                <div className="stat-label">Tổng số xe</div>
                <div className="stat-value">156</div>
                <div className="stat-subtext">139 hoạt động · 17 bảo trì</div>
                <div className="stat-trend"><i className="fas fa-arrow-up" /> +12 xe mới tháng này</div>
              </div>
              <div className="stat-icon"><i className="fas fa-car-side" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-content">
                <div className="stat-label">Khách hàng</div>
                <div className="stat-value">2.847</div>
                <div className="stat-subtext">+184 KH mới tháng này</div>
                <div className="stat-trend"><i className="fas fa-arrow-up" /> +12,5% so với tháng trước</div>
              </div>
              <div className="stat-icon"><i className="fas fa-users" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-content">
                <div className="stat-label">Tỷ lệ sử dụng xe</div>
                <div className="stat-value">89%</div>
                <div className="stat-subtext">139/156 xe đang hoạt động</div>
                <div className="stat-trend"><i className="fas fa-arrow-up" /> +5,2% so với tháng trước</div>
              </div>
              <div className="stat-icon"><i className="fas fa-percentage" /></div>
            </div>
            <div className="progress"><div className="bar" style={{width:'89%'}} /></div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title"><span className="live-indicator" /> Doanh thu theo thời gian</h3>
              <div className="chart-filters">
                <button className="filter-btn active" data-period="7">7 ngày</button>
                <button className="filter-btn" data-period="30">30 ngày</button>
                <button className="filter-btn" data-period="90">90 ngày</button>
                <button className="filter-btn" data-period="365">1 năm</button>
              </div>
            </div>
            <div className="chart-area"><canvas id="revenueChart" ref={canvasRef} aria-label="Biểu đồ doanh thu theo thời gian" role="img" /></div>
            <div className="chart-footer">
              <div className="chart-total">Tổng: <strong id="chartTotal">{chartTotal}</strong></div>
              <button className="download-btn" onClick={() => {
                const link = document.createElement('a');
                link.download = `doanh-thu-${new Date().toLocaleDateString('vi-VN').replace(/\//g,'-')}.png`;
                link.href = document.getElementById('revenueChart').toDataURL('image/png',1.0);
                link.click();
              }}><i className="fas fa-download" /> Xuất ảnh</button>
            </div>
          </div>

          <div className="activity-feed">
            <div className="activity-header">
              <h3 className="activity-title">Hoạt động gần đây</h3>
              <a href="#" className="view-all-btn">Xem tất cả</a>
            </div>
            <div className="activity-list">
              {activities.map((a, idx) => (
                <div className="activity-item" key={idx}>
                  <div className={`activity-icon ${idx===0? 'rental' : idx===1? 'payment' : idx===2? 'maintenance' : idx===3? 'alert' : 'rental'}`}>
                    <i className={`fas ${a.icon}`} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">{a.title}</div>
                    <div className="activity-meta"><div className="activity-time"><i className="far fa-clock" /> {a.time}</div><span>·</span><a href="#" className="activity-link">Chi tiết</a></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:24, marginBottom:24}}>
          <div className="metrics-grid">
            <div className="metric-card"><div className="metric-icon"><i className="fas fa-wallet" /></div><div className="metric-value">2,8 tỷ ₫</div><div className="metric-label">Doanh thu tháng</div><div className="metric-change change-positive"><i className="fas fa-arrow-up" /> <span>+18,5%</span></div></div>
            <div className="metric-card"><div className="metric-icon"><i className="fas fa-battery-full" /></div><div className="metric-value">89%</div><div className="metric-label">Tỷ lệ sử dụng</div><div className="metric-change change-positive"><i className="fas fa-arrow-up" /> <span>+5,2%</span></div></div>
          </div>

          <div className="notifications-panel">
            <h4>Thông báo nhanh</h4>
            <div className="notification-item"><div className="notification-icon info"><i className="fas fa-info" /></div><div className="notification-content"><div className="notification-title">Bảo trì định kỳ</div><div className="notification-desc">Nhắc: Lịch bảo trì cho 10 xe vào tuần tới.</div></div></div>
            <div className="notification-item"><div className="notification-icon success"><i className="fas fa-check" /></div><div className="notification-content"><div className="notification-title">Sao lưu dữ liệu</div><div className="notification-desc">Sao lưu đã hoàn thành lúc 03:00 sáng.</div></div></div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
