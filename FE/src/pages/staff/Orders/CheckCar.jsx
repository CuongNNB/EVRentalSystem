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
import "./CheckCar.css";

const CheckCar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId = "EV0205010" } = useParams();
  const [photos, setPhotos] = useState({});
  const [descriptions, setDescriptions] = useState({}); // Thêm state cho descriptions
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
    () => ROW_INSPECTION_SLOTS.filter((slot) => slot.id !== "row1" && slot.id !== "row2"),
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

  // Validation: Kiểm tra có ít nhất 1 ảnh
  if (photoEntries.length === 0) {
    setErrorMessage("Vui lòng tải lên ít nhất một ảnh kiểm tra xe.");
    return;
  }


  setIsSending(true);

  try {
    let successCount = 0;
    let failCount = 0;

    for (const [slotId, data] of photoEntries) {
      const partName = getInspectionPart(slotId);
      if (!partName) continue;

      try {
        // 🔹 Dùng FormData để gửi file
        const formData = new FormData();
        formData.append("bookingId", bookingId);
        formData.append("partName", partName);
        formData.append("picture", data.file);
        formData.append("description", descriptions[slotId] || ""); // Thêm description
        formData.append("staffId", staffId);
        formData.append("status", DEFAULT_INSPECTION_STATUS);

        await api.post("/api/inspections/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        successCount++;
      } catch (inspectionError) {
        console.error(`Failed to create inspection for ${partName}:`, inspectionError);
        failCount++;
      }
    }

    // Nếu không có inspection nào thành công, dừng lại
    if (successCount === 0) {
      setErrorMessage("Không thể tạo biên bản kiểm tra. Vui lòng thử lại.");
      setIsSending(false);
      return;
    }


    // Gọi API cập nhật trạng thái booking
    try {
      await api.put(`/api/bookings/${encodeURIComponent(bookingId)}/status`, null, {
        params: { status: "Vehicle_Inspected_Before_Pickup" },
      });
    } catch (statusError) {
      console.warn("Unable to update booking status", statusError);
      // Vẫn cho phép tiếp tục vì inspections đã được tạo
    }

    const message = failCount > 0
      ? `Đã gửi ${successCount}/${photoEntries.length} ảnh kiểm tra. ${failCount} ảnh thất bại.`
      : `Đã gửi biên bản kiểm tra với ${successCount} ảnh cho khách hàng.`;
    
    setNotification(message);
    
    setTimeout(() => {
      navigate("/staff/orders", { replace: true });
    }, 2000);
  } catch (error) {
    console.error("Error during inspection submission:", error);
    setErrorMessage(
      error.response?.data?.message || 
      "Không thể tạo biên bản kiểm tra hoặc cập nhật trạng thái. Vui lòng thử lại."
    );
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
              <section className="return-check__panel return-check__panel--gallery">
                <header className="return-check__panel-header">
                  <h2>Ảnh kiểm tra</h2>
                  <p>Tải lên hình ảnh minh chứng cho từng góc chụp.</p>
                </header>

                <div className="return-check__photos">
                  {photoSlots.map((slot) => (
                    <div 
                      key={slot.id} 
                      className={`return-check__photo-slot-wrapper ${
                        photos[slot.id]?.preview ? 'return-check__photo-slot-wrapper--active' : ''
                      }`}
                    >
                      {/* Photo Upload */}
                      <label className="return-check__photo-slot">
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
                        <p className="return-check__photo-label">{slot.label}</p>
                      </label>
                      
                      {/* Description - chỉ hiện khi đã có ảnh */}
                      {photos[slot.id]?.preview && (
                        <div className="return-check__photo-description-wrapper">
                          <label htmlFor={`desc-${slot.id}`} className="return-check__photo-description-label">
                            💬 Mô tả cho ảnh này:
                          </label>
                          <textarea
                            id={`desc-${slot.id}`}
                            className="return-check__photo-description"
                            placeholder={`Ví dụ: "Không có vết xước", "Đèn hoạt động tốt"...`}
                            value={descriptions[slot.id] || ""}
                            onChange={(e) => setDescriptions(prev => ({
                              ...prev,
                              [slot.id]: e.target.value
                            }))}
                            rows={2}
                          />
                          <span className="return-check__photo-description-hint">
                            {descriptions[slot.id]?.length || 0} ký tự
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {remainingRowSlots.map((slot) => (
                    <div key={slot.id} className="return-check__add-row-wrapper">
                      <button
                        type="button"
                        className="return-check__add-row-button"
                        onClick={() => handleAddRow(slot.id)}
                      >
                        <div className="return-check__add-row-icon">
                          <span className="return-check__add-row-plus">+</span>
                        </div>
                        <span className="return-check__add-row-label">Thêm {slot.label}</span>
                      </button>
                    </div>
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

