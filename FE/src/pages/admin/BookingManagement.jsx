// src/pages/admin/BookingManagement.jsx
import React, { useEffect, useState } from "react";
import "./AdminDashboardNew.css";
import "./VehicleManagement.css";
import "./BookingManagement.css";
import ErrorBoundary from "../../components/admin/ErrorBoundary";

const BookingManagement = () => {
    const API_BASE = "http://localhost:8084/EVRentalSystem";

    // --- State cho Table ---
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    // --- State cho Modal & Edit ---
    const [showModal, setShowModal] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [masterData, setMasterData] = useState([]); // Dữ liệu Station -> Model -> Car
    const [loadingMaster, setLoadingMaster] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // --- Form State trong Modal ---
    const [formData, setFormData] = useState({
        bookingId: null,
        stationId: "",
        vehicleModelId: "",
        vehicleDetailId: "",
        startTime: "",
        expectedReturnTime: "",
        actualReturnTime: "",
        status: ""
    });

    // Helper: Mapping trạng thái hiển thị
    const getStatusText = (status) => {
        if (!status) return 'Không xác định';
        switch (status) {
            case 'Pending_Deposit_Confirmation': return 'Chờ xác nhận cọc';
            case 'Pending_Contract_Signing': return 'Chờ ký hợp đồng';
            case 'Pending_Vehicle_Pickup': return 'Chờ kiểm tra xe';
            case 'Vehicle_Inspected_Before_Pickup': return 'Đã kiểm tra xe';
            case 'Currently_Renting': return 'Đang thuê xe';
            case 'Vehicle_Returned': return 'Xe đã trả';
            case 'Completed': return 'Đã hoàn thành';
            case 'Vehicle_Return_Overdue': return 'Quá hạn trả xe';
            case 'Cancelled': return 'Đã hủy';
            case 'Pending_Deposit_Payment': return 'Đợi thanh toán cọc';
            case 'Vehicle_Inspected_After_Pickup': return 'Đợi xác nhận nhận xe';
            case 'Pending_Total_Payment': return 'Đợi thanh toán đơn hàng';
            case 'Pending_Total_Payment_Confirmation': return 'Đợi xác nhận tổng thanh toán';
            case 'Total_Fees_Charged': return 'Đã tính phí tổng';
            default: return status;
        }
    };

    // Danh sách các trạng thái Admin được phép chọn thủ công (Theo yêu cầu)
    const ALLOWED_MANUAL_STATUSES = [
        "Pending_Deposit_Confirmation",
        "Vehicle_Inspected_Before_Pickup",
        "Currently_Renting",
        "Pending_Total_Payment",
        "Pending_Total_Payment_Confirmation"
    ];

    // Helper: Format
    const formatMoney = (val) => (val || val === 0) ? Number(val).toLocaleString("vi-VN") + " đ" : "-";
    const formatDateTime = (val) => {
        if (!val) return "-";
        const d = new Date(val);
        return isNaN(d.getTime()) ? String(val) : d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };
    const formatForInput = (isoString) => {
        if (!isoString) return "";
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return "";
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    // --- API Calls ---
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/user-management/get-bookings`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            let arr = [];
            if (Array.isArray(data)) arr = data;
            else if (data && Array.isArray(data.data)) arr = data.data;
            else {
                const key = Object.keys(data || {}).find(k => Array.isArray(data[k]));
                arr = key ? data[key] : [];
            }
            arr.sort((a, b) => (b.bookingId || 0) - (a.bookingId || 0));
            setRows(arr);
        } catch (err) {
            console.error("Fetch bookings failed:", err);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        if (masterData.length > 0) return masterData; 
        try {
            setLoadingMaster(true);
            const res = await fetch(`${API_BASE}/vehicle-management/get-all-about-station`);
            if (!res.ok) throw new Error("Failed to load master data");
            const data = await res.json();
            const stations = data.stations || [];
            setMasterData(stations);
            return stations;
        } catch (err) {
            console.error(err);
            return [];
        } finally {
            setLoadingMaster(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // --- Handlers ---
    const handleEditClick = async (booking) => {
        const stations = await fetchMasterData();
        setEditingBooking(booking);
        
        // Map StationName -> StationId nếu cần
        let resolvedStationId = booking.stationId;
        if (!resolvedStationId && booking.stationName) {
            const foundStation = stations.find(s => s.stationName.trim().toLowerCase() === booking.stationName.trim().toLowerCase());
            if (foundStation) resolvedStationId = foundStation.stationId;
        }

        setFormData({
            bookingId: booking.bookingId,
            stationId: resolvedStationId || "", 
            vehicleModelId: booking.vehicleModelId || "",
            vehicleDetailId: booking.vehicleDetailId || "",
            startTime: formatForInput(booking.startTime),
            expectedReturnTime: formatForInput(booking.expectedReturnTime),
            actualReturnTime: formatForInput(booking.actualReturnTime),
            status: booking.status
        });

        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'stationId') {
                next.vehicleModelId = "";
                next.vehicleDetailId = "";
            }
            if (name === 'vehicleModelId') {
                next.vehicleDetailId = "";
            }
            return next;
        });
    };

    const handleUpdate = async () => {
        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                bookingId: editingBooking.bookingId,
                stationId: formData.stationId ? Number(formData.stationId) : null,
                vehicleModelId: formData.vehicleModelId ? Number(formData.vehicleModelId) : null,
                vehicleDetailId: formData.vehicleDetailId ? Number(formData.vehicleDetailId) : null,
            };

            const res = await fetch(`${API_BASE}/api/user-management/update-booking`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Cập nhật thất bại");
            }

            alert("Cập nhật đơn hàng thành công!");
            setShowModal(false);
            fetchBookings(); 
        } catch (err) {
            alert("Lỗi: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Logic Client Filtering ---
    const currentStationData = masterData.find(s => s.stationId === Number(formData.stationId));
    const availableModels = currentStationData ? currentStationData.models : [];
    const currentModelData = availableModels.find(m => m.vehicleModelId === Number(formData.vehicleModelId));
    const availableCars = currentModelData ? currentModelData.cars : [];

    // --- LOGIC PHÂN QUYỀN TRẠNG THÁI (CORE LOGIC) ---
    
    // Nhóm 1: Được đổi Model + Detail
    const canChangeModel = (status) => status === 'Pending_Deposit_Payment';

    // Nhóm 2: Được đổi Detail (nhưng khóa Model)
    const canChangeDetail = (status) => {
        const group2 = [
            'Pending_Deposit_Payment',
            'Pending_Deposit_Confirmation',
            'Pending_Contract_Signing',
            'Pending_Vehicle_Pickup',
            'Vehicle_Inspected_Before_Pickup'
        ];
        return group2.includes(status);
    };

    // Khóa nút Sửa
    const isEditDisabled = (status) => status === 'Completed' || status === 'Cancelled';

    // --- Filtering Rows ---
    const filteredRows = rows.filter(r => {
        const PROCESSING = [
            "Pending_Deposit_Payment", "Pending_Deposit_Confirmation", "Pending_Contract_Signing",
            "Pending_Vehicle_Pickup", "Vehicle_Inspected_Before_Pickup", "Currently_Renting",
            "Vehicle_Returned", "Vehicle_Inspected_After_Pickup", "Pending_Total_Payment",
            "Total_Fees_Charged", "Pending_Total_Payment_Confirmation"
        ];
        
        let matchStatus = true;
        if (filterStatus === 'COMPLETED') matchStatus = r.status === 'Completed';
        else if (filterStatus === 'CANCELLED') matchStatus = r.status === 'Cancelled';
        else if (filterStatus === 'PROCESSING') matchStatus = PROCESSING.includes(r.status);

        if (!matchStatus) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (r.renterName || "").toLowerCase().includes(q) ||
            (r.vehicleBrand || "").toLowerCase().includes(q) ||
            (r.vehicleModel || "").toLowerCase().includes(q) ||
            String(r.bookingId).includes(q)
        );
    });

    return (
        <ErrorBoundary>
            <div className="admin-breadcrumb">
                <i className="fas fa-home"></i> <span>Quản trị</span> <i className="fas fa-chevron-right"></i> <span>Quản lý đơn hàng</span>
            </div>

            <div className="admin-page-header">
                <div className="admin-page-header-left">
                    <div className="admin-page-icon" style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
                        <i className="fas fa-clipboard-list"></i>
                    </div>
                    <div className="admin-page-title-group">
                        <h1 className="admin-page-title">Quản lý đơn hàng</h1>
                        <p className="admin-page-subtitle">Danh sách đơn hàng - admin</p>
                    </div>
                </div>
            </div>

            <div className="vehicle-toolbar" style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                <div className="vehicle-search">
                    <i className="fas fa-search"></i>
                    <input placeholder="Tìm tên khách, xe, mã đơn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="vehicle-filter" style={{ marginLeft: "12px" }}>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="booking-form-select" style={{ minWidth: "160px" }}>
                        <option value="ALL">Tất cả đơn hàng</option>
                        <option value="PROCESSING">Đang xử lý</option>
                        <option value="COMPLETED">Đã hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
                <button className="admin-btn admin-btn-secondary" onClick={fetchBookings}>
                    <i className="fas fa-sync-alt"></i> Làm mới
                </button>
            </div>

            <div className="vehicles-table-container">
                {loading ? <div className="empty-state"><i className="fas fa-spinner fa-spin"></i> <p>Đang tải...</p></div> : 
                filteredRows.length === 0 ? <div className="empty-state"><i className="fas fa-list"></i> <p>Không tìm thấy đơn hàng</p></div> : (
                    <table className="vehicles-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách thuê</th>
                                <th>Trạm xe</th> 
                                <th>Xe (Biển số)</th>
                                <th>Thời gian nhận</th>
                                <th>Trả dự kiến</th>
                                <th>Cọc</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((r) => (
                                <tr key={r.bookingId}>
                                    <td style={{ fontWeight: "bold", color: "#3b82f6" }}>#{r.bookingId}</td>
                                    <td>
                                        <div>{r.renterName}</div>
                                        <div style={{ fontSize: "11px", color: "#64748b" }}>{r.renterPhone}</div>
                                    </td>
                                    <td><div style={{ fontWeight: 500 }}>{r.stationName || "-"}</div></td>
                                    <td>
                                        {r.vehicleBrand} {r.vehicleModel}
                                        {r.licensePlate && <div className="vehicle-license-cell" style={{ fontSize: "12px" }}>{r.licensePlate}</div>}
                                    </td>
                                    <td>{formatDateTime(r.startTime)}</td>
                                    <td>{formatDateTime(r.expectedReturnTime)}</td>
                                    <td>{formatMoney(r.deposit)}</td>
                                    <td>{formatMoney(r.paymentTotal)}</td>
                                    <td><span className={`status-badge ${r.status}`}>{getStatusText(r.status)}</span></td>
                                    <td style={{ textAlign: "center" }}>
                                        <button className="admin-btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}
                                            onClick={() => handleEditClick(r)} disabled={isEditDisabled(r.status)}>
                                            <i className="fas fa-edit"></i> Sửa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- EDIT MODAL OVERLAY --- */}
            {showModal && editingBooking && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal-content">
                        <div className="booking-modal-header">
                            <h2><i className="fas fa-edit" style={{ color: "#3b82f6" }}></i> Chỉnh sửa đơn hàng #{editingBooking.bookingId}</h2>
                            <button className="booking-modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
                        </div>

                        <div className="booking-modal-body">
                            {loadingMaster ? <div style={{ textAlign: "center", padding: "20px" }}><i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu xe...</div> : (
                                <div className="booking-form-grid">
                                    {/* 1. TRẠM XE - LUÔN DISABLE */}
                                    <div className="booking-form-group">
                                        <label className="booking-form-label">Trạm xe</label>
                                        <select 
                                            name="stationId"
                                            className="booking-form-select"
                                            value={formData.stationId}
                                            disabled={true} 
                                            style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                                        >
                                            <option value="">-- Chọn Trạm --</option>
                                            {masterData.map(st => (
                                                <option key={st.stationId} value={st.stationId}>{st.stationName}</option>
                                            ))}
                                            {!formData.stationId && editingBooking.stationName && (
                                                <option value="" selected>{editingBooking.stationName}</option>
                                            )}
                                        </select>
                                    </div>

                                    {/* 2. MODEL - Disable nếu chưa có Trạm HOẶC trạng thái bị khóa */}
                                    <div className="booking-form-group">
                                        <label className="booking-form-label">
                                            Dòng xe (Model) 
                                            {!canChangeModel(formData.status) && <span style={{fontSize: '11px', color: '#dc2626', marginLeft: '5px'}}>(Đã khóa)</span>}
                                        </label>
                                        <select 
                                            name="vehicleModelId"
                                            className="booking-form-select"
                                            value={formData.vehicleModelId}
                                            onChange={handleFormChange}
                                            disabled={!formData.stationId || !canChangeModel(formData.status)}
                                        >
                                            <option value="">-- Chọn Dòng xe --</option>
                                            {availableModels.map(md => (
                                                <option key={md.vehicleModelId} value={md.vehicleModelId}>{md.brand} {md.modelName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. DETAIL - Disable nếu chưa có Model HOẶC trạng thái bị khóa */}
                                    <div className="booking-form-group full-width">
                                        <label className="booking-form-label">
                                            Chi tiết xe (Biển số)
                                            {!canChangeDetail(formData.status) && <span style={{fontSize: '11px', color: '#dc2626', marginLeft: '5px'}}>(Đã khóa)</span>}
                                        </label>
                                        <select 
                                            name="vehicleDetailId"
                                            className="booking-form-select"
                                            value={formData.vehicleDetailId}
                                            onChange={handleFormChange}
                                            disabled={!formData.vehicleModelId || !canChangeDetail(formData.status)}
                                        >
                                            <option value="">-- Chọn xe cụ thể --</option>
                                            {editingBooking.vehicleDetailId && (
                                                <option value={editingBooking.vehicleDetailId}>{editingBooking.licensePlate} (Hiện tại)</option>
                                            )}
                                            {availableCars.map(car => (
                                                car.vehicleDetailId !== editingBooking.vehicleDetailId && (
                                                    <option key={car.vehicleDetailId} value={car.vehicleDetailId} disabled={car.status !== 'AVAILABLE'}>
                                                        {car.licensePlate} - {car.color} {car.status !== 'AVAILABLE' ? `(${car.status})` : ''}
                                                    </option>
                                                )
                                            ))}
                                        </select>
                                    </div>

                                    {/* 4. Thời gian */}
                                    <div className="booking-form-group">
                                        <label className="booking-form-label">Thời gian nhận</label>
                                        <input type="datetime-local" name="startTime" className="booking-form-input" value={formData.startTime} onChange={handleFormChange} />
                                    </div>
                                    <div className="booking-form-group">
                                        <label className="booking-form-label">Trả dự kiến (Gia hạn)</label>
                                        <input type="datetime-local" name="expectedReturnTime" className="booking-form-input" value={formData.expectedReturnTime} onChange={handleFormChange} />
                                    </div>
                                    <div className="booking-form-group">
                                        <label className="booking-form-label">Trả thực tế</label>
                                        <input type="datetime-local" name="actualReturnTime" className="booking-form-input" value={formData.actualReturnTime} onChange={handleFormChange} />
                                    </div>

                                    {/* 5. Trạng thái - CHỈ HIỂN THỊ LIST CHO PHÉP */}
                                    <div className="booking-form-group">
                                        <label className="booking-form-label">Trạng thái đơn hàng</label>
                                        <select name="status" className="booking-form-select" value={formData.status} onChange={handleFormChange}>
                                            {/* Luôn hiển thị trạng thái hiện tại nếu nó không nằm trong list cho phép (để tránh lỗi UI) */}
                                            {!ALLOWED_MANUAL_STATUSES.includes(formData.status) && (
                                                <option value={formData.status}>{getStatusText(formData.status)}</option>
                                            )}
                                            
                                            {/* List các trạng thái được phép chọn */}
                                            {ALLOWED_MANUAL_STATUSES.map(status => (
                                                <option key={status} value={status}>
                                                    {getStatusText(status)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="booking-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                            <button className="btn-save" onClick={handleUpdate} disabled={submitting || loadingMaster}>
                                {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>} <span>Lưu thay đổi</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ErrorBoundary>
    );
};

export default BookingManagement;