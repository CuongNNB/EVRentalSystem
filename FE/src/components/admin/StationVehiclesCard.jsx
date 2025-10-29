/**
 * StationVehiclesCard Component
 * 
 * NOTE: File được tạo mới để hiển thị thông tin tổng số xe trong dashboard admin
 * - Hiển thị tổng số xe với dropdown chọn trạm
 * - Dữ liệu từ API backend, không hardcode
 * - Khi chọn trạm, hiển thị số xe của trạm đó
 * 
 * @param {number} totalAll - Tổng số xe toàn hệ thống (khi chọn "Tất cả trạm")
 */

import React, { useState, useEffect, useMemo } from 'react';
import { getStationOptions, getStationTotalVehicles } from '../../api/adminDashboard';
import './StationVehiclesCard.css';

const StationVehiclesCard = ({ totalAll = 0 }) => {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('all');
  const [stationVehicleCount, setStationVehicleCount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách trạm khi mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationList = await getStationOptions();
        // Giới hạn 7 trạm như yêu cầu
        setStations(stationList.slice(0, 7));
      } catch (error) {
        console.error('[StationVehiclesCard] Error fetching stations:', error);
        setStations([]);
      }
    };
    fetchStations();
  }, []);

  // Fetch số xe của trạm được chọn
  useEffect(() => {
    if (selectedStationId === 'all') {
      setStationVehicleCount(null);
      return;
    }

    const fetchStationVehicles = async () => {
      setLoading(true);
      try {
        const data = await getStationTotalVehicles(selectedStationId);
        // Backend có thể trả về { total: 10 } hoặc { totalVehicles: 10 } hoặc số trực tiếp
        const count = typeof data === 'number' 
          ? data 
          : (data?.total ?? data?.totalVehicles ?? data?.total_vehicles ?? 0);
        setStationVehicleCount(count);
      } catch (error) {
        console.error('[StationVehiclesCard] Error fetching station vehicles:', error);
        setStationVehicleCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStationVehicles();
  }, [selectedStationId]);

  // Số xe hiển thị: nếu chọn "Tất cả" thì dùng totalAll, không thì dùng stationVehicleCount
  const displayCount = useMemo(() => {
    if (selectedStationId === 'all') {
      return totalAll;
    }
    return stationVehicleCount ?? 0;
  }, [selectedStationId, totalAll, stationVehicleCount]);

  const handleStationChange = (e) => {
    setSelectedStationId(e.target.value);
  };

  return (
    <div className="stat-card">
      <div className="station-vehicles-card">
        <div className="station-vehicles-card__icon-wrapper">
          <span className="station-vehicles-card__icon">🚗</span>
        </div>
        
        <div className="station-vehicles-card__content">
          <h3 className="station-vehicles-card__title">TỔNG SỐ XE</h3>
          
          <div className={`station-vehicles-card__total ${loading ? 'loading' : ''}`}>
            {displayCount}
          </div>
          
          <div className="station-vehicles-card__footer">
            <select 
              className="station-vehicles-card__select"
              value={selectedStationId}
              onChange={handleStationChange}
              disabled={loading}
            >
              <option value="all">Toàn hệ thống</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationVehiclesCard;

