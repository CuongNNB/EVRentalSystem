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
    <button className="admin-btn admin-btn-success" onClick={() => onExport('xlsx')}>
      <i className="fas fa-file-excel"></i>
      <span>Xuất Excel</span>
    </button>
  )
}
