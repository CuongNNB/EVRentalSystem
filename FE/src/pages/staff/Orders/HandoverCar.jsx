import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffSlideBar from "../../../components/staff/StaffSlideBar";
import StaffHeader from "../../../components/staff/StaffHeader";
import "../StaffLayout.css";
import "./HandoverCar.css";

const MOCK_VEHICLES = [
  {
    id: "59UA1989",
    name: "VinFast VF 3",
    plate: "59UA1989",
    battery: "85%",
    color: "Xám vàng",
    mileage: "10,000 km",
    status: "Tốt",
  },
  {
    id: "59A12368",
    name: "VinFast VF 3",
    plate: "59A12368",
    battery: "72%",
    color: "Trắng ngọc",
    mileage: "8,500 km",
    status: "Tốt",
  },
];

const HandoverCar = () => {
  const { orderId = "EV0205010" } = useParams();
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState(MOCK_VEHICLES[0]);

  const handleSelect = (event) => {
    const found = MOCK_VEHICLES.find((item) => item.id === event.target.value);
    if (found) {
      setSelectedCar(found);
    }
  };

  return (
    <div className="staff-shell staff-shell--orders">
      <StaffHeader />
      <div className="staff-layout staff-layout--orders">
        <StaffSlideBar activeKey="orders" />
        <main className="staff-main">
          <section className="handover">
            <header className="handover__header">
              <h1>
                Quản lý bàn giao xe <span># {orderId}</span>
              </h1>
              <p>Chọn xe bàn giao</p>
            </header>

          <div className="handover__select">
            <div className="handover__info">
              <span className="handover__label">Tên xe:</span>
              <strong>{selectedCar.name}</strong>
            </div>

            <label className="handover__selector">
              <span>Chọn xe bàn giao</span>
              <select value={selectedCar.id} onChange={handleSelect}>
                {MOCK_VEHICLES.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.id}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="handover__card">
            <section className="handover__details">
              <h2>{selectedCar.name}</h2>
              <dl>
                <div>
                  <dt>Biển số xe</dt>
                  <dd>{selectedCar.plate}</dd>
                </div>
                <div>
                  <dt>Tình trạng pin</dt>
                  <dd className="handover__battery">{selectedCar.battery}</dd>
                </div>
                <div>
                  <dt>Màu xe</dt>
                  <dd>{selectedCar.color}</dd>
                </div>
                <div>
                  <dt>Số km đã đi</dt>
                  <dd>{selectedCar.mileage}</dd>
                </div>
                <div>
                  <dt>Tình trạng xe</dt>
                  <dd>
                    <span className="handover__status">{selectedCar.status}</span>
                  </dd>
                </div>
              </dl>
            </section>

            <div className="handover__car-preview">
              <div className="handover__car-frame">
                <span role="img" aria-label="car">
                  🚘
                </span>
                <p>{selectedCar.name}</p>
              </div>
            </div>

            <footer className="handover__actions">
              
              <button
                type="button"
                className="handover__action handover__action--primary"
                onClick={() =>
                  navigate(`/staff/orders/${orderId}/handover/check`)
                }
              >
                Kiểm tra xe
              </button>
            </footer>
          </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HandoverCar;
