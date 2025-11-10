import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import api from "../../../utils/api";
import { getRenterDetail, mapRenterDetail } from "../../../api/users";
import "../StaffLayout.css";
import "./OrderDetail.css";

// Component cho status badge với animation
const StatusBadge = ({ variant, children, animated = false }) => (
  <span className={`order-detail__status order-detail__status--${variant} ${animated ? 'order-detail__status--animated' : ''}`}>
    {children}
  </span>
);

// Component cho action buttons
const ActionButton = ({ 
  variant = "primary", 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  icon = null 
}) => (
  <button
    type="button"
    className={`order-detail__action-btn order-detail__action-btn--${variant}`}
    onClick={onClick}
    disabled={disabled || loading}
  >
    {loading && <span className="order-detail__spinner"></span>}
    {icon && <span className="order-detail__btn-icon">{icon}</span>}
    {children}
  </button>
);

// Component cho document viewer
const DocumentViewer = ({ documents, title }) => (
  <div className="order-detail__doc-viewer">
    <h4 className="order-detail__doc-title">{title}</h4>
    <div className="order-detail__doc-grid">
      {documents.map((doc, index) => (
        <div key={index} className="order-detail__doc-item">
          <div className="order-detail__doc-preview">
            {doc.url ? (
              <img 
                src={doc.url} 
                alt={doc.label}
                className="order-detail__doc-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="order-detail__doc-fallback"
              style={{ display: doc.url ? 'none' : 'flex' }}
            >
              📄
            </div>
          </div>
          <p className="order-detail__doc-label">{doc.label}</p>
          {doc.url && (
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="order-detail__doc-link"
            >
              Xem chi tiết
            </a>
          )}
        </div>
      ))}
    </div>
  </div>
);


const OrderDetail = () => {
  const navigate = useNavigate();
  // Support multiple possible route param names: :bookingId or :id or :orderId
  const { bookingId: bookingIdParam, id: idParam, orderId: orderIdParam } = useParams();
  const bookingId = bookingIdParam || idParam || orderIdParam;
  
  // Core states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Data states
  const [renterDetails, setRenterDetails] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  // Action states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch order details with improved error handling
  const fetchOrderDetails = useCallback(async () => {
    if (!bookingId) {
      setError("Không tìm thấy mã đơn hàng");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      // Gọi song song các API
      const [renterResponse, bookingResponse, verificationResponse] = await Promise.allSettled([
        api.get(`/api/bookings/${bookingId}/renter-details`, {
          params: { bookingId: parseInt(bookingId) }
        }),
        api.get(`/api/bookings/booking-details`, {
          params: { bookingId: parseInt(bookingId) }
        }),
        api.get(`/api/renter-detail/verification-status`, {
          params: { bookingId: parseInt(bookingId) }
        })
      ]);

      // Process successful responses
      let bookingData;
      if (renterResponse.status === 'fulfilled') {
        const renterDataRaw = renterResponse.value.data?.data || renterResponse.value.data;
        setRenterDetails(renterDataRaw);
      } else {
        console.warn("Failed to fetch renter details:", renterResponse.reason);
        setRenterDetails(null);
      }

      if (bookingResponse.status === 'fulfilled') {
        bookingData = bookingResponse.value.data?.data || bookingResponse.value.data;
        setBookingDetails(bookingData);
      } else {
        console.warn("Failed to fetch booking details:", bookingResponse.reason);
        setBookingDetails(null);
      }

      if (verificationResponse.status === 'fulfilled') {
        const verificationData = verificationResponse.value.data?.data || verificationResponse.value.data;
        setVerificationStatus(verificationData);
      } else {
        console.warn("Failed to fetch verification status:", verificationResponse.reason);
        setVerificationStatus('PENDING');
      }

      // Fallback: if renter details missing doc URLs, try user profile renter-detail API
      const hasDocs = (rd) => !!(rd && (rd.cccdFrontUrl || rd.frontCccd || rd.cccdBackUrl || rd.backCccd || rd.gplx || rd.driverLicenseUrl || rd.driverLicenseImageUrl));
      if (!hasDocs(renterDetails) && bookingData?.userId) {
        try {
          const userDetailRaw = await getRenterDetail(bookingData.userId);
          const mapped = mapRenterDetail(userDetailRaw);
          setRenterDetails(prev => ({ ...(prev || {}), ...mapped }));
        } catch (e) {
          console.warn('Fallback renter-detail by user failed:', e.message);
        }
      }

    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Không thể tải thông tin đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  }, [bookingId, getRenterDetail]);

  // Load data on mount
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Helper functions để format dữ liệu
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "—";
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    const statusMap = {
        Pending_Deposit_Confirmation: { label: "Chờ xác nhận đặt cọc", variant: "warning" },
        Pending_Contract_Signing: { label: "Chờ ký hợp đồng", variant: "warning" },
        Pending_Vehicle_Pickup: { label: "Chờ nhận xe", variant: "warning" },
        Pending_Renter_Confirmation: { label: "Chờ khách xác nhận", variant: "warning" },
        Vehicle_Inspected_Before_Pickup: { label: "Đã kiểm tra xe", variant: "info" },
        Currently_Renting: { label: "Đang thuê", variant: "success" },
        Vehicle_Returned: { label: "Đã trả xe", variant: "success" },
        Total_Fees_Charged: { label: "Tính phí bổ sung", variant: "warning" },
        Completed: { label: "Hoàn thành", variant: "success" },
    };
    return statusMap[status] || { label: status, variant: "default" };
  };

  const getVerificationStatusConfig = (status) => {
    const statusMap = {
      VERIFIED: { label: "Đã xác minh", variant: "success" },
      PENDING: { label: "Chờ xác minh", variant: "warning" },
      REJECTED: { label: "Từ chối", variant: "error" },
    };
    return statusMap[status] || { label: "Chờ xác minh", variant: "warning" };
  };

  // Prepare documents data for DocumentViewer
  const getDocumentsData = () => {
    if (!renterDetails) return [];
    const documents = [];

    const gplxUrl = renterDetails.gplx || renterDetails.driverLicenseUrl || renterDetails.driverLicenseImageUrl;
    const frontUrl = renterDetails.frontCccd || renterDetails.cccdFrontUrl || renterDetails.frontCccdUrl;
    const backUrl = renterDetails.backCccd || renterDetails.cccdBackUrl || renterDetails.backCccdUrl;

    if (gplxUrl) documents.push({ key: 'gplx', label: 'Giấy phép lái xe', url: gplxUrl });
    if (frontUrl) documents.push({ key: 'frontCccd', label: 'CCCD - Mặt trước', url: frontUrl });
    if (backUrl) documents.push({ key: 'backCccd', label: 'CCCD - Mặt sau', url: backUrl });

    return documents;
  };

  const [preparedDocs, setPreparedDocs] = useState([]);

  // Detect and normalize base64 image strings to data URLs
  const looksLikeBase64 = useCallback((s) => {
    if (typeof s !== 'string') return false;
    const t = s.trim();
    if (t.length < 50) return false; // too short to be an image
    // Allow letters, numbers, + / = and optional newlines
    if (!/^[A-Za-z0-9+/=\r\n]+$/.test(t)) return false;
    const noNl = t.replace(/[\r\n]/g, '');
    return noNl.length % 4 === 0;
  }, []);

  const ensureDataUrl = useCallback((u) => {
    if (!u) return null;
    if (/^data:/i.test(u)) return u; // already a data URL
    // Sometimes backend may return "image/png;base64,AAAA..." (missing data: prefix)
    if (/^[a-z]+\/[a-z0-9.+-]+;base64,/i.test(u)) return `data:${u}`;
    if (looksLikeBase64(u)) return `data:image/jpeg;base64,${u}`; // default to jpeg
    return null;
  }, [looksLikeBase64]);

  const resolveAbsoluteUrl = useCallback((u) => {
    if (!u) return null;
    if (/^(https?:)?\/\//i.test(u) || /^data:/i.test(u)) return u;
    try {
      const base = api.defaults?.baseURL || '';
      const url = new URL(base);
      const baseOrigin = url.origin;
      const basePath = url.pathname.replace(/\/$/, '');
      if (u.startsWith('/')) {
        // Join origin + basePath + u
        return `${baseOrigin}${basePath}${u}`;
      }
      return `${baseOrigin}${basePath}/${u}`;
    } catch {
      return u;
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const urlsToRevoke = [];

    const load = async () => {
      const docs = getDocumentsData();
      if (docs.length === 0) {
        setPreparedDocs([]);
        return;
      }
      const results = await Promise.all(docs.map(async (d) => {
        // First, check if it's base64 and convert to data URL
        const asData = ensureDataUrl(d.url);
        if (asData) {
          return { ...d, blobUrl: asData, linkUrl: asData };
        }
        const resolved = resolveAbsoluteUrl(d.url);
        if (!resolved) return { ...d, blobUrl: null, error: true };
        // data URL - use directly
        if (/^data:/i.test(resolved)) {
          return { ...d, blobUrl: resolved, linkUrl: resolved };
        }
        try {
          const resp = await api.get(resolved, { responseType: 'blob' });
          const blobUrl = URL.createObjectURL(resp.data);
          urlsToRevoke.push(blobUrl);
          return { ...d, blobUrl, linkUrl: blobUrl };
        } catch (e) {
          // Fallback: try using resolved URL directly (public)
          return { ...d, blobUrl: null, linkUrl: resolved, error: true };
        }
      }));
      if (!isCancelled) setPreparedDocs(results);
    };

    load();
    return () => {
      isCancelled = true;
      urlsToRevoke.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renterDetails]);

  // Action handlers
  const handleVerifyRenter = async () => {
    if (!bookingId) {
      setError("Không tìm thấy mã đơn hàng");
      return;
    }

    try {
      setIsVerifying(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post("/api/renter-detail/verify-renter", null, {
        params: { bookingId: parseInt(bookingId) }
      });

      if (response.data.success) {
        setVerificationStatus('VERIFIED');
        setSuccessMessage("Đã xác minh thông tin người thuê thành công!");
        // Refresh data to get updated status
        setTimeout(() => fetchOrderDetails(), 1000);
      }
    } catch (err) {
      console.error("Error verifying renter:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Không thể xác minh thông tin người thuê"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateBookingStatus = async (newStatus) => {
    if (!bookingId) {
      setError("Không tìm thấy mã đơn hàng");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setError("");
      setSuccessMessage("");

      const response = await api.put(`/api/bookings/${bookingId}/status`, null, {
        params: { status: newStatus }
      });

      if (response.data.success) {
        setSuccessMessage(`Đã cập nhật trạng thái đơn hàng thành "${getStatusConfig(newStatus).label}"`);
        // Refresh data to get updated status
        setTimeout(() => fetchOrderDetails(), 1000);
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Không thể cập nhật trạng thái đơn hàng"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="staff-shell staff-shell--orders">
      <StaffHeader />
      <div className="staff-layout staff-layout--orders">
        <StaffSlideBar activeKey="orders" />

        <main className="staff-main">
          <section className="order-detail">
            {/* Header Section */}
            <header className="order-detail__top">
              <ActionButton 
                variant="secondary" 
                onClick={() => navigate(-1)}
                icon="←"
              >
                Quay lại
              </ActionButton>
              <div className="order-detail__header-info">
                <h1>
                  Chi tiết đơn hàng{" "}
                  <span className="order-detail__code">#{bookingId || "N/A"}</span>
                </h1>
                {bookingDetails && (
                  <StatusBadge 
                    variant={getStatusConfig(bookingDetails.status).variant}
                    animated={true}
                  >
                    {getStatusConfig(bookingDetails.status).label}
                  </StatusBadge>
                )}
              </div>
            </header>

            {/* Message Alerts */}
            {error && (
              <div className="order-detail__alert order-detail__alert--error" onClick={clearMessages}>
                <span className="order-detail__alert-icon">⚠️</span>
                <div>
                  <strong>Lỗi:</strong> {error}
                </div>
                <button className="order-detail__alert-close">×</button>
              </div>
            )}

            {successMessage && (
              <div className="order-detail__alert order-detail__alert--success" onClick={clearMessages}>
                <span className="order-detail__alert-icon">✅</span>
                <div>{successMessage}</div>
                <button className="order-detail__alert-close">×</button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="order-detail__loading">
                <div className="order-detail__spinner-large"></div>
                <p>Đang tải thông tin đơn hàng...</p>
              </div>
            )}

            {/* Content */}
            {!loading && (
              <>

                {/* Main Content */}
                <div className="order-detail__content">
                  <div className="order-detail__grid">
                      {/* Renter Information Card */}
                      {renterDetails ? (
                        <section className="order-card order-card--renter">
                        <header className="order-card__header">
                          <h2>👤 Thông tin người thuê</h2>
                          <StatusBadge 
                            variant={getVerificationStatusConfig(verificationStatus).variant}
                            animated={verificationStatus === 'VERIFIED'}
                          >
                            {getVerificationStatusConfig(verificationStatus).label}
                          </StatusBadge>
                        </header>

                        <div className="order-card__body">
                          <dl className="order-detail__info order-detail__info--columns">
                            <div>
                              <dt>Họ và tên</dt>
                              <dd>{renterDetails.fullName || "—"}</dd>
                            </div>
                            <div>
                              <dt>Số điện thoại</dt>
                              <dd>
                                <a href={`tel:${renterDetails.phoneNumber}`} className="order-detail__phone-link">
                                  {renterDetails.phoneNumber || "—"}
                                </a>
                              </dd>
                            </div>
                          </dl>

                          <div className="order-detail__email">
                            <dt>Email</dt>
                            <dd>
                              <a href={`mailto:${renterDetails.email}`} className="order-detail__email-link">
                                {renterDetails.email || "—"}
                              </a>
                            </dd>
                          </div>

                          {/* Documents Section */}
                          <div className="order-detail__renter-documents">
                            <h3 className="order-detail__documents-title">📄 Tài liệu người thuê</h3>
                            <div className="document-card-wrapper">
                              {/* CCCD Card */}
                              <div className="document-card">
                                <div className="document-header">
                                  <div className="document-icon document-icon-purple">🪪</div>
                                  <div className="document-info">
                                    <h3>Căn cước công dân</h3>
                                    <p>CCCD/CMND</p>
                                  </div>
                                </div>
                                {/* Ảnh mặt trước */}
                                {preparedDocs.find(d=>d.key==='frontCccd') ? (
                                  <div className="document-preview" style={{ marginTop: 12 }}>
                                    <div className="document-preview-title">Ảnh mặt trước</div>
                                    <div className="document-image-frame" aria-hidden>
                                      <img
                                        src={preparedDocs.find(d=>d.key==='frontCccd')?.blobUrl || preparedDocs.find(d=>d.key==='frontCccd')?.linkUrl}
                                        alt="cccd-front"
                                        className="document-image"
                                        onError={(e)=>{ e.target.style.display='none'; }}
                                      />
                                    </div>
                                    <a
                                      href={preparedDocs.find(d=>d.key==='frontCccd')?.linkUrl || preparedDocs.find(d=>d.key==='frontCccd')?.blobUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="document-view-link"
                                    >Mở ảnh trong tab mới</a>
                                  </div>
                                ) : <div className="document-missing">Chưa có ảnh mặt trước</div>}
                                {/* Ảnh mặt sau */}
                                {preparedDocs.find(d=>d.key==='backCccd') ? (
                                  <div className="document-preview" style={{ marginTop: 12 }}>
                                    <div className="document-preview-title">Ảnh mặt sau</div>
                                    <div className="document-image-frame" aria-hidden>
                                      <img
                                        src={preparedDocs.find(d=>d.key==='backCccd')?.blobUrl || preparedDocs.find(d=>d.key==='backCccd')?.linkUrl}
                                        alt="cccd-back"
                                        className="document-image"
                                        onError={(e)=>{ e.target.style.display='none'; }}
                                      />
                                    </div>
                                    <a
                                      href={preparedDocs.find(d=>d.key==='backCccd')?.linkUrl || preparedDocs.find(d=>d.key==='backCccd')?.blobUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="document-view-link"
                                    >Mở ảnh trong tab mới</a>
                                  </div>
                                ) : <div className="document-missing" style={{ marginTop: 8 }}>Chưa có ảnh mặt sau</div>}
                              </div>

                              {/* GPLX Card */}
                              <div className="document-card">
                                <div className="document-header">
                                  <div className="document-icon document-icon-orange">🚗</div>
                                  <div className="document-info">
                                    <h3>Giấy phép lái xe</h3>
                                    <p>GPLX</p>
                                  </div>
                                </div>
                                {preparedDocs.find(d=>d.key==='gplx') ? (
                                  <div className="document-preview" style={{ marginTop: 12 }}>
                                    <div className="document-preview-title">Ảnh GPLX</div>
                                    <div className="document-image-frame" aria-hidden>
                                      <img
                                        src={preparedDocs.find(d=>d.key==='gplx')?.blobUrl || preparedDocs.find(d=>d.key==='gplx')?.linkUrl}
                                        alt="driver-license"
                                        className="document-image"
                                        onError={(e)=>{ e.target.style.display='none'; }}
                                      />
                                    </div>
                                    <a
                                      href={preparedDocs.find(d=>d.key==='gplx')?.linkUrl || preparedDocs.find(d=>d.key==='gplx')?.blobUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="document-view-link"
                                    >Mở ảnh trong tab mới</a>
                                  </div>
                                ) : <div className="document-missing">Chưa có ảnh GPLX</div>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <footer className="order-card__footer">
                          <ActionButton 
                            variant={verificationStatus === 'VERIFIED' ? "success" : "primary"}
                            onClick={handleVerifyRenter}
                            disabled={verificationStatus === 'VERIFIED'}
                            loading={isVerifying}
                            icon={verificationStatus === 'VERIFIED' ? "✅" : "✓"}
                          >
                            {verificationStatus === 'VERIFIED' ? "Đã xác minh" : "Xác minh thông tin"}
                          </ActionButton>
                        </footer>
                      </section>
                      ) : (
                        <section className="order-card order-card--renter">
                          <div className="order-detail__empty-state">
                            <span className="order-detail__empty-icon">👤</span>
                            <p>Không thể tải thông tin người thuê</p>
                          </div>
                        </section>
                      )}

                      {/* Booking Information Card */}
                      {bookingDetails ? (
                        <section className="order-card order-card--booking">
                          <header className="order-card__header">
                            <h2>🚗 Thông tin đơn hàng</h2>
                          </header>

                          <div className="order-card__body order-card__body--modern">
                            {/* Car Visual Section */}
                            <div className="order-detail__car-section">
                              <div className="order-detail__car-visual-new">
                                <div className="order-detail__car-icon-new">🚗</div>
                                <div className="order-detail__car-info-new">
                                  <h3>{bookingDetails.modelName || "—"}</h3>
                                  <p>{bookingDetails.licensePlate || "—"}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Order Details Section */}
                            <div className="order-detail__order-section">
                              <div className="order-detail__info-grid">
                                <div className="order-detail__info-item">
                                  <dt>Mã đơn thuê xe</dt>
                                  <dd>{bookingDetails.bookingId || "—"}</dd>
                                </div>
                                <div className="order-detail__info-item">
                                  <dt>Thời gian thuê</dt>
                                  <dd>{bookingDetails.rentingDurationDay} ngày</dd>
                                </div>
                                <div className="order-detail__info-item order-detail__info-item--full">
                                  <dt>Thời gian thuê</dt>
                                  <dd>
                                    {formatDateTime(bookingDetails.startDate)} → {formatDateTime(bookingDetails.endDate)}
                                  </dd>
                                </div>
                                <div className="order-detail__info-item order-detail__info-item--full">
                                  <dt>Trạm đón trả</dt>
                                  <dd>{bookingDetails.stationName || "—"}</dd>
                                </div>
                              </div>
                            </div>

                            {/* Pricing Summary Section */}
                            <div className="order-detail__pricing-section">
                              <div className="order-detail__pricing-grid">
                                <div className="order-detail__pricing-item">
                                  <dt>Phí thuê xe</dt>
                                  <dd>{formatCurrency(bookingDetails.fee)}</dd>
                                </div>
                                <div className="order-detail__pricing-item">
                                  <dt>Tiền cọc</dt>
                                  <dd>{formatCurrency(bookingDetails.deposit/1000)}</dd>
                                </div>
                                <div className="order-detail__pricing-item">
                                  <dt>Phí phát sinh</dt>
                                  <dd>{formatCurrency(bookingDetails.additionalFee)}</dd>
                                </div>
                                <div className="order-detail__pricing-total">
                                  <dt>Tổng cộng</dt>
                                  <dd>{formatCurrency(bookingDetails.totalAmount)}</dd>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      ) : (
                        <section className="order-card order-card--booking">
                          <div className="order-detail__empty-state">
                            <span className="order-detail__empty-icon">🚗</span>
                            <p>Không thể tải thông tin đơn hàng</p>
                          </div>
                        </section>
                      )}
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default OrderDetail;
