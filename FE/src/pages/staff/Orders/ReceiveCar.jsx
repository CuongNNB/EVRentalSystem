import React, { useCallback, useMemo, useState } from "react";
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
import "./ReceiveCar.css";

// helpers outside component to satisfy lint rules
async function createPlaceholderBlob() {
	return await new Promise((res) => {
		const c = document.createElement("canvas");
		c.width = 1;
		c.height = 1;
		const ctx = c.getContext("2d");
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, 1, 1);
		c.toBlob(res, "image/png");
	});
}



// additional fee helper: directly create on backend (backend computes final money if needed)
async function createAdditionalFee(bookingId, feeName, amount, desc) {
	const bid = Number(bookingId);
	if (!Number.isFinite(bid)) {
		console.warn("createAdditionalFee skipped: non-numeric bookingId", bookingId);
		return false;
	}
	try {
		await api.post("/api/additional-fee/create", null, {
			params: { bookingId: bid, feeName, amount, desc },
		});
		return true;
	} catch (error_) {
		console.warn("createAdditionalFee error", error_);
		return false;
	}
}

export default function ReceiveCar() {
	const navigate = useNavigate();
	const location = useLocation();
	const { orderId = "EV0205010" } = useParams();

	const [photos, setPhotos] = useState({});
	const [descriptions, setDescriptions] = useState({});
	const [notification, setNotification] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [additionalRows, setAdditionalRows] = useState([]);
	const [bookingDetails, setBookingDetails] = useState(null);
	const [renterDetails, setRenterDetails] = useState(null);

	// Vehicle from previous step
	const vehicleInfo = useMemo(() => {
		const state = location.state || {};
		return state.vehicle || null;
	}, [location.state]);

	const resolveVehicleImage = () => {
		if (vehicleInfo?.imageUrl) return vehicleInfo.imageUrl;
		const lower = (s) => String(s || "").trim().toLowerCase();
		const candidates = [vehicleInfo?.name, bookingDetails?.vehicleModel].filter(Boolean);
		for (const candidate of candidates) {
			const candLower = lower(candidate);
			for (const key of Object.keys(carDatabase)) {
				const entry = carDatabase[key];
				if (lower(entry?.name) === candLower && entry?.images?.length) return entry.images[0];
			}
		}
		return "/carpic/1.jpg";
	};

	// pick booking/renter details if provided
	useMemo(() => {
		const state = location.state || {};
		if (state.bookingDetails) setBookingDetails(state.bookingDetails);
		if (state.renterDetails) setRenterDetails(state.renterDetails);
	}, [location.state]);

	// resolve staffId robustly
	const staffId = useMemo(() => {
		const state = location.state || {};
		const candidates = [
			state.staffId,
			state.order?.staffId,
			state.order?.staff?.id,
			state.order?.raw?.staffId,
			state.order?.raw?.staff?.id,
		];
			if (typeof globalThis !== "undefined" && globalThis.localStorage) {
			try {
					const cachedUser = globalThis.localStorage.getItem("ev_user");
				if (cachedUser) {
					const parsed = JSON.parse(cachedUser);
					candidates.push(parsed?.id, parsed?.userId, parsed?.staffId);
				}
			} catch {}
		}
		for (const c of candidates) {
			if (c !== undefined && c !== null) {
				const n = Number(c);
				if (!Number.isNaN(n)) return n;
			}
		}
		return null;
	}, [location.state]);

	// bookingId resolution
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
		for (const c of candidates) {
			if (c !== undefined && c !== null) {
				const normalized = String(c).trim();
				if (normalized) return normalized;
			}
		}
		return "";
	}, [location.state, orderId]);

	// slots & row extension
	const photoSlots = useMemo(() => buildInspectionSlots(additionalRows), [additionalRows]);
	const allowedSlotIds = useMemo(() => new Set(photoSlots.map((s) => s.id)), [photoSlots]);
	const optionalRowSlots = useMemo(
		() => ROW_INSPECTION_SLOTS.filter((slot) => slot.id !== "row1" && slot.id !== "row2"),
		[]
	);
	const remainingRowSlots = useMemo(
		() => optionalRowSlots.filter((slot) => !additionalRows.includes(slot.id)),
		[optionalRowSlots, additionalRows]
	);
	const handleAddRow = (rowId) => setAdditionalRows((prev) => (prev.includes(rowId) ? prev : [...prev, rowId]));

	const handleUpload = (e, slotId) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onloadend = () =>
			setPhotos((p) => ({
				...p,
				[slotId]: { file, preview: reader.result },
			}));
		reader.readAsDataURL(file);
	};

		// create a single inspection (after)
		const createInspection = useCallback(async (slotId, file, desc) => {
		const partName = getInspectionPart(slotId);
		if (!partName) return false;
		try {
			const formData = new FormData();
			formData.append("bookingId", String(bookingId));
			formData.append("partName", String(partName)); // case-sensitive
			// ensure file has a filename
			let fileToSend = file;
			if (file && !(file instanceof File)) {
				fileToSend = new File([file], "inspection.png", { type: file.type || "image/png" });
			}
			formData.append("picture", fileToSend);
			formData.append("description", desc || "");
			formData.append("staffId", String(staffId ?? "0"));
			formData.append("status", DEFAULT_INSPECTION_STATUS);

			await api.post("/api/inspections-after/create", formData);
					return true;
		} catch (err) {
			console.error("createInspection error", err);
			if (err?.response?.data) console.error("server error body:", err.response.data);
			return false;
		}
			}, [bookingId, staffId]);

  

			const submitPhotoEntries = useCallback(async (entries) => {
			let success = 0, fail = 0;
			for (const [slotId, data] of entries) {
				const ok = await createInspection(slotId, data.file, descriptions[slotId] || "");
				if (ok) success++; else fail++;
			}
			return { success, fail };
			}, [createInspection, descriptions]);

			const submitTextOnlyEntries = useCallback(async () => {
			let success = 0, fail = 0;
			const textOnly = ["odometer", "battery"];
			for (const slotId of textOnly) {
				if (descriptions[slotId] && String(descriptions[slotId]).trim()) {
					const blob = await createPlaceholderBlob();
					const ok = await createInspection(slotId, blob, descriptions[slotId] || "");
					if (ok) success++; else fail++;
				}
			}
			return { success, fail };
			}, [createPlaceholderBlob, createInspection, descriptions]);

  

		async function handleReceive() {
		if (isSending) return;
		setErrorMessage("");
		setNotification("");

		if (!bookingId) {
			setErrorMessage("Không tìm thấy mã đơn hàng.");
			return;
		}
		if (!staffId) {
			setErrorMessage("Không tìm thấy mã nhân viên.");
			return;
		}

		// Require at least one photo (excluding odometer/battery)
		const photoEntries = Object.entries(photos).filter(
			([slotId, value]) => allowedSlotIds.has(slotId) && value?.file && slotId !== "odometer" && slotId !== "battery"
		);
		if (photoEntries.length === 0) {
			setErrorMessage("Vui lòng tải lên ít nhất một ảnh kiểm tra xe.");
			return;
		}

			setIsSending(true);
			try {
				const { success: s1, fail: f1 } = await submitPhotoEntries(photoEntries);
				const { success: s2, fail: f2 } = await submitTextOnlyEntries();
				const success = s1 + s2;
				const fail = f1 + f2;

				if (success === 0) {
				setErrorMessage("Không thể tạo biên bản nhận xe. Vui lòng thử lại.");
				setIsSending(false);
				return;
			}


				// Create additional fees for odometer and battery if applicable (backend auto-calculates money)
				let feeMessages = [];
				// Odometer -> Over_Mileage_Fee (send current odo as input; server computes final fee)
				if (descriptions.odometer && String(descriptions.odometer).trim()) {
					const odoVal = Number(descriptions.odometer);
					if (!Number.isNaN(odoVal)) {
						const ok = await createAdditionalFee(
							bookingId,
							"Over_Mileage_Fee",
							odoVal,
							descriptions.odometer || "Phí vượt số km"
						);
						if (ok) feeMessages.push("Đã tạo phí vượt km.");
					}
				}
				// Battery -> Fuel_Fee (send current battery level as input; server computes final fee)
				if (descriptions.battery && String(descriptions.battery).trim()) {
					const batVal = Number.parseInt(descriptions.battery);
					if (!Number.isNaN(batVal)) {
						const ok = await createAdditionalFee(
							bookingId,
							"Fuel_Fee",
							batVal,
							descriptions.battery || "Phí mức pin"
						);
						if (ok) feeMessages.push("Đã tạo phí pin.");
					}
				}

			const baseMessage = fail > 0
				? `Đã tạo ${success} biên bản, ${fail} mục thất bại.`
				: `Đã hoàn tất biên bản nhận xe (${success} mục).`;
			const feePart = feeMessages.length ? ` ${feeMessages.join("; ")}.` : "";
			const message = `${baseMessage}${feePart}`;
			setNotification(message);
			setTimeout(() => navigate(`/staff/orders/${orderId}/extra-fee`, { replace: true }), 2000);
		} catch (e) {
			console.error("handleReceive error", e);
			setErrorMessage("Lỗi khi gửi biên bản nhận xe.");
			setIsSending(false);
		}
	}

	const renderPhotoSlot = (s) => (
		<div
			key={s.id}
			className={`return-check__photo-slot-wrapper ${photos[s.id]?.preview ? "return-check__photo-slot-wrapper--active" : ""}`}
		>
			<label className="return-check__photo-slot">
				<input type="file" accept="image/*" onChange={(e) => handleUpload(e, s.id)} />
				<div className="return-check__photo-frame">
					{photos[s.id]?.preview ? (
						<img src={photos[s.id].preview} alt={s.label} className="return-check__photo-img" />
					) : (
						<span className="return-check__photo-placeholder">📷</span>
					)}
				</div>
				<p className="return-check__photo-label">{s.label}</p>
			</label>

			{photos[s.id]?.preview && (
				<div className="return-check__photo-description-wrapper">
					<label htmlFor={`desc-${s.id}`} className="return-check__photo-description-label">💬 Mô tả cho ảnh này:</label>
					<textarea
						id={`desc-${s.id}`}
						className="return-check__photo-description"
						placeholder={`Ví dụ: "Không có vết xước", "Đèn hoạt động tốt"...`}
						value={descriptions[s.id] || ""}
						onChange={(e) => setDescriptions((prev) => ({ ...prev, [s.id]: e.target.value }))}
						rows={2}
					/>
					<span className="return-check__photo-description-hint">{descriptions[s.id]?.length || 0} ký tự</span>
				</div>
			)}
		</div>
	);

		const renderTextSlot = (s) => (
		<div key={s.id} className="return-check__text-input-wrapper">
			<label className="return-check__text-input-label">
				<span className="return-check__text-input-icon">{s.id === "odometer" ? "📊" : "🔋"}</span>
				<span className="return-check__text-input-title">{s.label}</span>
			</label>
			<div className="return-check__input-group">
				<input
					type="number"
						min="0"
					max={s.id === "battery" ? "100" : undefined}
					className="return-check__text-input"
					placeholder={`Nhập ${s.id === "odometer" ? "số km hiện tại" : "mức pin (0-100)"}`}
					value={descriptions[s.id] || ""}
					onChange={(e) => {
						let value = e.target.value;
						if (s.id === "battery") {
								const num = Number.parseInt(value);
							if (!Number.isNaN(num)) {
								if (num > 100) value = "100";
								if (num < 0) value = "0";
							}
						}
						setDescriptions((prev) => ({ ...prev, [s.id]: value }));
					}}
				/>
				<span className="return-check__suffix">{s.id === "odometer" ? "km" : "%"}</span>
			</div>
		</div>
	);

	return (
		<div className="staff-shell staff-shell--orders">
			<StaffHeader />
			<div className="staff-layout staff-layout--orders">
				<StaffSlideBar activeKey="orders" />
				<main className="staff-main">
					<section className="return-check">
						<header className="return-check__header">
							<h1>
								Quản lý nhận xe <span># {orderId}</span>
							</h1>
							<p>Ghi nhận trạng thái xe khi nhận về</p>
						</header>

									{notification && (
										<output className="return-check__toast">
											<span className="return-check__toast-icon" aria-hidden="true">✅</span>
											<div>
												<p className="return-check__toast-title">Thành công</p>
												<p className="return-check__toast-message">{notification}</p>
											</div>
										</output>
									)}
						{errorMessage && (
							<div className="return-check__toast" role="alert" style={{ background: "rgba(248, 113, 113, 0.18)", color: "#b91c1c" }}>
								<span className="return-check__toast-icon" aria-hidden="true">⚠️</span>
								<div>
									<p className="return-check__toast-title">Gửi thất bại</p>
									<p className="return-check__toast-message">{errorMessage}</p>
								</div>
							</div>
						)}

						{renterDetails && (
							<section className="return-check__vehicle-info">
								<header className="return-check__vehicle-header"><h2>Thông tin người thuê</h2></header>
								<div className="return-check__vehicle-details">
									<div className="return-check__vehicle-card">
										<dl className="return-check__vehicle-specs">
											<div><dt>Họ và tên</dt><dd>{renterDetails.fullName || "—"}</dd></div>
											<div><dt>Email</dt><dd>{renterDetails.email || "—"}</dd></div>
											<div><dt>Số điện thoại</dt><dd>{renterDetails.phoneNumber || "—"}</dd></div>
										</dl>
									</div>
								</div>
							</section>
						)}

						{vehicleInfo && (
							<section className="return-check__vehicle-info">
								<header className="return-check__vehicle-header"><h2>Thông tin xe kiểm tra</h2></header>
								<div className="return-check__vehicle-details">
									<div className="return-check__vehicle-card">
										<div className="return-check__vehicle-preview" style={{ minWidth: 180 }}>
											<img
												src={resolveVehicleImage()}
												alt={vehicleInfo?.name || "Vehicle"}
												style={{ width: 160, height: 100, objectFit: "cover", borderRadius: 8 }}
												onError={(e) => {
													e.currentTarget.src = "/carpic/1.jpg";
												}}
											/>
											<strong>{vehicleInfo.plate || "—"}</strong>
										</div>
										<dl className="return-check__vehicle-specs">
											<div><dt>Tên xe</dt><dd>{vehicleInfo.name || "—"}</dd></div>
											<div><dt>Màu sắc</dt><dd>{vehicleInfo.color || "—"}</dd></div>
											<div><dt>Dung lượng pin</dt><dd>{vehicleInfo.battery || "—"}</dd></div>
											<div><dt>Quãng đường</dt><dd>{vehicleInfo.mileage || "—"}</dd></div>
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
										if (slot.id === "odometer" || slot.id === "battery") return renderTextSlot(slot);
										return renderPhotoSlot(slot);
									})}

									{remainingRowSlots.map((slot) => (
										<div key={slot.id} className="return-check__add-row-wrapper">
											<button type="button" className="return-check__add-row-button" onClick={() => handleAddRow(slot.id)}>
												<div className="return-check__add-row-icon"><span className="return-check__add-row-plus">+</span></div>
												<span className="return-check__add-row-label">Thêm {slot.label}</span>
											</button>
										</div>
									))}
								</div>
							</section>
						</div>

						<footer className="return-check__actions">
					
							<div className="return-check__action-group">
								<button type="button" className="return-check__action return-check__action--primary" onClick={handleReceive} disabled={isSending}>
									{isSending ? "Đang xử lý..." : "Tính phí phát sinh"}
								</button>
							</div>
						</footer>
					</section>
				</main>
			</div>
		</div>
	);
}

