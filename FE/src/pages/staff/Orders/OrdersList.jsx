import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../utils/api";
import { extractVehicleModelId } from "../../../utils/vehicleModel";
import "../StaffLayout.css";
import "./Orders.css";

const STORAGE_KEYS = {
    USER: ["ev_user", "user"],
    TOKEN: ["ev_station_token", "ev_token", "token"],
    MANUAL_STATION: "ev_staff_station_id",
};

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
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
    ),
    invoice: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    ),
    revenue: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 3v18M7 7h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
};

const STATUS_ALIASES = {
    Pending_Deposit_Payment: "pending_deposit_payment",
    pending_deposit_confirmation: "pending_deposit_confirmation",
    pending_contract_signing: "pending_contract_signing",
    pending_vehicle_pickup: "pending_vehicle_pickup",
    vehicle_inspected_before_pickup: "vehicle_inspected_before_pickup",
    vehicle_pickup_overdue: "vehicle_pickup_overdue",
    currently_renting: "currently_renting",
    vehicle_returned: "vehicle_returned",
    total_fees_charged: "total_fees_charged",
    completed: "completed",
    vehicle_return_overdue: "vehicle_return_overdue",
    pending: "pending_deposit_confirmation",
    waiting: "pending_deposit_confirmation",
    confirm: "pending_deposit_confirmation",
    confirmed: "vehicle_inspected_before_pickup",
    renting: "currently_renting",
    rent: "currently_renting",
    in_progress: "currently_renting",
    progress: "currently_renting",
    ongoing: "currently_renting",
    delivering: "pending_vehicle_pickup",
    overdue: "vehicle_return_overdue",
    late: "vehicle_return_overdue",
    past_due: "vehicle_return_overdue",
    expired: "vehicle_return_overdue",
    cancelled: "cancelled",
};

const STATUS_CONFIG = {
    pending_deposit_payment: {
        label: "Chờ thanh toán cọc",
        variant: "warning",
        bucket: "handover",
    },
    pending_deposit_confirmation: {
        label: "Chờ xác nhận đặt cọc",
        variant: "warning",
        bucket: "handover",
    },
    pending_contract_signing: {
        label: "Chờ ký hợp đồng",
        variant: "warning",
        bucket: "handover",
    },
    pending_vehicle_pickup: {
        label: "Chờ nhận xe",
        variant: "warning",
        bucket: "handover",
    },
    pending_renter_confirmation: {
        label: "Chờ khách xác nhận",
        variant: "warning",
        bucket: "handover",
    },
    vehicle_inspected_before_pickup: {
        label: "Đã kiểm tra xe",
        variant: "info",
        bucket: "handover",
    },
    vehicle_pickup_overdue: {
        label: "Quá hạn nhận xe",
        variant: "danger",
        bucket: "handover",
    },
    currently_renting: {
        label: "Đang thuê",
        variant: "success",
        bucket: "receiving",
    },
    vehicle_returned: {
        label: "Đã trả xe",
        variant: "success-muted",
        bucket: "receiving",
    },
    total_fees_charged: {
        label: "Đã hoàn thành",
        variant: "success",
        bucket: "receiving",
    },
    completed: {
        label: "Đợi thanh toán hóa đơn",
        variant: "warning",
        bucket: "receiving",
    },
    vehicle_return_overdue: {
        label: "Quá hạn trả xe",
        variant: "danger",
        bucket: "receiving",
    },
    cancelled: {
        label: "Đã hủy đơn hàng",
        variant: "danger",
        bucket: "handover",
    },
    default: { label: "Không xác định", variant: "default", bucket: "handover" },
};

const CONNECTION_STYLE = {
    loading: {
        backgroundColor: "#dbeafe",
        border: "1px solid #93c5fd",
        color: "#1d4ed8",
    },
    success: {
        backgroundColor: "#dcfce7",
        border: "1px solid #86efac",
        color: "#166534",
    },
    warning: {
        backgroundColor: "#fef3c7",
        border: "1px solid #fcd34d",
        color: "#b45309",
    },
    error: {
        backgroundColor: "#fee2e2",
        border: "1px solid #fca5a5",
        color: "#b91c1c",
    },
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

const firstStoredValue = (keys) => {
    if (typeof window === "undefined") return null;
    for (const key of keys) {
        const value = window.localStorage.getItem(key);
        if (value && value !== "null" && value !== "undefined") {
            return value;
        }
    }
    return null;
};

const readStoredUser = () => {
    const raw = firstStoredValue(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.warn("Không thể parse ev_user từ localStorage", error);
        return null;
    }
};

const base64Decode = (value) => {
    if (!value) return "";
    try {
        if (typeof window !== "undefined" && typeof window.atob === "function") {
            return window.atob(value);
        }
        return Buffer.from(value, "base64").toString("utf-8");
    } catch (error) {
        console.warn("base64Decode thất bại", error);
        return "";
    }
};

const decodeJwtPayload = (token) => {
    if (!token || typeof token !== "string") return null;
    const segments = token.split(".");
    if (segments.length < 2) return null;
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = base64Decode(normalized);
    if (!decoded) return null;
    try {
        return JSON.parse(decoded);
    } catch (error) {
        console.warn("decodeJwtPayload: JSON.parse thất bại", error);
        return null;
    }
};

const parseStationCandidate = (candidate) => {
    if (candidate === null || candidate === undefined) return null;
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return String(candidate);
    }
    if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (!trimmed) return null;
        const numeric = Number(trimmed);
        return Number.isNaN(numeric) ? trimmed : String(numeric);
    }
    return null;
};

const extractStationIdFromUser = (user) => {
    if (!user || typeof user !== "object") return null;
    const candidates = [
        user.stationId,
        user.station_id,
        user.stationID,
        user.stationCode,
        user.station?.stationId,
        user.station?.id,
        user.station?.station_id,
        user.station?.stationCode,
        user.profile?.stationId,
        user.profile?.station?.stationId,
        user.employeeDetail?.stationId,
        user.employeeDetail?.station?.stationId,
        user.staffStationId,
    ];
    for (const candidate of candidates) {
        const parsed = parseStationCandidate(candidate);
        if (parsed) return parsed;
    }
    return null;
};

const extractStationIdFromToken = (token) => {
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return (
        parseStationCandidate(
            payload.stationId ??
            payload.stationID ??
            payload.station_id ??
            payload.stationCode ??
            payload.station
        ) || null
    );
};

const getManualStationId = () => {
    if (typeof window === "undefined") return "";
    const value = window.localStorage.getItem(STORAGE_KEYS.MANUAL_STATION);
    return value?.trim() || "";
};

const saveManualStationId = (value) => {
    if (typeof window === "undefined") return;
    if (!value) {
        window.localStorage.removeItem(STORAGE_KEYS.MANUAL_STATION);
        return;
    }
    window.localStorage.setItem(STORAGE_KEYS.MANUAL_STATION, value);
};

const determineInitialStationId = (authUser) => {
    const userCandidate =
        extractStationIdFromUser(authUser) || extractStationIdFromUser(readStoredUser());
    if (userCandidate) return userCandidate;

    const tokenCandidate = extractStationIdFromToken(firstStoredValue(STORAGE_KEYS.TOKEN));
    if (tokenCandidate) return tokenCandidate;

    // Prefer stationId saved at login
    if (typeof window !== 'undefined') {
        const savedStation = window.localStorage.getItem('ev_station_id');
        if (savedStation && savedStation.trim()) return savedStation.trim();
    }

    const manualCandidate = getManualStationId();
    if (manualCandidate) return manualCandidate;

    return "";
};

const normalizeStatus = (status) =>
    (status || "")
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/-+/g, "_");

const resolveStatus = (status) => {
    const normalized = normalizeStatus(status);
    const alias = STATUS_ALIASES[normalized];
    const key = alias || (STATUS_CONFIG[normalized] ? normalized : "default");
    const config = STATUS_CONFIG[key] || STATUS_CONFIG.default;
    return {
        key,
        label: config.label || status || "Không xác định",
        variant: config.variant,
        bucket: config.bucket,
        raw: status,
    };
};

const parseDateTime = (value) => {
    if (!value) {
        return { date: "—", time: "", raw: null };
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return { date: value, time: "", raw: null };
    }
    return {
        date: parsed.toLocaleDateString("vi-VN"),
        time: parsed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        raw: parsed,
    };
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return "—";
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return String(value);
    return currencyFormatter.format(numeric);
};

const deriveActions = (statusKey) => {
    switch (statusKey) {
        case "pending_deposit_payment":
            return ["view", "reject"];
        case "pending_deposit_confirmation":
            return ["view", "reject", "confirm"];
        case "pending_contract_signing":
            return ["view"];
        case "pending_vehicle_pickup":
        case "vehicle_pickup_overdue":
            return ["view", "vehicle"];
        case "vehicle_inspected_before_pickup":
            return ["view", "handover"];
        case "currently_renting":
            return ["view", "invoice"];
        case "total_fees_charged":
            return ["view"];
        case "vehicle_return_overdue":
            return ["view", "revenue"];
        case "vehicle_returned":
            return ["view", "revenue"];
        case "completed":
        default:
            return ["view"];
    }
};

// Trạng thái chỉ được cập nhật ở trang ReceiveCar sau khi hoàn tất nhận xe.
// Vì vậy 'invoice' không tự động đổi trạng thái ở đây nữa.
const ACTION_STATUS_MAP = {
    invoice: null,
    // revenue: không tự động đổi trạng thái, sẽ đổi trong trang Extra Fee khi nhấn "Gửi cho khách"
    confirm: "pending_contract_signing",
    handover: "currently_renting",
    reject: "cancelled",
};

const resolveVehicleDetailId = (source = {}) => {
    if (!source || typeof source !== "object") return null;
    const normalize = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) return null;
            const numeric = Number(trimmed);
            return Number.isNaN(numeric) ? trimmed : numeric;
        }
        if (typeof value === "number" && Number.isFinite(value)) return value;
        return null;
    };
    const candidates = [
        source.id,
        source.vehicleDetailId,
        source.vehicleDetailID,
        source.vehicle_details_id,
        source.vehicleDetailsId,
        source.vehicleDetailsID,
        source.assignedVehicleId,
        source.assigned_vehicle_id,
        source.vehicleId,
        source.vehicleID,
        source.vehicle_id,
        source.vehicle?.id,
        source.vehicle?.vehicleId,
        source.vehicle?.vehicleID,
        source.vehicle?.detailId,
        source.vehicle?.detail?.id,
        source.vehicle?.detail?.vehicleId,
        source.vehicleDetail?.id,
        source.vehicleDetail?.vehicleId,
        source.vehicleDetails?.id,
        source.vehicleDetails?.vehicleId,
    ];
    for (const candidate of candidates) {
        const normalized = normalize(candidate);
        if (normalized !== null) {
            return normalized;
        }
    }
    return null;
};

const getCachedHandoverSelection = (orderId) => {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem("handover-order");
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (!cached || typeof cached !== "object") return null;

        const cachedOrderId =
            cached.order?.id ??
            cached.order?.orderId ??
            cached.order?.raw?.id ??
            cached.order?.raw?.orderId ??
            cached.bookingId ??
            cached.orderId;

        if (
            cachedOrderId &&
            orderId &&
            String(cachedOrderId) !== String(orderId)
        ) {
            return null;
        }

        const candidateSources = [
            cached.vehicle,
            cached.vehicle?.raw,
            cached,
            cached.order,
            cached.order?.raw,
            { vehicleId: cached.vehicleId },
            { vehicleId: cached.vehicle?.id },
        ];

        let vehicleId = null;
        for (const source of candidateSources) {
            vehicleId = resolveVehicleDetailId(source);
            if (vehicleId) break;
        }

        const vehicleStatus =
            cached.vehicle?.status ||
            cached.vehicleStatus ||
            cached.order?.vehicleStatus ||
            cached.order?.raw?.vehicleStatus ||
            cached.vehicle?.raw?.status ||
            null;

        return { vehicleId, vehicleStatus };
    } catch (error) {
        console.warn("Unable to read cached handover selection", error);
        return null;
    }
};

const statusKeyToEnum = (statusKey) =>
    statusKey
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("_");

const mapBooking = (booking, fallbackId) => {
    const pickup = parseDateTime(
        booking.startDate ||
        booking.startTime ||
        booking.pickupDate ||
        booking.start_date ||
        booking.start_time
    );
    const dropoff = parseDateTime(
        booking.endDate ||
        booking.expectedReturnTime ||
        booking.returnDate ||
        booking.end_date ||
        booking.return_time
    );
    const status = resolveStatus(booking.status);
    const numericTotal = (() => {
        const candidate = booking.totalAmount ?? booking.total ?? booking.amount;
        const n = Number(candidate);
        return Number.isNaN(n) ? 0 : n;
    })();
    return {
        id:
            booking.id ||
            booking.bookingId ||
            booking.booking_id ||
            booking.code ||
            `booking-${fallbackId}`,
        customer: {
            name: booking.customerName || booking.renterName || booking.customer || "—",
            phone:
                booking.customerNumber ||
                booking.customerPhone ||
                booking.phone ||
                booking.renterPhone ||
                "",
        },
        car: booking.vehicleModel || booking.vehicleName || booking.carName || "—",
        pickup,
        dropoff,
        status,
        total: formatCurrency(numericTotal),
        totalValue: numericTotal,
        actions: deriveActions(status.key),
        raw: {
            ...booking,
            vehicleModelId: extractVehicleModelId(booking),
        },
    };
};

const matchesSearch = (order, term) => {
    const keyword = term.trim().toLowerCase();
    if (!keyword) return true;
    const haystack = [
        order.id,
        order.customer?.name,
        order.customer?.phone,
        order.car,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return haystack.includes(keyword);
};

const isSameDay = (dateA, dateB) =>
    dateA &&
    dateB &&
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();

const isWithinDays = (date, base, days) => {
    if (!date || !base) return false;
    const diff = base.getTime() - date.getTime();
    return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

const matchesDateFilter = (date, filter) => {
    if (!filter) return true;
    const now = new Date();
    switch (filter) {
        case "today":
            return isSameDay(date, now);
        case "week":
            return isWithinDays(date, now, 7);
        case "month":
            return isWithinDays(date, now, 30);
        default:
            return true;
    }
};

const OrdersTable = ({ title, orders, emptyMessage, onRenderRow, sortConfig, onSort }) => (
    <article className="orders-card">
        <header className="orders-card__header">
            <h2>{title}</h2>
            <span className="orders-card__count">{orders.length} đơn</span>
        </header>
        <div className="orders-table__scroll">
            <table className="orders-table">
                <thead>
                    <tr>
                        <th
                            className="orders-table__th--sortable"
                            onClick={() => onSort && onSort('id')}
                            aria-sort={sortConfig?.key === 'id' ? sortConfig.direction : 'none'}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' && onSort) onSort('id'); }}
                        >
                            Mã đơn {sortConfig?.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                            className="orders-table__th--sortable"
                            onClick={() => onSort && onSort('customer')}
                            aria-sort={sortConfig?.key === 'customer' ? sortConfig.direction : 'none'}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' && onSort) onSort('customer'); }}
                        >
                            Khách hàng {sortConfig?.key === 'customer' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                            className="orders-table__th--sortable"
                            onClick={() => onSort && onSort('car')}
                            aria-sort={sortConfig?.key === 'car' ? sortConfig.direction : 'none'}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' && onSort) onSort('car'); }}
                        >
                            Xe {sortConfig?.key === 'car' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                            className="orders-table__th--sortable"
                            onClick={() => onSort && onSort('pickup')}
                            aria-sort={sortConfig?.key === 'pickup' ? sortConfig.direction : 'none'}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' && onSort) onSort('pickup'); }}
                        >
                            Ngày thuê {sortConfig?.key === 'pickup' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                            className="orders-table__th--sortable"
                            onClick={() => onSort && onSort('dropoff')}
                            aria-sort={sortConfig?.key === 'dropoff' ? sortConfig.direction : 'none'}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' && onSort) onSort('dropoff'); }}
                        >
                            Ngày trả {sortConfig?.key === 'dropoff' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                            className="orders-table__th--sortable"
                            onClick={() => onSort && onSort('status')}
                            aria-sort={sortConfig?.key === 'status' ? sortConfig.direction : 'none'}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' && onSort) onSort('status'); }}
                        >
                            Trạng thái {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                            className="orders-table__th--sortable"
                            onClick={() => onSort && onSort('total')}
                            aria-sort={sortConfig?.key === 'total' ? sortConfig.direction : 'none'}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' && onSort) onSort('total'); }}
                        >
                            Tổng tiền {sortConfig?.key === 'total' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length ? (
                        orders.map(onRenderRow)
                    ) : (
                        <tr>
                            <td colSpan={8} className="orders-table__empty">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </article>
);

const OrdersList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stationId, setStationId] = useState(() => determineInitialStationId(user));
    const [manualStationValue, setManualStationValue] = useState(() => getManualStationId());
    const [manualInput, setManualInput] = useState(() => getManualStationId());
    const [isEditingStation, setIsEditingStation] = useState(
        () => !determineInitialStationId(user)
    );
    // --- Modal state for "reject" ---
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectTargetOrder, setRejectTargetOrder] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [connectionState, setConnectionState] = useState({
        status: stationId ? "idle" : "error",
        message: stationId ? "" : "Chưa tìm thấy trạm.",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [manualError, setManualError] = useState("");
    const [sortConfigHandover, setSortConfigHandover] = useState({ key: "", direction: "asc" });
    const [sortConfigReceiving, setSortConfigReceiving] = useState({ key: "", direction: "asc" });

    const requestSortHandover = (key) => {
        setSortConfigHandover((prev) => {
            const direction = prev.key === key && prev.direction === "asc" ? "desc" : "asc";
            return { key, direction };
        });
    };
    const requestSortReceiving = (key) => {
        setSortConfigReceiving((prev) => {
            const direction = prev.key === key && prev.direction === "asc" ? "desc" : "asc";
            return { key, direction };
        });
    };

    useEffect(() => {
        if (stationId) {
            setIsEditingStation(false);
            return;
        }
        setIsEditingStation(true);
    }, [stationId]);

    useEffect(() => {
        if (stationId) return;
        const derived = determineInitialStationId(user);
        if (derived) {
            setStationId(derived);
        }
    }, [user, stationId]);

    // Server search (optional): Try backend search API; fall back to client-side filter
    const handleSearch = async () => {
        if (!stationId) {
            setConnectionState({ status: "error", message: "Chưa xác định trạm để tìm kiếm." });
            return;
        }

        const q = (searchTerm || "").trim();
        // If no keyword, just refetch all to refresh view
        if (!q && !statusFilter && !dateFilter) {
            // Trigger the existing effect by toggling stationId message only
            setConnectionState({ status: "loading", message: `Đang tải đơn hàng cho trạm ${stationId}...` });
            try {
                const response = await api.get(`/api/bookings/station/${stationId}`);
                const payload = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
                const mapped = payload.map((item, index) => mapBooking(item, index));
                setOrders(mapped);
                setConnectionState({ status: mapped.length ? "success" : "warning", message: mapped.length ? `Đã tải ${mapped.length} đơn hàng.` : "Không có đơn phù hợp." });
            } catch (e) {
                setConnectionState({ status: "error", message: e?.response?.data?.message || e.message || "Không thể tải danh sách đơn hàng." });
            }
            return;
        }

        setLoading(true);
        setConnectionState({ status: "loading", message: "Đang tìm kiếm..." });
        try {
            // Preferred backend search endpoint (adjust if your BE differs)
            const res = await api.get(`/api/bookings/search`, {
                params: {
                    stationId,
                    q,
                    status: statusFilter || undefined,
                    dateRange: dateFilter || undefined,
                },
            });
            const payload = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
            const mapped = payload.map((item, index) => mapBooking(item, index));
            setOrders(mapped);
            setConnectionState({ status: "success", message: `Tìm thấy ${mapped.length} đơn phù hợp.` });
        } catch (err) {
            // Fallback gracefully to client-side filtering when search API is not available
            const status = err?.response?.status;
            if (status === 404 || status === 405 || status === 501) {
                setConnectionState({ status: "warning", message: "API tìm kiếm chưa sẵn sàng – dùng lọc tại chỗ." });
            } else {
                setConnectionState({ status: "warning", message: "Không thể tìm kiếm từ server – dùng lọc tại chỗ." });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!stationId) {
            setOrders([]);
            return;
        }

        let cancelled = false;

        const fetchOrders = async () => {
            setLoading(true);
            setError("");
            setConnectionState({
                status: "loading",
                message: `Đang tải đơn hàng cho trạm ${stationId}...`,
            });

            try {
                const response = await api.get(`/api/bookings/station/${stationId}`);
                const payload = Array.isArray(response.data)
                    ? response.data
                    : response.data?.data ?? [];
                const mapped = payload.map((item, index) => mapBooking(item, index));

                if (cancelled) return;

                setOrders(mapped);
                setConnectionState(
                    mapped.length
                        ? {
                            status: "success",
                            message: `Đã tải ${mapped.length} đơn hàng của trạm ${stationId}.`,
                        }
                        : {
                            status: "warning",
                            message: `Trạm ${stationId} chưa có đơn hàng nào.`,
                        }
                );
            } catch (fetchError) {
                if (cancelled) return;

                const message =
                    fetchError?.response?.data?.message ||
                    fetchError?.message ||
                    "Không thể tải danh sách đơn hàng.";

                setError(message);
                setOrders([]);
                setConnectionState({
                    status: "error",
                    message,
                });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
        return () => {
            cancelled = true;
        };
    }, [stationId]);

    const filteredOrders = useMemo(() => {
        const list = orders.filter((order) => {
            if (!matchesSearch(order, searchTerm)) return false;
            if (
                statusFilter &&
                order.status.key !== statusFilter &&
                order.status.raw?.toLowerCase() !== statusFilter
            ) {
                return false;
            }
            if (dateFilter && !matchesDateFilter(order.pickup.raw, dateFilter)) {
                return false;
            }
            return true;
        });
        return list;
    }, [orders, searchTerm, statusFilter, dateFilter]);

    const groupedOrders = useMemo(() => {
        return filteredOrders.reduce(
            (result, order) => {
                const bucket = order.status.bucket === "handover" ? "handover" : "receiving";
                result[bucket].push(order);
                return result;
            },
            { handover: [], receiving: [] }
        );
    }, [filteredOrders]);

    const sortOrders = (list, sortCfg) => {
        if (!sortCfg?.key) return list;
        const dir = sortCfg.direction === "desc" ? -1 : 1;
        const safeStr = (v) => (v === undefined || v === null ? "" : String(v).toLowerCase());
        const safeNum = (v) => (v === undefined || v === null || Number.isNaN(Number(v)) ? 0 : Number(v));
        const safeTime = (d) => (d && d instanceof Date && !Number.isNaN(d.getTime()) ? d.getTime() : 0);
        const compare = (a, b) => {
            switch (sortCfg.key) {
                case "id":
                    return safeStr(a.id).localeCompare(safeStr(b.id), undefined, { numeric: true }) * dir;
                case "customer":
                    return safeStr(a.customer?.name).localeCompare(safeStr(b.customer?.name)) * dir;
                case "car":
                    return safeStr(a.car).localeCompare(safeStr(b.car)) * dir;
                case "pickup":
                    return (safeTime(a.pickup?.raw) - safeTime(b.pickup?.raw)) * dir;
                case "dropoff":
                    return (safeTime(a.dropoff?.raw) - safeTime(b.dropoff?.raw)) * dir;
                case "status":
                    return safeStr(a.status?.label).localeCompare(safeStr(b.status?.label)) * dir;
                case "total":
                    return (safeNum(a.totalValue) - safeNum(b.totalValue)) * dir;
                default:
                    return 0;
            }
        };
        return [...list].sort(compare);
    };

    const sortedHandover = useMemo(() => sortOrders(groupedOrders.handover, sortConfigHandover), [groupedOrders, sortConfigHandover]);
    const sortedReceiving = useMemo(() => sortOrders(groupedOrders.receiving, sortConfigReceiving), [groupedOrders, sortConfigReceiving]);

    const applyStatusUpdate = (orderId, newStatusKey) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId
                    ? {
                        ...order,
                        status: resolveStatus(newStatusKey),
                        actions: deriveActions(newStatusKey),
                        raw: {
                            ...(order.raw || {}),
                            status: statusKeyToEnum(newStatusKey),
                        },
                    }
                    : order
            )
        );
    };

    const confirmReject = async () => {
        if (!rejectTargetOrder) return;
        const order = rejectTargetOrder;
        setRejectLoading(true);

        try {
            await api.put(
                "http://localhost:8084/EVRentalSystem/api/user/booking/update-status",
                null,
                {
                    params: {
                        bookingId: order.id,
                        status: "Cancelled",
                    },
                }
            );

            // cập nhật UI giống trước: applyStatusUpdate(order.id, "cancelled")
            applyStatusUpdate(order.id, "cancelled");

            setConnectionState({
                status: "success",
                message: `Đã huỷ đơn ${order.id} (Cancelled).`,
            });
        } catch (err) {
            console.error("Unable to call update-status", err);

            // Tùy chọn: vẫn apply tạm (giữ cùng behavior cũ)
            applyStatusUpdate(order.id, "cancelled");

            setConnectionState({
                status: "warning",
                message: `Không thể kết nối API huỷ đơn ${order.id}. Đã cập nhật tạm trạng thái (Cancelled).`,
            });
        } finally {
            setRejectLoading(false);
            setRejectModalOpen(false);
            setRejectTargetOrder(null);
        }
    };

    const attemptStatusUpdate = async (orderId, newStatusKey) => {
        const enumValue = statusKeyToEnum(newStatusKey);
        try {
            await api.put(`/api/bookings/${orderId}/status`, null, {
                params: { status: enumValue },
            });
            applyStatusUpdate(orderId, newStatusKey);
            setConnectionState({
                status: "success",
                message: `Đã cập nhật trạng thái đơn ${orderId}: ${STATUS_CONFIG[newStatusKey]?.label || enumValue
                    }.`,
            });
            return true;
        } catch (error) {
            console.warn("Unable to update booking status, applying mock update", error);
            applyStatusUpdate(orderId, newStatusKey);
            setConnectionState({
                status: "warning",
                message: `Không thể kết nối API, đã cập nhật tạm trạng thái đơn ${orderId}.`,
            });
            return false;
        }
    };

    const handleAction = async (order, action) => {
        if (!order) return;
        if (action === "reject") {
            // 1) Confirm với user
            setRejectTargetOrder(order);
            setRejectModalOpen(true);
            return;
        }
        let orderSnapshot = order;
        let updateSucceeded = null;
        const nextStatusKey = ACTION_STATUS_MAP[action];
        if (nextStatusKey) {
            updateSucceeded = await attemptStatusUpdate(order.id, nextStatusKey);
            orderSnapshot = {
                ...order,
                status: resolveStatus(nextStatusKey),
                actions: deriveActions(nextStatusKey),
                raw: {
                    ...(order.raw || {}),
                    status: statusKeyToEnum(nextStatusKey),
                },
            };
        }

        switch (action) {
            case "view":
                navigate(`/staff/orders/${order.id}`);
                break;
            case "confirm":
                // Xác nhận đặt cọc: chuyển trạng thái và tạo hợp đồng
                {
                    let contractCreated = false;
                    try {
                        await api.post('/api/contract/create', null, {
                            params: {
                                bookingId: order.id,
                                staffId: user?.id || user?.userId || user?.staffId
                            }
                        });
                        contractCreated = true;
                    } catch (contractError) {
                        console.error("Unable to create contract", contractError);
                    }

                    const statusMessage = updateSucceeded
                        ? "Đã xác nhận đặt cọc thành công."
                        : "Đã xác nhận đặt cọc (tạm thời do lỗi kết nối trạng thái).";

                    const contractMessage = contractCreated
                        ? "Hợp đồng đã được tạo."
                        : "Không thể tạo hợp đồng, vui lòng thử lại sau.";

                    const statusType =
                        updateSucceeded && contractCreated ? "success"
                            : updateSucceeded || contractCreated ? "warning"
                                : "error";

                    setConnectionState({
                        status: statusType,
                        message: `${statusMessage} ${contractMessage}`,
                    });
                }
                break;
            case "vehicle":
                try {
                    const payload = {
                        order: orderSnapshot,
                        stationId,
                        bookingId: order.id,
                        vehicleModelId:
                            orderSnapshot.raw?.vehicleModelId ||
                            orderSnapshot.raw?.vehicleModel?.vehicleId ||
                            null,
                    };
                    // Handover UI removed — navigate to order detail instead
                    sessionStorage.setItem("handover-order", JSON.stringify(payload));
                    navigate(`/staff/orders/${order.id}/handover`, { state: payload });
                } catch (storageError) {
                    console.warn("Unable to persist handover order payload", storageError);
                    navigate(`/staff/orders/${order.id}/handover`);
                }
                break;
            case "handover":
                {
                    const baseMessage = updateSucceeded
                        ? "Đã bàn giao xe cho khách."
                        : "Đã bàn giao xe cho khách (tạm thời do lỗi kết nối, vui lòng kiểm tra lại).";
                    const cachedSelection = getCachedHandoverSelection(orderSnapshot.id);
                    const vehicleId =
                        cachedSelection?.vehicle?.id ||
                        cachedSelection?.vehicleId ||
                        resolveVehicleDetailId(orderSnapshot.raw);
                    const previousVehicleStatus = cachedSelection?.vehicleStatus || "UNKNOWN";
                    if (!vehicleId) {
                        setConnectionState({
                            status: updateSucceeded ? "warning" : "error",
                            message: `${baseMessage} Không tìm thấy mã xe để cập nhật trạng thái.`,
                        });
                        break;
                    }
                    let vehicleUpdateSucceeded = false;
                    try {
                        await api.put("/api/vehicle-details/update-status", null, {
                            params: { vehicleId, newStatus: "RENTED" },
                        });
                        vehicleUpdateSucceeded = true;
                        if (typeof window !== "undefined") {
                            window.sessionStorage.removeItem("handover-order");
                            window.sessionStorage.setItem(
                                `vehicle-status-${vehicleId}`,
                                JSON.stringify({
                                    previous: previousVehicleStatus,
                                    current: "RENTED",
                                    updatedAt: Date.now(),
                                })
                            );
                        }
                    } catch (vehicleError) {
                        console.warn("Unable to update vehicle status", vehicleError);
                    }
                    const statusType =
                        updateSucceeded && vehicleUpdateSucceeded
                            ? "success"
                            : updateSucceeded || vehicleUpdateSucceeded
                                ? "warning"
                                : "error";
                    const detailMessage = vehicleUpdateSucceeded
                        ? "Trạng thái xe đã chuyển sang đang thuê."
                        : "Không thể cập nhật trạng thái xe.";
                    setConnectionState({
                        status: statusType,
                        message: `${baseMessage} ${detailMessage}`,
                    });
                }
                break;
            case "invoice":
                // Nhận xe: chuyển sang trang nhận xe để staff thực hiện kiểm tra chi tiết
                try {
                    // Prepare payload and navigate to the ReceiveCar flow so staff can
                    // upload inspection photos and finalize receiving.
                    try {
                        const payload = {
                            order: orderSnapshot,
                            stationId,
                            bookingId: order.id,
                            vehicleModelId:
                                orderSnapshot.raw?.vehicleModelId ||
                                orderSnapshot.raw?.vehicleModel?.vehicleId ||
                                null,
                        };
                        sessionStorage.setItem("handover-order", JSON.stringify(payload));
                        navigate(`/staff/orders/${order.id}/receive`, { state: payload });
                    } catch (navErr) {
                        console.warn("Unable to persist receive order payload", navErr);
                        navigate(`/staff/orders/${order.id}/receive`);
                    }

                    // Continue with the existing server-side updates (update return time / set vehicle AVAILABLE)
                    // so behavior remains compatible even if staff returns from the receive page.

                    // 1) Cập nhật thời gian trả
                    try {
                        await api.post(`/api/bookings/${order.id}/update-return-time`);
                    } catch (primaryErr) {
                        // Fallback nếu controller map dưới /api/staff
                        if (primaryErr?.response?.status === 404 || primaryErr?.response?.status === 405) {
                            await api.post(`/api/staff/${order.id}/update-return-time`);
                        } else {
                            throw primaryErr;
                        }
                    }
                    // 2) Đưa trạng thái xe về AVAILABLE
                    let vehicleUpdateSucceeded = false;
                    try {
                        const cachedSelection = getCachedHandoverSelection(orderSnapshot.id);
                        const vehicleId =
                            cachedSelection?.vehicle?.id ||
                            cachedSelection?.vehicleId ||
                            resolveVehicleDetailId(orderSnapshot.raw);

                        if (vehicleId) {
                            await api.put("/api/vehicle-details/update-status", null, {
                                params: { vehicleId, newStatus: "AVAILABLE" },
                            });
                            vehicleUpdateSucceeded = true;
                            if (typeof window !== "undefined") {
                                window.sessionStorage.setItem(
                                    `vehicle-status-${vehicleId}`,
                                    JSON.stringify({ previous: "RENTED", current: "AVAILABLE", updatedAt: Date.now() })
                                );
                            }
                        }
                    } catch (vehicleErr) {
                        console.warn("Unable to set vehicle AVAILABLE on receiving", vehicleErr);
                    }

                    const statusType = updateSucceeded && vehicleUpdateSucceeded ? "success" :
                        (updateSucceeded || vehicleUpdateSucceeded ? "warning" : "error");
                    const detailMessage = vehicleUpdateSucceeded
                        ? "Trạng thái xe đã chuyển sang sẵn sàng (AVAILABLE)."
                        : "Không thể cập nhật trạng thái xe về AVAILABLE.";

                    setConnectionState({
                        status: statusType,
                        message: updateSucceeded
                            ? `Đã nhận xe cho đơn ${order.id}. ${detailMessage}`
                            : `Đã nhận xe (cập nhật trạng thái cục bộ). ${detailMessage}`,
                    });
                } catch (err) {
                    console.error("Unable to update return time / vehicle availability", err);
                    setConnectionState({
                        status: updateSucceeded ? "success" : "warning",
                        message: updateSucceeded
                            ? `Đã nhận xe cho đơn ${order.id}. Đã cập nhật thời gian trả và trạng thái xe sẵn sàng.`
                            : `Đã gọi API nhận xe cho đơn ${order.id}, nhưng cập nhật trạng thái tạm thời do lỗi kết nối. Vui lòng kiểm tra lại.`,
                    });
                }
                break;
            case "revenue":
                navigate(`/staff/orders/${order.id}/extra-fee`);
                break;
            default:
                break;
        }
    };

    const renderOrderRow = (order) => (
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
                <span className={`status-badge status-badge--${order.status.variant}`}>
                    {order.status.label}
                </span>
            </td>
            <td className="orders-table__money">{order.total} </td>
            <td>
                <div className="orders-table__actions">
                    {order.actions.map((action) => {
                        const actionMeta =
                            action === "view"
                                ? { icon: "eye", variant: "view", label: "Xem chi tiết" }
                                : action === "confirm"
                                    ? { icon: "check", variant: "success", label: "Xác nhận đặt cọc" }
                                    : action === "vehicle"
                                        ? { icon: "car", variant: "vehicle", label: "Chuẩn bị xe" }
                                        : action === "handover"
                                            ? { icon: "key", variant: "key", label: "Bàn giao xe" }
                                            : action === "invoice"
                                                ? { icon: "key", variant: "success", label: "Nhận xe" }
                                                : action === "revenue"
                                                    ? { icon: "revenue", variant: "revenue", label: "Tính phí phát sinh" }
                                                    : action === "reject" // <-- thêm đoạn này
                                                        ? { icon: "cancel", variant: "danger", label: "Từ chối đặt cọc" }
                                                        : { icon: "eye", variant: "view", label: "Xem chi tiết" };

                        return (
                            <button
                                key={`${order.id}-${action}`}
                                type="button"
                                className={`orders-action orders-action--${actionMeta.variant}`}
                                title={actionMeta.label}
                                onClick={() => handleAction(order, action)}
                            >
                                <span className="orders-action__icon">
                                    {ICONS[actionMeta.icon] || ICONS.eye}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </td>
        </tr>
    );

    const handleManualSubmit = (event) => {
        event.preventDefault();
        const value = manualInput.trim();
        if (!value) {
            setManualError("Vui lòng nhập mã trạm hợp lệ.");
            return;
        }
        if (!/^\d+$/.test(value)) {
            setManualError("Mã trạm chỉ bao gồm số.");
            return;
        }

        saveManualStationId(value);
        setManualStationValue(value);
        setStationId(value);
        setManualError("");
        setIsEditingStation(false);
        setConnectionState({
            status: "loading",
            message: `Đang tải đơn hàng cho trạm ${value}...`,
        });
    };

    const handleManualReset = () => {
        saveManualStationId("");
        setManualStationValue("");
        setManualInput("");
        setManualError("");
        const fallback = determineInitialStationId(user);
        setStationId(fallback);
        if (!fallback) {
            setIsEditingStation(true);
            setConnectionState({
                status: "error",
                message: "Chưa cấu hình trạm cho nhân viên. Vui lòng nhập lại.",
            });
        }
    };

    return (
        <div className="staff-shell staff-shell--orders">
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
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleSearch();
                                            }
                                        }}
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="pending_deposit_confirmation">Chờ xác nhận đặt cọc</option>
                                    <option value="pending_contract_signing">Chờ ký hợp đồng</option>
                                    <option value="pending_vehicle_pickup">Chờ nhận xe</option>
                                    <option value="pending_renter_confirmation">Chờ khách xác nhận</option>
                                    <option value="vehicle_inspected_before_pickup">Đã kiểm tra xe</option>
                                    <option value="currently_renting">Đang thuê</option>
                                    <option value="vehicle_returned">Đã trả xe</option>
                                    <option value="total_fees_charged">Chờ thanh toán bổ sung</option>
                                    <option value="completed">Hoàn thành</option>
                                </select>
                                <select
                                    value={dateFilter}
                                    onChange={(event) => setDateFilter(event.target.value)}
                                >
                                    <option value="">Ngày thuê: Tất cả</option>
                                    <option value="today">Hôm nay</option>
                                    <option value="week">7 ngày gần nhất</option>
                                    <option value="month">30 ngày gần nhất</option>
                                </select>
                                <button type="button" className="staff-orders__export" onClick={handleSearch}>
                                    Tìm kiếm 🔍
                                </button>
                            </div>
                        </header>

                        {connectionState.status !== "idle" && (
                            <div
                                className="staff-orders__connection"
                                style={{
                                    ...(CONNECTION_STYLE[connectionState.status] || CONNECTION_STYLE.loading),
                                    marginTop: "12px",
                                    marginBottom: "12px",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    display: "inline-block",
                                }}
                            >
                                {connectionState.message}
                            </div>
                        )}

                        {stationId && (
                            <div>

                            </div>
                        )}

                        {/* Manual station form removed: stationId is auto-derived at login */}

                        <section className="orders-board">
                            <OrdersTable
                                title="Đơn hàng bàn giao"
                                orders={loading ? [] : sortedHandover}
                                emptyMessage={
                                    loading
                                        ? "Đang tải danh sách đơn hàng..."
                                        : "Không có đơn hàng nào cần bàn giao."
                                }
                                onRenderRow={renderOrderRow}
                                sortConfig={sortConfigHandover}
                                onSort={requestSortHandover}
                            />

                            <OrdersTable
                                title="Đơn hàng nhận xe"
                                orders={loading ? [] : sortedReceiving}
                                emptyMessage={
                                    loading
                                        ? "Đang tải danh sách đơn hàng..."
                                        : "Không có đơn hàng nào trong quá trình nhận xe."
                                }
                                onRenderRow={renderOrderRow}
                                sortConfig={sortConfigReceiving}
                                onSort={requestSortReceiving}
                            />
                        </section>

                        {error && (
                            <div
                                style={{
                                    marginTop: "16px",
                                    padding: "12px 16px",
                                    borderRadius: "10px",
                                    border: "1px solid #fca5a5",
                                    backgroundColor: "#fee2e2",
                                    color: "#b91c1c",
                                    fontSize: "14px",
                                    maxWidth: "640px",
                                }}
                            >
                                {error}
                            </div>
                        )}
                    </section>
                </main>
            </div>
            {/* REJECT CONFIRM MODAL */}
            {rejectModalOpen && (
                <div className="orders-overlay">
                    <div className="orders-modal">

                        <h3 className="orders-modal__title">Xác nhận hủy đơn</h3>

                        <p className="orders-modal__desc">
                            Bạn có chắc muốn <strong>hủy</strong> đơn số {" "}
                            <span className="font-medium">{rejectTargetOrder?.id}</span> không?<br />
                        </p>

                        <div className="orders-modal__actions">
                            <button
                                type="button"
                                className="orders-modal__btn orders-modal__btn--cancel"
                                onClick={() => {
                                    if (!rejectLoading) {
                                        setRejectModalOpen(false);
                                        setRejectTargetOrder(null);
                                    }
                                }}
                                disabled={rejectLoading}
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                className="orders-modal__btn orders-modal__btn--danger"
                                onClick={confirmReject}
                                disabled={rejectLoading}
                            >
                                {rejectLoading ? "Đang hủy..." : "Xác nhận"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );

};

export default OrdersList;
