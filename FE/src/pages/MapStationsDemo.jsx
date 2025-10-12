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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">17 Trạm xe điện</h3>
            <p className="text-gray-600">
              Phủ sóng toàn bộ 17 quận/huyện tại TP.HCM với vị trí chiến lược
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tìm kiếm thông minh</h3>
            <p className="text-gray-600">
              Tìm kiếm trạm theo tên hoặc địa chỉ với auto-zoom đến vị trí
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Responsive Design</h3>
            <p className="text-gray-600">
              Hoạt động mượt mà trên mọi thiết bị từ desktop đến mobile
            </p>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Tính năng nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-emerald-200">✓</span>
                Bản đồ Google Maps miễn phí
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-200">✓</span>
                Marker tùy chỉnh màu xanh ngọc
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-200">✓</span>
                Popup thông tin chi tiết
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-200">✓</span>
                Hover effects mượt mà
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-emerald-200">✓</span>
                Zoom và kéo bản đồ tự do
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-200">✓</span>
                Tìm kiếm và lọc trạm
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-200">✓</span>
                Responsive hoàn hảo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-200">✓</span>
                Performance tối ưu
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapStationsDemo;
