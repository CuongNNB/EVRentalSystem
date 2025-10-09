# 🚀 Hướng dẫn nhanh khởi động Backend

## Vấn đề hiện tại
Frontend đang chạy ở **Mock Mode** vì backend Spring Boot chưa được khởi động.

## Giải pháp nhanh

### 1. Khởi động Backend Spring Boot

#### Cách 1: Command Line
```bash
# Di chuyển đến thư mục backend Spring Boot
cd path/to/your/spring-boot-project

# Chạy ứng dụng
mvn spring-boot:run
```

#### Cách 2: IDE
1. Mở project Spring Boot trong IDE
2. Tìm file main class (có `@SpringBootApplication`)
3. Click chuột phải → "Run"

### 2. Cấu hình CORS (Bắt buộc!)

Thêm vào `application.properties`:
```properties
# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:5180
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

Hoặc thêm class Java:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 3. Cấu hình File Upload

Thêm vào `application.properties`:
```properties
# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 4. Cấu hình Database

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/ev_rental_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 5. Kiểm tra kết quả

Sau khi khởi động backend:
1. Backend chạy trên `http://localhost:8080`
2. Frontend hiển thị "✅ Backend online" (thay vì "🔄 Mock Mode")
3. Có thể đăng ký/đăng nhập thành công
4. Dữ liệu được lưu vào database thật

## Test ngay bây giờ

### Với Mock Mode (hiện tại):
- ✅ Đăng ký: `tinhpham@gmail.com` / `123456`
- ✅ Đăng nhập: `test@example.com` / `any_password`

### Với Backend thật:
- ✅ Tất cả chức năng hoạt động bình thường
- ✅ Dữ liệu lưu vào database
- ✅ File upload hoạt động

## Troubleshooting

### Lỗi Port 8080 đã được sử dụng:
```bash
# Tìm process
netstat -ano | findstr :8080

# Kill process (thay PID)
taskkill /PID <PID> /F
```

### Lỗi Database:
- Kiểm tra MySQL đang chạy
- Kiểm tra username/password
- Tạo database `ev_rental_db`

### Lỗi CORS:
- Đảm bảo đã thêm cấu hình CORS
- Kiểm tra frontend đang chạy trên port nào
- Thêm port đó vào `allowedOrigins`
