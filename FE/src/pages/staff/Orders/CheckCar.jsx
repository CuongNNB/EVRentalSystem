import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import api from "../../../utils/api";
import {
  DEFAULT_INSPECTION_STATUS,
  ROW_INSPECTION_SLOTS,
  buildInspectionSlots,
  getInspectionPart,
} from "../../../utils/inspectionParts";
import "../StaffLayout.css";
import "./ReturnCar.css";

const CheckCar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId = "EV0205010" } = useParams();
  const [photos, setPhotos] = useState({});
  const [notification, setNotification] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [additionalRows, setAdditionalRows] = useState([]);

  const staffId = useMemo(() => {
    const state = location.state || {};
    const candidates = [
      state.staffId,
      state.order?.staffId,
      state.order?.staff?.id,
      state.order?.raw?.staffId,
      state.order?.raw?.staff?.id,
    ];
    if (typeof window !== "undefined") {
      try {
        const cachedUser = window.localStorage.getItem("ev_user");
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser);
          candidates.push(parsedUser?.id);
          candidates.push(parsedUser?.userId);
          candidates.push(parsedUser?.staffId);
        }
      } catch (storageError) {
        console.warn("Unable to read cached staff profile", storageError);
      }
    }
    for (const candidate of candidates) {
      if (candidate !== undefined && candidate !== null) {
        const normalized = Number(candidate);
        if (!Number.isNaN(normalized)) {
          return normalized;
        }
      }
    }
    return null;
  }, [location.state]);

  const photoSlots = useMemo(
    () => buildInspectionSlots(additionalRows),
    [additionalRows]
  );
  const allowedSlotIds = useMemo(() => new Set(photoSlots.map((slot) => slot.id)), [photoSlots]);
  const optionalRowSlots = useMemo(
    () => ROW_INSPECTION_SLOTS.filter((slot) => slot.id !== "row1"),
    []
  );
  const handleAddRow = (rowId) => {
    setAdditionalRows((prev) => (prev.includes(rowId) ? prev : [...prev, rowId]));
  };
  const remainingRowSlots = useMemo(
    () => optionalRowSlots.filter((slot) => !additionalRows.includes(slot.id)),
    [optionalRowSlots, additionalRows]
  );

  const bookingId = useMemo(() => {
    const state = location.state || {};
    const candidates = [
      state.bookingId,
      state.order?.id,
      state.order?.orderId,
      state.order?.raw?.id,
      state.order?.raw?.bookingId,
      state.order?.raw?.orderId,
      orderId,
    ];
    for (const candidate of candidates) {
      if (candidate !== undefined && candidate !== null) {
        const normalized = String(candidate).trim();
        if (normalized) return normalized;
      }
    }
    return "";
  }, [location.state, orderId]);

  const handleUpload = (event, slotId) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setPhotos((prev) => ({
      ...prev,
      [slotId]: {
        file,                // lưu file thật để gửi BE
        preview: reader.result, // base64 chỉ để hiển thị
      },
    }));
  };

  reader.readAsDataURL(file); // dùng cho preview thôi
};


  const handleSendToCustomer = async () => {
  if (isSending) return;
  setErrorMessage("");
  setNotification("");

  if (!bookingId) {
    setErrorMessage("Không tìm thấy mã đơn hàng để cập nhật trạng thái.");
    return;
  }

  if (!staffId) {
    setErrorMessage("Không tìm thấy mã nhân viên để tạo biên bản kiểm tra.");
    return;
  }

  const photoEntries = Object.entries(photos).filter(
    ([slotId, value]) => allowedSlotIds.has(slotId) && value?.file
  );

  setIsSending(true);

  try {
    for (const [slotId, data] of photoEntries) {
      const partName = getInspectionPart(slotId);
      if (!partName) continue;

      // 🔹 Dùng FormData thay vì JSON
      const formData = new FormData();
      formData.append("bookingId", bookingId);
      formData.append("partName", partName);
      formData.append("picture", data.file); // <--- Gửi file thật
      formData.append("staffId", staffId);
      formData.append("status", DEFAULT_INSPECTION_STATUS);

      await api.post("/api/inspections/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    // Gọi API cập nhật trạng thái booking
    await api.put(`/api/bookings/${encodeURIComponent(bookingId)}/status`, null, {
      params: { status: "Vehicle_Inspected_Before_Pickup" },
    });

    setNotification("Đã gửi biên bản kiểm tra cho khách hàng.");
    setTimeout(() => {
      navigate("/staff/orders", { replace: true });
    }, 1500);
  } catch (error) {
    console.warn("Unable to send inspections or update booking status", error);
    setErrorMessage("Không thể tạo biên bản kiểm tra hoặc cập nhật trạng thái. Vui lòng thử lại.");
    setIsSending(false);
  }
};


  return (
    <div className="staff-shell staff-shell--orders">
      <StaffHeader />
      <div className="staff-layout staff-layout--orders">
        <StaffSlideBar activeKey="orders" />
        <main className="staff-main">
          <section className="return-check">
            <header className="return-check__header">
              <h1>
                Quản lý bàn giao xe <span># {orderId}</span>
              </h1>
              <p>Kiểm tra xe trước khi giao</p>
            </header>

            {notification && (
              <div className="return-check__toast" role="status">
                <span className="return-check__toast-icon" aria-hidden="true">
                  ✅
                </span>
                <div>
                  <p className="return-check__toast-title">Đã gửi cho khách</p>
                  <p className="return-check__toast-message">{notification}</p>
                </div>
              </div>
            )}
            {errorMessage && (
              <div
                className="return-check__toast"
                role="alert"
                style={{ background: "rgba(248, 113, 113, 0.18)", color: "#b91c1c" }}
              >
                <span className="return-check__toast-icon" aria-hidden="true">
                  ⚠️
                </span>
                <div>
                  <p className="return-check__toast-title">Gửi thất bại</p>
                  <p className="return-check__toast-message">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="return-check__layout">
              <section className="return-check__panel">
                <header className="return-check__panel-header">
                  <h2>Thông tin kiểm tra</h2>
                  <p>Ghi nhận tình trạng xe trước khi bàn giao cho khách.</p>
                </header>

                <div className="return-check__grid">
                  <label>
                    <span>Tình trạng pin</span>
                    <textarea rows={2} placeholder="Ghi chú..." />
                  </label>
                  <label>
                    <span>Tình trạng động cơ</span>
                    <textarea rows={2} placeholder="Ghi chú..." />
                  </label>
                  <label className="return-check__full">
                    <span>Tình trạng ngoại thất</span>
                    <textarea rows={3} placeholder="Ghi chú..." />
                  </label>
                  <label className="return-check__full">
                    <span>Tình trạng nội thất</span>
                    <textarea rows={3} placeholder="Ghi chú..." />
                  </label>
                </div>
              </section>

              <section className="return-check__panel return-check__panel--gallery">
                <header className="return-check__panel-header">
                  <h2>Ảnh kiểm tra</h2>
                  <p>Tải lên hình ảnh minh chứng cho từng góc chụp.</p>
                </header>

                <div className="return-check__photos">
                  {photoSlots.map((slot) => (
                    <label key={slot.id} className="return-check__photo-slot">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleUpload(event, slot.id)}
                      />
                      <div className="return-check__photo-frame">
                        {photos[slot.id]?.preview ? (
                          <img
                            src={photos[slot.id].preview}
                            alt={slot.label}
                            className="return-check__photo-img"
                          />
                        ) : (
                          <span className="return-check__photo-placeholder" aria-hidden="true">
                            📷
                          </span>
                        )}
                      </div>
                      <p>{slot.label}</p>
                    </label>
                  ))}
                  {remainingRowSlots.map((slot) => (
                    <button
                      key={`add-${slot.id}`}
                      type="button"
                      className="return-check__photo-slot return-check__photo-slot--adder"
                      onClick={() => handleAddRow(slot.id)}
                      aria-label={`Thêm ${slot.label}`}
                    >
                      <div className="return-check__photo-frame return-check__photo-frame--adder">
                        <span className="return-check__photo-add" aria-hidden="true">
                          +
                        </span>
                      </div>
                      <p>Thêm {slot.label}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <footer className="return-check__actions">
              <button
                type="button"
                className="return-check__action"
                onClick={() => navigate(-1)}
              >
                ← Trở về chọn xe
              </button>
              <div className="return-check__action-group">
                <button
                  type="button"
                  className="return-check__action return-check__action--primary"
                  onClick={handleSendToCustomer}
                  disabled={isSending}
                >
                  {isSending ? "Đang gửi..." : "Gửi cho khách"}
                </button>
              </div>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CheckCar;

