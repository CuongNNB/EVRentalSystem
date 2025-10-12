import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Car, Clock, Battery, Users } from 'lucide-react';
import Header from '../components/Header';
import StationMap from '../components/StationMap';
import { carDatabase } from '../data/carData';
import './StationCarView.css';

const StationCarView = () => {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState('Quận 1');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for districts
  const districts = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
    'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Thủ Đức', 'Gò Vấp', 'Bình Thạnh'
  ];

  // Convert carDatabase to station format with additional station info
  const getStationCars = () => {
    try {
      return Object.values(carDatabase).map(car => ({
        id: car.id,
        name: car.name,
        image: car.images[0], // Use first image
        price: car.price.toLocaleString('vi-VN'),
        battery: `${Math.floor(Math.random() * 20) + 80}%`, // Random battery 80-99%
        seats: car.specifications.seats,
        distance: `${(Math.random() * 3 + 1).toFixed(1)}km`, // Random distance 1-4km
        station: `Trạm ${selectedDistrict}`
      }));
    } catch (err) {
      console.error('Error getting station cars:', err);
      setError('Lỗi khi tải dữ liệu xe');
      return [];
    }
  };

  useEffect(() => {
    // Simulate loading cars for selected district
    setLoading(true);
    setError(null);
    try {
      setTimeout(() => {
        const stationCars = getStationCars();
        setCars(stationCars);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('Lỗi khi tải dữ liệu');
      setLoading(false);
    }
  }, [selectedDistrict]);

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
  };

  const handleFindNearby = () => {
    // Simulate finding nearby cars
    console.log('Finding nearby cars...');
  };

  const handleViewDetails = (carId) => {
    navigate(`/car/${carId}`);
  };

  // Show error state
  if (error) {
    return (
      <div className="station-page">
        <Header />
        <main className="station-page__main">
          <div className="station-cars__empty">
            <Car className="station-cars__empty-icon" />
            <h3>Đã xảy ra lỗi</h3>
            <p>{error}</p>
            <button 
              className="station-cars__empty-btn"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="station-page">
      <Header />
      <main className="station-page__main">
        {/* Header Section */}
        <div className="station-page__intro">
          <div className="station-page__badge">TÌM XE THEO TRẠM</div>
          <h1 className="station-page__title">Xem xe theo trạm</h1>
          <p className="station-page__description">
            Chọn trạm hoặc xem bản đồ để tìm xe phù hợp với nhu cầu của bạn
          </p>
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
        <StationMap 
          selectedDistrict={selectedDistrict}
          onFindNearby={handleFindNearby}
        />

        {/* Cars Section */}
        <div className="station-cars">
          <div className="station-cars__header">
            <h2>Xe có sẵn tại {selectedDistrict}</h2>
            <span className="station-cars__count">{cars.length} xe khả dụng</span>
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
                        <span>{car.seats} chỗ</span>
                      </div>
                      <div className="station-car-card__feature">
                        <MapPin className="station-car-card__feature-icon" />
                        <span>{car.distance}</span>
                      </div>
                      <div className="station-car-card__feature">
                        <Clock className="station-car-card__feature-icon" />
                        <span>2 phút</span>
                      </div>
                    </div>
                    <div className="station-car-card__actions">
                      <div className="station-car-card__price">{car.price}đ/ngày</div>
                      <button 
                        className="station-car-card__btn"
                        onClick={() => handleViewDetails(car.id)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StationCarView;
