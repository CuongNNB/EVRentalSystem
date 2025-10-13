
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import api from "../../../utils/api";
import "../StaffLayout.css";
import "./ExtraFee.css";

const FEE_TYPES = [
  { value: "", label: "-- Chọn loại phí --" },
  { value: "damage", label: "Phí hư hỏng", enumValue: "Damage_Fee" },
  { value: "late", label: "Phí trả xe trễ", enumValue: "Late_Return_Fee" },
  { value: "cleaning", label: "Phí vệ sinh", enumValue: "Cleaning_Fee" },
  { value: "fuel", label: "Phí nhiên liệu", enumValue: "Fuel_Fee" },
  { value: "other", label: "Chi phí khác", enumValue: "Other_Fee" },
];

// Map type to enum value
const mapTypeToEnum = (type) => {
  const feeType = FEE_TYPES.find(ft => ft.value === type);
  return feeType?.enumValue || "Other_Fee";
};

const DEFAULT_ITEM = {
  type: "",
  description: "",
  amount: "0",
};

const formatCurrency = (value) => {
  if (!value) return "0";
  return new Intl.NumberFormat("vi-VN").format(Number(value));
};

const ExtraFee = () => {
  const navigate = useNavigate();
  const { orderId = "EV0001" } = useParams();
  const [fees, setFees] = useState([{ ...DEFAULT_ITEM }]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const totalAmount = useMemo(
    () =>
      fees.reduce((sum, fee) => {
        const amount = Number(fee.amount);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [fees]
  );

  const handleChange = (index, key, value) => {
    setFees((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [key]: key === "amount" ? value.replace(/[^\d]/g, "") : value,
            }
          : item
      )
    );
  };

  const handleAddFee = () => {
    setFees((prev) => [...prev, { ...DEFAULT_ITEM }]);
  };

  const handleRemoveFee = (index) => {
    setFees((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validateFees = () => {
    if (!fees.length) return false;
    return fees.every(
      (item) => item.type && item.description.trim() && item.amount
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateFees()) {
      setToast({
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin cho từng chi phí phát sinh.",
      });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Tạo các additional fee
      const feePromises = fees.map(fee => {
        const params = new URLSearchParams({
          bookingId: orderId,
          feeName: mapTypeToEnum(fee.type),
          amount: fee.amount,
          desc: fee.description
        });
        
        return api.post(`/api/additional-fee/create?${params.toString()}`);
      });

      await Promise.all(feePromises);

      // 2. Cập nhật trạng thái đơn hàng sang "Completed"
      await api.put(`/api/bookings/${orderId}/status`, null, {
        params: { status: "Completed" },
      });

      setSubmitting(false);
      setToast({
        type: "success",
        message: "Đã gửi chi phí phát sinh cho khách hàng và hoàn thành đơn hàng.",
      });

      setTimeout(() => {
        navigate("/staff/orders", { replace: true });
      }, 1600);
    } catch (error) {
      console.error("Error creating additional fees or updating status:", error);
      setSubmitting(false);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Không thể lưu chi phí phát sinh. Vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="staff-shell staff-shell--orders">
      {toast && (
        <div className={`extra-fee-toast extra-fee-toast--${toast.type}`}>
          <span className="extra-fee-toast__icon" aria-hidden="true">
            {toast.type === "success" ? "✅" : "⚠️"}
          </span>
          <div>
            <p className="extra-fee-toast__title">Thông báo</p>
            <p className="extra-fee-toast__message">{toast.message}</p>
          </div>
        </div>
      )}
      <StaffHeader />
      <div className="staff-layout staff-layout--orders">
        <StaffSlideBar activeKey="orders" />
        <main className="staff-main">
          <section className="extra-fee">
            <header className="extra-fee__heading">
              <p className="extra-fee__eyebrow">Quản lý nhận xe #{orderId}</p>
              <h1>Chi phí phát sinh khi thuê xe</h1>
              <p>
                Kiểm tra và ghi nhận các khoản chi phí phát sinh trong quá trình
                bàn giao xe trả.
              </p>
            </header>

            <form className="extra-fee__form" onSubmit={handleSubmit}>
              {fees.map((fee, index) => (
                <section key={`extra-fee-${index}`} className="extra-fee__card">
                  <header className="extra-fee__card-header">
                    <h2>Chi phí phát sinh #{index + 1}</h2>
                    {fees.length > 1 && (
                      <button
                        type="button"
                        className="extra-fee__remove"
                        onClick={() => handleRemoveFee(index)}
                      >
                        ✕
                        <span className="sr-only">Xóa chi phí</span>
                      </button>
                    )}
                  </header>

                  <label className="extra-fee__field">
                    <span>Loại phí phát sinh *</span>
                    <select
                      value={fee.type}
                      onChange={(event) =>
                        handleChange(index, "type", event.target.value)
                      }
                      required
                    >
                      {FEE_TYPES.map((type) => (
                        <option key={type.value || "default"} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="extra-fee__field">
                    <span>Nội dung chi tiết *</span>
                    <textarea
                      rows={3}
                      placeholder="Vui lòng nhập nội dung chi tiết..."
                      value={fee.description}
                      onChange={(event) =>
                        handleChange(index, "description", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label className="extra-fee__field extra-fee__field--inline">
                    <div>
                      <span>Phí phát *</span>
                      <div className="extra-fee__input">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={fee.amount}
                          onChange={(event) =>
                            handleChange(index, "amount", event.target.value)
                          }
                          required
                        />
                        <span className="extra-fee__input-suffix">VNĐ</span>
                      </div>
                    </div>
                  </label>
                </section>
              ))}

              <div className="extra-fee__actions">
                <button
                  type="button"
                  className="extra-fee__add"
                  onClick={handleAddFee}
                >
                  <span aria-hidden="true">＋</span> Thêm phí phát sinh
                </button>
              </div>

              <footer className="extra-fee__summary">
                <div>
                  <p>Tổng phí phát sinh</p>
                  <h3>{formatCurrency(totalAmount)} VNĐ</h3>
                </div>
                <button
                  type="submit"
                  className="extra-fee__submit"
                  disabled={submitting}
                >
                  {submitting ? "Đang gửi..." : "Gửi cho khách"}
                </button>
              </footer>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ExtraFee;


