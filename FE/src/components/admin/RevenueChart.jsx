import { useEffect, useRef, useState } from 'react'
import useRevenueSeries from '../../pages/admin/hooks/useRevenueSeries'
import {
  Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Filler, Tooltip, Legend,
} from 'chart.js'
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Filler, Tooltip, Legend)

const mapRange = { '7d':7, '30d':30, '90d':90, '1y':365 }

export default function RevenueChart(){
  const [range, setRange] = useState('7d')
  const { data, loading, error, refetch } = useRevenueSeries({ period: mapRange[range] })
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  // Check if backend API exists
  useEffect(() => {
    if (error) {
      const errorMsg = error?.message || String(error)
      if (errorMsg.includes('404') || errorMsg.includes('500') || errorMsg.includes('Network Error')) {
        console.warn('⚠️ [RevenueChart] Backend API chưa có: /admin/overview/revenue-series')
      }
    }
  }, [error])

  useEffect(() => {
    if (!data || !Array.isArray(data.labels) || !Array.isArray(data.values)) return
    const el = canvasRef.current
    if (!el) return

    try { chartRef.current?.destroy() } catch {}
    chartRef.current = new Chart(el, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Doanh thu (₫)',
          data: data.values,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed?.y ?? ctx.parsed ?? 0
                return ' Doanh thu: ' + new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(v || 0))
              }
            }
          }
        },
        scales: {
          x: { 
            grid: { display: false },
            ticks: {
              font: {
                size: 11
              },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9',
              drawBorder: false
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#64748b',
              padding: 8,
              callback: (value) => {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M'
                }
                if (value >= 1000) {
                  return (value / 1000).toFixed(0) + 'K'
                }
                return value
              }
            }
          }
        }
      }
    })

    return () => { try { chartRef.current?.destroy() } catch {} ; chartRef.current = null }
  }, [data?.labels, data?.values])

  if (loading) {
    return (
      <div className="stat-card revenue-chart-card">
        <div className="chart-header">
          <div className="chart-title-wrapper">
            <h3 className="chart-title">
              <div className="chart-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              Biểu đồ doanh thu
            </h3>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          ⏳ Đang tải biểu đồ...
        </div>
      </div>
    )
  }
  
  // If backend API not ready, hide component
  if (error) {
    const errorMsg = error?.message || String(error)
    const isBackendNotReady = errorMsg.includes('404') || errorMsg.includes('500') || errorMsg.includes('Network Error')
    if (isBackendNotReady) return null
    return (
      <div className="stat-card revenue-chart-card">
        <div className="chart-header">
          <div className="chart-title-wrapper">
            <h3 className="chart-title">
              <div className="chart-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              Biểu đồ doanh thu
            </h3>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <button onClick={refetch} className="admin-btn admin-btn-primary">Thử lại</button>
        </div>
      </div>
    )
  }
  
  // Only treat as no-data when there are no labels at all.
  if (!data?.labels || !data.labels.length) {
    return (
      <div className="stat-card revenue-chart-card">
        <div className="chart-header">
          <div className="chart-title-wrapper">
            <h3 className="chart-title">
              <div className="chart-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              Biểu đồ doanh thu
            </h3>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          Không có dữ liệu
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card revenue-chart-card">
      {/* Header with Time Range Tabs */}
      <div className="chart-header">
        <div className="chart-title-wrapper">
          <h3 className="chart-title">
            <div className="chart-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            Biểu đồ doanh thu
          </h3>
        </div>
        <div className="chart-tabs">
          {Object.keys(mapRange).map(r => (
            <button 
              key={r} 
              className={`chart-tab ${r === range ? 'active' : ''}`} 
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart Canvas */}
      <div className="chart-canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
