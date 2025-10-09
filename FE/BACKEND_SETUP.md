# Hướng dẫn khởi động Backend Spring Boot

## Vấn đề hiện tại
Frontend đang gặp lỗi "Failed to fetch" vì backend Spring Boot chưa được khởi động.

## Giải pháp

### 1. Khởi động Backend Spring Boot

#### Cách 1: Sử dụng Maven
```bash
# Di chuyển đến thư mục backend
cd path/to/your/spring-boot-project

# Chạy ứng dụng
mvn spring-boot:run
```

#### Cách 2: Sử dụng Gradle
```bash
# Di chuyển đến thư mục backend
cd path/to/your/spring-boot-project

# Chạy ứng dụng
./gradlew bootRun
```

#### Cách 3: Chạy từ IDE
1. Mở project Spring Boot trong IDE (IntelliJ IDEA, Eclipse, VS Code)
2. Tìm file main class (có annotation `@SpringBootApplication`)
3. Click chuột phải và chọn "Run"

### 2. Cấu hình CORS (Quan trọng!)

Thêm cấu hình CORS vào Spring Boot:

```java
@Configuration
@EnableWebMvc
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

Đảm bảo backend hỗ trợ file upload:

```java
@PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ApiResponse<UserResponse>> register(
    @RequestParam("name") String name,
    @RequestParam("email") String email,
    @RequestParam("phone") String phone,
    @RequestParam("password") String password,
    @RequestParam("gplx") MultipartFile gplx,
    @RequestParam("cccd") MultipartFile cccd
) {
    // Xử lý đăng ký với file upload
}
```

### 4. Cấu hình Database

Đảm bảo database đang chạy và cấu hình đúng trong `application.properties`:

```properties
# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/ev_rental_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# File upload configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 5. Kiểm tra Backend

Sau khi khởi động, kiểm tra:

1. **Health Check**: `http://localhost:8080/actuator/health`
2. **API Test**: `http://localhost:8080/api/users`

### 6. Troubleshooting

#### Lỗi Port đã được sử dụng
```bash
# Tìm process đang sử dụng port 8080
netstat -ano | findstr :8080

# Kill process (thay PID bằng process ID)
taskkill /PID <PID> /F
```

#### Lỗi Database Connection
- Kiểm tra MySQL/PostgreSQL đang chạy
- Kiểm tra username/password trong `application.properties`
- Kiểm tra database đã được tạo chưa

#### Lỗi CORS
- Đảm bảo đã thêm cấu hình CORS
- Kiểm tra frontend đang chạy trên port nào
- Thêm port đó vào `allowedOrigins`

### 7. Logs Debugging

Thêm logging để debug:

```properties
# Logging configuration
logging.level.com.evrental.evrentalsystem=DEBUG
logging.level.org.springframework.web=DEBUG
```

## Kết quả mong đợi

Sau khi khởi động thành công:
1. Backend chạy trên `http://localhost:8080`
2. Frontend hiển thị "✅ Backend online" ở góc phải màn hình
3. Có thể đăng nhập/đăng ký thành công
4. Không còn lỗi "Failed to fetch"
