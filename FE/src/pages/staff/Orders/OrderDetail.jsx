import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import api from "../../../utils/api";
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
  const { orderId } = useParams();
  const [isConfirmed, setConfirmed] = useState(false);
  
  // State cho dữ liệu từ API
  const [renterDetails, setRenterDetails] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gọi API khi component mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Không tìm thấy mã đơn hàng");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Gọi song song 2 API
        const [renterResponse, bookingResponse] = await Promise.all([
          api.get(`/api/bookings/${orderId}/renter-details`, {
            params: { bookingId: orderId }
          }),
          api.get(`/api/bookings/${orderId}/booking-details`, {
            params: { bookingId: orderId }
          })
        ]);

        // Lấy dữ liệu từ response
        const renterData = renterResponse.data?.data || renterResponse.data;
        const bookingData = bookingResponse.data?.data || bookingResponse.data;

        setRenterDetails(renterData);
        setBookingDetails(bookingData);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          err.response?.data?.message || 
          err.message || 
          "Không thể tải thông tin đơn hàng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Helper functions để format dữ liệu
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "—";
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const statusMap = {
      Pending_Deposit_Confirmation: { label: "Chờ xác nhận đặt cọc", variant: "warning" },
      Pending_Contract_Signing: { label: "Chờ ký hợp đồng", variant: "warning" },
      Pending_Vehicle_Pickup: { label: "Chờ nhận xe", variant: "warning" },
      Vehicle_Inspected_Before_Pickup: { label: "Đã kiểm tra xe", variant: "info" },
      Currently_Renting: { label: "Đang thuê", variant: "success" },
      Vehicle_Returned: { label: "Đã trả xe", variant: "success" },
      Total_Fees_Charged: { label: "Tính phí bổ sung", variant: "warning" },
      Completed: { label: "Hoàn thành", variant: "success" },
    };
    return statusMap[status] || { label: status, variant: "default" };
  };

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
                <span className="order-detail__code">#{orderId || "N/A"}</span>
              </h1>
            </header>

            {/* Loading State */}
            {loading && (
              <div style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#f0f9ff",
                borderRadius: "12px",
                margin: "20px 0",
              }}>
                <p style={{ fontSize: "16px", color: "#0369a1" }}>
                  Đang tải thông tin đơn hàng...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div style={{
                padding: "20px",
                backgroundColor: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: "12px",
                margin: "20px 0",
                color: "#b91c1c",
              }}>
                <strong>Lỗi:</strong> {error}
              </div>
            )}

            {/* Content - chỉ hiển thị khi có dữ liệu */}
            {!loading && !error && renterDetails && bookingDetails && (
              <>
                <div className="order-detail__grid">
            <section className="order-card">
              <header className="order-card__header">
                <h2>Thông tin người thuê</h2>
                <StatusBadge variant="info">
                  Đã xác minh
                </StatusBadge>
              </header>

              <div className="order-card__body">
                <dl className="order-detail__info order-detail__info--columns">
                  <div>
                    <dt>Họ và tên</dt>
                    <dd>{renterDetails.fullName || "—"}</dd>
                  </div>
                  <div>
                    <dt>Số điện thoại</dt>
                    <dd>{renterDetails.phoneNumber || "—"}</dd>
                  </div>
                </dl>

                <div className="order-detail__email">
                  <dt>Email</dt>
                  <dd>{renterDetails.email || "—"}</dd>
                </div>

                <div className="order-detail__docs">
                  {/* Giấy phép lái xe */}
                  {renterDetails.gplx && (
                    <div className="order-detail__doc-group">
                      <p>Giấy phép lái xe</p>
                      <div className="order-detail__doc-sides">
                        <a
                          href={renterDetails.gplx}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="order-detail__doc-btn"
                        >
                          Xem ảnh
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Căn cước công dân */}
                  {(renterDetails.frontCccd || renterDetails.backCccd) && (
                    <div className="order-detail__doc-group">
                      <p>Căn cước công dân</p>
                      <div className="order-detail__doc-sides">
                        {renterDetails.frontCccd && (
                          <a
                            href={renterDetails.frontCccd}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="order-detail__doc-btn"
                          >
                            Mặt trước
                          </a>
                        )}
                        {renterDetails.backCccd && (
                          <a
                            href={renterDetails.backCccd}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="order-detail__doc-btn"
                          >
                            Mặt sau
                          </a>
                        )}
                      </div>
                    </div>
                  )}
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
                    <dd>{bookingDetails.modelName || "—"}</dd>
                  </div>
                  <div>
                    <dt>Biển số xe</dt>
                    <dd>{bookingDetails.licensePlate || "—"}</dd>
                  </div>
                  <div>
                    <dt>Mã đơn thuê xe</dt>
                    <dd>{bookingDetails.bookingId || "—"}</dd>
                  </div>
                  <div>
                    <dt>Thời gian thuê</dt>
                    <dd>
                      {formatDateTime(bookingDetails.startDate)} → {formatDateTime(bookingDetails.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt>Trạm đón trả</dt>
                    <dd>{bookingDetails.stationName || "—"}</dd>
                  </div>
                  <div>
                    <dt>Trạng thái thuê</dt>
                    <dd>
                      <StatusBadge variant={getStatusConfig(bookingDetails.status).variant}>
                        {getStatusConfig(bookingDetails.status).label}
                      </StatusBadge>
                    </dd>
                  </div>
                </dl>
              </div>

              <footer className="order-card__footer order-detail__summary">
                <div>
                  <p>Thời gian thuê</p>
                  <h3>{bookingDetails.rentingDurationDay} ngày</h3>
                </div>
                <div>
                  <p>Phí thuê xe</p>
                  <h3>{formatCurrency(bookingDetails.fee)}</h3>
                </div>
                <div>
                  <p>Tiền cọc</p>
                  <h3>{formatCurrency(bookingDetails.deposit)}</h3>
                </div>
                <div>
                  <p>Phí phát sinh</p>
                  <h3>{formatCurrency(bookingDetails.additionalFee)}</h3>
                </div>
                <div className="order-detail__grand">
                  <p>Tổng cộng</p>
                  <h2>{formatCurrency(bookingDetails.totalAmount)}</h2>
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
                  <dt>Biển số xe</dt>
                  <dd>{bookingDetails.licensePlate || "—"}</dd>
                </div>
                <div>
                  <dt>Mã đơn</dt>
                  <dd>{bookingDetails.bookingId || "—"}</dd>
                </div>
                <div>
                  <dt>Ngày bắt đầu thuê</dt>
                  <dd>{formatDateTime(bookingDetails.startDate)}</dd>
                </div>
                <div>
                  <dt>Ngày dự kiến trả</dt>
                  <dd>{formatDateTime(bookingDetails.endDate)}</dd>
                </div>
                <div>
                  <dt>Thời gian thuê</dt>
                  <dd>{bookingDetails.rentingDurationDay} ngày</dd>
                </div>
              </dl>

              <div className="order-detail__notes">
                <p style={{ 
                  padding: "16px", 
                  backgroundColor: "#f0f9ff", 
                  borderRadius: "8px",
                  color: "#0369a1",
                  textAlign: "center"
                }}>
                  Thông tin chi tiết về tình trạng xe sẽ được cập nhật khi kiểm tra xe.
                </p>
              </div>
            </div>
                </section>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default OrderDetail;
