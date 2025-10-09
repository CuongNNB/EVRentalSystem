import React from "react";
import StaffSlideBar from "../../components/staff/StaffSlideBar";
import StaffHeader from "../../components/staff/StaffHeader";
import DataTable from "../../components/staff/DataTable";
import "./StaffLayout.css";

const OVERVIEW_CARDS = [
  {
    key: "orders-today",
    title: "Đơn hàng hôm nay",
    value: "24",
    trend: { label: "↑ 12% so với hôm qua", variant: "positive" },
    icon: "🗓️",
    accent: "green",
  },
  {
    key: "cars-renting",
    title: "Xe đang cho thuê",
    value: "18",
    trend: { label: "75% năng suất", variant: "warning" },
    icon: "🚗",
    accent: "yellow",
  },
  {
    key: "cars-ready",
    title: "Xe sẵn sàng",
    value: "6",
    trend: { label: "25% xe trống", variant: "info" },
    icon: "✅",
    accent: "cyan",
  },
  {
    key: "revenue-today",
    title: "Doanh thu hôm nay",
    value: "45M",
    trend: { label: "↓ 8% so với hôm qua", variant: "negative" },
    icon: "🔥",
    accent: "red",
  },
];

const RECENT_ORDERS = [
  {
    id: "EV0205010",
    customer: "Nguyễn Văn A",
    car: "VinFast VF 3",
    rentDate: "30/09/2025",
    status: { label: "Đang thuê", variant: "success" },
    total: "1,000,000đ",
  },
  {
    id: "EV0205009",
    customer: "Trần Thị B",
    car: "VinFast VF 5",
    rentDate: "30/09/2025",
    status: { label: "Chờ xử lý", variant: "warning" },
    total: "1,200,000đ",
  },
  {
    id: "EV0205008",
    customer: "Lê Văn C",
    car: "VinFast VF 8",
    rentDate: "29/09/2025",
    status: { label: "Hoàn thành", variant: "success-muted" },
    total: "1,500,000đ",
  },
];

const StaffLayout = () => {
  return (
    <div className="staff-shell">
      <StaffHeader />
      <div className="staff-layout">
        <StaffSlideBar activeKey="overview" />

        <main className="staff-main">
          <section className="staff-content">
            <div className="staff-content__heading">
              <p className="staff-content__eyebrow">Tổng quan</p>
              <h1>Thống kê tổng quan hệ thống thuê xe</h1>
              <p className="staff-content__intro">
                Cập nhật nhanh các chỉ số vận hành và hiệu suất trong ngày hôm nay.
              </p>
            </div>

            <section className="staff-overview">
              {OVERVIEW_CARDS.map((card) => (
                <article
                  key={card.key}
                  className={`staff-card staff-card--${card.accent}`}
                >
                  <div className="staff-card__info">
                    <h3>{card.title}</h3>
                    <p className="staff-card__value">{card.value}</p>
                    <span
                      className={`staff-card__trend staff-card__trend--${card.trend.variant}`}
                    >
                      {card.trend.label}
                    </span>
                  </div>
                  <div className="staff-card__icon" aria-hidden="true">
                    {card.icon}
                  </div>
                </article>
              ))}
            </section>

            <section className="staff-table">
              <div className="staff-table__header">
                <div>
                  <h2>Đơn hàng gần đây</h2>
                  <p>Theo dõi trạng thái và doanh thu từng đơn hàng phát sinh.</p>
                </div>
                <button type="button" className="staff-table__cta">
                  Xem tất cả →
                </button>
              </div>
              <DataTable rows={RECENT_ORDERS} />
            </section>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
