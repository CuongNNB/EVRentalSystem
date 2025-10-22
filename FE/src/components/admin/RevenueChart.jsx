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

  useEffect(() => {
    if (!data || !Array.isArray(data.labels) || !Array.isArray(data.values)) return
    const el = canvasRef.current
    if (!el) return

    try { chartRef.current?.destroy() } catch {}
    chartRef.current = new Chart(el, {
      type: 'line',
      data: { labels: data.labels, datasets: [{ label: 'Revenue', data: data.values, fill: true, tension: 0.3, pointRadius: 3 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }
    })

    return () => { try { chartRef.current?.destroy() } catch {} ; chartRef.current = null }
  }, [data?.labels, data?.values])

  if (loading) return <div className="skeleton chart">Loading chart…</div>
  if (error) return <button onClick={refetch}>Retry chart</button>
  if (!data?.labels?.length) return <div className="empty">No data</div>

  return (
    <div className="card h-80">
      <div className="tabs">
        {Object.keys(mapRange).map(r => <button key={r} className={r===range ? 'active': ''} onClick={() => setRange(r)}>{r}</button>)}
      </div>
      <div className="h-64"><canvas ref={canvasRef} /></div>
    </div>
  )
}
