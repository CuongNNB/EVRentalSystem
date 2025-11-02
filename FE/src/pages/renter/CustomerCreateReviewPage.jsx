import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./CustomerCreateReviewPage.css";

export default function CustomerCreateReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // bookingId được truyền qua location.state hoặc query param ?bookingId=...
  const bookingIdFromState = location.state?.bookingId ?? null;
  const searchParams = new URLSearchParams(location.search);
  const bookingFromQuery = searchParams.get("bookingId");

  const [bookingId, setBookingId] = useState(
    bookingIdFromState || bookingFromQuery || ""
  );
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", type: "info" });

  useEffect(() => {
    if (!bookingId) {
      // nếu không có bookingId, hiển thị note chứ vẫn cho nhập tay
      setToast({
        show: true,
        text: "Không tìm thấy bookingId tự động. Bạn có thể nhập thủ công.",
        type: "info",
      });
      const t = setTimeout(() => setToast((s) => ({ ...s, show: false })), 2600);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line

  const handleStarClick = (v) => {
    setRating(v);
  };

  const handleSubmit = async () => {
    if (!bookingId) {
      setToast({ show: true, text: "Vui lòng nhập Booking ID.", type: "error" });
      return;
    }
    if (!rating || rating < 1) {
      setToast({ show: true, text: "Vui lòng chọn số sao.", type: "error" });
      return;
    }

    setSubmitting(true);
    setToast({ show: true, text: "Đang gửi đánh giá...", type: "info" });

    const payload = {
      bookingId: Number(bookingId),
      rating,
      comment: comment || "",
      // anonymous field not required by API sample; kept locally if needed
    };

    try {
      const res = await fetch(
        "http://localhost:8084/EVRentalSystem/api/reviews/create-review",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => null);
        throw new Error(errText || `Lỗi server: ${res.status}`);
      }

      setToast({ show: true, text: "Gửi đánh giá thành công. Cảm ơn bạn!", type: "success" });
      setTimeout(() => navigate("/", { replace: true }), 1400);
    } catch (err) {
      console.error("submit review error:", err);
      setToast({ show: true, text: `Gửi thất bại: ${err.message}`, type: "error" });
      setTimeout(() => setToast({ show: false }), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ccrp-root">
      <Header />
      <main className="ccrp-wrap">
        <section className="ccrp-card soft-card">
          <div className="ccrp-left">
            <h1 className="ccrp-title">Chia Sẻ Trải Nghiệm Của Bạn</h1>
            <p className="ccrp-sub">Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn.</p>

            <div className="ccrp-info soft-panel">
              <label className="label-small">Mã đơn của bạn</label>
              <input
                className="input-booking soft-input"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="VD: 12345"
              />

              <div className="rating-block">
                <div className="rating-left">
                  <label className="label-small">Đánh giá</label>
                  <div
                    className="stars"
                    role="radiogroup"
                    aria-label="Chọn đánh giá từ 1 tới 5 sao"
                  >
                    {[1, 2, 3, 4, 5].map((s) => {
                      const active = s <= (hoverRating || rating);
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`star-btn ${active ? "active" : ""}`}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleStarClick(s)}
                          aria-checked={rating === s}
                          aria-label={`${s} sao`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                  <div className="rating-note">Bạn đánh giá: <span className="rating-strong">{rating} sao</span></div>
                </div>

                <div className="rating-right">
                </div>
              </div>
            </div>

            <div className="ccrp-comment soft-panel">
              <label className="label-small">Đánh giá của bạn</label>
              <textarea
                className="comment-area soft-input"
                rows={6}
                placeholder="Viết chi tiết trải nghiệm, nhân viên hỗ trợ, chất lượng xe, thời gian giao nhận..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="comment-footer">
                <div className="char-count">{comment.length}/1000</div>
              </div>
            </div>

            <div className="ccrp-actions">
              <button
                className="btn-cancel soft-btn"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="btn-submit gradient-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>

          <aside className="ccrp-right">
            <div className="preview-card soft-panel">
              <div className="preview-title">Mẹo viết đánh giá tốt</div>
              <ul className="preview-list">
                <li>Ghi rõ trải nghiệm: giao/nhận, thời gian, nhân viên.</li>
                <li>Miêu tả ngắn: điều bạn hài lòng & điều cần cải thiện.</li>
                <li>Không để thông tin nhạy cảm trong bình luận.</li>
              </ul>
            </div>

            <div className="preview-card soft-panel">
              <div className="preview-title">Bạn sẽ nhận được</div>
              <div className="preview-desc">Đánh giá giúp cộng đồng — và chúng tôi dùng phản hồi để cải thiện dịch vụ.</div>
            </div>

            <div className="support-card soft-panel">
              <div className="support-title">Cần hỗ trợ?</div>
              <div className="support-line">Liên hệ: <a href="mailto:support@example.com">4aesieunhan.work@gmail.com</a></div>
            </div>
          </aside>
        </section>

        {/* toast */}
        {toast.show && (
          <div className={`toast toast-${toast.type}`}>
            {toast.text}
            <button 
            className="toast-close" 
            onClick={() => 
            setToast({ show: false })}>
              ✕
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
