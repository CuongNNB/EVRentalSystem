import React from 'react'
import { exportOverview } from '../../api/adminDashboard'

export default function ExportButtons() {
  const onExport = async (format) => {
    try {
      const blob = await exportOverview({ format })
      const url = URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      const ts = new Date().toISOString().slice(0,10)
      a.href = url
      a.download = `EVR-Overview-${ts}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e?.message || 'Export failed')
    }
  }

  return (
    <div style={{marginTop:12}}>
      <button className="quick-btn" onClick={() => onExport('csv')} style={{marginRight:8}}>Xuất CSV</button>
      <button className="quick-btn" onClick={() => onExport('xlsx')}>Xuất XLSX</button>
    </div>
  )
}
