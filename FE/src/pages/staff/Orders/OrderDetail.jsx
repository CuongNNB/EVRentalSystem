import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import "../StaffLayout.css";
import "./OrderDetail.css";

const ORDER_DETAILS = {
  EV0205010: {
    code: "EV0205010",
    renter: {
      name: "Nguyễn Văn A",
      phone: "0909 042 421",
      email: "nguyenvana@gmail.com",
      verifyStatus: { label: "Đợi xác minh", variant: "warning" },
      documents: [
        { label: "Giấy phép lái xe", sides: ["Mặt trước", "Mặt sau"] },
        { label: "Căn cước công dân", sides: ["Mặt trước", "Mặt sau"] },
      ],
    },
    order: {
      carName: "VinFast VF 3",
      plate: "59A-123456",
      chassis: "EV0205008",
      bookingTime: "12h00 29/09/2025 → 12h00 30/09/2025",
      pickupStation: "Trạm SXX-002",
      rentStatus: { label: "Chờ bàn giao", variant: "info" },
      summary: {
        rentDuration: "2 ngày",
        rentFee: "1,600,000đ",
        extraFee: "1,200,000đ",
        total: "2,800,000đ",
      },
    },
    inspection: {
      vin: "5YJ3E1EA7JF000999",
      color: "Xám xương rồng",
      rentDate: "12h00 29/09/2025 → 12h00 30/09/2025",
      mileage: "10,000km",
      fuel: "65%",
      exterior: [
        { label: "Trước xe", image: "🚗" },
        { label: "Sau xe", image: "🚗" },
        { label: "Mặt trái", image: "🚗" },
        { label: "Mặt phải", image: "🚗" },
      ],
      notes: [
        { label: "Tình trạng ngoại thất", placeholder: "Ghi chú tình trạng xe" },
        { label: "Tình trạng nội thất", placeholder: "Ghi chú tình trạng xe" },
        { label: "Tình trạng động cơ", placeholder: "Ghi chú tình trạng xe" },
      ],
    },
  },
};

const StatusBadge = ({ variant, children }) => (
  <span className={`order-detail__status order-detail__status--${variant}`}>
    {children}
  </span>
);

const OrderDetail = () => {
  const navigate = useNavigate();
  const { orderId = "EV0205010" } = useParams();
  const detail = ORDER_DETAILS[orderId] || ORDER_DETAILS.EV0205010;
  const [isConfirmed, setConfirmed] = React.useState(false);

  return (
    <div className="staff-shell staff-shell--orders">
      <StaffHeader />
      <div className="staff-layout staff-layout--orders">
        <StaffSlideBar activeKey="orders" />

        <main className="staff-main">
          <section className="order-detail">
            <header className="order-detail__top">
              <button
                type="button"
                className="order-detail__back"
                onClick={() => navigate(-1)}
            >
              ← Quay lại
            </button>
            <h1>
              Chi tiết đơn hàng{" "}
              <span className="order-detail__code">#{detail.code}</span>
            </h1>
          </header>

          <div className="order-detail__grid">
            <section className="order-card">
              <header className="order-card__header">
                <h2>Thông tin người thuê</h2>
                <StatusBadge variant={detail.renter.verifyStatus.variant}>
                  {detail.renter.verifyStatus.label}
                </StatusBadge>
              </header>

              <div className="order-card__body">
                <dl className="order-detail__info order-detail__info--columns">
                  <div>
                    <dt>Họ và tên</dt>
                    <dd>{detail.renter.name}</dd>
                  </div>
                  <div>
                    <dt>Số điện thoại</dt>
                    <dd>{detail.renter.phone}</dd>
                  </div>
                </dl>

                <div className="order-detail__email">
                  <dt>Email</dt>
                  <dd>{detail.renter.email}</dd>
                </div>

                <div className="order-detail__docs">
                  {detail.renter.documents.map((doc) => (
                    <div key={doc.label} className="order-detail__doc-group">
                      <p>{doc.label}</p>
                      <div className="order-detail__doc-sides">
                        {doc.sides.map((side) => (
                          <button
                            key={side}
                            type="button"
                            className="order-detail__doc-btn"
                          >
                            {side}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="order-card__footer">
                <button
                  type="button"
                  className={`order-detail__confirm${
                    isConfirmed ? " order-detail__confirm--done" : ""
                  }`}
                  onClick={() => setConfirmed(true)}
                >
                  {isConfirmed ? "Đã xác nhận" : "✓ Xác nhận"}
                </button>
              </footer>
            </section>

            <section className="order-card order-card--highlight">
              <header className="order-card__header">
                <h2>Thông tin đơn hàng</h2>
              </header>

              <div className="order-card__body order-card__body--split">
                <div className="order-detail__car-visual">🚗</div>
                <dl className="order-detail__info">
                  <div>
                    <dt>Tên/Mẫu xe</dt>
                    <dd>{detail.order.carName}</dd>
                  </div>
                  <div>
                    <dt>Biển số xe</dt>
                    <dd>{detail.order.plate}</dd>
                  </div>
                  <div>
                    <dt>Mã đơn thuê xe</dt>
                    <dd>{detail.order.chassis}</dd>
                  </div>
                  <div>
                    <dt>Thời gian thuê</dt>
                    <dd>{detail.order.bookingTime}</dd>
                  </div>
                  <div>
                    <dt>Trạm đón trả</dt>
                    <dd>{detail.order.pickupStation}</dd>
                  </div>
                  <div>
                    <dt>Trạng thái thuê</dt>
                    <dd>
                      <StatusBadge variant={detail.order.rentStatus.variant}>
                        {detail.order.rentStatus.label}
                      </StatusBadge>
                    </dd>
                  </div>
                </dl>
              </div>

              <footer className="order-card__footer order-detail__summary">
                <div>
                  <p>Thời gian thuê</p>
                  <h3>{detail.order.summary.rentDuration}</h3>
                </div>
                <div>
                  <p>Phí thuê xe</p>
                  <h3>{detail.order.summary.rentFee}</h3>
                </div>
                <div>
                  <p>Tiền cọc</p>
                  <h3>{detail.order.summary.extraFee}</h3>
                </div>
                <div className="order-detail__grand">
                  <p>Tổng cộng</p>
                  <h2>{detail.order.summary.total}</h2>
                </div>
               
              </footer>
            </section>
          </div>

          <section className="order-card order-card--wide">
            <header className="order-card__header">
              <h2>Tình trạng xe trước khi bàn giao</h2>
            </header>

            <div className="order-card__body order-detail__inspection">
              <dl className="order-detail__info order-detail__info--grid">
                <div>
                  <dt>Số khung</dt>
                  <dd>{detail.inspection.vin}</dd>
                </div>
                <div>
                  <dt>Màu xe</dt>
                  <dd>{detail.inspection.color}</dd>
                </div>
                <div>
                  <dt>Ngày thuê</dt>
                  <dd>{detail.inspection.rentDate}</dd>
                </div>
                <div>
                  <dt>Số kilô mét</dt>
                  <dd>{detail.inspection.mileage}</dd>
                </div>
                <div>
                  <dt>Tình trạng pin</dt>
                  <dd>{detail.inspection.fuel}</dd>
                </div>
              </dl>

              <div className="order-detail__gallery">
                {detail.inspection.exterior.map((item) => (
                  <figure key={item.label}>
                    <div className="order-detail__gallery-thumb">
                      <span aria-hidden="true">{item.image}</span>
                    </div>
                    <figcaption>{item.label}</figcaption>
                  </figure>
                ))}
              </div>

              <div className="order-detail__notes">
                {detail.inspection.notes.map((note) => (
                  <label key={note.label}>
                    <span>{note.label}</span>
                    <textarea
                      rows={2}
                      placeholder={note.placeholder}
                      defaultValue=""
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>
          </section>
        </main>
      </div>
    </div>
  );
};

export default OrderDetail;
