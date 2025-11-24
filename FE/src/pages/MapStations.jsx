import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Search, MapPin, Car, Clock, Navigation, X } from "lucide-react";
import './MapStations.css';

// Brand color
const BRAND = "#009B72";

// Static stations list (kept for map centering & demo UI)
const stations = [
    {
        id: 1, name: "Cho thuê Xe điện VinFast - Thảo Điền", district: "Thủ Đức",
        address: "Hầm gửi xe B3 - Vincom Mega Mall, 161 Võ Nguyên Giáp, Thảo Điền, Thủ Đức, Hồ Chí Minh",
        location: "10.801,-106.730", cars: 15, status: "active"
    },
    {
        id: 2, name: "Cho thuê Xe điện VinFast - Tân Cảng", district: "Bình Thạnh",
        address: "208 Nguyễn Hữu Cảnh, Vinhomes Tân Cảng, Bình Thạnh, Hồ Chí Minh",
        location: "10.793,-106.721", cars: 12, status: "active"
    },
    {
        id: 3, name: "Cho thuê Xe điện VinFast - Quận 1", district: "Quận 1",
        address: "Tầng hầm B2 - Vincom Đồng Khởi, 70 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh",
        location: "10.776,-106.700", cars: 20, status: "active"
    },
    {
        id: 4, name: "Cho thuê Xe điện VinFast - Quận 7", district: "Quận 7",
        address: "Crescent Mall, 101 Tôn Dật Tiên, Tân Phú, Quận 7, TP. Hồ Chí Minh",
        location: "10.732,-106.721", cars: 18, status: "active"
    },
    {
        id: 5, name: "Cho thuê Xe điện VinFast - Gò Vấp", district: "Gò Vấp",
        address: "Trung tâm thương mại Emart, 366 Phan Văn Trị, Gò Vấp, TP. Hồ Chí Minh",
        location: "10.839,-106.667", cars: 14, status: "active"
    },
    {
        id: 6, name: "Cho thuê Xe điện VinFast - Bình Tân", district: "Bình Tân",
        address: "AEON Mall Bình Tân, 1 Đường số 17A, Bình Trị Đông B, Bình Tân, TP. Hồ Chí Minh",
        location: "10.755,-106.611", cars: 16, status: "active"
    },
    {
        id: 7, name: "Cho thuê Xe điện VinFast - Phú Nhuận", district: "Phú Nhuận",
        address: "Co.opmart Nguyễn Kiệm, 571 Nguyễn Kiệm, Phú Nhuận, TP. Hồ Chí Minh",
        location: "10.801,-106.679", cars: 10, status: "active"
    },
];

// Helper functions
const parseLoc = (locStr) => {
    let [lat, lng] = String(locStr).split(",").map(s => Number(s.trim()));
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

// --- THÊM ĐOẠN NÀY VÀO (Khoảng dòng 80) ---
const getCarImageSrc = (image) => {
    if (!image) return "/anhxe/default.jpg";

    // Nếu là file ảnh (có đuôi .jpg)
    if (image.toLowerCase().endsWith(".jpg")) {
        // Nếu đã có đường dẫn tuyệt đối (ví dụ mock data)
        if (image.startsWith("/")) return image;
        // Nếu chỉ là tên file thì thêm folder
        return `/carpic/${image}`;
    }

    // Ngược lại coi là Base64
    return `data:image/jpeg;base64,${image}`;
};

const MapStations = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("Thủ Đức");
    const [selectedStationId, setSelectedStationId] = useState(
        stations.find(s => s.district === "Thủ Đức")?.id ?? stations[0].id
    );
    const [showModal, setShowModal] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    const mapRef = useRef(null);
    const navigate = useNavigate();

    // API-driven states
    const [loading, setLoading] = useState(false);
    const [stationsData, setStationsData] = useState([]); // kept if you still want search-by-stations API
    const [vehiclesData, setVehiclesData] = useState([]); // old vehicle list fallback
    const [vehicleModels, setVehicleModels] = useState([]); // NEW: models per-station in selected district
    const [selectedStation, setSelectedStation] = useState(null);
    const [availableVehiclesState, setAvailableVehicles] = useState([]);

    // Derived static districts for tabs
    const DISTRICTS = useMemo(() =>
        Array.from(new Set(stations.map(s => s.district))),
        []);


    // stationsInDistrict from static list (used for map centering and station list UI)
    const stationsInDistrict = useMemo(
        () => stations.filter(s => s.district === selectedDistrict),
        [selectedDistrict]
    );


    const center = useMemo(
        () => centroidOf(stationsInDistrict),
        [stationsInDistrict]
    );

    // Generate map URL (keeps previous logic)
    const mapUrl = useMemo(() => {
        if (selectedStation) {
            const { lat, lng } = parseLoc(selectedStation.location);
            return buildEmbedUrl(lat, lng, selectedStation.name, 15);
        }
        if (center) {
            return buildEmbedUrl(center.lat, center.lng, selectedDistrict, 12);
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

    // ---------- NEW: API call to get model details for a station ----------
    // NOTE: Adjust the URL below to match your actual API path if different.
    // Current assumption: GET /EVRentalSystem/api/vehicle-models/station/{stationId}/details
    const fetchModelDetailsForStation = async (stationId) => {
        try {
            //http://localhost:8084/EVRentalSystem/api/stations/5/models
            const url = `http://localhost:8084/EVRentalSystem/api/stations/${stationId}/models`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            // Expecting an array of model objects similar to sample:
            // { vehicleModelId, brand, model, price, seats, modelPicture, availableCount }
            return Array.isArray(json) ? json : [];
        } catch (err) {
            console.error(`Error fetching models for station ${stationId}:`, err);
            return [];
        }
    };

    // Load vehicle models for all stations in a district (parallel)
    const loadVehicleModelsForDistrict = async (districtLabel) => {
        setLoading(true);
        setVehicleModels([]);
        try {
            if (!districtLabel || districtLabel === "Tất cả") {
                // fallback: load all available vehicles (existing behavior)
                const res = await fetch("http://localhost:8084/EVRentalSystem/api/vehicles/available");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const allVehicles = await res.json();
                setVehiclesData(Array.isArray(allVehicles) ? allVehicles : []);
                setVehicleModels([]); // clear models
            } else {
                // get stations in that district (using static stations list)
                const stationsInThisDistrict = stations.filter(s => s.district === districtLabel);
                // parallel fetch per station
                const promises = stationsInThisDistrict.map(s => fetchModelDetailsForStation(s.id));
                const results = await Promise.all(promises);
                // Flatten, and attach station info to each model (so UI can show stationName)
                const flattened = results.flatMap((models, idx) =>
                    (models || []).map(m => ({
                        ...m,
                        stationId: stationsInThisDistrict[idx].id,
                        stationName: stationsInThisDistrict[idx].name,
                        stationAddress: stationsInThisDistrict[idx].address,
                        stationDistrict: stationsInThisDistrict[idx].district,
                    }))
                );
                setVehicleModels(flattened);
                // clear old vehiclesData to avoid confusion
                setVehiclesData([]);
            }
        } catch (error) {
            console.error("Error loading vehicle models for district:", error);
            setVehicleModels([]);
            setVehiclesData([]);
        } finally {
            setLoading(false);
        }
    };

    // When tab changes, call the appropriate loader
    const handleDistrictChange = (district) => {
        // lưu district vào URL query param rồi reload trang
        const newUrl = `${window.location.pathname}?district=${encodeURIComponent(district)}`;
        window.history.pushState({}, '', newUrl);
        window.location.reload();
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

    // Load default district models on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const districtFromUrl = params.get('district');
        const districtToLoad = districtFromUrl || "Thủ Đức";
        setSelectedDistrict(districtToLoad);
        loadVehicleModelsForDistrict(districtToLoad);
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

                {/* Vehicles / Models Section */}
                <section className="vehicles-section">
                    <h3 className="vehicles-section-title">
                        Xe khả dụng tại {selectedDistrict}
                    </h3>
                    {loading ? (
                        <div className="vehicles-loading">Đang tải dữ liệu...</div>
                    ) : (
                        <>
                            {/* If vehicleModels exist (i.e. we loaded model-per-station), show them */}
                            {vehicleModels && vehicleModels.length > 0 ? (
                                <div className="vehicles-grid-display">
                                    {vehicleModels.map((m, idx) => {
                                        // 1. SỬA: Gọi hàm xử lý ảnh
                                        const img = getCarImageSrc(m.modelPicture);

                                        return (
                                            <article key={`${m.vehicleModelId || m.model}-${idx}`} className="vehicle-card">
                                                <div className="vehicle-card__media">
                                                    {/* 2. SỬA: Dùng biến img đã xử lý */}
                                                    {img ? (
                                                        <img
                                                            src={img}
                                                            alt={`${m.brand} ${m.model}`}
                                                            className="vehicle-card__image"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="vehicle-card__placeholder" aria-hidden="true">
                                                            🚗
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ... (Phần Header và Tags giữ nguyên) ... */}
                                                <div className="vehicle-card__header">
                                                    <div>
                                                        <h3 className="vehicle-card__name">{m.model}</h3>
                                                        <p className="vehicle-card__subtitle">
                                                            {m.brand} – {m.seats} chỗ
                                                        </p>
                                                        <p className="vehicle-card__subtitle" style={{ marginTop: 6, fontSize: 13 }}>
                                                            Trạm: {m.stationName}
                                                        </p>
                                                    </div>
                                                    <div className="vehicle-card__price-wrapper">
                                                        <span className="vehicle-card__price-label">Giá mẫu</span>
                                                        <p className="vehicle-card__price">
                                                            {fPrice(m.price || (m.vehicleModel?.price))}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="vehicle-card__tags">
                                                    <span className="vehicle-card__tag">Còn: {m.availableCount ?? '—'}</span>
                                                    <span className="vehicle-card__tag">{m.seats} chỗ</span>
                                                </div>
                                                {/* ... (Hết phần Header và Tags) ... */}

                                                <div className="vehicle-card__actions">
                                                    <button
                                                        type="button"
                                                        className="vehicle-card__cta vehicle-card__cta--secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/car/${m.vehicleModelId || m.id}`, {
                                                                state: {
                                                                    id: m.vehicleModelId || m.id,
                                                                    brand: m.brand || "Không rõ thương hiệu",
                                                                    model: m.model || "Không rõ model",
                                                                    price: m.price || 0,
                                                                    seats: m.seats || 4,
                                                                    availableCount: m.availableCount ?? 1,
                                                                    modelPicture: m.modelPicture,
                                                                    // 3. SỬA: Dùng hàm xử lý ảnh cho mảng images
                                                                    images: [img],
                                                                    stationId: m.stationId,
                                                                    stationName: m.stationName,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Xem chi tiết <span aria-hidden>→</span>
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                // fallback: either vehiclesData (old endpoint) or empty-state
                                vehiclesData && vehiclesData.length > 0 ? (
                                    <div className="vehicles-grid-display">
                                        {vehiclesData.map(v => {
                                            // 1. SỬA: Gọi hàm xử lý ảnh (Lưu ý ở đây key là v.picture)
                                            const img = getCarImageSrc(v.picture);

                                            return (
                                                <article key={`${v.licensePlate || v.id || Math.random()}`} className="vehicle-card">
                                                    <div className="vehicle-card__media">
                                                        {/* 2. SỬA: Dùng biến img */}
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

                                                    {/* ... (Phần giữa giữ nguyên) ... */}

                                                    <div className="vehicle-card__actions">
                                                        <button
                                                            type="button"
                                                            className="vehicle-card__cta vehicle-card__cta--secondary"
                                                            onClick={() => {
                                                                navigate(`/car/${v.id}`, {
                                                                    state: {
                                                                        id: v.id,
                                                                        brand: v.brand,
                                                                        model: v.model,
                                                                        price: v.price,
                                                                        stationId: v.stationId || v.stationId || null,
                                                                        stationName: v.stationName || v.station || 'Không rõ trạm',
                                                                        // 3. SỬA: Dùng biến img cho mảng images
                                                                        images: [img],
                                                                    }
                                                                });
                                                            }}
                                                        >
                                                            Xem chi tiết <span aria-hidden>→</span>
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="vehicles-empty-state">
                                        Không có xe khả dụng.
                                    </div>
                                )
                            )}
                        </>
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
