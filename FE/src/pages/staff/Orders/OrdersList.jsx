import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import "../StaffLayout.css";
import "./Orders.css";

const ICONS = {
  check: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13.5l4.5 4.5L19 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16.5 13.5c-1.2 1.2-1.2 3 0 4.2l1.6 1.6c.6.6.6 1.6 0 2.2-.6.6-1.6.6-2.2 0-6-6-8.4-8.4-12.4-14.4-.6-.6-.6-1.6 0-2.2.6-.6 1.6-.6 2.2 0l1.6 1.6c1.2 1.2 3 1.2 4.2 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 2.75h7.4L18 6.85v14.4a.8.8 0 0 1-.8.8H6.5a.8.8 0 0 1-.8-.8V3.55a.8.8 0 0 1 .8-.8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.4 2.75V6.2a.8.8 0 0 0 .8.8h3.45"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 12.25h6.5M8.75 16.25h6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 15.5h18l-1.2-4.5a2 2 0 0 0-1.9-1.5H6.1a2 2 0 0 0-1.9 1.5L3 15.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 19.5a1.5 1.5 0 1 1-3 0v-4h18v4a1.5 1.5 0 1 1-3 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 19.5a1.5 1.5 0 1 0-3 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.5 19.5a1.5 1.5 0 1 0-3 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="9.5"
        cy="8.5"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M13.5 11.5l6 6v2h-2.5l-1.5-1.5-1.5 1.5-2-2 1.5-1.5-2-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  cancel: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3 2.75 19.5a1 1 0 0 0 .87 1.5h16.76a1 1 0 0 0 .87-1.5L12 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 10v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  ),
  invoice: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3h10a1 1 0 0 1 1 1v16l-3-1.6-3 1.6-3-1.6-3 1.6V4a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 7h4M10 11h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  money: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 9v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const ACTION_LIBRARY = {
  confirm: { icon: "check", variant: "success", label: "Xác nhận" },
  view: { icon: "eye", variant: "view", label: "Xem chi tiết" },
  call: {
    icon: "phone",
    variant: "call",
    label: "Liên hệ khách hàng",
    emoji: "📞",
  },
  contract: { icon: "document", variant: "contract", label: "Hợp đồng" },
  vehicle: { icon: "car", variant: "vehicle", label: "Chuẩn bị xe" },
  key: { icon: "key", variant: "key", label: "Bàn giao xe", emoji: "🔑" },
  cancel: { icon: "cancel", variant: "danger", label: "Hủy đơn" },
  remind: { icon: "alert", variant: "alert", label: "Nhắc khách hàng" },
  invoice: { icon: "invoice", variant: "invoice", label: "Kiểm tra xe" },
  revenue: { icon: "money", variant: "revenue", label: "Tính phí", emoji: "💰" },
};

const HANDOVER_ORDERS = [
  {
    id: "EV0205010",
    customer: { name: "Nguyễn Văn A", phone: "0912 345 678" },
    car: "VinFast VF 3",
    pickup: { date: "30/09/2025", time: "11:00" },
    dropoff: { date: "01/10/2025", time: "18:00" },
    status: { label: "Chờ xác thực", variant: "warning" },
    total: "1,000,000đ",
    actions: ["view", "confirm"],
  },
  {
    id: "EV0205009",
    customer: { name: "Trần Thị B", phone: "0987 654 321" },
    car: "VinFast VF 5",
    pickup: { date: "30/09/2025", time: "12:00" },
    dropoff: { date: "02/10/2025", time: "20:00" },
    status: { label: "Chờ ký hợp đồng", variant: "warning" },
    total: "1,200,000đ",
    actions: ["view", "contract"],
  },
  {
    id: "EV0205008",
    customer: { name: "Lê Văn C", phone: "0909 123 456" },
    car: "VinFast VF 8",
    pickup: { date: "29/09/2025", time: "09:00" },
    dropoff: { date: "30/09/2025", time: "17:00" },
    status: { label: "Chờ nhận xe", variant: "warning" },
    total: "1,500,000đ",
    actions: ["view", "vehicle"],
  },
  {
    id: "EV0205007",
    customer: { name: "Phạm Minh D", phone: "0933 777 888" },
    car: "VinFast VF 5",
    pickup: { date: "30/09/2025", time: "10:00" },
    dropoff: { date: "01/10/2025", time: "16:00" },
    status: { label: "Đã kiểm tra xe", variant: "success" },
    total: "950,000đ",
    actions: ["view", "key"],
  },
  {
    id: "EV0205006",
    customer: { name: "Hoàng Thế E", phone: "0901 234 567" },
    car: "VinFast VF 3",
    pickup: { date: "30/09/2025", time: "11:00" },
    dropoff: { date: "01/10/2025", time: "19:00" },
    status: { label: "Quá hạn nhận xe", variant: "danger" },
    total: "800,000đ",
    actions: ["view", "cancel"],
  },
];

const RECEIVED_ORDERS = [
  {
    id: "EV0205015",
    customer: { name: "Lê Văn F", phone: "0945 123 789" },
    car: "VinFast VF 8",
    pickup: { date: "29/09/2025", time: "18:00" },
    dropoff: { date: "30/09/2025", time: "18:00" },
    status: { label: "Đang thuê", variant: "success" },
    total: "1,500,000đ",
    actions: ["view", "confirm"],
  },
  {
    id: "EV0205014",
    customer: { name: "Võ Thị G", phone: "0778 888 899" },
    car: "VinFast VF 3",
    pickup: { date: "30/09/2025", time: "10:00" },
    dropoff: { date: "01/10/2025", time: "20:00" },
    status: { label: "Đã kiểm tra xe", variant: "info" },
    total: "900,000đ",
    actions: ["view", "invoice"],
  },
  {
    id: "EV0205023",
    customer: { name: "Đặng Minh H", phone: "0908 777 111" },
    car: "VinFast VF 5",
    pickup: { date: "29/09/2025", time: "07:00" },
    dropoff: { date: "30/09/2025", time: "20:00" },
    status: { label: "Tính phí phát sinh", variant: "warning" },
    total: "1,200,000đ",
    actions: ["view", "revenue"],
  },
  {
    id: "EV0205012",
    customer: { name: "Bùi Thanh I", phone: "0822 333 444" },
    car: "VinFast VF 3",
    pickup: { date: "30/09/2025", time: "12:00" },
    dropoff: { date: "30/09/2025", time: "19:00" },
    status: { label: "Hoàn thành", variant: "success-muted" },
    total: "850,000đ",
    actions: ["view", "confirm"],
  },
  {
    id: "EV0205011",
    customer: { name: "Nguyễn Thế K", phone: "0678 901 234" },
    car: "VinFast VF 8",
    pickup: { date: "28/09/2025", time: "09:00" },
    dropoff: { date: "30/09/2025", time: "17:00" },
    status: { label: "Quá hạn trả xe", variant: "danger" },
    total: "2,000,000đ",
    actions: ["view", "call"],
  },
];

const OrdersList = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const resolveStatus = (orderId, fallbackStatus) => {
    if (typeof window === "undefined") return fallbackStatus;

    const stored = window.sessionStorage.getItem(
      `handover-status-${orderId}`
    );

    if (!stored) return fallbackStatus;

    try {
      const parsed = JSON.parse(stored);
      return {
        ...fallbackStatus,
        ...parsed,
      };
    } catch (error) {
      console.warn("Failed to parse stored status", error);
      return fallbackStatus;
    }
  };

  const handleAction = (order, actionKey) => {
    if (actionKey === "view") {
      navigate(`/staff/orders/${order.id}`);
      return;
    }
    if (actionKey === "vehicle") {
      navigate(`/staff/orders/${order.id}/handover`);
      return;
    }
    if (actionKey === "key") {
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            `handover-status-${order.id}`,
            JSON.stringify({
              label: "Đã kiểm tra xe",
              variant: "success",
            })
          );
        } catch (error) {
          console.warn("Failed to persist delivery status", error);
        }
      }

      setToast({
        message: "Đã kiểm tra xe trước khi bàn giao cho khách.",
        type: "success",
      });
      return;
    }
    if (actionKey === "invoice") {
      navigate(`/staff/orders/${order.id}/handover/check`);
      return;
    }
    if (actionKey === "revenue") {
      navigate(`/staff/orders/${order.id}/extra-fee`);
    }
  };

  const renderActionButton = (order, actionKey, idx) => {
    const action = ACTION_LIBRARY[actionKey];
    if (!action) return null;
    const iconMarkup = action.emoji ? (
      <span className="orders-action__emoji" aria-hidden="true">
        {action.emoji}
      </span>
    ) : (
      ICONS[action.icon]
    );

    return (
      <button
        key={`${order.id}-${actionKey}-${idx}`}
        type="button"
        className={`orders-action orders-action--${action.variant}`}
        title={action.label}
        onClick={() => handleAction(order, actionKey)}
      >
        <span className="orders-action__icon">{iconMarkup}</span>
      </button>
    );
  };

  const renderOrders = (orders) =>
    orders.map((order) => {
      const currentStatus = resolveStatus(order.id, order.status);

      return (
        <tr key={order.id}>
          <td className="orders-table__order">
            <span className="orders-table__order-code">{order.id}</span>
          </td>
          <td>
            <span className="orders-table__customer">{order.customer.name}</span>
            <span className="orders-table__muted">{order.customer.phone}</span>
          </td>
          <td>{order.car}</td>
          <td>
            <span className="orders-table__date">{order.pickup.date}</span>
            <span className="orders-table__muted">{order.pickup.time}</span>
          </td>
          <td>
            <span className="orders-table__date">{order.dropoff.date}</span>
            <span className="orders-table__muted">{order.dropoff.time}</span>
          </td>
          <td>
            <span
              className={`status-badge status-badge--${currentStatus.variant}`}
            >
              {currentStatus.label}
            </span>
          </td>
          <td className="orders-table__money">{order.total}</td>
          <td>
            <div className="orders-table__actions">
              {order.actions?.map((action, index) =>
                renderActionButton(order, action, index)
              )}
            </div>
          </td>
        </tr>
      );
    });

  return (
    <div className="staff-shell staff-shell--orders">
      {toast && (
        <div className={`staff-toast staff-toast--${toast.type}`} role="status">
          <span className="staff-toast__icon" aria-hidden="true">
            ✅
          </span>
          <div className="staff-toast__body">
            <p className="staff-toast__title">Thông báo</p>
            <p className="staff-toast__message">{toast.message}</p>
          </div>
        </div>
      )}
      <StaffHeader />
      <div className="staff-layout staff-layout--orders">
        <StaffSlideBar activeKey="orders" />

        <main className="staff-main">
          <section className="staff-content staff-orders">
          <header className="staff-orders__heading">
            <div>
              <p className="staff-content__eyebrow">Đơn hàng</p>
              <h1>Quản lý Đơn hàng</h1>
              <p className="staff-content__intro">
                Thống kê tổng quan và quản lý đơn thuê xe điện.
              </p>
            </div>

            <div className="staff-orders__filters">
              <div className="staff-orders__field">
                <span className="staff-orders__field-icon" aria-hidden="true">
                  🔍
                </span>
                <input
                  type="search"
                  placeholder="Tìm kiếm mã đơn, khách hàng, biển số xe..."
                />
              </div>
              <select defaultValue="">
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="active">Đang thuê</option>
                <option value="completed">Hoàn thành</option>
                <option value="overdue">Quá hạn</option>
              </select>
              <select defaultValue="">
                <option value="">Ngày thuê: Tất cả</option>
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày gần nhất</option>
                <option value="month">30 ngày gần nhất</option>
              </select>
              <button type="button" className="staff-orders__export">
                Tìm kiếm 🔍
              </button>
            </div>
          </header>

          <section className="orders-board">
            <article className="orders-card">
              <header className="orders-card__header">
                <h2>Đơn hàng bàn giao</h2>
                <span className="orders-card__count">
                  {HANDOVER_ORDERS.length} đơn
                </span>
              </header>
              <div className="orders-table__scroll">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Xe</th>
                      <th>Ngày thuê</th>
                      <th>Ngày trả</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>{renderOrders(HANDOVER_ORDERS)}</tbody>
                </table>
              </div>
            </article>

            <article className="orders-card">
              <header className="orders-card__header">
                <h2>Đơn hàng nhận xe</h2>
                <span className="orders-card__count">
                  {RECEIVED_ORDERS.length} đơn
                </span>
              </header>
              <div className="orders-table__scroll">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Xe</th>
                      <th>Ngày thuê</th>
                      <th>Ngày trả</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>{renderOrders(RECEIVED_ORDERS)}</tbody>
                </table>
              </div>
            </article>
          </section>
        </section>
      </main>
    </div>
  </div>
  );
};

export default OrdersList;
