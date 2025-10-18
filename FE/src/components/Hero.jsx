import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import DISTRICTS from "../data/districts";

const stats = [
    {value: "50+", label: "trạm thuê xe toàn quốc"},
    {value: "200+", label: "xe điện sẵn sàng"},
    {value: "10K+", label: "hành trình đã hoàn tất"},
    {value: "95%", label: "khách hàng hài lòng"},
];

// ✅ Hàm định dạng chuẩn cho input datetime-local
const formatDateTimeLocal = (date) => {
    const pad = (n) => (n < 10 ? "0" + n : n);
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export default function Hero({backgroundImage}) {
    const [isLoading, setIsLoading] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [selectedStation, setSelectedStation] = useState("");
    const navigate = useNavigate();

    // ✅ Khởi tạo giá trị mặc định: bây giờ & +1 ngày
    useEffect(() => {
        const now = new Date();
        const plusOneDay = new Date(now);
        plusOneDay.setDate(now.getDate() + 1);

        setStartTime(formatDateTimeLocal(now));
        setEndTime(formatDateTimeLocal(plusOneDay));
    }, []);

    // ✅ Khi người dùng đổi thời gian bắt đầu
    const handleStartTimeChange = (e) => {
        const newStart = new Date(e.target.value);
        setStartTime(e.target.value);

        // Tự động cập nhật endTime = startTime + 1 ngày
        const autoEnd = new Date(newStart);
        autoEnd.setDate(newStart.getDate() + 1);
        setEndTime(formatDateTimeLocal(autoEnd));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If user picked a station and is logged in, navigate to station page
        const userRaw = localStorage.getItem('ev_user') || localStorage.getItem('user') || null;
        const token = localStorage.getItem('token') || localStorage.getItem('ev_token') || null;

        if ((userRaw || token) && selectedStation) {
            // navigate to station-cars route and pass the selected label so StationCarView can preselect
            navigate('/station-cars', { state: { district: selectedStation } });
            return;
        }

        // fallback behaviour: simulate booking (for anonymous or no station selected)
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert(`✅ Đặt xe thành công!\n\nThời gian thuê:\n- Bắt đầu: ${new Date(startTime).toLocaleString('vi-VN')}\n- Kết thúc: ${new Date(endTime).toLocaleString('vi-VN')}`);
        }, 900);
    };

    return (
        <section
            className="hero-section"
            style={{backgroundImage: `url(${backgroundImage})`}}
        >
            <div className="hero-overlay"/>
            <div className="hero-inner">
                <div className="hero-copy">
                    <h1>
                        Thuê Xe Điện <span>Lái Tương Lai</span>
                    </h1>
                    <p>
                        Hệ thống trạm thuê xe điện toàn quốc với 50+ điểm phủ sóng.
                        Xác thực nhanh 5 phút, đặt xe linh hoạt, thanh toán đa dạng.
                        Trải nghiệm xe điện thế hệ mới ngay hôm nay.
                    </p>

                    <div className="hero-rating">
                        <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                        <div className="rating-text">
                            <span className="rating-score">4.9/5</span>
                            <span className="rating-label">
                đánh giá từ 2,500+ khách hàng
              </span>
                        </div>
                    </div>

                    <div className="hero-stats">
                        {stats.map((stat) => (
                            <div key={stat.value} className="stat">
                                <strong>{stat.value}</strong>
                                <span>{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    <button type="button" className="btn primary-btn hero-cta">
                        Xem danh sách xe
                    </button>
                </div>

                {/* === FORM ĐẶT XE === */}
                <div className="hero-card" role="form" aria-label="Đặt xe ngay">
                    <div className="hero-card__header">
                        <h3>Đặt xe ngay</h3>
                        <p>Chọn địa điểm và thời gian thuê xe phù hợp</p>
                    </div>

                    <form className="booking-form" onSubmit={handleSubmit}>
                        <label className="form-field">
              <span className="field-label">
                <span className="field-icon">📍</span>
                Địa điểm nhận xe
              </span>
                            <select
                                className="form-select"
                                required
                                value={selectedStation}
                                onChange={(e) => setSelectedStation(e.target.value)}
                            >
                                <option value="">Chọn trạm thuê xe</option>
                                {DISTRICTS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </label>

                        {/* === Thời gian bắt đầu === */}
                        <label className="form-field">
              <span className="field-label">
                <span className="field-icon">⏰</span>
                Thời gian bắt đầu
              </span>
                            <input
                                type="datetime-local"
                                required
                                value={startTime}
                                min={formatDateTimeLocal(new Date())}
                                onChange={handleStartTimeChange}
                            />
                        </label>

                        {/* === Thời gian kết thúc === */}
                        <label className="form-field">
              <span className="field-label">
                <span className="field-icon">⏰</span>
                Thời gian kết thúc
              </span>
                            <input
                                type="datetime-local"
                                required
                                value={endTime}
                                min={startTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </label>

                        <button
                            type="submit"
                            className="btn primary-btn booking-submit"
                            disabled={isLoading}
                        >
              <span
                  className="btn-text"
                  style={{display: isLoading ? "none" : "block"}}
              >
                Đặt ngay
              </span>
                            <span
                                className="btn-loading"
                                style={{display: isLoading ? "flex" : "none"}}
                            >
                <span className="spinner"></span>
                Đang xử lý...
              </span>
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
