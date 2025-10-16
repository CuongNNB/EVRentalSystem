// MapStationsDemo.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { Search, MapPin, Car, Clock, Navigation, X } from "lucide-react";
import './MapStations.css';

// ---------------------------
// MapStations component (gộp vào file demo)
// ---------------------------

// Brand color
const BRAND = "#009B72";

// Static stations list (kept for map centering & demo UI)
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
    // Some static data uses negative longitudes; keep them as positive for embed URLs if necessary
    if (lng < 0) lng = Math.abs(lng);
    return { lat, lng };
};

const buildEmbedUrl = (lat, lng, label, zoom = 14) => {
    const q = `${lat},${lng}(${encodeURIComponent(label)})`;
    return `https://www.google.com/maps?q=${q}&hl=vi&z=${zoom}&t=m&output=embed`;
};

const centroidOf = (arr) => {
    if (!arr.length) return null;
    const lat = arr.reduce((s, v) => s + parseLoc(v.location).lat, 0) / arr.length;
    const lng = arr.reduce((s, v) => s + parseLoc(v.location).lng, 0) / arr.length;
    return { lat, lng };
};

const MapStations = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("Tất cả");
    const [selectedStationId, setSelectedStationId] = useState(
        stations.find(s => s.district === "Thủ Đức")?.id ?? stations[0].id
    );
    const [showModal, setShowModal] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    const mapRef = useRef(null);

    // API-driven states
    const [loading, setLoading] = useState(false);
    const [stationsData, setStationsData] = useState([]); // kept if you still want search-by-stations API
    const [vehiclesData, setVehiclesData] = useState([]); // vehicles to render (filtered)
    const [selectedStation, setSelectedStation] = useState(null);
    const [availableVehiclesState, setAvailableVehicles] = useState([]);

    // Derived static districts for tabs
    const DISTRICTS = useMemo(() =>
            ["Tất cả", ...Array.from(new Set(stations.map(s => s.district)))],
        []
    );

    // stationsInDistrict from static list (used only for map centering and station list UI)
    const stationsInDistrict = useMemo(
        () => (selectedDistrict === "Tất cả"
            ? stations
            : stations.filter(s => s.district === selectedDistrict)),
        [selectedDistrict]
    );

    const center = useMemo(
        () => centroidOf(stationsInDistrict),
        [stationsInDistrict]
    );

    // Generate map URL (keeps previous logic)
    const mapUrl = useMemo(() => {
        if (selectedStation && selectedDistrict !== "Tất cả") {
            // if selectedStation has a location (from static or stationsData), use it
            if (selectedStation.location) {
                const { lat, lng } = parseLoc(selectedStation.location);
                return buildEmbedUrl(lat, lng, selectedStation.name, 15);
            }
        }
        if (center) {
            const label = selectedDistrict === "Tất cả" ? "TP. Hồ Chí Minh" : selectedDistrict;
            return buildEmbedUrl(center.lat, center.lng, label, 12);
        }
        return "https://www.google.com/maps?q=10.7769,106.7008&hl=vi&z=11&t=m&output=embed";
    }, [selectedStation, selectedDistrict, center]);

    // Update selectedStation when selectedStationId or stationsData/stations change
    useEffect(() => {
        let found = null;
        if (stationsData && stationsData.length && selectedStationId != null) {
            found = stationsData.find(s => s.id === selectedStationId) || null;
        }
        if (!found) {
            found = stations.find(s => s.id === selectedStationId) || stationsInDistrict[0] || null;
        }
        setSelectedStation(found);
    }, [selectedStationId, stationsData, stationsInDistrict]);

    /**
     * NEW: load vehicles from /api/vehicles/available then filter by stationAddress
     * - If districtLabel === "Tất cả": use all vehicles
     * - Else: filter vehicles whose stationAddress includes districtLabel (case-insensitive)
     */
    const loadVehiclesAndFilterByDistrict = async (districtLabel) => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8084/EVRentalSystem/api/vehicles/available");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const allVehicles = await res.json();
            const arr = Array.isArray(allVehicles) ? allVehicles : [];

            // set stationsData to empty because we're using vehicles endpoint now
            setStationsData([]);

            if (!districtLabel || districtLabel === "Tất cả") {
                setVehiclesData(arr);
            } else {
                const needle = districtLabel.toLowerCase().trim();
                const filtered = arr.filter((v) => {
                    const addr = (v.stationAddress || '').toLowerCase();
                    return addr.includes(needle);
                });
                setVehiclesData(filtered);
            }

            // also update availableVehiclesState for first few vehicles (optional)
            const avail = (arr || []).filter(v => (v.status || '').toUpperCase() === 'AVAILABLE');
            setAvailableVehicles(avail);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            setVehiclesData([]);
            setStationsData([]);
            setAvailableVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    // When tab changes, load via vehicles endpoint and filter by stationAddress
    const handleDistrictChange = (district) => {
        setSelectedDistrict(district);
        setMapKey(prev => prev + 1);
        loadVehiclesAndFilterByDistrict(district);

        // scroll to map
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Sync selectedStationId when district changes (keep a sensible default)
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

    // Handle station card click (static station UI)
    const handleStationCardClick = (station) => {
        setSelectedStationId(station.id);
        setMapKey(prev => prev + 1);
        setTimeout(() => {
            if (mapRef.current) mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // Modal handlers
    const handleStationSelect = (station) => {
        setSelectedStationId(station.id);
        setShowModal(true);
        setMapKey(prev => prev + 1);
        setSelectedDistrict(station.district);
        setTimeout(() => {
            if (mapRef.current) mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };
    const handleCloseModal = () => setShowModal(false);
    const handleDirections = (station) => {
        const { lat, lng } = parseLoc(station.location);
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    };
    const handleRentCar = (station) => {
        alert(`Chức năng thuê xe tại ${station.name} sẽ được triển khai sớm!`);
    };

    // Load default district vehicles on mount
    useEffect(() => {
        const defaultDistrict = "Thủ Đức";
        setSelectedDistrict(defaultDistrict);
        loadVehiclesAndFilterByDistrict(defaultDistrict);
    }, []);

    // Formatting helper for vehicle price (copied)
    const fPrice = (price) => {
        if (!price && price !== 0) return "Liên hệ";
        const formatted = (price * 1000).toLocaleString("vi-VN");
        return `${formatted} VND/ngày`;
    };

    return (
        <div className="map-stations-wrapper">
            <Header />
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
                                        onClick={() => handleDistrictChange(district)}
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

                    {loading ? (
                        <div className="vehicles-loading">Đang tải dữ liệu...</div>
                    ) : vehiclesData.length === 0 ? (
                        <div className="vehicles-empty-state">
                            Không có xe khả dụng.
                        </div>
                    ) : (
                        <div className="vehicles-grid-display">
                            {vehiclesData.map(v => {
                                const img = v.picture ? `/carpic/${v.picture}` : "/anhxe/default.jpg";
                                return (
                                    <article key={`${v.licensePlate || v.id || Math.random()}`} className="vehicle-card">
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
                                                    {fPrice(v.vehicleModel?.price || v.price || 1200)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="vehicle-card__tags">
                                            <span className="vehicle-card__tag">⚡ {v.batteryCapacity}</span>
                                            <span className="vehicle-card__tag">{v.status}</span>
                                        </div>

                                        <ul className="vehicle-card__features">
                                            <li className="vehicle-card__feature">
                                                <span className="vehicle-card__feature-icon">📍</span>
                                                <span>{v.stationName || v.station || 'Không rõ'}</span>
                                            </li>
                                            <li className="vehicle-card__feature">
                                                <span className="vehicle-card__feature-icon">🧭</span>
                                                <span>Odo: {(v.odo || 0).toLocaleString('vi-VN')} km</span>
                                            </li>
                                        </ul>

                                        <div className="vehicle-card__actions">
                                            <button
                                                type="button"
                                                className="vehicle-card__cta vehicle-card__cta--secondary"
                                                onClick={() => {
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

// ---------------------------
// MapStationsDemo (page) - sử dụng MapStations gộp sẵn
// ---------------------------
const MapStationsDemo = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Bản đồ trạm xe điện EV Rental
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Khám phá các trạm sạc xe điện EVRental tại TP.HCM với bản đồ tương tác Google Maps
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <MapStations />
                </div>

            </main>
        </div>
    );
};

export default MapStations;
  