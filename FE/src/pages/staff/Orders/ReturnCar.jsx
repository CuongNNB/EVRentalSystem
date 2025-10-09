import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import "../StaffLayout.css";
import "./ReturnCar.css";

const PHOTO_SLOTS = [
  { id: "front", label: "Mặt trước" },
  { id: "rear", label: "Mặt sau" },
  { id: "left", label: "Bên trái" },
  { id: "right", label: "Bên phải" },
  { id: "interior", label: "Nội thất" },
  { id: "extra", label: "Ảnh bổ sung" },
];

const ReturnCar = () => {
  const navigate = useNavigate();
  const { orderId = "EV0205010" } = useParams();
  const [photos, setPhotos] = useState({});
  const [notification, setNotification] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleUpload = (event, slotId) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPhotos((prev) => ({
      ...prev,
      [slotId]: { file, preview },
    }));
  };

  const handleSendToCustomer = () => {
    if (isSending) return;
    setIsSending(true);

    if (typeof window !== "undefined") {
      const statusPayload = {
        label: "Chờ nhận xe",
        variant: "warning",
      };
      try {
        window.sessionStorage.setItem(
          `handover-status-${orderId}`,
          JSON.stringify(statusPayload)
        );
      } catch (error) {
        console.warn("Unable to persist handover status", error);
      }
    }

    setNotification("Đã gửi biên bản kiểm tra cho khách hàng.");

    setTimeout(() => {
      navigate("/staff/orders", { replace: true });
    }, 1500);
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
                {PHOTO_SLOTS.map((slot) => (
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
                        <span role="img" aria-label="camera">
                          📷
                        </span>
                      )}
                    </div>
                    <p>{slot.label}</p>
                  </label>
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

export default ReturnCar;
