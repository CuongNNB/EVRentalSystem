import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Car, Clock, Navigation, X } from "lucide-react";
import './MapStations.css';
import { searchStationsByDistrict } from "../api/stations";
import { getAvailableVehicles } from "../api/vehicles";

// Brand color
const BRAND = "#009B72";

// Google Maps configuration - Roadmap với view chi tiết như ảnh
const DEFAULT_MAP_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125419.45765362856!2d106.56921537207647!3d10.77498653239171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fbf0c2c6621%3A0x3723a5a2dc31e15e!2zVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1729000000000!5m2!1svi!2s";

// Stations data with VinFast locations - Updated according to provided information
const stations = [
  { id: 1, name: "Cho thuê Xe điện VinFast - Thảo Điền", lat: 10.8000, lng: 106.7300, address: "Hầm gửi xe B3 - Vincom Mega Mall, 161 Võ Nguyên Giáp, Thảo Điền, Thủ Đức, Hồ Chí Minh", cars: 15, status: "active", district: "Thủ Đức" },
  { id: 2, name: "Cho thuê Xe điện VinFast - Tân Cảng", lat: 10.8100, lng: 106.7200, address: "208 Nguyễn Hữu Cảnh, Vinhomes Tân Cảng, Bình Thạnh, Hồ Chí Minh", cars: 12, status: "active", district: "Bình Thạnh" },
  { id: 3, name: "Cho thuê Xe điện VinFast - Quận 1", lat: 10.7769, lng: 106.7008, address: "Tầng hầm B2 - Vincom Đồng Khởi, 70 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh", cars: 20, status: "active", district: "Quận 1" },
  { id: 4, name: "Cho thuê Xe điện VinFast - Quận 7", lat: 10.7370, lng: 106.7195, address: "Crescent Mall, 101 Tôn Dật Tiên, Tân Phú, Quận 7, TP. Hồ Chí Minh", cars: 18, status: "active", district: "Quận 7" },
  { id: 5, name: "Cho thuê Xe điện VinFast - Gò Vấp", lat: 10.8390, lng: 106.6766, address: "Trung tâm thương mại Emart, 366 Phan Văn Trị, Gò Vấp, TP. Hồ Chí Minh", cars: 14, status: "active", district: "Gò Vấp" },
  { id: 6, name: "Cho thuê Xe điện VinFast - Bình Tân", lat: 10.7679, lng: 106.5949, address: "AEON Mall Bình Tân, 1 Đường số 17A, Bình Trị Đông B, Bình Tân, TP. Hồ Chí Minh", cars: 16, status: "active", district: "Bình Tân" },
  { id: 7, name: "Cho thuê Xe điện VinFast - Phú Nhuận", lat: 10.7974, lng: 106.6810, address: "Co.opmart Nguyễn Kiệm, 571 Nguyễn Kiệm, Phú Nhuận, TP. Hồ Chí Minh", cars: 10, status: "active", district: "Phú Nhuận" },
 
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

  // API data states
  const [loading, setLoading] = useState(false);
  const [stationsReal, setStationsReal] = useState([]);  // danh sách station theo quận
  const [vehiclesFlat, setVehiclesFlat] = useState([]);  // danh sách xe hiển thị (flatten)

  // Parse location string "lat,lng" to object
  const parseLocation = (loc) => {
    if (!loc) return { lat: null, lng: null };
    const [lat, lng] = loc.split(",").map(Number);
    return { lat, lng };
  };

  // Map nhãn tab -> district cho BE
  const DISTRICT_VALUE = {
    "all": null,
    "Tất cả": null,
    "Tất cả khu vực": null,
    "Thủ Đức": "Thủ Đức",
    "Bình Thạnh": "Bình Thạnh",
    "Quận 1": "Quận 1",
    "Quận 2": "Quận 2",
    "Quận 3": "Quận 3",
    "Quận 4": "Quận 4",
    "Quận 5": "Quận 5",
    "Quận 6": "Quận 6",
    "Quận 7": "Quận 7",
    "Quận 8": "Quận 8",
    "Quận 9": "Quận 9",
    "Quận 10": "Quận 10",
    "Quận 11": "Quận 11",
    "Quận 12": "Quận 12",
    "Gò Vấp": "Gò Vấp",
    "Bình Tân": "Bình Tân",
    "Phú Nhuận": "Phú Nhuận",
    "Thảo Điền": "Thủ Đức",
    "Tân Cảng": "Bình Thạnh"
  };

  // Load data by district
  const loadByDistrict = async (tabLabel) => {
    const districtParam = DISTRICT_VALUE[tabLabel] ?? tabLabel;

    console.log("🔍 LoadByDistrict called with:", tabLabel, "→", districtParam);
    setLoading(true);
    
    // 1) TẤT CẢ KHU VỰC → lấy mọi xe AVAILABLE
    if (!districtParam) {
      console.log("📍 Loading ALL vehicles...");
      const allVehicles = await getAvailableVehicles();
      console.log("📊 Received vehicles count:", allVehicles?.length || 0);
      setStationsReal([]);
      setVehiclesFlat(allVehicles || []);
      setSelectedStation(null);   // giữ map mặc định
      setMapKey((k) => k + 1);
      setLoading(false);
      return;
    }

    // 2) QUẬN CỤ THỂ → lấy station + vehicles
    console.log("📍 Loading stations for district:", districtParam);
    const list = await searchStationsByDistrict(districtParam);
    console.log("📊 Received stations:", list?.length || 0);
    
    const flatVehicles = (list || []).flatMap(s => s.vehicles || []);
    console.log("📊 Total vehicles in stations:", flatVehicles.length);
    
    setStationsReal(list || []);
    setVehiclesFlat(flatVehicles);

    // Auto-zoom map tới station đầu tiên
    if (list && list.length > 0) {
      // Có data từ API
      const s = list[0];
      const { lat, lng } = parseLocation(s.location);
      if (lat && lng) {
        console.log("🗺️ Auto-zooming to API station:", s.stationName, "at", lat, lng);
        setSelectedStation({
          id: s.stationId,
          name: s.stationName,
          lat,
          lng,
          address: s.address,
          cars: (s.vehicles || []).length,
          status: "active",
          district: districtParam,
        });
      }
      setMapKey((k) => k + 1);
    } else {
      // Không có data từ API → fallback sang mock data để zoom map
      console.log("⚠️ No API data, using mock station for map zoom");
      const mockStation = stations.find(s => s.district === districtParam);
      if (mockStation) {
        console.log("🗺️ Auto-zooming to mock station:", mockStation.name, "at", mockStation.lat, mockStation.lng);
        setSelectedStation(mockStation);
      } else {
        setSelectedStation(null);
      }
      setMapKey((k) => k + 1);
    }
    
    setLoading(false);
  };

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

  // Generate dynamic map URL with roadmap view và marker tại vị trí cụ thể
  const getMapUrl = () => {
    if (selectedStation) {
      const lat = selectedStation.lat;
      const lng = selectedStation.lng;
      const address = encodeURIComponent(selectedStation.address || selectedStation.name);
      
      // Sử dụng format q= để hiển thị marker và info window với địa chỉ cụ thể
      // Tham số: q=lat,lng với label là địa chỉ, z=zoom level, t=m (roadmap)
      return `https://maps.google.com/maps?q=${lat},${lng}+(${address})&t=m&z=16&output=embed&iwloc=near`;
    }
    return DEFAULT_MAP_URL;
  };

  // Handle district filter change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    
    // Call API to load data
    loadByDistrict(district);
    
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

  // Load default data on mount
  useEffect(() => {
    // Mặc định hiển thị "Tất cả khu vực"
    loadByDistrict("all");
  }, []);

  return (
    <div className="map-stations-wrapper">
      <div className="map-stations-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Xem xe theo trạm</h1>
        </div>

        {/* District Filter Tabs */}
        <div className="district-filter-section">
          <div className="district-tabs-wrapper">
            <div className="district-tabs">
              {districts.map((district) => {
                const isActive = district === selectedDistrict;
                return (
                  <button
                    key={district}
                    onClick={() => handleDistrictChange(district)}
                    className={`district-tab ${isActive ? 'active' : ''}`}
                  >
                    <span className="tab-text">
                      {district === "all" ? "Tất cả" : district}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map Section - Full Width */}
        <div className="map-section-full" ref={mapRef}>
          <div className="map-card-full">
            <div className="map-frame-full">
              <iframe
                key={`map-${mapKey}-${selectedStation ? selectedStation.id : 'default'}`}
                src={getMapUrl()}
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                title="Bản đồ trạm VinFast TP.HCM"
                referrerPolicy="no-referrer-when-downgrade"
                className="map-iframe-element"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Vehicles List Section - Full Width */}
        <div className="vehicles-list-section">
          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p className="loading-text">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Vehicles Grid */}
          {!loading && vehiclesFlat.length > 0 && (
            <div className="vehicles-grid">
              {vehiclesFlat.map((vehicle) => (
                <div 
                  key={vehicle.licensePlate} 
                  className="car-card-compact"
                >
                  {/* Car Image Placeholder */}
                  <div className="car-image-placeholder">
                    <Car size={64} className="car-placeholder-icon" />
                    {/* Status Badge */}
                    <span className={`vehicle-status-badge ${
                      vehicle.status === "AVAILABLE" ? "status-available" :
                      vehicle.status === "RENTED" ? "status-rented" :
                      "status-inactive"
                    }`}>
                      {vehicle.status === "AVAILABLE" ? "Có sẵn" :
                       vehicle.status === "RENTED" ? "Đã thuê" :
                       vehicle.status}
                    </span>
                  </div>

                  {/* Car Info */}
                  <div className="car-info-compact">
                    <h3 className="car-model-name">{vehicle.brand} {vehicle.model}</h3>
                    <p className="car-station-name">
                      {vehicle.color || 'Sedan'}
                    </p>
                    <p className="car-license">Biển số: {vehicle.licensePlate}</p>
                    
                    <div className="car-price-large">
                      <span className="price-amount">XXX.XXX.XXX</span>
                      <span className="price-currency">VND</span>
                    </div>
                    <p className="price-period">/mỗi ngày</p>

                    {/* Car Features Icons */}
                    <div className="car-features-icons">
                      <div className="feature-icon-item" title="Transmission">
                        <span className="icon-symbol">⚙️</span>
                      </div>
                      <div className="feature-icon-item" title="Fuel Type">
                        <span className="icon-symbol">⚡</span>
                      </div>
                      <div className="feature-icon-item" title="Electric">
                        <span className="icon-symbol">🔋</span>
                      </div>
                      <div className="feature-icon-item" title="Air Conditioning">
                        <span className="icon-symbol">❄️</span>
                      </div>
                    </div>

                    {/* Rent Button */}
                    <button 
                      className="rent-btn-compact"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Chi tiết xe: ${vehicle.brand} ${vehicle.model}\nBiển số: ${vehicle.licensePlate}`);
                      }}
                      disabled={vehicle.status !== "AVAILABLE"}
                    >
                      {vehicle.status === "AVAILABLE" ? "Xem chi tiết" : "Không khả dụng"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && vehiclesFlat.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">Không có xe khả dụng</h3>
              <p className="empty-text">
                Hiện tại không có xe nào {selectedDistrict !== 'all' ? `tại ${selectedDistrict}` : 'trong hệ thống'}
              </p>
              <button 
                className="empty-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDistrict("all");
                  loadByDistrict("all");
                }}
              >
                Xem tất cả khu vực
              </button>
            </div>
          )}
        </div>
      </div>

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

