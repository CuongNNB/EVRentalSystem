import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import api from "../../../utils/api";
import { carDatabase } from "../../../data/carData";
import "../StaffLayout.css";
import "./HandoverCar.css";

const extractStoredPayload = (locationState) => {
  if (locationState) return locationState;
  try {
    const raw = sessionStorage.getItem("handover-order");
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn("Unable to parse cached handover payload", error);
    return {};
  }
};

const mapVehicleDetails = (source) => {
  if (!source) return null;
  const mileage =
    typeof source.odo === "number"
      ? `${source.odo.toLocaleString("vi-VN")} km`
      : source.mileage || "—";
  const parseSeats = (value) => {
    if (value === undefined || value === null) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : null;
  };
  const seats =
    parseSeats(source.seats) ||
    parseSeats(source.seatCount) ||
    parseSeats(source.capacity) ||
    parseSeats(source.seat) ||
    parseSeats(source.numberOfSeats) ||
    parseSeats(source.vehicleModel?.seatCount) ||
    parseSeats(source.vehicleModel?.seats) ||
    parseSeats(source.vehicleModel?.capacity);

  return {
    id: String(source.id ?? ""),
    name:
      source.modelName ||
      source.model ||
      source.vehicleModel?.model ||
      "Xe chưa xác định",
    plate: source.licensePlate || source.plate || "—",
    battery: source.batteryCapacity || source.battery || "—",
    color: source.color || "—",
    mileage,
    seats: seats || null,
    // Prefer any direct image field from BE if present
    imageUrl:
      source.imageUrl ||
      source.image ||
      source.thumbnail ||
      source.picture ||
      null,
  };
};

const HandoverCar = () => {
  const { orderId = "--" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const payload = useMemo(
    () => extractStoredPayload(location.state),
    [location.state]
  );
  const order = payload?.order || null;
  const stationId =
    payload?.stationId ||
    window.localStorage.getItem("ev_staff_station_id") ||
    "";
  const vehicleModelId = order?.raw?.vehicleModelId;

  const [vehicles, setVehicles] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    try {
      sessionStorage.removeItem("handover-order");
    } catch (cleanupError) {
      console.warn("Unable to clear cached handover payload", cleanupError);
    }
  }, []);

  // Fetch booking details and renter details
  useEffect(() => {
    if (!orderId || orderId === "--") return;

    const fetchBookingData = async () => {
      setIsLoadingBooking(true);
      try {
        // Fetch booking details
        const bookingResponse = await api.get("/api/bookings/booking-details", {
          params: { bookingId: orderId }, 
        });
        setBookingDetails(bookingResponse.data?.data || bookingResponse.data);

        // Fetch renter details
        const renterResponse = await api.get(`/api/bookings/${orderId}/renter-details`, {
          params: { bookingId: orderId },
        });
        setRenterDetails(renterResponse.data?.data || renterResponse.data);
      } catch (error) {
        console.warn("Unable to fetch booking/renter details", error);
      } finally {
        setIsLoadingBooking(false);
      }
    };

    fetchBookingData();
  }, [orderId]);

  useEffect(() => {
    if (!vehicleModelId || !stationId) {
      setListError(
        "Thiếu thông tin trạm hoặc mẫu xe để tải danh sách xe khả dụng."
      );
      setVehicles([]);
      setSelectedId("");
      return;
    }

    const fetchReservedVehicles = async () => {
      setListLoading(true);
      setListError("");
      try {
        console.log("Fetching reserved vehicles with params:", { modelId: vehicleModelId, stationId });
        // Gọi API lấy xe có status Reserved
        const response = await api.get("/api/vehicle-details/available", {
          params: { modelId: vehicleModelId, stationId },
        });
        const data = response.data?.data ?? response.data ?? [];
        setVehicles(data);
        if (data.length) {
          setSelectedId(String(data[0].id));
        } else {
          // Fallback: nếu không có xe Reserved, thử lấy xe Available
          console.log("No reserved vehicles found, trying available vehicles...");
          const fallbackResponse = await api.get("/api/vehicle-details/available", {
            params: { modelId: vehicleModelId, stationId },
          });
          const fallbackData = fallbackResponse.data?.data ?? fallbackResponse.data ?? [];
          if (fallbackData.length) {
            setVehicles(fallbackData);
            setSelectedId(String(fallbackData[0].id));
          } else {
            setSelectedId("");
            setVehicle(null);
            setListError("Không có xe khả dụng trong trạm cho mẫu xe này.");
          }
        }
      } catch (error) {
        console.warn("Unable to fetch reserved vehicles", error);
        setListError("Không thể tải danh sách xe đã đặt.");
        setVehicles([]);
        setSelectedId("");
        setVehicle(null);
      } finally {
        setListLoading(false);
      }
    };

    fetchReservedVehicles();
  }, [vehicleModelId, stationId]);

  useEffect(() => {
    if (!selectedId) {
      setVehicle(null);
      return;
    }

    const fetchVehicleDetails = async () => {
      setDetailLoading(true);
      setDetailError("");
      try {
        const response = await api.get(
          `/api/vehicle-details/${encodeURIComponent(selectedId)}`
        );
        const data = response.data?.data ?? response.data;
        setVehicle(mapVehicleDetails(data));
      } catch (error) {
        console.warn("Unable to fetch vehicle detail", error);
        setDetailError("Không thể tải chi tiết xe.");
        setVehicle(null);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [selectedId]);

  const handleSelect = (event) => {
    setSelectedId(event.target.value);
  };

  const resolveVehicleImage = () => {
    // 1) If BE already provided an image in vehicle detail
    if (vehicle?.imageUrl) return vehicle.imageUrl;

    // 2) Try by vehicle name/model against carDatabase
    const nameCandidates = [
      vehicle?.name,
      order?.car,
      bookingDetails?.vehicleModel,
    ].filter(Boolean);

    const lower = (s) => String(s).trim().toLowerCase();
    for (const candidate of nameCandidates) {
      const candLower = lower(candidate);
      for (const key of Object.keys(carDatabase)) {
        const entry = carDatabase[key];
        if (lower(entry?.name) === candLower && entry?.images?.length) {
          return entry.images[0]; // public path under /anhxe/
        }
      }
    }

    // 3) Fallback to a generic image from public/carpic if needed
    return "/carpic/1.jpg";
  };

  const handleProceed = () => {
    if (!vehicle) return;
    const nextState = {
      order,
      stationId,
      vehicle,
      vehicles,
      bookingDetails,
      renterDetails,
    };
    try {
      sessionStorage.setItem("handover-order", JSON.stringify(nextState));
    } catch (cacheError) {
      console.warn("Unable to cache handover payload", cacheError);
    }
    navigate(`/staff/orders/${orderId}/handover/check`, { state: nextState });
  };

  if (!order) {
    return (
      <div className="staff-shell staff-shell--orders">
        <StaffHeader />
        <div className="staff-layout staff-layout--orders">
          <StaffSlideBar activeKey="orders" />
          <main className="staff-main">
            <section className="handover handover--empty">
              <header className="handover__header">
                <h1>Quản lý bàn giao xe</h1>
                <p>Không tìm thấy thông tin đơn hàng.</p>
              </header>
              <button
                type="button"
                className="handover__button handover__button--primary"
                onClick={() => navigate(-1)}
              >
                ← Quay lại danh sách đơn
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-shell staff-shell--orders">
      <StaffHeader />
      <div className="staff-layout staff-layout--orders">
        <StaffSlideBar activeKey="orders" />
        <main className="staff-main">
          <section className="handover">
            <header className="handover__header">
              <div>
                <h1>
                  Quản lý bàn giao xe <span>#{orderId}</span>
                </h1>
                <p>Chọn xe bàn giao cho khách</p>
              </div>
              <button
                type="button"
                className="handover__button handover__button--danger"
                onClick={() => navigate(-1)}
              >
                ← Quay lại
              </button>
            </header>

            <section className="handover__summary">
              <header>
                <h2>Thông tin đơn #{order.id}</h2>
                {isLoadingBooking && <span style={{ fontSize: "0.9rem", color: "#666" }}>Đang tải...</span>}
              </header>
              
              {/* Renter Details */}
              {renterDetails && (
                <>
                  <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem", fontSize: "1rem" }}>
                    Thông tin người thuê
                  </h3>
                  <dl>
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
                </>
              )}

              {/* Booking Details */}
              {bookingDetails && (
                <>
                  <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem", fontSize: "1rem" }}>
                    Chi tiết đơn thuê
                  </h3>
                  <dl>
                    <div>
                      <dt>Mẫu xe</dt>
                      <dd>{bookingDetails.vehicleModel || order.car || "—"}</dd>
                    </div>
                    <div>
                      <dt>Ngày thuê</dt>
                      <dd>
                        {bookingDetails.pickupDate || order.pickup?.date || "—"}
                        {bookingDetails.pickupTime || order.pickup?.time ? ` • ${bookingDetails.pickupTime || order.pickup.time}` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Ngày trả</dt>
                      <dd>
                        {bookingDetails.dropoffDate || order.dropoff?.date || "—"}
                        {bookingDetails.dropoffTime || order.dropoff?.time ? ` • ${bookingDetails.dropoffTime || order.dropoff.time}` : ""}
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
                </>
              )}

              {/* Fallback to original order data if API data not loaded */}
              {!isLoadingBooking && !renterDetails && !bookingDetails && (
                <dl>
                  <div>
                    <dt>Khách hàng</dt>
                    <dd>{order.customer?.name || "—"}</dd>
                  </div>
                  <div>
                    <dt>Số điện thoại</dt>
                    <dd>{order.customer?.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt>Mẫu xe</dt>
                    <dd>{order.car || "—"}</dd>
                  </div>
                  <div>
                    <dt>Ngày thuê</dt>
                    <dd>
                      {order.pickup?.date || "—"}
                      {order.pickup?.time ? ` • ${order.pickup.time}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>Ngày trả</dt>
                    <dd>
                      {order.dropoff?.date || "—"}
                      {order.dropoff?.time ? ` • ${order.dropoff.time}` : ""}
                    </dd>
                  </div>
                </dl>
              )}
            </section>

            <section className="handover__vehicle-card">
              <div className="handover__vehicle-header">
                <div>
                  <p className="handover__subtitle">Xe khả dụng</p>
                  <div className="handover__badge-group">
                    {stationId && (
                      <span className="handover__badge">Trạm: {stationId}</span>
                    )}
                    <span
                      className={`handover__badge ${
                        vehicles.length
                          ? "handover__badge--positive"
                          : "handover__badge--warning"
                      }`}
                    >
                      {vehicles.length
                        ? `${vehicles.length} xe khả dụng`
                        : "Không có xe khả dụng"}
                    </span>
                  </div>
                </div>
                <label>
                  <span className="handover__subtitle">Chọn xe bàn giao</span>
                  <select
                    value={selectedId}
                    onChange={handleSelect}
                    disabled={!vehicles.length}
                  >
                    {vehicles.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.licensePlate || `Xe #${item.id}`}
                      </option>
                    ))}
                    {!vehicles.length && <option>Không có xe khả dụng</option>}
                  </select>
                </label>
              </div>

              {listLoading && (
                <div className="handover__message handover__message--info">
                  Đang tải danh sách xe...
                </div>
              )}
              {listError && !listLoading && (
                <div className="handover__message handover__message--warning">
                  {listError}
                </div>
              )}

              <div className="handover__detail-body">
                <div className="handover__detail-info">
                  <h3>{vehicle?.name || "Chưa có xe được chọn"}</h3>
                  <dl>
                    <div>
                      <dt>Biển số xe</dt>
                      <dd>{vehicle?.plate || "—"}</dd>
                    </div>
                    <div>
                      <dt>Màu sắc</dt>
                      <dd>{vehicle?.color || "—"}</dd>
                    </div>
                    <div>
                      <dt>Dung lượng pin</dt>
                      <dd>{vehicle?.battery || "—"}</dd>
                    </div>
                    <div>
                      <dt>Odo / Quãng đường</dt>
                      <dd>{vehicle?.mileage || "—"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="handover__detail-preview">
                  <div className="handover__car-frame">
                    {vehicle ? (
                      <img
                        src={resolveVehicleImage()}
                        alt={vehicle?.name || "Vehicle"}
                        className="handover__car-img"
                        onError={(e) => {
                          e.currentTarget.src = "/carpic/1.jpg";
                        }}
                      />
                    ) : (
                      <>
                        <span aria-hidden="true">EV</span>
                        <strong>{vehicle?.plate || "—"}</strong>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {detailLoading && (
                <div className="handover__message handover__message--info">
                  Đang tải chi tiết xe...
                </div>
              )}
              {detailError && !detailLoading && (
                <div className="handover__message handover__message--warning">
                  {detailError}
                </div>
              )}

              <footer className="handover__footer">
                <button
                  type="button"
                  className="handover__button handover__button--danger"
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="handover__button handover__button--primary"
                  disabled={!vehicle}
                  onClick={handleProceed}
                >
                  Kiểm tra xe
                </button>
              </footer>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HandoverCar;
