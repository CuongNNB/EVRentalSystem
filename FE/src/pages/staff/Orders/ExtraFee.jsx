
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
    { value: "over_mileage", label: "Phí vượt quãng đường", enumValue: "Over_Mileage_Fee" },
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
    odometer: "", // For Over_Mileage_Fee
    batteryLevel: "", // For Fuel_Fee
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
        return fees.every((item) => {
            if (!item.type || !item.description.trim()) return false;

            // Special validation for Over_Mileage_Fee
            if (item.type === "over_mileage") {
                return item.odometer && Number(item.odometer) > 0;
            }

            // Special validation for Fuel_Fee
            if (item.type === "fuel") {
                return item.batteryLevel && Number(item.batteryLevel) >= 0;
            }

            // Special validation for Late_Return_Fee - no amount needed
            if (item.type === "late") {
                return true; // Only description is required, which is already checked above
            }

            return item.amount && Number(item.amount) > 0;
        });
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
            // 1. Tạo các additional fee - track từng kết quả riêng biệt
            console.log(`🔄 Đang tạo ${fees.length} phí phát sinh...`, fees);

            const feeResults = await Promise.allSettled(
                fees.map(async (fee, index) => {
                    // Chuẩn hóa tham số theo loại phí
                    let amount = fee.amount;
                    if (fee.type === "over_mileage") {
                        amount = fee.odometer; // BE tự tính dựa trên km
                    } else if (fee.type === "fuel") {
                        amount = fee.batteryLevel; // BE tự tính dựa trên % pin
                    }

                    // Dựng query theo yêu cầu BE
                    const params = new URLSearchParams();
                    params.set("bookingId", orderId);
                    params.set("feeName", mapTypeToEnum(fee.type));
                    // Lưu ý: với Late_Return_Fee không gửi amount (BE tự tính) → bỏ qua param này
                    if (fee.type !== "late") {
                        params.set("amount", String(amount ?? ""));
                    }
                    params.set("desc", fee.description);

                    console.log(`📤 Gửi phí #${index + 1}:`, {
                        type: fee.type,
                        feeName: mapTypeToEnum(fee.type),
                        amount: fee.type !== "late" ? amount : undefined,
                        desc: fee.description
                    });

                    return api.post(`/api/additional-fee/create?${params.toString()}`);
                })
            );

            // Kiểm tra kết quả
            const successCount = feeResults.filter(r => r.status === 'fulfilled').length;
            const failedCount = feeResults.filter(r => r.status === 'rejected').length;

            console.log(`✅ Thành công: ${successCount}/${fees.length} phí`);
            console.log(`❌ Thất bại: ${failedCount}/${fees.length} phí`);

            // Log chi tiết các fee thất bại
            feeResults.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`❌ Phí #${index + 1} thất bại:`, result.reason?.response?.data || result.reason);
                }
            });

            if (failedCount > 0) {
                const failedIndexes = feeResults
                    .map((r, i) => r.status === 'rejected' ? i + 1 : null)
                    .filter(i => i !== null);

                setSubmitting(false);
                setToast({
                    type: "error",
                    message: `Không thể tạo ${failedCount}/${fees.length} phí phát sinh (phí số ${failedIndexes.join(', ')}). Một số phí có thể không đạt điều kiện (vd: chưa vượt quãng đường, pin không giảm).`,
                });
                return;
            }

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

                                    {/* Special fields for Over_Mileage_Fee */}
                                    {fee.type === "over_mileage" && (
                                        <label className="extra-fee__field">
                                            <span>Số km hiện tại *</span>
                                            <input
                                                type="number"
                                                placeholder="Nhập số km hiện tại của xe..."
                                                value={fee.odometer}
                                                onChange={(event) =>
                                                    handleChange(index, "odometer", event.target.value)
                                                }
                                                required
                                            />
                                        </label>
                                    )}

                                    {/* Special fields for Fuel_Fee */}
                                    {fee.type === "fuel" && (
                                        <label className="extra-fee__field">
                                            <span>Mức pin hiện tại (%) *</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="Nhập mức pin hiện tại..."
                                                value={fee.batteryLevel}
                                                onChange={(event) =>
                                                    handleChange(index, "batteryLevel", event.target.value)
                                                }
                                                required
                                            />
                                        </label>
                                    )}

                                    {/* Special fields for Late_Return_Fee */}
                                    {fee.type === "late" && (
                                        <div className="extra-fee__info">
                                            <p>💡 Phí trả xe trễ sẽ được tính tự động dựa trên thời gian trễ và chính sách của hệ thống.</p>
                                        </div>
                                    )}

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

                                    {/* Only show amount field for non-special fee types */}
                                    {fee.type !== "over_mileage" && fee.type !== "fuel" && fee.type !== "late" && (
                                        <label className="extra-fee__field extra-fee__field--inline">
                                            <div>
                                                <span>Phí phát sinh *</span>
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
                                    )}

                                    {/* Show calculated fee info for special types */}
                                    {fee.type === "over_mileage" && (
                                        <div className="extra-fee__info">
                                            <p>💡 Phí vượt quãng đường sẽ được tính tự động dựa trên số km và thời gian thuê xe.</p>
                                        </div>
                                    )}

                                    {fee.type === "fuel" && (
                                        <div className="extra-fee__info">
                                            <p>💡 Phí nhiên liệu sẽ được tính tự động dựa trên mức pin hiện tại và dung lượng pin xe.</p>
                                        </div>
                                    )}
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


