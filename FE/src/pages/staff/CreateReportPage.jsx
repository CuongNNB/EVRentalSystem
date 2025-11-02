import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/staff/StaffHeader';
import StaffSlideBar from '../../components/staff/StaffSlideBar';
import CreateReportForm from '../../components/staff/CreateReportForm';

export default function CreateReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location?.state || {};
  const vehicleDetailId = state.vehicleDetailId || '';
  const headerNote = state.plate || state.id ? `Xe ${state.plate || state.id}` : '';

  return (
    <div className="staff-shell">
      <StaffHeader />
      <div className="staff-layout">
        <StaffSlideBar activeKey="reports" />
        <main className="staff-main">
          <section className="staff-content">
            <div className="staff-content__heading" style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:12}}>
              <div>
                <p className="staff-content__eyebrow">Báo cáo</p>
                <h1 style={{marginBottom:8}}>Tạo báo cáo sự cố {headerNote && <span style={{color:'#64748b', fontSize:14}}>({headerNote})</span>}</h1>
              </div>
              <button onClick={() => navigate(-1)} className="staff-table__cta">Quay lại</button>
            </div>

            <div className="orders-card">
              <div className="orders-card__header">
                <h2>Thông tin báo cáo</h2>
                <div />
              </div>
              <div className="orders-card__body">
                <CreateReportForm defaultVehicleDetailId={vehicleDetailId} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
