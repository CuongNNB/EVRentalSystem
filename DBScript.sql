USE master;
GO
IF DB_ID('EVRentalSystem') IS NOT NULL
    BEGIN
        ALTER DATABASE EVRentalSystem SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE EVRentalSystem;
    END
GO
CREATE DATABASE EVRentalSystem;
GO
USE EVRentalSystem;
GO
--
-- ============================
-- (1) User
-- ============================
CREATE TABLE [User]
(
    user_id    INT IDENTITY (1,1) PRIMARY KEY,
    username   NVARCHAR(100) NOT NULL UNIQUE,
    [password] NVARCHAR(255) NOT NULL,
    full_name  NVARCHAR(255),
    phone      VARCHAR(20),
    email      NVARCHAR(100),
    [address]  NVARCHAR(255),
    role       NVARCHAR(50)  NOT NULL,
    [status]   NVARCHAR(50),
    created_at DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

-- ============================
-- (2) Renter_Detail
-- ============================
CREATE TABLE Renter_Detail
(
    renter_id           INT PRIMARY KEY,
    cccd_front          NVARCHAR(MAX),
    cccd_back           NVARCHAR(MAX),
    driver_license      NVARCHAR(MAX),
    verification_status NVARCHAR(50),
    is_risky            BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_RenterDetail_User FOREIGN KEY (renter_id) REFERENCES [User] (user_id)
);

-- ============================
-- (3) Station
-- ============================
CREATE TABLE Station
(
    station_id   INT IDENTITY (1,1) PRIMARY KEY,
    station_name NVARCHAR(255) NOT NULL,
    [address]    NVARCHAR(500) NOT NULL,
    [location]   NVARCHAR(255)
);

-- ============================
-- (4) Employee_Detail
-- ============================
CREATE TABLE Employee_Detail
(
    employee_id INT PRIMARY KEY,
    station_id  INT NOT NULL,
    CONSTRAINT FK_Emp_User FOREIGN KEY (employee_id) REFERENCES [User] (user_id),
    CONSTRAINT FK_Emp_Station FOREIGN KEY (station_id) REFERENCES Station (station_id)
);

-- ============================
-- (5) Vehicle_Model
-- ============================
CREATE TABLE Vehicle_Model
(
    vehicle_id INT IDENTITY (1,1) PRIMARY KEY,
    brand      NVARCHAR(100)  NOT NULL,
    model      NVARCHAR(100)  NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    seats      INT            NOT NULL,

);

-- ============================
-- (6) Vehicle_Detail
-- ============================
CREATE TABLE Vehicle_Detail
(
    id               INT IDENTITY (1,1) PRIMARY KEY,
    license_plate    NVARCHAR(50) NOT NULL UNIQUE,
    vehicle_id       INT          NOT NULL,
    station_id       INT          NOT NULL,
    [color]          NVARCHAR(50),
    battery_capacity NVARCHAR(50),
    odo              INT,
    picture          NVARCHAR(50),
    [status]         NVARCHAR(50),
    CONSTRAINT FK_VDetail_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle_Model (vehicle_id),
    CONSTRAINT FK_VDetail_Station FOREIGN KEY (station_id) REFERENCES Station (station_id)
);

-- ============================
-- (7) Promotion
-- ============================
CREATE TABLE Promotion
(
    promotion_id     INT IDENTITY (1,1) PRIMARY KEY,
    promo_name       NVARCHAR(100) NOT NULL UNIQUE,
    [code]    NVARCHAR(MAX),
    discount_percent FLOAT,
    start_time       DATETIME2     NOT NULL,
    end_time         DATETIME2     NOT NULL,
    [status]         NVARCHAR(50)
);

-- ============================
-- (8) Booking
-- ============================
CREATE TABLE Booking
(
    booking_id           INT IDENTITY (1,1) PRIMARY KEY,
    renter_id            INT            NOT NULL,
    vehicle_model_id     INT            NOT NULL,
    station_id           INT            NOT NULL,
    license_plate        NVARCHAR(50)   NOT NULL,
    promotion_id         INT            NULL,
    created_at           DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    start_time           DATETIME2      NOT NULL,
    expected_return_time DATETIME2      NOT NULL,
    actual_return_time   DATETIME2,
    deposit              DECIMAL(10, 2) NOT NULL,
    [status]             NVARCHAR(50),
    CONSTRAINT FK_Booking_Station FOREIGN KEY (station_id) REFERENCES Station (station_id),
    CONSTRAINT FK_Booking_Renter FOREIGN KEY (renter_id) REFERENCES [User] (user_id),
    CONSTRAINT FK_Booking_License FOREIGN KEY (license_plate) REFERENCES Vehicle_Detail (license_plate),
    CONSTRAINT FK_Booking_Vehicle FOREIGN KEY (vehicle_model_id) REFERENCES Vehicle_Model (vehicle_id),
    CONSTRAINT FK_Booking_Promotion FOREIGN KEY (promotion_id) REFERENCES Promotion (promotion_id)
);

-- ============================
-- (9) Payment_Method
-- ============================
CREATE TABLE Payment_Method
(
    method_id     INT IDENTITY (1,1) PRIMARY KEY,
    method_name   NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(MAX),
    qr_image      NVARCHAR(MAX),
    [status]      NVARCHAR(50)
);

-- ============================
-- (10) Payment
-- ============================
CREATE TABLE Payment
(
    payment_id INT IDENTITY (1,1) PRIMARY KEY,
    booking_id INT            NOT NULL UNIQUE,
    total      DECIMAL(10, 2) NOT NULL,
    method_id  INT            NOT NULL,
    paid_at    DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Payment_Booking FOREIGN KEY (booking_id) REFERENCES Booking (booking_id),
    CONSTRAINT FK_Payment_Method FOREIGN KEY (method_id) REFERENCES Payment_Method (method_id)
);

-- ============================
-- (11) Inspection
-- ============================
CREATE TABLE Inspection
(
    inspection_id INT IDENTITY (1,1) PRIMARY KEY,
    booking_id    INT           NOT NULL,
    part_name     NVARCHAR(100) NOT NULL,
    picture       NVARCHAR(MAX) NULL,
    [description] NVARCHAR(MAX) NULL,
    staff_id      INT           NOT NULL,
    inspected_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    [status]      NVARCHAR(50),
    CONSTRAINT FK_Inspection_Booking FOREIGN KEY (booking_id) REFERENCES Booking (booking_id),
    CONSTRAINT FK_Inspection_Staff FOREIGN KEY (staff_id) REFERENCES [User] (user_id)
);

-- ============================
-- (12) Additional_Fee
-- ============================
CREATE TABLE Additional_Fee
(
    fee_id      INT IDENTITY (1,1) PRIMARY KEY,
    booking_id  INT            NOT NULL,
    fee_name    NVARCHAR(100)  NOT NULL,
    amount      DECIMAL(10, 2) NOT NULL,
    description NVARCHAR(MAX),
    created_at  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Fee_Booking FOREIGN KEY (booking_id) REFERENCES Booking (booking_id)
);

-- ============================
-- (13) Contract
-- ============================
CREATE TABLE Contract
(
    contract_id INT IDENTITY (1,1) PRIMARY KEY,
    booking_id  INT          NOT NULL UNIQUE,
    signed_at   DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    [status]    NVARCHAR(50),
    otp_code    NVARCHAR(10) NULL,
    CONSTRAINT FK_Contract_Booking FOREIGN KEY (booking_id) REFERENCES Booking (booking_id)
);

-- ============================
-- (14) Review
-- ============================
CREATE TABLE Review
(
    review_id  INT IDENTITY (1,1) PRIMARY KEY,
    booking_id INT       NOT NULL UNIQUE,
    rating     INT       NOT NULL,
    comment    NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Review_Booking FOREIGN KEY (booking_id) REFERENCES Booking (booking_id)
);

-- ============================
-- (15) Holiday_Fee
-- ============================
CREATE TABLE Holiday_Fee
(
    holiday_id INT IDENTITY (1,1) PRIMARY KEY,
    fee_name   NVARCHAR(100) NOT NULL,
    start_date DATE          NOT NULL,
    end_date   DATE          NOT NULL,
    value      FLOAT         NOT NULL,
    [status]   NVARCHAR(50),
    created_at DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

-- ============================
-- (16) Report
-- ============================
CREATE TABLE Report
(
    report_id         INT IDENTITY (1,1) PRIMARY KEY,
    staff_id          INT           NOT NULL,
    admin_id          INT           NOT NULL,
    vehicle_detail_id INT           NOT NULL,
    description       NVARCHAR(MAX) NOT NULL,
    [status]          NVARCHAR(50),
    created_at        DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Report_Staff FOREIGN KEY (staff_id) REFERENCES [User] (user_id),
    CONSTRAINT FK_Report_Admin FOREIGN KEY (admin_id) REFERENCES [User] (user_id),
    CONSTRAINT FK_Report_VDetail FOREIGN KEY (vehicle_detail_id) REFERENCES Vehicle_Detail (id)
);


-- ========================
-- 1. User
-- ========================
INSERT INTO [User] (username, [password], full_name, phone, email, [address], role, [status], created_at)
VALUES ('Admin01', '123456', N'Nguyễn Ngọc Bảo Cường', '038123456', 'baocuongg@gmail.com', N'Hồ Chí Minh', 'ADMIN',
        'ACTIVE', GETDATE()), -- user_id = 1
       ('Staff01', '123456', N'Đoàn Nguyễn Trung Nguyên', '011111111', 'nguyendnt@gmail.com', N'Hồ Chí Minh', 'STAFF',
        'ACTIVE', GETDATE()), -- user_id = 2
       ('Renter01', '123456', N'Phạm Trí Tính', '011222222', 'tinhpt@gmail.com', N'Thủ Đức, HCM', 'RENTER', 'ACTIVE',
        GETDATE()); -- user_id = 3
GO

-- ========================
-- 2. Renter_Detail
-- ========================
INSERT INTO Renter_Detail (renter_id, cccd_front, cccd_back, driver_license, verification_status, is_risky)
VALUES (3, N'base64-front-cccd', N'base64-back-cccd', 'B2-123456789', 'VERIFIED', 0);
GO

-- ========================
-- 3. Station
-- ========================
INSERT INTO Station (station_name, [address], [location])
VALUES (N'Cho thuê Xe điện VinFast - Thảo Điền',
        N'Hầm gửi xe B3 - Vincom Mega Mall, 161 Võ Nguyên Giáp, Thảo Điền, Thủ Đức, Hồ Chí Minh',
        N'10.801,-106.730'),
       (N'Cho thuê Xe điện VinFast - Tân Cảng',
        N'208 Nguyễn Hữu Cảnh, Vinhomes Tân Cảng, Bình Thạnh, Hồ Chí Minh',
        N'10.793,-106.721'),
       (N'Cho thuê Xe điện VinFast - Quận 1',
        N'Tầng hầm B2 - Vincom Đồng Khởi, 70 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh',
        N'10.776,-106.700'),
       (N'Cho thuê Xe điện VinFast - Quận 7',
        N'Crescent Mall, 101 Tôn Dật Tiên, Tân Phú, Quận 7, TP. Hồ Chí Minh',
        N'10.732,-106.721'),
       (N'Cho thuê Xe điện VinFast - Gò Vấp',
        N'Trung tâm thương mại Emart, 366 Phan Văn Trị, Gò Vấp, TP. Hồ Chí Minh',
        N'10.839,-106.667'),
       (N'Cho thuê Xe điện VinFast - Bình Tân',
        N'AEON Mall Bình Tân, 1 Đường số 17A, Bình Trị Đông B, Bình Tân, TP. Hồ Chí Minh',
        N'10.755,-106.611'),
       (N'Cho thuê Xe điện VinFast - Phú Nhuận',
        N'Co.opmart Nguyễn Kiệm, 571 Nguyễn Kiệm, Phú Nhuận, TP. Hồ Chí Minh',
        N'10.801,-106.679');
GO

-- ========================
-- 4. Employee_Detail
-- ========================
INSERT INTO Employee_Detail (employee_id, station_id)
VALUES (2, 1); -- Staff01 làm việc tại Station 1
GO

-- ========================
-- 5. Vehicle_Model
-- ========================
INSERT INTO Vehicle_Model (brand, model, price, seats)
VALUES (N'VinFast', N'VF e34', 1200, 5), -- vehicle_id = 1
       (N'VinFast', N'VF 8', 2000, 5),   -- vehicle_id = 2
       (N'Tesla', N'Model 3', 2500, 5),  -- vehicle_id = 3
       (N'VinFast', N'VF 5 Plus', 1500, 5),
       (N'VinFast', N'VF 9', 1600, 7),
       (N'Tesla', N'Model Y', 1700, 5),
       (N'Tesla', N'Model X', 1700, 7),
       (N'Hyundai', N'IONIQ 5', 1700, 5),
       (N'Kia', N'EV6', 1700, 5),
       (N'Nissan', N'Leaf', 1700, 5),
       (N'BMW', N'i4 eDrive40', 1320, 5),
       (N'Mercedes-Benz', N'EQE 300', 1340, 5),
       (N'Porsche', N'Taycan 4S', 1450, 4);
GO

-- ========================
-- 6. Vehicle_Detail
-- ========================
INSERT INTO Vehicle_Detail (license_plate, vehicle_id, station_id, [color], battery_capacity, odo, picture, [status])
VALUES ('51A-12345', 1, 1, N'Trắng', N'42 kWh', 1000, '1.jpg', 'AVAILABLE'),
       ('51B-67890', 2, 1, N'Đen', N'82 kWh', 2500, '2.jpg', 'AVAILABLE'),
       ('51C-11111', 3, 2, N'Xám', N'60 kWh', 5000, '3.jpg', 'AVAILABLE'),
       ('51D-10001', 4, 1, N'Xanh', N'37 kWh', 1500, '4.jpg', 'AVAILABLE'),
       ('51D-10002', 5, 2, N'Bạc', N'92 kWh', 2000, '5.jpg', 'RENTED'),
       ('51D-10003', 6, 1, N'Đỏ', N'75 kWh', 1200, '6.jpg', 'AVAILABLE'),
       ('51D-10004', 7, 2, N'Trắng', N'100 kWh', 2500, '7.jpg', 'FIXING'),
       ('51D-10005', 8, 1, N'Xám', N'58 kWh', 1700, '8.jpg', 'AVAILABLE'),
       ('51D-10006', 9, 1, N'Xanh dương', N'77 kWh', 2300, '9.jpg', 'AVAILABLE'),
       ('51D-10007', 10, 2, N'Vàng', N'40 kWh', 800, '10.jpg', 'FIXING'),
       ('51D-10008', 11, 2, N'Bạc', N'83 kWh', 900, '11.jpg', 'AVAILABLE'),
       ('51D-10009', 12, 1, N'Đen', N'90 kWh', 1100, '12.jpg', 'RENTED'),
       ('51D-10010', 13, 1, N'Trắng ngọc trai', N'93 kWh', 3000, '13.jpg', 'RENTED'),
       ('51E-20001', 1, 3, N'Xanh rêu', N'42 kWh', 800, '14.jpg', 'AVAILABLE'),
       ('51E-20002', 2, 4, N'Bạc', N'82 kWh', 1200, '15.jpg', 'AVAILABLE'),
       ('51E-20003', 3, 5, N'Đỏ đô', N'60 kWh', 1500, '16.jpg', 'AVAILABLE'),
       ('51E-20004', 4, 6, N'Trắng', N'37 kWh', 900, '17.jpg', 'AVAILABLE'),
       ('51E-20005', 5, 7, N'Đen', N'92 kWh', 2000, '18.jpg', 'AVAILABLE'),
       ('51E-20006', 6, 3, N'Xanh lam', N'75 kWh', 500, '19.jpg', 'AVAILABLE'),
       ('51E-20007', 7, 4, N'Đỏ', N'100 kWh', 1100, '20.jpg', 'AVAILABLE'),
       ('51E-20008', 8, 5, N'Vàng', N'58 kWh', 700, '21.jpg', 'AVAILABLE'),
       ('51E-20009', 9, 6, N'Xám bạc', N'77 kWh', 1600, '22.jpg', 'AVAILABLE'),
       ('51E-20010', 10, 7, N'Trắng ngọc', N'40 kWh', 300, '23.jpg', 'AVAILABLE');
GO

-- ========================
-- 7. Promotion
-- ========================
INSERT INTO Promotion (promo_name, [description], discount_percent, start_time, end_time, [status])
VALUES ('SALE10', N'Giảm 10% cho tất cả đơn trong tháng này', 10, GETDATE(), DATEADD(DAY, 30, GETDATE()), 'ACTIVE'),
       ('NEWUSER20', N'Ưu đãi 20% cho khách hàng mới', 20, GETDATE(), DATEADD(DAY, 60, GETDATE()), 'ACTIVE');
GO

-- ========================
-- 8. Booking (ĐÃ SỬA HOÀN CHỈNH)
-- ========================
INSERT INTO Booking (renter_id, vehicle_model_id, station_id, license_plate,
                     promotion_id, created_at, start_time, expected_return_time,
                     actual_return_time, deposit, [status])
VALUES (3, 1, 1, '51A-12345', 1, GETDATE(), GETDATE(), DATEADD(DAY, 1, GETDATE()), NULL, 2000000,
        'PENDING'), -- booking_id = 1
       (3, 2, 1, '51B-67890', 2, DATEADD(DAY, -10, GETDATE()), DATEADD(DAY, -10, GETDATE()),
        DATEADD(DAY, -9, GETDATE()), DATEADD(DAY, -9, GETDATE()), 3000000, 'COMPLETED'); -- booking_id = 2
GO

-- ========================
-- 9. Payment_Method
-- ========================
INSERT INTO Payment_Method (method_name, [description], qr_image, [status])
VALUES (N'MoMo', N'Thanh toán qua ví MoMo', NULL, 'ACTIVE'),
       (N'ZaloPay', N'Thanh toán qua ví ZaloPay', NULL, 'ACTIVE');
GO

-- ========================
-- 10. Payment
-- ========================
INSERT INTO Payment (booking_id, total, method_id, paid_at)
VALUES (2, 2700000, 1, DATEADD(DAY, -9, GETDATE())); -- Thanh toán hoàn tất cho booking 2
GO

-- ========================
-- 11. Inspection
-- ========================
INSERT INTO Inspection (booking_id, part_name, staff_id, inspected_at, [status])
VALUES (2, N'Bánh xe', 2, DATEADD(DAY, -9, GETDATE()), 'PASSED'),
       (2, N'Đèn xe', 2, DATEADD(DAY, -9, GETDATE()), 'PASSED'),
       (2, N'Pin', 2, DATEADD(DAY, -9, GETDATE()), 'PASSED');
GO

-- ========================
-- 12. Additional_Fee
-- ========================
INSERT INTO Additional_Fee (booking_id, fee_name, amount, [description])
VALUES (2, N'Trá xe trễ', 500000, N'Trá xe trễ 2 giờ so với dự kiến');
GO

-- ========================
-- 13. Contract
-- ========================
INSERT INTO Contract (booking_id, [status], otp_code)
VALUES (2, 'COMPLETED', '123456');
GO

-- ========================
-- 14. Review
-- ========================
INSERT INTO Review (booking_id, rating, comment)
VALUES (2, 5, N'Xe chạy êm, nhân viên hỗ trợ nhiệt tình!');
GO

-- ========================
-- 15. Holiday_Fee
-- ========================
INSERT INTO Holiday_Fee (fee_name, start_date, end_date, value, [status])
VALUES (N'Lễ Quốc Khánh 2/9', '2025-09-01', '2025-09-03', 0.15, 'ACTIVE');
GO

-- ========================
-- 16. Report
-- ========================
INSERT INTO Report (staff_id, admin_id, vehicle_detail_id, [description], [status])
VALUES (2, 1, 1, N'Xe VF e34 bị trầy nhẹ ở cản trước khi trả xe', 'RESOLVED');
GO
