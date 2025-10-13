import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Car, Clock, Navigation, X } from "lucide-react";
import './MapStations.css';

// Google Maps configuration
const DEFAULT_MAP_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4829915200835!2d106.6900!3d10.7777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f407cc41c13%3A0x26f4ef1f52c4d7d1!2zVHLhuqduIFThu7EgVGjDoG5o!5e0!3m2!1svi!2s!4v1696830402857!5m2!1svi!2s";

// Stations data with additional info
const stations = [
  { id: 1, name: "Trạm EVRental Quận 1", lat: 10.776889, lng: 106.700806, address: "22 Lý Tự Trọng, Quận 1, TP.HCM", cars: 12, status: "active", district: "Quận 1" },
  { id: 2, name: "Trạm EVRental Quận 3", lat: 10.786987, lng: 106.686126, address: "Nguyễn Đình Chiểu, Quận 3, TP.HCM", cars: 8, status: "active", district: "Quận 3" },
  { id: 3, name: "Trạm EVRental Quận 4", lat: 10.762622, lng: 106.708084, address: "Hoàng Diệu, Quận 4, TP.HCM", cars: 15, status: "active", district: "Quận 4" },
  { id: 4, name: "Trạm EVRental Quận 5", lat: 10.754566, lng: 106.663874, address: "85 Hùng Vương, Quận 5, TP.HCM", cars: 6, status: "maintenance", district: "Quận 5" },
  { id: 5, name: "Trạm EVRental Quận 6", lat: 10.749119, lng: 106.635689, address: "Nguyễn Văn Luông, Quận 6, TP.HCM", cars: 10, status: "active", district: "Quận 6" },
  { id: 6, name: "Trạm EVRental Quận 7", lat: 10.737018, lng: 106.719530, address: "Nguyễn Văn Linh, Quận 7, TP.HCM", cars: 18, status: "active", district: "Quận 7" },
  { id: 7, name: "Trạm EVRental Quận 8", lat: 10.724007, lng: 106.628937, address: "Tạ Quang Bửu, Quận 8, TP.HCM", cars: 7, status: "active", district: "Quận 8" },
  { id: 8, name: "Trạm EVRental Quận 9", lat: 10.841050, lng: 106.828308, address: "Đỗ Xuân Hợp, Quận 9, TP.HCM", cars: 14, status: "active", district: "Quận 9" },
  { id: 9, name: "Trạm EVRental Quận 10", lat: 10.774949, lng: 106.667084, address: "3 Tháng 2, Quận 10, TP.HCM", cars: 9, status: "active", district: "Quận 10" },
  { id: 10, name: "Trạm EVRental Quận 11", lat: 10.762045, lng: 106.641639, address: "Lạc Long Quân, Quận 11, TP.HCM", cars: 11, status: "active", district: "Quận 11" },
  { id: 11, name: "Trạm EVRental Quận 12", lat: 10.869784, lng: 106.641250, address: "Trường Chinh, Quận 12, TP.HCM", cars: 13, status: "active", district: "Quận 12" },
  { id: 12, name: "Trạm EVRental Bình Thạnh", lat: 10.804056, lng: 106.708687, address: "Điện Biên Phủ, Bình Thạnh, TP.HCM", cars: 16, status: "active", district: "Bình Thạnh" },
  { id: 13, name: "Trạm EVRental Tân Bình", lat: 10.801180, lng: 106.652064, address: "Cộng Hòa, Tân Bình, TP.HCM", cars: 5, status: "active", district: "Tân Bình" },
  { id: 14, name: "Trạm EVRental Gò Vấp", lat: 10.838992, lng: 106.676636, address: "Nguyễn Oanh, Gò Vấp, TP.HCM", cars: 12, status: "active", district: "Gò Vấp" },
  { id: 15, name: "Trạm EVRental Phú Nhuận", lat: 10.797365, lng: 106.680977, address: "Phan Đăng Lưu, Phú Nhuận, TP.HCM", cars: 8, status: "active", district: "Phú Nhuận" },
  { id: 16, name: "Trạm EVRental Bình Tân", lat: 10.767925, lng: 106.594871, address: "Kinh Dương Vương, Bình Tân, TP.HCM", cars: 10, status: "active", district: "Bình Tân" },
  { id: 17, name: "Trạm EVRental Thủ Đức", lat: 10.851977, lng: 106.758785, address: "Võ Văn Ngân, Thủ Đức, TP.HCM", cars: 20, status: "active", district: "Thủ Đức" },
];


// Main MapStations component
const MapStations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStation, setSelectedStation] = useState(null);
  const [showAllStations, setShowAllStations] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef(null);

  // Filter stations based on search, district and status
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         station.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === "all" || station.district === selectedDistrict;
    const matchesStatus = selectedStatus === "all" || station.status === selectedStatus;
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  // Get unique districts and statuses for filter
  const districts = ["all", ...new Set(stations.map(station => station.district))];
  const statuses = ["all", ...new Set(stations.map(station => station.status))];

  // Generate dynamic map URL
  const getMapUrl = () => {
    if (selectedStation) {
      return `https://www.google.com/maps?q=${selectedStation.lat},${selectedStation.lng}&z=15&output=embed`;
    }
    return DEFAULT_MAP_URL;
  };

  // Handle district filter change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    
    if (district === "all") {
      setSelectedStation(null);
      setMapKey(prev => prev + 1); // Force map reload
    } else {
      const firstStation = stations.find(st => st.district === district);
      if (firstStation) {
        setSelectedStation(firstStation);
        setMapKey(prev => prev + 1); // Force map reload
      }
    }
    
    // Scroll to map smoothly
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by filteredStations
  };

  // Handle station selection
  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setShowModal(true);
    setMapKey(prev => prev + 1); // Force map reload
    
    // Sync district selection when station is selected
    setSelectedDistrict(station.district);
    
    // Scroll to map smoothly
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStation(null);
  };
//hihi
//code
  // Handle find nearby
  const handleFindNearby = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Current position:", position.coords);
          // Find nearest station
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          let nearestStation = null;
          let minDistance = Infinity;
          
          stations.forEach(station => {
            const distance = Math.sqrt(
              Math.pow(station.lat - userLat, 2) + Math.pow(station.lng - userLng, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestStation = station;
            }
          });
          
          if (nearestStation) {
            handleStationSelect(nearestStation);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí.");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị.");
    }
  };

  // Handle directions
  const handleDirections = (station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
    window.open(url, '_blank');
  };

  // Handle rent car
  const handleRentCar = (station) => {
    // Placeholder for rent car functionality
    alert(`Chức năng thuê xe tại ${station.name} sẽ được triển khai sớm!`);
  };

  return (
    <div className="map-section">
      {/* Header */}
      <div className="map-header">
        <h2>
          <MapPin className="header-icon" />
          TP.HCM – {filteredStations.length} trạm EVRental đang hoạt động
        </h2>
        <p className="map-subtitle">
          Khám phá các trạm thuê xe điện gần bạn với bản đồ tương tác
        </p>
      </div>

      {/* Dynamic Filter Header */}
      <div className="dynamic-filter-header">
        <div className="filter-container">
          {/* Search Input */}
          <div className="filter-item search-filter">
            <div className="filter-icon">
              <Search className="icon" />
            </div>
            <input
              type="text"
              placeholder="Tìm trạm xe điện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>

          {/* District Filter */}
          <div className="filter-item district-filter">
            <div className="filter-icon">
              <MapPin className="icon" />
            </div>
            <select 
              value={selectedDistrict} 
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="filter-select"
            >
              {districts.map(district => (
                <option key={district} value={district}>
                  {district === "all" ? "Quận/Huyện" : district}
                </option>
              ))}
            </select>
            <div className="dropdown-arrow">▼</div>
          </div>

          {/* Status Filter */}
          <div className="filter-item status-filter">
            <div className="filter-icon">
              <Car className="icon" />
            </div>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === "all" ? "Trạng thái" : status === "active" ? "Hoạt động" : "Bảo trì"}
                </option>
              ))}
            </select>
            <div className="dropdown-arrow">▼</div>
          </div>
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="map-frame" ref={mapRef}>
        <iframe
          key={selectedStation ? selectedStation.id : "default"}
          src={getMapUrl()}
          width="100%"
          height="420"
          allowFullScreen
          loading="lazy"
          title="Bản đồ trạm EVRental TP.HCM"
          referrerPolicy="no-referrer-when-downgrade"
          className="map-iframe"
        ></iframe>
      </div>

      {/* Station Cards Grid */}
      <div className="station-cards-section">
        <div className="station-cards-header">
          <h3>Danh sách trạm ({filteredStations.length})</h3>
          <button 
            className="toggle-btn"
            onClick={() => setShowAllStations(!showAllStations)}
          >
            {showAllStations ? "Thu gọn" : "Xem tất cả"}
          </button>
        </div>
        
        <div className={`station-cards-grid ${showAllStations ? 'expanded' : ''}`}>
          {filteredStations.slice(0, showAllStations ? filteredStations.length : 6).map((station) => (
            <div 
              key={station.id} 
              className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
              onClick={() => handleStationSelect(station)}
            >
              <div className="station-card-header">
                <div className="station-card-icon">
                  <Car className="card-icon" />
                </div>
                <div className={`station-status-badge ${station.status}`}>
                  {station.status === 'active' ? '🟢 Hoạt động' : '🔧 Bảo trì'}
                </div>
              </div>
              
              <div className="station-card-content">
                <h4 className="station-card-name">{station.name}</h4>
                <p className="station-card-address">{station.address}</p>
                
                <div className="station-card-footer">
                  <div className="station-cars-info">
                    <Car className="cars-icon" />
                    <span><strong>{station.cars}</strong> xe có sẵn</span>
                  </div>
                  <div className="station-district">
                    {station.district}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="map-actions">
        <button className="action primary" onClick={() => setShowAllStations(true)}>
          <MapPin className="action-icon" />
          Xem tất cả trạm
        </button>
        <button className="action secondary" onClick={handleFindNearby}>
          <Navigation className="action-icon" />
          Thuê xe gần nhất
        </button>
      </div>

      {/* Feature Section */}
      <section className="feature-section">
        <h2 className="feature-title">🚀 Tính năng nổi bật</h2>
        <p className="feature-subtitle">
          EVRental giúp bạn tìm, đặt và thuê xe điện nhanh chóng, an toàn và tiện lợi.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">🚗</span>
            <h3>17 Trạm xe điện</h3>
            <p>Phủ sóng toàn bộ 17 quận/huyện tại TP.HCM với vị trí chiến lược</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Tìm kiếm thông minh</h3>
            <p>Tìm kiếm trạm theo tên hoặc địa chỉ với auto-zoom đến vị trí</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">💻</span>
            <h3>Responsive Design</h3>
            <p>Hoạt động mượt mà trên mọi thiết bị từ desktop đến mobile</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Trải nghiệm cao cấp</h3>
            <p>Bản đồ Google Maps miễn phí, marker tùy chỉnh, popup thông tin chi tiết</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Lọc thông minh</h3>
            <p>Lọc trạm theo quận/huyện và trạng thái hoạt động một cách dễ dàng</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h3>Performance tối ưu</h3>
            <p>Hiệu suất cao, tải nhanh và trải nghiệm mượt mà trên mọi thiết bị</p>
          </div>
        </div>
      </section>

      {/* Station Detail Modal */}
      {showModal && selectedStation && (
        <div className="station-detail-modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedStation.name}</h3>
              <button 
                className="close-btn"
                onClick={handleCloseModal}
              >
                <X className="close-icon" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="station-detail-info">
                <div className="detail-item">
                  <MapPin className="detail-icon" />
                  <span>{selectedStation.address}</span>
                </div>
                <div className="detail-item">
                  <Car className="detail-icon" />
                  <span>{selectedStation.cars} xe có sẵn</span>
                </div>
                <div className="detail-item">
                  <Clock className="detail-icon" />
                  <span>24/7 - Luôn mở cửa</span>
                </div>
                <div className="detail-item">
                  <div className="detail-icon">📍</div>
                  <span>{selectedStation.district}</span>
                </div>
              </div>
              
              {/* Mini Map */}
              <div className="modal-mini-map">
                <iframe
                  src={`https://www.google.com/maps?q=${selectedStation.lat},${selectedStation.lng}&z=15&output=embed`}
                  width="100%"
                  height="200"
                  allowFullScreen
                  loading="lazy"
                  title={`Bản đồ ${selectedStation.name}`}
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="modal-btn primary"
                  onClick={() => handleDirections(selectedStation)}
                >
                  <Navigation className="btn-icon" />
                  Chỉ đường
                </button>
                <button 
                  className="modal-btn secondary"
                  onClick={() => handleRentCar(selectedStation)}
                >
                  <Car className="btn-icon" />
                  Thuê xe ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapStations;

