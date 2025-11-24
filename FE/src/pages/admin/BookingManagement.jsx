// src/pages/admin/BookingManagement.jsx
// Dựa trên: /mnt/data/VehicleManagement.jsx
import React, { useEffect, useState } from "react";
import "./AdminDashboardNew.css";
import "./VehicleManagement.css";
import ErrorBoundary from "../../components/admin/ErrorBoundary";

const BookingManagement = () => {
    const API_BASE = "http://localhost:8084/EVRentalSystem";

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    // mapping trạng thái -> label tiếng Việt
    const getStatusText = (status) => {
        if (!status) return 'Không xác định';
        switch (status) {
            case 'Pending_Deposit_Confirmation':
                return 'Chờ xác nhận cọc';
            case 'Pending_Contract_Signing':
                return 'Chờ ký hợp đồng';
            case 'Pending_Vehicle_Pickup':
                return 'Chờ kiểm tra xe';
            case 'Vehicle_Inspected_Before_Pickup':
                return 'Đã kiểm tra xe';
            case 'Vehicle_Pickup_Overdue':
                return 'Quá hạn nhận xe';
            case 'Currently_Renting':
                return 'Đang thuê xe';
            case 'Vehicle_Returned':
                return 'Xe đã trả';
            case 'Total_Fees_Charged':
                return 'Đã hoàn tất đơn hàng';
            case 'Completed':
                return 'Đã hoàn thành đơn hàng';
            case 'Vehicle_Return_Overdue':
                return 'Quá hạn trả xe';
            case 'Pending_Renter_Confirmation':
                return 'Đợi khách hàng xác nhận';
            case 'Cancelled':
                return 'Đã hủy';
            case 'Pending_Deposit_Payment':
                return 'Đợi thanh toán cọc';
            case 'Vehicle_Inspected_After_Pickup':
                return 'Đợi xác nhận nhận xe';
            case 'Pending_Total_Payment':
                return 'Đợi thanh toán đơn hàng';
            case 'Pending_Total_Payment_Confirmation':
                return 'Đợi xác nhận tổng thanh toán';
            default:
                return 'Không xác định';
        }
    };
    // format ngày giờ dạng dd/MM/yyyy HH:mm
    const formatDateTime = (value) => {
        if (!value && value !== 0) return "-";
        const d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // format tiền
    const formatMoney = (value) => {
        if (value === null || value === undefined || value === "") return "-";
        const num = Number(value);
        if (Number.isNaN(num)) return String(value);
        return num.toLocaleString("vi-VN");
    };

    // helper: tìm key thực tế trong object từ danh sách candidates
    const findKey = (obj = {}, candidates = []) => {
        for (const c of candidates) {
            if (Object.prototype.hasOwnProperty.call(obj, c)) return c;
            const lowerKeys = Object.keys(obj).find((k) => k.toLowerCase() === c.toLowerCase());
            if (lowerKeys) return lowerKeys;
        }
        return null;
    };

    // fetch bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/user-management/get-bookings`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // normalize array
            let arr = [];
            if (Array.isArray(data)) arr = data;
            else if (data && Array.isArray(data.data)) arr = data.data;
            else {
                const key = Object.keys(data || {}).find((k) => Array.isArray(data[k]));
                arr = key ? data[key] : [];
            }

            setRows(arr);
        } catch (err) {
            console.error("Fetch bookings failed:", err);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    // Danh sách các trạng thái được coi là "Đang xử lý"
    const PROCESSING_STATUSES = [
        "Pending_Deposit_Payment",
        "Pending_Deposit_Confirmation",
        "Pending_Contract_Signing",
        "Pending_Vehicle_Pickup",
        "Vehicle_Inspected_Before_Pickup",
        "Currently_Renting",
        "Vehicle_Returned",
        "Vehicle_Inspected_After_Pickup",
        "Pending_Total_Payment",
        "Total_Fees_Charged",
        "Pending_Total_Payment_Confirmation"
    ];

    useEffect(() => {
        fetchBookings();
    }, []);

    // tìm tên key cụ thể (ứng với yêu cầu sắp xếp cột)
    const renterKey = findKey(rows[0] || {}, ["renterName", "renter", "customerName", "userName", "name", "fullName"]);
    const brandKey = findKey(rows[0] || {}, ["vehicleBrand", "brand", "make"]);
    const modelKey = findKey(rows[0] || {}, ["vehicleModel", "model", "vehicle_model", "modelName"]);
    const startKey = findKey(rows[0] || {}, ["startTime", "start", "startAt", "start_time", "startDate", "startAtTime"]);
    const expectedReturnKey = findKey(rows[0] || {}, ["expectedReturnTime", "expectedReturn", "expectedReturnAt", "expected_return_time"]);
    const actualReturnKey = findKey(rows[0] || {}, ["actualReturnTime", "actualReturn", "actualReturnAt", "actual_return_time"]);
    const depositKey = findKey(rows[0] || {}, ["deposit", "depositAmount", "deposit_amount"]);
    const paymentTotalKey = findKey(rows[0] || {}, ["paymentTotal", "total", "payment_total", "totalPayment", "paymentTotalAmount"]);
    const statusKey = findKey(rows[0] || {}, ["status", "bookingStatus", "state"]);

    // build ordered columns, only include those that exist and ignore id-like keys
    const orderedColumns = [
        { key: renterKey, label: "Khách thuê" },
        { key: brandKey, label: "Thương hiệu" },
        { key: modelKey, label: "Model" },
        { key: startKey, label: "Thời gian nhận xe" },
        { key: expectedReturnKey, label: "Thời gian trả dự kiến" },
        { key: actualReturnKey, label: "Thời gian trả thực tế" },
        { key: depositKey, label: "Tiền đặt cọc" },
        { key: paymentTotalKey, label: "Tổng thanh toán" },
        { key: statusKey, label: "Trạng thái" },
    ].filter((c) => c.key !== null); // loại các cột không tìm thấy

    // search & status filter
    const filtered = rows.filter((r) => {
        // 1. Lọc theo trạng thái (Filter)
        let matchesStatus = true;
        const currentStatus = r[statusKey]; // Lấy status của dòng hiện tại

        if (filterStatus === "COMPLETED") {
            matchesStatus = currentStatus === "Completed";
        } else if (filterStatus === "CANCELLED") {
            matchesStatus = currentStatus === "Cancelled";
        } else if (filterStatus === "PROCESSING") {
            matchesStatus = PROCESSING_STATUSES.includes(currentStatus);
        }
        // Nếu filterStatus là "ALL" thì matchesStatus luôn là true

        if (!matchesStatus) return false; // Nếu không khớp trạng thái thì loại luôn

        // 2. Lọc theo từ khóa (Search Term)
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();

        // Check các cột đã định nghĩa
        for (const c of orderedColumns) {
            const v = r[c.key];
            if (v !== null && v !== undefined && String(v).toLowerCase().includes(q)) return true;
        }
        // Fallback check toàn bộ object
        return Object.values(r).some((v) => (v ?? "").toString().toLowerCase().includes(q));
    });

    // render cell value with formatting
    const renderCell = (key, value) => {
        if (value === null || value === undefined) return "-";
        const lowerKey = (key || "").toLowerCase();
        if (lowerKey.includes("time") || lowerKey.includes("date") || lowerKey.includes("at")) {
            return formatDateTime(value);
        }
        if (typeof value === "number") {
            if (lowerKey.includes("total") || lowerKey.includes("payment") || lowerKey.includes("price") || lowerKey.includes("deposit")) {
                return formatMoney(value) + " đ";
            }
            return String(value);
        }
        if (!isNaN(Number(value))) {
            if (lowerKey.includes("total") || lowerKey.includes("payment") || lowerKey.includes("deposit") || lowerKey.includes("price")) {
                return formatMoney(Number(value)) + " đ";
            }
        }
        return String(value);
    };

    return (
        <ErrorBoundary>
            {/* Breadcrumb */}
            <div className="admin-breadcrumb">
                <i className="fas fa-home"></i>
                <span>Quản trị</span>
                <i className="fas fa-chevron-right"></i>
                <span>Quản lý đơn hàng</span>
            </div>

            {/* Header */}
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

            {/* Toolbar */}
            <div className="vehicle-toolbar" style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                <div className="vehicle-search">
                    <i className="fas fa-search"></i>
                    <input
                        placeholder="Tìm kiếm (tất cả trường)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="vehicle-filter" style={{ marginLeft: "12px", display: "flex", alignItems: "center" }}>
                    <i className="fas fa-filter" style={{ marginRight: "8px", color: "#64748b" }}></i>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                            outline: "none",
                            cursor: "pointer",
                            minWidth: "160px"
                        }}
                    >
                        <option value="ALL">Tất cả đơn hàng</option>
                        <option value="PROCESSING">Đang xử lý</option>
                        <option value="COMPLETED">Đã hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
                <button className="admin-btn admin-btn-secondary" onClick={fetchBookings}>
                    <i className="fas fa-sync-alt"></i>
                    <span>Làm mới</span>
                </button>

            </div>

            {/* Table */}
            <div className="vehicles-table-container">
                {loading ? (
                    <div className="empty-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Đang tải danh sách...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-list"></i>
                        <p>Không tìm thấy đơn hàng</p>
                    </div>
                ) : (
                    <table className="vehicles-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                {orderedColumns.map((c) => (
                                    <th key={c.key}>{c.label}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((r, i) => {
                                const id = r.bookingId ?? r.id ?? JSON.stringify(r);
                                return (
                                    <tr key={id}>
                                        <td>{i + 1}</td>

                                        {orderedColumns.map((c) => {
                                            // for status column just show pretty label
                                            if (c.key === statusKey) {
                                                return (
                                                    <td key={c.key}>{getStatusText(r[c.key])}</td>
                                                );
                                            }
                                            return <td key={c.key}>{renderCell(c.key, r[c.key])}</td>;
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Internal CSS for better table spacing (kept minimal) */}
            <style>{`
                .vehicles-table td, .vehicles-table th {
                    padding: 10px 12px;
                    vertical-align: middle;
                }
                .vehicles-table tbody tr:hover {
                    background: rgba(59,130,246,0.03);
                }
            `}</style>

        </ErrorBoundary>
    );
};

export default BookingManagement;
