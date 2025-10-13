import React from 'react';
import MapStations from '../components/MapStations';
import Header from '../components/Header';

const MapStationsDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🗺️ Bản đồ trạm xe điện EVRental
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
//sua code o day
export default MapStationsDemo;
