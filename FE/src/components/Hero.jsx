import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const stats = [
    { value: "50+", label: "trạm thuê xe toàn quốc" },
    { value: "200+", label: "xe điện sẵn sàng" },
    { value: "10K+", label: "hành trình đã hoàn tất" },
    { value: "95%", label: "khách hàng hài lòng" },
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

export default function Hero({ backgroundImage }) {
    const [isLoading, setIsLoading] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Nếu chưa chọn trạm -> báo
        if (!selectedStation) {
            alert('Vui lòng chọn trạm trước khi đặt.');
            return;
        }

        // Tìm label tương ứng trong danh sách stations (mảng stations đã có trong file)
        const stationObj = stations.find(s => s.id === selectedStation);
        const districtLabel = stationObj ? stationObj.label : null;

        if (!districtLabel) {
            alert('Không tìm thấy trạm tương ứng. Vui lòng thử lại.');
            return;
        }

        // navigate tới /map-stations?district=<encoded label>
        const url = `/map-stations?district=${encodeURIComponent(districtLabel)}`;
        navigate(url);
    };


    // Stations list (keep in sync with select options previously)
    const stations = [
        { id: 'thu-duc', label: 'Thủ Đức' },  //http://localhost:5173/map-stations?district=Th%E1%BB%A7%20%C4%90%E1%BB%A9c
        { id: 'binh-thanh', label: 'Bình Thạnh' }, //http://localhost:5173/map-stations?district=B%C3%ACnh%20Th%E1%BA%A1nh
        { id: 'quan-7', label: 'Quận 7' }, //http://localhost:5173/map-stations?district=Qu%E1%BA%ADn%201
        { id: 'quan-1', label: 'Quận 1' }, //http://localhost:5173/map-stations?district=Qu%E1%BA%ADn%207
        { id: 'go-vap', label: 'Gò Vấp' }, //http://localhost:5173/map-stations?district=G%C3%B2%20V%E1%BA%A5p
        { id: 'binh-tan', label: 'Bình Tân' }, //http://localhost:5173/map-stations?district=B%C3%ACnh%20T%C3%A2n
        { id: 'phu-nhuan', label: 'Phú Nhuận' } //http://localhost:5173/map-stations?district=Ph%C3%BA%20Nhu%E1%BA%ADn
    ];

    const [selectedStation, setSelectedStation] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const itemRefs = useRef([]);

    // Close dropdown on outside click or Escape
    useEffect(() => {
        function handleDocClick(e) {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }

        function handleKey(e) {
            if (e.key === 'Escape') {
                setDropdownOpen(false);
                return;
            }
            if (!dropdownOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setFocusedIndex(i => Math.min(i + 1, stations.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setFocusedIndex(i => Math.max(i - 1, 0));
            }
            if (e.key === 'Enter' && focusedIndex >= 0) {
                const s = stations[focusedIndex];
                if (s) {
                    setSelectedStation(s.id);
                    setDropdownOpen(false);
                    if (buttonRef.current) buttonRef.current.focus();
                }
            }
        }

        document.addEventListener('click', handleDocClick);
        document.addEventListener('keydown', handleKey);

        return () => {
            document.removeEventListener('click', handleDocClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    // When focusedIndex changes, move DOM focus to that item
    useEffect(() => {
        if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex].focus();
        }
    }, [focusedIndex]);

    return (
        <section
            className="hero-section"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="hero-overlay" />
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

                    <button type="button" className="btn primary-btn hero-cta" onClick={() => navigate('/cars')}>
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
                            <div className="station-dropdown" ref={dropdownRef}>
                                <button
                                    type="button"
                                    className="station-dropdown__button"
                                    aria-haspopup="listbox"
                                    aria-expanded={dropdownOpen}
                                    onClick={() => setDropdownOpen((v) => !v)}
                                    ref={buttonRef}
                                >
                                    {selectedStation ? (stations.find(s => s.id === selectedStation) || {}).label : 'Chọn trạm thuê xe'}
                                    <span className="station-dropdown__chev">▾</span>
                                </button>

                                {dropdownOpen && (
                                    <ul className="station-dropdown__menu" role="listbox">
                                        {stations.map((s, idx) => (
                                            <li
                                                key={s.id}
                                                role="option"
                                                tabIndex={0}
                                                ref={el => itemRefs.current[idx] = el}
                                                aria-selected={selectedStation === s.id}
                                                className={`station-dropdown__item ${selectedStation === s.id ? 'is-active' : ''}`}
                                                onClick={() => { setSelectedStation(s.id); setDropdownOpen(false); if (buttonRef.current) buttonRef.current.focus(); }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setSelectedStation(s.id);
                                                        setDropdownOpen(false);
                                                        if (buttonRef.current) buttonRef.current.focus();
                                                    }
                                                }}
                                            >
                                                {s.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <input type="hidden" name="station" value={selectedStation} />
                            </div>
                        </label>

                        <button
                            type="submit"
                            className="btn primary-btn booking-submit"
                            disabled={isLoading}
                        >
                            <span
                                className="btn-text"
                                style={{ display: isLoading ? "none" : "block" }}
                            >
                                Đặt ngay
                            </span>
                            <span
                                className="btn-loading"
                                style={{ display: isLoading ? "flex" : "none" }}
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
