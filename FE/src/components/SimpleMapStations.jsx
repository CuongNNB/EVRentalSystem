import React, { useState } from 'react';
import './MapStations.css';

// Simple MapStations component without react-leaflet
const SimpleMapStations = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Stations data
  const stations = [
    { id: 1, name: "Trạm EVRental Quận 1", lat: 10.776889, lng: 106.700806, address: "22 Lý Tự Trọng, Quận 1, TP.HCM" },
    { id: 2, name: "Trạm EVRental Quận 3", lat: 10.786987, lng: 106.686126, address: "Nguyễn Đình Chiểu, Quận 3, TP.HCM" },
    { id: 3, name: "Trạm EVRental Quận 4", lat: 10.762622, lng: 106.708084, address: "Hoàng Diệu, Quận 4, TP.HCM" },
    { id: 4, name: "Trạm EVRental Quận 5", lat: 10.754566, lng: 106.663874, address: "85 Hùng Vương, Quận 5, TP.HCM" },
    { id: 5, name: "Trạm EVRental Quận 6", lat: 10.749119, lng: 106.635689, address: "Nguyễn Văn Luông, Quận 6, TP.HCM" },
    { id: 6, name: "Trạm EVRental Quận 7", lat: 10.737018, lng: 106.719530, address: "Nguyễn Văn Linh, Quận 7, TP.HCM" },
    { id: 7, name: "Trạm EVRental Quận 8", lat: 10.724007, lng: 106.628937, address: "Tạ Quang Bửu, Quận 8, TP.HCM" },
    { id: 8, name: "Trạm EVRental Quận 9", lat: 10.841050, lng: 106.828308, address: "Đỗ Xuân Hợp, Quận 9, TP.HCM" },
    { id: 9, name: "Trạm EVRental Quận 10", lat: 10.774949, lng: 106.667084, address: "3 Tháng 2, Quận 10, TP.HCM" },
    { id: 10, name: "Trạm EVRental Quận 11", lat: 10.762045, lng: 106.641639, address: "Lạc Long Quân, Quận 11, TP.HCM" },
    { id: 11, name: "Trạm EVRental Quận 12", lat: 10.869784, lng: 106.641250, address: "Trường Chinh, Quận 12, TP.HCM" },
    { id: 12, name: "Trạm EVRental Bình Thạnh", lat: 10.804056, lng: 106.708687, address: "Điện Biên Phủ, Bình Thạnh, TP.HCM" },
    { id: 13, name: "Trạm EVRental Tân Bình", lat: 10.801180, lng: 106.652064, address: "Cộng Hòa, Tân Bình, TP.HCM" },
    { id: 14, name: "Trạm EVRental Gò Vấp", lat: 10.838992, lng: 106.676636, address: "Nguyễn Oanh, Gò Vấp, TP.HCM" },
    { id: 15, name: "Trạm EVRental Phú Nhuận", lat: 10.797365, lng: 106.680977, address: "Phan Đăng Lưu, Phú Nhuận, TP.HCM" },
    { id: 16, name: "Trạm EVRental Bình Tân", lat: 10.767925, lng: 106.594871, address: "Kinh Dương Vương, Bình Tân, TP.HCM" },
    { id: 17, name: "Trạm EVRental Thủ Đức", lat: 10.851977, lng: 106.758785, address: "Võ Văn Ngân, Thủ Đức, TP.HCM" },
  ];
//hihi

  // Handle station card click
  const handleStationClick = (station) => {
    setSelectedStation(station);
    setShowMap(true);
    console.log('Selected station:', station);
  };

  // Handle view details button click
  const handleViewDetails = (station, e) => {
    e.stopPropagation();
    setSelectedStation(station);
    setShowMap(true);
    console.log('View details for:', station.name);
  };

  // Handle get directions button click
  const handleGetDirections = (station, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    const mapsUrl = `https://www.google.com/maps?q=${station.lat},${station.lng}`;
    window.open(mapsUrl, '_blank');
    console.log('Get directions to:', station.name);
  };

  // Handle close map
  const handleCloseMap = () => {
    setShowMap(false);
    setSelectedStation(null);
  };


  return (
    <div className="map-stations-container">

      {/* Map Placeholder */}
      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-content">
            <div className="map-header">
              <h3>🗺️ Bản đồ trạm xe điện EVRental</h3>
              <p>TP.HCM - {stations.length} trạm</p>
            </div>

            <div className="stations-grid">
              {stations.map((station) => (
                  <div 
                    key={station.id} 
                    className={`station-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
                    onClick={() => handleStationClick(station)}
                  >
                    <div className="station-marker">
                      <div className="marker-pin">
                        <div className="marker-icon">🚗</div>
                      </div>
                    </div>
                    <div className="station-info">
                      <h4 className="station-name">{station.name}</h4>
                      <p className="station-address">{station.address}</p>
                      <div className="station-actions">
                        <button 
                          className="action-btn primary"
                          onClick={(e) => handleViewDetails(station, e)}
                        >
                          Xem chi tiết
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={(e) => handleGetDirections(station, e)}
                        >
                          Chỉ đường
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Info */}
      <div className="map-info">
        <div className="info-item">
          <span className="info-icon">📍</span>
          <span>Tổng cộng {stations.length} trạm EVRental</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🗺️</span>
          <span>Bản đồ trạm xe điện</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🔍</span>
          <span>Tìm kiếm và lọc trạm</span>
        </div>
      </div>

      {/* Station Map Modal */}
      {showMap && selectedStation && (
        <div className="station-map-modal">
          <div className="modal-overlay" onClick={handleCloseMap}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                🗺️ {selectedStation.name}
              </h3>
              <button className="modal-close" onClick={handleCloseMap}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="station-details">
                <div className="station-info-card">
                  <div className="station-marker-large">
                    <div className="marker-pin-large">
                      <div className="marker-icon-large">🚗</div>
                    </div>
                  </div>
                  <div className="station-details-info">
                    <h4 className="station-details-name">{selectedStation.name}</h4>
                    <p className="station-details-address">
                      <strong>📍 Địa chỉ:</strong><br />
                      {selectedStation.address}
                    </p>
                    <p className="station-details-coords">
                      <strong>🌐 Tọa độ:</strong><br />
                      {selectedStation.lat}, {selectedStation.lng}
                    </p>
                  </div>
                </div>
                
                <div className="map-container-modal">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.325!2d${selectedStation.lng}!3d${selectedStation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM2LjgiTiAxMDbCsDQyJzAyLjkiRQ!5e0!3m2!1svi!2s!4v1760241934224!5m2!1svi!2s&q=${selectedStation.lat},${selectedStation.lng}`}
                    width="100%"
                    height="400"
                    style={{ 
                      border: 0, 
                      borderRadius: '12px'
                    }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ ${selectedStation.name}`}
                  ></iframe>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="modal-btn primary"
                    onClick={() => handleGetDirections(selectedStation)}
                  >
                    🧭 Mở Google Maps
                  </button>
                  <button 
                    className="modal-btn secondary"
                    onClick={handleCloseMap}
                  >
                    ✕ Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMapStations;
