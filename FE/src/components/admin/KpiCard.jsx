import React from 'react'

export default function KpiCard({ title, value, sub }) {
  return (
    <div className="stat-card kpi-card">
      <div className="stat-header">
        <div className="stat-content">
          <div className="stat-label">{title}</div>
          <div className="stat-value">{value ?? '--'}</div>
          {sub ? <div className="stat-subtext">{sub}</div> : null}
        </div>
      </div>
    </div>
  )
}
