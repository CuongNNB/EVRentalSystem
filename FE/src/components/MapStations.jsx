import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, MapPin, Car, Clock, Navigation, X } from "lucide-react";
import './MapStations.css';
import { searchStationsByDistrict } from "../api/stations";
import { getAvailableVehicles } from "../api/vehicles";

// Brand color
const BRAND = "#009B72";

// Stations data with VinFast locations - Updated with exact coordinates from your table
const stations = [
  { id: 1, name: "Cho thuê Xe điện VinFast - Thảo Điền", district: "Thủ Đức",
    address: "Hầm gửi xe B3 - Vincom Mega Mall, 161 Võ Nguyên Giáp, Thảo Điền, Thủ Đức, Hồ Chí Minh",
    location: "10.801,-106.730", cars: 15, status: "active" },
  { id: 2, name: "Cho thuê Xe điện VinFast - Tân Cảng", district: "Bình Thạnh",
    address: "208 Nguyễn Hữu Cảnh, Vinhomes Tân Cảng, Bình Thạnh, Hồ Chí Minh",
    location: "10.793,-106.721", cars: 12, status: "active" },
  { id: 3, name: "Cho thuê Xe điện VinFast - Quận 1", district: "Quận 1",
    address: "Tầng hầm B2 - Vincom Đồng Khởi, 70 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh",
    location: "10.776,-106.700", cars: 20, status: "active" },
  { id: 4, name: "Cho thuê Xe điện VinFast - Quận 7", district: "Quận 7",
    address: "Crescent Mall, 101 Tôn Dật Tiên, Tân Phú, Quận 7, TP. Hồ Chí Minh",
    location: "10.732,-106.721", cars: 18, status: "active" },
  { id: 5, name: "Cho thuê Xe điện VinFast - Gò Vấp", district: "Gò Vấp",
    address: "Trung tâm thương mại Emart, 366 Phan Văn Trị, Gò Vấp, TP. Hồ Chí Minh",
    location: "10.839,-106.667", cars: 14, status: "active" },
  { id: 6, name: "Cho thuê Xe điện VinFast - Bình Tân", district: "Bình Tân",
    address: "AEON Mall Bình Tân, 1 Đường số 17A, Bình Trị Đông B, Bình Tân, TP. Hồ Chí Minh",
    location: "10.755,-106.611", cars: 16, status: "active" },
  { id: 7, name: "Cho thuê Xe điện VinFast - Phú Nhuận", district: "Phú Nhuận",
    address: "Co.opmart Nguyễn Kiệm, 571 Nguyễn Kiệm, Phú Nhuận, TP. Hồ Chí Minh",
    location: "10.801,-106.679", cars: 10, status: "active" },
];

// Helper functions
const parseLoc = (locStr) => {
  let [lat, lng] = String(locStr).split(",").map(s => Number(s.trim()));
  // Tự động sửa kinh độ âm (Google Maps Việt Nam dùng kinh độ dương)
  if (lng < 0) lng = Math.abs(lng);
  return { lat, lng };
};

// Build clean embed URL - ROADMAP mode
const buildEmbedUrl = (lat, lng, label, zoom = 14) => {
  const q = `${lat},${lng}(${encodeURIComponent(label)})`;
  // t=m = map (roadmap view), không phải satellite hay terrain
  return `https://www.google.com/maps?q=${q}&hl=vi&z=${zoom}&t=m&output=embed`;
};

// Calculate centroid for "All" view
const centroidOf = (arr) => {
  if (!arr.length) return null;
  const lat = arr.reduce((s, v) => s + parseLoc(v.location).lat, 0) / arr.length;
  const lng = arr.reduce((s, v) => s + parseLoc(v.location).lng, 0) / arr.length;
  return { lat, lng };
};

// Main MapStations component
const MapStations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Tất cả");
  const [selectedStationId, setSelectedStationId] = useState(
    stations.find(s => s.district === "Thủ Đức")?.id ?? stations[0].id
  );
  const [showModal, setShowModal] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef(null);

  // API data states
  const [loading, setLoading] = useState(false);
  const [stationsData, setStationsData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedDistrict === "Tất cả") {
          const res = await fetch("http://localhost:8084/EVRentalSystem/api/vehicles/available");
          const allVehicles = await res.json();
          setVehiclesData(allVehicles || []);
          setStationsData([]); // reset danh sách trạm
        } else {
          const res = await fetch(
            `http://localhost:8084/EVRentalSystem/api/stations/search?district=${encodeURIComponent(selectedDistrict)}`
          );
          const stations = await res.json();
          setStationsData(stations || []);
          // Gộp tất cả xe của các trạm trong quận đó
          const mergedVehicles = stations.flatMap(s => s.vehicles || []);
          setVehiclesData(mergedVehicles);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, [selectedDistrict]);

  const vehicleStats = useMemo(() => {
    const vs = selectedStation?.vehicles || [];
    const total = vs.length;
    const by = vs.reduce((a, v) => {
      const k = (v.status || "").toUpperCase();
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {});
    return {
      total,
      available: by.AVAILABLE || 0,
      rented: by.RENTED || 0,
      fixing: by.FIXING || 0,
    };
  }, [selectedStation]);

  const availableVehicles = useMemo(
    () =>
      (selectedStation?.vehicles || []).filter(
        (v) => (v.status || "").toUpperCase() === "AVAILABLE"
      ),
    [selectedStation]
  );

  // Get unique districts
  const DISTRICTS = useMemo(() => 
    ["Tất cả", ...Array.from(new Set(stations.map(s => s.district)))],
    []
  );

  // Filter stations by selected district
  const stationsInDistrict = useMemo(
    () => (selectedDistrict === "Tất cả"
      ? stations
      : stations.filter(s => s.district === selectedDistrict)),
    [selectedDistrict]
  );

  // Calculate center point
  const center = useMemo(
    () => centroidOf(stationsInDistrict),
    [stationsInDistrict]
  );

  // Generate map URL based on selection
  const mapUrl = useMemo(() => {
    if (selectedStation && selectedDistrict !== "Tất cả") {
      const { lat, lng } = parseLoc(selectedStation.location);
      return buildEmbedUrl(lat, lng, selectedStation.name, 15);
    }
    if (center) {
      const label = selectedDistrict === "Tất cả" ? "TP. Hồ Chí Minh" : selectedDistrict;
      return buildEmbedUrl(center.lat, center.lng, label, 12);
    }
    // Default HCMC roadmap
    return "https://www.google.com/maps?q=10.7769,106.7008&hl=vi&z=11&t=m&output=embed";
  }, [selectedStation, selectedDistrict, center]);

  // Map nhãn tab -> district cho BE
  const DISTRICT_VALUE = {
    "Tất cả": null,
    "Thủ Đức": "Thủ Đức",
    "Bình Thạnh": "Bình Thạnh",
    "Quận 1": "Quận 1",
    "Quận 7": "Quận 7",
    "Gò Vấp": "Gò Vấp",
    "Bình Tân": "Bình Tân",
    "Phú Nhuận": "Phú Nhuận",
  };

  // Load data by district
  const loadByDistrict = async (tabLabel) => {
    const districtParam = DISTRICT_VALUE[tabLabel] ?? tabLabel;

    console.log("🔍 LoadByDistrict called with:", tabLabel, "→", districtParam);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8084/EVRentalSystem/api/stations/search?district=${districtParam}`);
      const data = await response.json();

      console.log("API Response:", data);
      console.log("Selected district:", tabLabel);
      console.log("Stations in district:", data.length);

      setStationsData(data);

      if (data.length > 0) {
        const firstStationVehicles = data[0].vehicles || [];
        console.log("Vehicles in first station:", firstStationVehicles.length, firstStationVehicles);

        const available = firstStationVehicles.filter(v => v.status === 'AVAILABLE');
        console.log("Available vehicles count:", available.length);
        console.log("Available vehicles detail:", available);

        setAvailableVehicles(available);
      } else {
        setAvailableVehicles([]);
      }
    } catch (error) {
      console.error("Error loading stations:", error);
    }

    setLoading(false);
  };

  // Sync selected station when district changes
  useEffect(() => {
    if (selectedDistrict === "Tất cả") { 
      setSelectedStationId(null); 
      return; 
    }
    const stillValid = stationsInDistrict.some(s => s.id === selectedStationId);
    if (!stillValid) {
      setSelectedStationId(stationsInDistrict[0]?.id ?? null);
    }
  }, [selectedDistrict, stationsInDistrict, selectedStationId]);

  // Handle district filter change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setMapKey(prev => prev + 1); // Force map reload
    
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

  // Handle station card click
  const handleStationCardClick = (station) => {
    setSelectedStationId(station.id);
    setMapKey(prev => prev + 1); // Force map reload
    
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

  // Handle station selection for modal
  const handleStationSelect = (station) => {
    setSelectedStationId(station.id);
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
  };

  // Handle directions
  const handleDirections = (station) => {
    const { lat, lng } = parseLoc(station.location);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Handle rent car
  const handleRentCar = (station) => {
    // Placeholder for rent car functionality
    alert(`Chức năng thuê xe tại ${station.name} sẽ được triển khai sớm!`);
  };

  // Load default data on mount
  useEffect(() => {
    // Mặc định hiển thị "Thủ Đức" với marker đầu tiên
    const defaultDistrict = "Thủ Đức";
    loadByDistrict(defaultDistrict);
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
              {DISTRICTS.map((district) => {
                const isActive = district === selectedDistrict;
                return (
                  <button
                    key={district}
                    onClick={() => setSelectedDistrict(district)}
                    className={`district-tab ${isActive ? 'active' : ''}`}
                  >
                    <span className="tab-text">
                      {district}
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
                key={`map-${mapKey}`}
                src={mapUrl}
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                title="Bản đồ trạm VinFast TP.HCM"
                referrerPolicy="no-referrer-when-downgrade"
                className="map-iframe-element"
                style={{ border: 0, borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Vehicles Section */}
        <section className="vehicles-section">
          <h3 className="vehicles-section-title">
            {selectedDistrict === "Tất cả" ? "Tất cả xe khả dụng" : `Xe khả dụng tại ${selectedDistrict}`}
          </h3>

          {vehiclesData.length === 0 ? (
            <div className="vehicles-empty-state">
              Không có xe khả dụng.
            </div>
          ) : (
            <div className="vehicles-grid-display">
              {vehiclesData.map(v => {
                const img = v.picture ? `/carpic/${v.picture}` : "/anhxe/default.jpg";
                const formatPrice = (price) => {
                  if (!price) return "Liên hệ";
                  const formatted = (price * 1000).toLocaleString("vi-VN");
                  return `${formatted} VND/ngày`;
                };
                return (
                  <article key={v.licensePlate} className="vehicle-card">
                    {/* Image */}
                    <div className="vehicle-card__media">
                      {img ? (
                        <img
                          src={img}
                          alt={`${v.brand} ${v.model}`}
                          className="vehicle-card__image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="vehicle-card__placeholder" aria-hidden="true">
                          🚗
                        </div>
                      )}
                    </div>

                    {/* Header */}
                    <div className="vehicle-card__header">
                      <div>
                        <h3 className="vehicle-card__name">{v.model}</h3>
                        <p className="vehicle-card__subtitle">
                          {v.brand} – {v.color}
                        </p>
                      </div>
                      <div className="vehicle-card__price-wrapper">
                        <span className="vehicle-card__price-label">Giá thuê</span>
                        <p className="vehicle-card__price">
                          {formatPrice(v.vehicleModel?.price || v.price || 1200)}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="vehicle-card__tags">
                      <span className="vehicle-card__tag">⚡ {v.batteryCapacity}</span>
                      <span className="vehicle-card__tag">{v.status}</span>
                    </div>

                    {/* Features */}
                    <ul className="vehicle-card__features">
                      <li className="vehicle-card__feature">
                        <span className="vehicle-card__feature-icon">📍</span>
                        <span>{v.stationName || 'Không rõ'}</span>
                      </li>
                      <li className="vehicle-card__feature">
                        <span className="vehicle-card__feature-icon">🧭</span>
                        <span>Odo: {(v.odo || 0).toLocaleString('vi-VN')} km</span>
                      </li>
                    </ul>

                    {/* Actions */}
                    <div className="vehicle-card__actions">
                      <button
                        type="button"
                        className="vehicle-card__cta vehicle-card__cta--secondary"
                        onClick={() => {
                          // Handle view details
                          alert(`Xem chi tiết xe: ${v.brand} ${v.model}`);
                        }}
                      >
                        Xem chi tiết <span aria-hidden>→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
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
                {(() => {
                  const { lat, lng } = parseLoc(selectedStation.location);
                  return (
                    <iframe
                      src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                      width="100%"
                      height="200"
                      allowFullScreen
                      loading="lazy"
                      title={`Bản đồ ${selectedStation.name}`}
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  );
                })()}
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

