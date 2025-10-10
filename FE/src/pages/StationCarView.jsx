import React, { useState, useEffect } from 'react';
import { MapPin, Search, Car, Clock, Battery, Users } from 'lucide-react';
import './StationCarView.css';

const StationCarView = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Quận 1');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for districts
  const districts = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5',
    'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Thủ Đức', 'Gò Vấp', 'Bình Thạnh'
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
    // Simulate loading cars for selected district
    setLoading(true);
    setTimeout(() => {
      setCars(mockCars);
      setLoading(false);
    }, 800);
  }, [selectedDistrict]);

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
  };

  const handleFindNearby = () => {
    // Simulate finding nearby cars
    console.log('Finding nearby cars...');
  };

  return (
    <div className="station-car-view">
      {/* Header Section */}
      <div className="header-section">
        <h1 className="header-title">Xem xe theo trạm</h1>
        <p className="header-description">
          Chọn trạm hoặc xem bản đồ để tìm xe phù hợp
        </p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-buttons">
          {districts.map((district) => (
            <button
              key={district}
              className={`filter-btn ${selectedDistrict === district ? 'active' : ''}`}
              onClick={() => handleDistrictSelect(district)}
            >
              {district}
            </button>
          ))}
        </div>
        <div className="advanced-filter">
          <button className="filter-advanced-btn">
            <span>⚙️</span>
            Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="map-header">
          <MapPin className="map-icon" />
          <span>Bản đồ trạm xe</span>
        </div>
        <div className="map-container">
          <div className="map-placeholder">
            <div className="map-content">
              <MapPin className="map-pin" />
              <h3>Bản đồ trạm xe điện</h3>
              <p>Hiển thị vị trí các trạm xe trong {selectedDistrict}</p>
              <div className="map-stations">
                <div className="station-marker">
                  <div className="marker-dot"></div>
                  <span>Trạm Quận 1 – 5 xe khả dụng</span>
                </div>
                <div className="station-marker">
                  <div className="marker-dot"></div>
                  <span>Trạm Quận 2 – 3 xe khả dụng</span>
                </div>
              </div>
            </div>
          </div>
          <button className="floating-search-btn" onClick={handleFindNearby}>
            <Search className="search-icon" />
            Tìm quanh đây
          </button>
        </div>
      </div>

      {/* Cars Section */}
      <div className="cars-section">
        <div className="cars-header">
          <h2>Xe có sẵn tại {selectedDistrict}</h2>
          <span className="cars-count">{cars.length} xe khả dụng</span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách xe...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="no-cars-container">
            <Car className="no-cars-icon" />
            <h3>Không có xe khả dụng</h3>
            <p>Hiện tại không có xe nào tại trạm này</p>
            <button className="view-other-stations-btn">
              Xem trạm khác
            </button>
          </div>
        ) : (
          <div className="cars-grid fade-in">
            {cars.map((car) => (
              <div key={car.id} className="car-card">
                <div className="car-image-container">
                  <img src={car.image} alt={car.name} className="car-image" />
                  <div className="car-badge">
                    <Battery className="battery-icon" />
                    {car.battery}
                  </div>
                </div>
                <div className="car-info">
                  <h3 className="car-name">{car.name}</h3>
                  <div className="car-details">
                    <div className="car-detail-item">
                      <Users className="detail-icon" />
                      <span>{car.seats} chỗ</span>
                    </div>
                    <div className="car-detail-item">
                      <MapPin className="detail-icon" />
                      <span>{car.distance}</span>
                    </div>
                    <div className="car-detail-item">
                      <Clock className="detail-icon" />
                      <span>2 phút</span>
                    </div>
                  </div>
                  <div className="car-price-section">
                    <span className="car-price">{car.price}đ/ngày</span>
                    <button className="car-btn">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StationCarView;
