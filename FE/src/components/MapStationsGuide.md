# 🗺️ MapStations Component Guide

## 📋 Tổng quan
Component `MapStations.jsx` sử dụng thư viện `react-leaflet` để hiển thị bản đồ OpenStreetMap với các trạm xe điện EVRental tại TP.HCM.

## 🚀 Tính năng chính

### ✅ Đã implement:
- **Bản đồ OpenStreetMap** với 17 trạm xe điện
- **Custom marker** màu xanh ngọc với icon xe 🚗
- **Popup tương tác** với thông tin chi tiết trạm
- **Search box** tìm kiếm theo tên/địa chỉ
- **Auto-zoom** đến kết quả tìm kiếm
- **Hover effects** scale(1.1) cho marker
- **Responsive design** 100% width, 600px height
- **Smooth transitions** cho tất cả interactions
- **Custom cursor** grab/grabbing khi kéo bản đồ

### 🎨 UI/UX Features:
- **Border-radius 12px** cho container
- **Box-shadow** đẹp mắt
- **Gradient popup header** màu xanh ngọc
- **Action buttons** trong popup
- **Loading states** và error handling
- **Mobile responsive** với breakpoints

## 📁 Cấu trúc file

```
src/components/
├── MapStations.jsx      # Main component
├── MapStations.css      # Styles
└── MapStationsGuide.md  # This guide
```

## 🔧 Cài đặt dependencies

```bash
npm install react-leaflet leaflet
```

## 📖 Cách sử dụng

### 1. Import component:
```jsx
import MapStations from './components/MapStations';
```

### 2. Sử dụng trong JSX:
```jsx
function App() {
  return (
    <div>
      <h1>Bản đồ trạm xe điện</h1>
      <MapStations />
    </div>
  );
}
```

### 3. Tích hợp vào StationMap:
```jsx
// Trong StationMap.jsx
import MapStations from "./MapStations";

// Thêm toggle button
const [useLeafletMap, setUseLeafletMap] = useState(true);

// Render conditional
{useLeafletMap ? (
  <MapStations />
) : (
  <GoogleMapsIframe />
)}
```

## 🎯 Props và Configuration

### MapStations Component:
- **Không có props** - tự động load dữ liệu stations
- **Auto-center** tại TP.HCM (10.78, 106.70)
- **Default zoom** level 12

### Customization:
```jsx
// Thay đổi center và zoom
<MapContainer
  center={[10.78, 106.70]}  // TP.HCM
  zoom={12}                  // Zoom level
>

// Thay đổi tile layer
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; OpenStreetMap contributors'
/>
```

## 🎨 Customization

### 1. Thay đổi marker icon:
```jsx
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-content">🚗</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};
```

### 2. Thay đổi popup content:
```jsx
<Popup>
  <div className="custom-popup">
    <h3>{station.name}</h3>
    <p>{station.address}</p>
    <button>Xem chi tiết</button>
  </div>
</Popup>
```

### 3. Thêm search filters:
```jsx
const [filters, setFilters] = useState({
  district: '',
  type: 'all'
});

const filteredStations = stations.filter(station => {
  if (filters.district && !station.address.includes(filters.district)) {
    return false;
  }
  return true;
});
```

## 📱 Responsive Breakpoints

```css
/* Desktop */
.map-container { height: 600px; }

/* Tablet */
@media (max-width: 768px) {
  .map-container { height: 400px; }
}

/* Mobile */
@media (max-width: 480px) {
  .map-container { height: 300px; }
}
```

## 🐛 Troubleshooting

### 1. Marker không hiển thị:
```jsx
// Fix default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
```

### 2. CSS không load:
```jsx
// Import CSS
import 'leaflet/dist/leaflet.css';
import './MapStations.css';
```

### 3. Map container height:
```css
.leaflet-container {
  height: 600px !important;
  width: 100%;
}
```

## 🚀 Performance Tips

1. **Lazy loading** markers khi cần
2. **Debounce** search input
3. **Memoize** filtered stations
4. **Use useCallback** cho event handlers

## 📊 Data Structure

```javascript
const station = {
  id: 1,
  name: "Trạm EVRental Quận 1",
  lat: 10.776889,
  lng: 106.700806,
  address: "22 Lý Tự Trọng, Quận 1, TP.HCM"
};
```

## 🎉 Kết quả

- ✅ **17 trạm xe điện** hiển thị trên bản đồ
- ✅ **Search functionality** hoạt động mượt mà
- ✅ **Responsive design** trên mọi thiết bị
- ✅ **Custom UI** đẹp và chuyên nghiệp
- ✅ **Performance** tối ưu với React hooks
- ✅ **Accessibility** hỗ trợ keyboard navigation

## 🔄 Updates

- **v1.0.0**: Initial release với basic features
- **v1.1.0**: Thêm search functionality
- **v1.2.0**: Thêm responsive design
- **v1.3.0**: Thêm custom markers và popups
