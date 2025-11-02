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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

  // Fetch số xe của trạm được chọn - Tính từ danh sách xe thực tế (không tính xe đã xóa)
  const fetchStationVehicles = useCallback(async () => {
    if (selectedStationId === 'all') {
      setStationVehicleCount(null);
      return;
    }

    setLoading(true);
    try {
      // Fetch toàn bộ danh sách xe của trạm để tính chính xác (không tính xe đã xóa)
      const response = await fetch(`http://localhost:8084/EVRentalSystem/api/vehicle/vehicles?page=0&size=10000&stationId=${selectedStationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const allVehicles = data?.content || (Array.isArray(data) ? data : []);
      
      // Filter out deleted vehicles - KHÔNG tính xe đã xóa
      const activeVehicles = allVehicles.filter(v => {
        const isDeleted = v?.deleted === true || 
                         v?.isDeleted === true || 
                         v?.deletedAt !== null && v?.deletedAt !== undefined ||
                         String(v?.status || '').toUpperCase() === 'DELETED' ||
                         String(v?.status || '').toUpperCase() === 'SOFT_DELETE';
        return !isDeleted;
      });
      
      // Đếm số xe của trạm (không tính xe đã xóa)
      const count = activeVehicles.length;
      console.log(`[StationVehiclesCard] Station ${selectedStationId} vehicles (excluding deleted):`, count);
      setStationVehicleCount(count);
    } catch (error) {
      console.error('[StationVehiclesCard] Error fetching station vehicles from list:', error);
      // Fallback: Thử dùng API getStationTotalVehicles
      try {
        const data = await getStationTotalVehicles(selectedStationId);
        const count = typeof data === 'number' 
          ? data 
          : (data?.total ?? data?.totalVehicles ?? data?.total_vehicles ?? 0);
        console.warn('[StationVehiclesCard] Using API as fallback (may include deleted vehicles):', count);
        setStationVehicleCount(count);
      } catch (fallbackErr) {
        console.error('[StationVehiclesCard] Fallback API also failed:', fallbackErr);
        setStationVehicleCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedStationId]);

  // Fetch số xe khi selectedStationId thay đổi
  useEffect(() => {
    fetchStationVehicles();
  }, [fetchStationVehicles]);

  // Listen for vehicle deletion event để refresh số xe của trạm
  useEffect(() => {
    const handleVehicleDeleted = () => {
      console.log(`[StationVehiclesCard] Vehicle deleted event received, refreshing station ${selectedStationId} vehicles...`);
      fetchStationVehicles();
    };
    
    window.addEventListener('vehicleDeleted', handleVehicleDeleted);
    
    return () => {
      window.removeEventListener('vehicleDeleted', handleVehicleDeleted);
    };
  }, [fetchStationVehicles, selectedStationId]);

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

