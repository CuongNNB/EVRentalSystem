# 🔧 Hướng dẫn khắc phục sự cố

## Vấn đề: Trang hiển thị màu trắng khi refresh

### Nguyên nhân có thể:
1. **Google Maps API Key chưa được cấu hình**
2. **Lỗi JavaScript trong console**
3. **Vấn đề với import modules**

### Cách khắc phục:

#### 1. Cấu hình Google Maps API Key
Tạo file `.env` trong thư mục gốc với nội dung:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

#### 2. Kiểm tra Console
Mở Developer Tools (F12) và kiểm tra tab Console để xem lỗi cụ thể.

#### 3. Restart Development Server
```bash
npm run dev
```

#### 4. Clear Cache
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Tính năng Fallback
Nếu Google Maps không load được, trang sẽ hiển thị:
- Fallback map với thông tin trạm xe
- Error message với nút "Thử lại"
- Debug info trong development mode

### Liên hệ hỗ trợ
Nếu vấn đề vẫn tiếp tục, vui lòng cung cấp:
- Screenshot của console errors
- Thông tin browser và version
- Steps to reproduce
