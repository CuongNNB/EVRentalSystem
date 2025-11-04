import React from 'react';
import PropTypes from 'prop-types';
import './StaffOverview.css';

function Card({ title, value, emoji = '📊', gradient }) {
  return (
    <div className="staff-stat-card">
      <div className="kpi-card__header">
        <div className="kpi-card__icon" style={{ background: gradient }}>{emoji}</div>
        <div className="kpi-card__content">
          <div className="kpi-card__label">{title}</div>
          <div className="kpi-card__value">{value}</div>
        </div>
      </div>
    </div>
  );
}

Card.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  emoji: PropTypes.string,
  gradient: PropTypes.string,
};

export default function StaffOverview({
  vehicleDetailsCount = 0,
  availableCount = 0,
  rentedCount = 0,
  incidentCount = 0,
  title = 'Tổng quan',
  className = '',
}) {
  return (
    <div className={`orders-card orders-card--narrow staff-overview-card ${className}`}>
      <div className="orders-card__header">
        <h2>{title}</h2>
        <div />
      </div>
      <div className="orders-card__body">
        <section className="staff-kpi-grid">
          <Card title="Xe tại điểm" value={vehicleDetailsCount} emoji="🚗" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" />
          <Card title="Xe sẵn sàng" value={availableCount} emoji="✅" gradient="linear-gradient(135deg,#10b981,#059669)" />
          <Card title="Xe đang cho thuê" value={rentedCount} emoji="🔑" gradient="linear-gradient(135deg,#3b82f6,#2563eb)" />
          <Card title="Xe sự cố" value={incidentCount} emoji="⚠️" gradient="linear-gradient(135deg,#ef4444,#dc2626)" />
        </section>
      </div>
    </div>
  );
}

StaffOverview.propTypes = {
  vehicleDetailsCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  availableCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rentedCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  incidentCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  className: PropTypes.string,
};
