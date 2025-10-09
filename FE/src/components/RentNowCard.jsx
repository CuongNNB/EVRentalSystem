import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RentNowCard.css';

const RentNowCard = ({ carId }) => {
  const navigate = useNavigate();

  const handleRentNow = () => {
    if (carId) {
      navigate(`/checkout`);
    } else {
      navigate('/cars');
    }
  };

  return (
    <div className="rent-now-card">
      <div className="rent-now-content">
        <h2 className="rent-now-title">Thuê xe ngay</h2>
        
        <button 
          className="rent-now-button"
          onClick={handleRentNow}
        >
          Đặt xe ngay
        </button>
      </div>
    </div>
  );
};

export default RentNowCard;
