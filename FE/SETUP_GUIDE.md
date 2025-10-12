# 🚀 Hướng dẫn cấu hình Google Maps

## Vấn đề: Bản đồ không hiển thị

### Nguyên nhân:
Google Maps API key chưa được cấu hình, nên bản đồ hiển thị fallback thay vì bản đồ thực.

### Cách khắc phục:

#### Bước 1: Tạo file .env
Tạo file `.env` trong thư mục gốc của project với nội dung:

```env
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Google OAuth Client ID (đã có sẵn)
VITE_GOOGLE_CLIENT_ID=127336457562-2fcbrk4bq0748eok6vue64c0led7krg5.apps.googleusercontent.com
```

#### Bước 2: Lấy Google Maps API Key
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google Maps JavaScript API
4. Tạo API key trong phần "Credentials"
5. Copy API key và paste vào file .env

#### Bước 3: Restart Development Server
```bash
npm run dev
```

### Tính năng hiện tại:
- ✅ **Fallback Map đẹp** khi chưa có API key
- ✅ **Hiển thị trạm xe** theo quận được chọn
- ✅ **Giao diện responsive** hoạt động tốt
- ✅ **Error handling** robust

### Khi có API key:
- 🗺️ **Bản đồ Google Maps thực**
- 📍 **Markers tương tác** cho các trạm xe
- 🔍 **Tìm kiếm địa điểm**
- 🎯 **Pan/zoom** mượt mà

### Debug:
Mở Developer Tools (F12) và kiểm tra Console để xem:
- API key có được load không
- Có lỗi gì trong quá trình khởi tạo bản đồ
- Thông tin debug chi tiết
