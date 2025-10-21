import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import api from "../../../utils/api";
import { carDatabase } from "../../../data/carData";
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
  const [bookingDetails, setBookingDetails] = useState(null);
  const [renterDetails, setRenterDetails] = useState(null);

  // Lấy thông tin xe từ HandoverCar hoặc từ state
  const vehicleInfo = useMemo(() => {
    const state = location.state || {};
    return state.vehicle || null;
  }, [location.state]);

  const resolveVehicleImage = () => {
    if (vehicleInfo?.imageUrl) return vehicleInfo.imageUrl;
    const lower = (s) => String(s).trim().toLowerCase();
    const candidates = [vehicleInfo?.name, bookingDetails?.vehicleModel].filter(Boolean);
    for (const candidate of candidates) {
      const candLower = lower(candidate);
      for (const key of Object.keys(carDatabase)) {
        const entry = carDatabase[key];
        if (lower(entry?.name) === candLower && entry?.images?.length) {
          return entry.images[0];
        }
      }
    }
    return "/carpic/1.jpg";
  };

  // Lấy booking và renter details từ state (đã fetch ở HandoverCar)
  useMemo(() => {
    const state = location.state || {};
    if (state.bookingDetails) setBookingDetails(state.bookingDetails);
    if (state.renterDetails) setRenterDetails(state.renterDetails);
  }, [location.state]);

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
    ([slotId, value]) => allowedSlotIds.has(slotId) && value?.file && slotId !== 'odometer' && slotId !== 'battery'
  );

  // Validation: Kiểm tra có ít nhất 1 ảnh (không tính odometer và battery)
  if (photoEntries.length === 0) {
    setErrorMessage("Vui lòng tải lên ít nhất một ảnh kiểm tra xe.");
    return;
  }

  setIsSending(true);

  try {
    // 1) Update license plate for booking
    if (vehicleInfo?.plate) {
      try {
        await api.post(`/api/bookings/${encodeURIComponent(bookingId)}`, null, {
          params: { licensePlate: vehicleInfo.plate },
        });
        console.log("✅ Cập nhật biển số thành công:", vehicleInfo.plate);
      } catch (plateErr) {
        console.error("Không thể cập nhật biển số", plateErr);
        setErrorMessage("Không thể cập nhật biển số cho đơn. Vui lòng thử lại.");
        setIsSending(false);
        return;
      }
    }

    // Vehicle status will be updated in OrdersList when "Bàn giao xe" button is clicked

    // 3) Continue creating inspections
    let successCount = 0;
    let failCount = 0;

    // Xử lý các ảnh kiểm tra (không bao gồm odometer và battery)
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

    // Xử lý odometer và battery (chỉ gửi text, không có ảnh)
    const textOnlySlots = ['odometer', 'battery'];
    console.log('Processing text-only slots:', textOnlySlots);
    console.log('Current descriptions:', descriptions);
    
    for (const slotId of textOnlySlots) {
      if (descriptions[slotId] && descriptions[slotId].trim()) {
        const partName = getInspectionPart(slotId);
        console.log(`Processing ${slotId}: partName=${partName}, description=${descriptions[slotId]}`);
        if (!partName) continue;

        try {
          // Tạo một file ảnh giả (1x1 pixel PNG) cho API yêu cầu
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1, 1);
          
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          
          const formData = new FormData();
          formData.append("bookingId", bookingId);
          formData.append("partName", partName);
          formData.append("picture", blob, "placeholder.png");
          
         
          
          formData.append("description", description);
          formData.append("staffId", staffId);
          formData.append("status", DEFAULT_INSPECTION_STATUS);

          const response = await api.post("/api/inspections/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          
          console.log(`Successfully created inspection for ${slotId}:`, response.data);
          successCount++;
        } catch (inspectionError) {
          console.error(`Failed to create inspection for ${partName}:`, inspectionError);
          failCount++;
        }
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

            {/* Thông tin người thuê */}
            {renterDetails && (
              <section className="return-check__vehicle-info">
                <header className="return-check__vehicle-header">
                  <h2>Thông tin người thuê</h2>
                </header>
                <div className="return-check__vehicle-details">
                  <div className="return-check__vehicle-card">
                    <dl className="return-check__vehicle-specs">
                      <div>
                        <dt>Họ tên</dt>
                        <dd>{renterDetails.fullName || "—"}</dd>
                      </div>
                      <div>
                        <dt>Email</dt>
                        <dd>{renterDetails.email || "—"}</dd>
                      </div>
                      <div>
                        <dt>Số điện thoại</dt>
                        <dd>{renterDetails.phoneNumber || "—"}</dd>
                      </div>
                      <div>
                        <dt>Giấy phép lái xe</dt>
                        <dd>{renterDetails.drivingLicense || "—"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>
            )}

            {/* Thông tin booking */}
            {bookingDetails && (
              <section className="return-check__vehicle-info">
                <header className="return-check__vehicle-header">
                  <h2>Chi tiết đơn thuê</h2>
                </header>
                <div className="return-check__vehicle-details">
                  <div className="return-check__vehicle-card">
                    <dl className="return-check__vehicle-specs">
                      <div>
                        <dt>Mẫu xe</dt>
                        <dd>{bookingDetails.vehicleModel || "—"}</dd>
                      </div>
                      <div>
                        <dt>Ngày thuê</dt>
                        <dd>
                          {bookingDetails.pickupDate || "—"}
                          {bookingDetails.pickupTime ? ` • ${bookingDetails.pickupTime}` : ""}
                        </dd>
                      </div>
                      <div>
                        <dt>Ngày trả</dt>
                        <dd>
                          {bookingDetails.dropoffDate || "—"}
                          {bookingDetails.dropoffTime ? ` • ${bookingDetails.dropoffTime}` : ""}
                        </dd>
                      </div>
                      <div>
                        <dt>Trạng thái</dt>
                        <dd>{bookingDetails.status || "—"}</dd>
                      </div>
                      <div>
                        <dt>Tổng tiền</dt>
                        <dd>{bookingDetails.totalPrice ? `${bookingDetails.totalPrice.toLocaleString('vi-VN')} ₫` : "—"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>
            )}

            {/* Thông tin xe đã chọn */}
            {vehicleInfo && (
              <section className="return-check__vehicle-info">
                <header className="return-check__vehicle-header">
                  <h2>Thông tin xe kiểm tra</h2>
                </header>
                <div className="return-check__vehicle-details">
                  <div className="return-check__vehicle-card">
                    <div className="return-check__vehicle-preview" style={{ minWidth: 180 }}>
                      <img
                        src={resolveVehicleImage()}
                        alt={vehicleInfo?.name || "Vehicle"}
                        style={{ width: 160, height: 100, objectFit: "cover", borderRadius: 8 }}
                        onError={(e) => { e.currentTarget.src = "/carpic/1.jpg"; }}
                      />
                      <strong>{vehicleInfo.plate || "—"}</strong>
                    </div>
                    <dl className="return-check__vehicle-specs">
                      <div>
                        <dt>Tên xe</dt>
                        <dd>{vehicleInfo.name || "—"}</dd>
                      </div>
                      <div>
                        <dt>Màu sắc</dt>
                        <dd>{vehicleInfo.color || "—"}</dd>
                      </div>
                      <div>
                        <dt>Dung lượng pin</dt>
                        <dd>{vehicleInfo.battery || "—"}</dd>
                      </div>
                      <div>
                        <dt>Quãng đường</dt>
                        <dd>{vehicleInfo.mileage || "—"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>
            )}

            <div className="return-check__layout">
              <section className="return-check__panel return-check__panel--gallery">
                <header className="return-check__panel-header">
                  <h2>Ảnh kiểm tra</h2>
                  <p>Tải lên hình ảnh minh chứng cho từng góc chụp.</p>
                </header>

                <div className="return-check__photos">
                  {photoSlots.map((slot) => {
                    // Đối với odometer và battery, chỉ hiển thị input text
                    if (slot.id === 'odometer' || slot.id === 'battery') {
                      return (
                        <div key={slot.id} className="return-check__text-input-wrapper">
                          <label className="return-check__text-input-label">
                            <span className="return-check__text-input-icon">
                              {slot.id === 'odometer' ? '📊' : '🔋'}
                            </span>
                            <span className="return-check__text-input-title">{slot.label}</span>
                          </label>
                          <div className="return-check__input-group">
                            <input
                              type="number"
                              min={slot.id === 'battery' ? "0" : "0"}
                              max={slot.id === 'battery' ? "100" : undefined}
                              className="return-check__text-input"
                              placeholder={`Nhập ${slot.id === 'odometer' ? 'số km hiện tại' : 'mức pin (0-100)'}`}
                              value={descriptions[slot.id] || ""}
                              onChange={(e) => {
                                let value = e.target.value;
                                // Giới hạn battery từ 0-100
                                if (slot.id === 'battery') {
                                  const numValue = parseInt(value);
                                  if (!isNaN(numValue)) {
                                    if (numValue > 100) value = '100';
                                    if (numValue < 0) value = '0';
                                  }
                                }
                                setDescriptions(prev => ({
                                  ...prev,
                                  [slot.id]: value
                                }));
                              }}
                            />
                            <span className="return-check__suffix">
                              {slot.id === 'odometer' ? 'km' : '%'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    
                    // Đối với các slot khác, hiển thị upload ảnh như cũ
                    return (
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
                    );
                  })}
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

