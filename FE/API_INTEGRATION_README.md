# API Integration Guide

## Tổng quan
Frontend đã được tích hợp hoàn toàn với Spring Boot API backend cho hệ thống đăng nhập/đăng ký.

## Cấu trúc API

### Backend Endpoints (Spring Boot)
```
POST /api/users/register    - Đăng ký tài khoản mới
POST /api/users/login       - Đăng nhập
PUT  /api/users/{id}        - Cập nhật thông tin profile
PUT  /api/users/{id}/password - Đổi mật khẩu
```

### Frontend Components
- `src/services/api.js` - API service layer
- `src/contexts/AuthContext.jsx` - Authentication context
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/pages/Login.jsx` - Login page (updated)
- `src/pages/Register.jsx` - Register page (updated)

## Cấu hình

### 1. Environment Variables
Tạo file `.env` trong root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_AUTH_SERVER=http://localhost:3001
```

### 2. API Request/Response Format

#### Register Request
```javascript
// FormData for file upload
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('phone', '0123456789');
formData.append('password', 'password123');
formData.append('gplx', gplxFile);
formData.append('cccd', cccdFile);
```

#### Login Request
```javascript
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### API Response Format
```javascript
{
  "success": true,
  "message": "Login success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "0123456789"
    },
    "token": "jwt_token_here"
  }
}
```

## Tính năng đã tích hợp

### 1. Authentication Context
- Quản lý state đăng nhập toàn cục
- Tự động lưu token vào localStorage
- Auto-login khi có token hợp lệ

### 2. API Service Layer
- Generic API call function
- Error handling tự động
- Token management
- File upload support

### 3. Form Validation
- Client-side validation
- Error message display
- Loading states

### 4. Route Protection
- ProtectedRoute component
- Auto-redirect khi chưa đăng nhập
- Loading states

## Cách sử dụng

### 1. Khởi động Backend
```bash
# Chạy Spring Boot application
mvn spring-boot:run
# hoặc
./mvnw spring-boot:run
```

### 2. Khởi động Frontend
```bash
npm run dev
```

### 3. Test API
1. Truy cập `http://localhost:5173/register`
2. Đăng ký tài khoản mới
3. Truy cập `http://localhost:5173/login`
4. Đăng nhập với tài khoản vừa tạo
5. Truy cập `http://localhost:5173/dashboard` (cần đăng nhập)

## Lưu ý quan trọng

### 1. CORS Configuration
Backend cần cấu hình CORS để cho phép frontend gọi API:
```java
@CrossOrigin(origins = "http://localhost:5173")
```

### 2. File Upload
Backend cần xử lý multipart/form-data cho file upload:
```java
@PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
```

### 3. Error Handling
Frontend đã có error handling cơ bản, có thể mở rộng thêm:
- Network error handling
- Validation error display
- Token expiration handling

## Troubleshooting

### 1. CORS Error
- Kiểm tra CORS configuration trong backend
- Đảm bảo frontend và backend chạy trên port khác nhau

### 2. API Connection Error
- Kiểm tra VITE_API_BASE_URL trong .env
- Đảm bảo backend đang chạy trên port 8080

### 3. File Upload Error
- Kiểm tra backend có hỗ trợ multipart/form-data
- Kiểm tra file size limits

## Mở rộng

### 1. Thêm API endpoints mới
1. Thêm method vào `src/services/api.js`
2. Thêm function vào `src/contexts/AuthContext.jsx` nếu cần
3. Sử dụng trong components

### 2. Thêm validation
1. Cập nhật form validation trong Login/Register
2. Thêm server-side validation error handling

### 3. Thêm features
1. Remember me functionality
2. Forgot password
3. Email verification
4. Profile management
