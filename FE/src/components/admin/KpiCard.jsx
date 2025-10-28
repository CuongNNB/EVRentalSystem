/**
 * KpiCard Component
 * 
 * NOTE: Component hiển thị KPI card với icon đẹp, gradient background
 * @param {string} title - Tiêu đề KPI
 * @param {string|number} value - Giá trị hiển thị
 * @param {string} sub - Text phụ (delta, comparison)
 * @param {string} icon - Icon emoji hoặc FontAwesome class
 * @param {string} gradient - CSS gradient cho icon background
 */

import React from 'react'

export default function KpiCard({ title, value, sub, icon = '📊', gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }) {
  return (
    <div className="stat-card kpi-card">
      <div className="kpi-card__header">
        <div 
          className="kpi-card__icon" 
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <div className="kpi-card__content">
          <div className="kpi-card__label">{title}</div>
          <div className="kpi-card__value">{value ?? '--'}</div>
          {sub ? <div className="kpi-card__subtext">{sub}</div> : null}
        </div>
      </div>
    </div>
  )
}
