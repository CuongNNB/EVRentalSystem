import React, { useState, useEffect } from 'react';
import { MapPin, Search, Car, Clock, Battery, Users } from 'lucide-react';
import './StationCarView.css';

const StationCarView = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCarList, setShowCarList] = useState(false); // Ẩn danh sách xe cho đến khi kết nối backend

    // 7 quận theo yêu cầu từ hình ảnh
    const districts = [
        'Tất cả', 'Quận 1', 'Bình Thạnh', 'Thủ Đức', 'Quận 7',
        'Gò Vấp', 'Bình Tân', 'Phú Nhuận'
    ];

    // Mock data for cars
    const mockCars = [
        {
            id: 1,
            name: 'Tesla Model 3',
            image: '/anhxe/Tesla Model 3.jpg',
            price: '1,200,000',
            battery: '85%',
            seats: 5,
            distance: '2.5km',
            station: 'Trạm Quận 1'
        },
        {
            id: 2,
            name: 'BMW iX xDrive50',
            image: '/anhxe/BMW iX xDrive50.jpg',
            price: '1,800,000',
            battery: '92%',
            seats: 5,
            distance: '1.8km',
            station: 'Trạm Quận 1'
        },
        {
            id: 3,
            name: 'Mercedes-Benz EQE 350+',
            image: '/anhxe/Mercedes-Benz EQE 350+.jpg',
            price: '2,200,000',
            battery: '78%',
            seats: 5,
            distance: '3.2km',
            station: 'Trạm Quận 1'
        },
        {
            id: 4,
            name: 'Porsche Taycan Turbo S',
            image: '/anhxe/Porsche Taycan Turbo S.jpg',
            price: '3,500,000',
            battery: '88%',
            seats: 4,
            distance: '4.1km',
            station: 'Trạm Quận 1'
        },
        {
            id: 5,
            name: 'Audi Q8 e-tron',
            image: '/anhxe/Audi Q8 e-tron.jpg',
            price: '2,800,000',
            battery: '95%',
            seats: 5,
            distance: '2.9km',
            station: 'Trạm Quận 1'
        },
        {
            id: 6,
            name: 'Hyundai Ioniq 5',
            image: '/anhxe/Hyundai Ioniq 5.jpg',
            price: '1,500,000',
            battery: '82%',
            seats: 5,
            distance: '1.5km',
            station: 'Trạm Quận 1'
        }
    ];

    useEffect(() => {
        // Chỉ load cars khi showCarList = true (khi đã kết nối backend)
        if (showCarList) {
            setLoading(true);
            setTimeout(() => {
                setCars(mockCars);
                setLoading(false);
            }, 800);
        }
    }, [selectedDistrict, showCarList]);

    const handleDistrictSelect = (district) => {
        setSelectedDistrict(district);
    };

    const handleFindNearby = () => {
        // Simulate finding nearby cars
        console.log('Finding nearby cars...');
    };

    return (
        <div className="station-page">
            {/* Header */}
            <div className="station-header">
                <div className="station-header__content">
                    <div className="station-header__logo">
                        <div className="station-header__logo-icon">🚗</div>
                        <div className="station-header__logo-text">
                            <h1>EV Car Rental</h1>
                            <p>Thuê xe điện – lái tương lai</p>
                        </div>
                    </div>
                    <nav className="station-header__nav">
                        <a href="/" className="station-header__nav-link">Trang chủ</a>
                        <a href="/cars" className="station-header__nav-link">Xem xe có sẵn</a>
                        <a href="/stations" className="station-header__nav-link active">Tìm xe theo trạm</a>
                        <a href="/promotions" className="station-header__nav-link">Ưu đãi</a>
                        <a href="/account" className="station-header__nav-link">Tài khoản</a>
                    </nav>
                    <div className="station-header__actions">
                        <button className="station-header__btn station-header__btn--login">Đăng nhập</button>
                        <button className="station-header__btn station-header__btn--register">Đăng ký</button>
                    </div>
                </div>
            </div>

            <div className="station-page__main">
                {/* Title Section */}
                <div className="station-page__intro">
                    <h1 className="station-page__title">Xem xe theo trạm</h1>
                </div>

                {/* Filter Section */}
                <div className="station-filters">
                    {districts.map((district) => (
                        <button
                            key={district}
                            className={`station-filters__button ${selectedDistrict === district ? 'is-active' : ''}`}
                            onClick={() => handleDistrictSelect(district)}
                        >
                            {district}
                        </button>
                    ))}
                </div>

                {/* Map Section */}
                <div className="station-map">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4829915200835!2d106.6900!3d10.7777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f407cc41c13%3A0x26f4ef1f52c4d7d1!2zVHLhuqduIFThu7EgVGjDoG5o!5e0!3m2!1svi!2s!4v1696830402857!5m2!1svi!2s"
                        width="100%"
                        height="400"
                        style={{ border: 0, borderRadius: '12px' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Bản đồ trạm xe"
                    ></iframe>
                </div>

                {/* Cars Section - Ẩn cho đến khi kết nối backend */}
                {showCarList && (
                    <div className="station-cars">
                        <div className="station-cars__header">
                            <h2>Xe có sẵn tại {selectedDistrict === 'Tất cả' ? 'các trạm' : selectedDistrict}</h2>
                            <div className="station-cars__count">{cars.length} xe khả dụng</div>
                        </div>

                        {loading ? (
                            <div className="station-cars__loading">
                                <div className="station-cars__spinner"></div>
                                <p>Đang tải danh sách xe...</p>
                            </div>
                        ) : cars.length === 0 ? (
                            <div className="station-cars__empty">
                                <Car className="station-cars__empty-icon" />
                                <h3>Không có xe khả dụng</h3>
                                <p>Hiện tại không có xe nào tại trạm này</p>
                                <button className="station-cars__empty-btn">
                                    Xem trạm khác
                                </button>
                            </div>
                        ) : (
                            <div className="station-cars__grid">
                                {cars.map((car) => (
                                    <div key={car.id} className="station-car-card">
                                        <div className="station-car-card__media">
                                            <img src={car.image} alt={car.name} className="station-car-card__image" />
                                            <div className="station-car-card__badge">
                                                <Battery className="station-car-card__battery-icon" />
                                                {car.battery}
                                            </div>
                                        </div>
                                        <div className="station-car-card__content">
                                            <h3 className="station-car-card__name">{car.name}</h3>
                                            <div className="station-car-card__features">
                                                <div className="station-car-card__feature">
                                                    <Users className="station-car-card__feature-icon" />
                                                    {car.seats} chỗ
                                                </div>
                                                <div className="station-car-card__feature">
                                                    <MapPin className="station-car-card__feature-icon" />
                                                    {car.distance}
                                                </div>
                                                <div className="station-car-card__feature">
                                                    <Clock className="station-car-card__feature-icon" />
                                                    2 phút
                                                </div>
                                            </div>
                                        </div>
                                        <div className="station-car-card__actions">
                                            <span className="station-car-card__price">{car.price}đ/ngày</span>
                                            <button className="station-car-card__btn">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StationCarView;
