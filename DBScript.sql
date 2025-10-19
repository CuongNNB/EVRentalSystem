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
    [color]          NVARCHAR(50),
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
    license_plate        NVARCHAR(50)   NULL,
    promotion_id         INT            NULL,
    created_at           DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    start_time           DATETIME2      NOT NULL,
    expected_return_time DATETIME2      NOT NULL,
    actual_return_time   DATETIME2,
    deposit              DECIMAL(10, 2) NOT NULL,
    [status]             NVARCHAR(50),
    CONSTRAINT FK_Booking_Station FOREIGN KEY (station_id) REFERENCES Station (station_id),
    CONSTRAINT FK_Booking_Renter FOREIGN KEY (renter_id) REFERENCES [User] (user_id),
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
    staff_id    INT          ,
    signed_at   DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    [status]    NVARCHAR(50),
    otp_code    NVARCHAR(10) NULL,
    CONSTRAINT FK_Contract_Booking FOREIGN KEY (booking_id) REFERENCES Booking (booking_id),
    CONSTRAINT FK_Contract_Staff FOREIGN KEY (staff_id) REFERENCES EMPLOYEE_DETAIL (employee_id)
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
    GETDATE()),
    ('Jang Won-young', '123456', N'Jang Won-young', '0123456789', 'jangwonyoung@gmail.com', N'69', 'STAFF', 'ACTIVE', GETDATE()); -- user_id = 3
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
VALUES (2, 1), (4, 1); -- Staff01 làm việc tại Station 1
GO

-- ========================
-- 5. Vehicle_Model
-- ========================
INSERT INTO Vehicle_Model (brand, model, price, seats, [color])
VALUES
    (N'VinFast', N'VF e34',    700, 5, N'Trắng'),
    (N'VinFast', N'VF e34',    700, 5, N'Đen'),
    (N'VinFast', N'VF e34',    700, 5, N'Xanh dương'),
    (N'VinFast', N'VF e34',    700, 5, N'Đỏ'),
    (N'VinFast', N'VF 8',      950, 5, N'Đen'),
    (N'VinFast', N'VF 8',      950, 5, N'Xám'),
    (N'VinFast', N'VF 8',      950, 5, N'Trắng'),
    (N'VinFast', N'VF 5 Plus', 600, 4, N'Bạc'),
    (N'VinFast', N'VF 5 Plus', 600, 4, N'Đen'),
    (N'VinFast', N'VF 9',     1200, 7, N'Trắng ngọc trai'),
    (N'VinFast', N'VF 9',     1200, 7, N'Đen'),

    -- Tesla
    (N'Tesla', N'Model 3', 1100, 5, N'Đỏ'),
    (N'Tesla', N'Model 3', 1100, 5, N'Đen'),
    (N'Tesla', N'Model 3', 1100, 5, N'Bạc'),
    (N'Tesla', N'Model Y', 1000, 5, N'Trắng'),
    (N'Tesla', N'Model Y', 1000, 5, N'Xám'),
    (N'Tesla', N'Model Y', 1000, 5, N'Đen'),
    (N'Tesla', N'Model X', 1200, 7, N'Đen'),
    (N'Tesla', N'Model X', 1200, 7, N'Bạc'),

    -- Hyundai / Kia / Nissan
    (N'Hyundai', N'IONIQ 5', 950, 5, N'Xám bạc'),
    (N'Hyundai', N'IONIQ 5', 950, 5, N'Trắng'),
    (N'Kia', N'EV6', 900, 5, N'Đỏ'),
    (N'Kia', N'EV6', 900, 5, N'Xanh dương'),
    (N'Nissan', N'Leaf', 750, 5, N'Xanh lá'),
    (N'Nissan', N'Leaf', 750, 5, N'Bạc'),

    -- BMW / Mercedes / Porsche
    (N'BMW', N'i4 eDrive40', 1150, 5, N'Bạc'),
    (N'BMW', N'i4 eDrive40', 1150, 5, N'Màu than'),
    (N'Mercedes-Benz', N'EQE 300', 1200, 5, N'Trắng ngọc'),
    (N'Porsche', N'Taycan 4S', 1200, 4, N'Đỏ đô'),
    (N'Porsche', N'Taycan 4S', 1200, 4, N'Đen');
GO

-- ========================
-- 6. Vehicle_Detail
-- ========================
INSERT INTO Vehicle_Detail (license_plate, vehicle_id, station_id, battery_capacity, odo, picture, [status])
VALUES
        -- vehicle_id = 1 (3 bản ghi)
    ('51A-10001', 1, 1, N'42 kWh',  1200, '1_1.jpg', 'AVAILABLE'),
    ('51A-10002', 1, 2, N'42 kWh',   800, '1_2.jpg', 'AVAILABLE'),
    ('51A-10003', 1, 3, N'42 kWh',  2500, '1_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 2 (4 bản ghi)
    ('51B-20001', 2, 1, N'82 kWh',  2500, '2_1.jpg', 'AVAILABLE'),
    ('51B-20002', 2, 2, N'82 kWh',  1400, '2_2.jpg', 'AVAILABLE'),
    ('51B-20003', 2, 3, N'82 kWh',  3200, '2_3.jpg', 'AVAILABLE'),
    ('51B-20004', 2, 4, N'82 kWh',   600, '2_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 3 (3 bản ghi)
    ('51C-30001', 3, 2, N'60 kWh',  5000, '3_1.jpg', 'AVAILABLE'),
    ('51C-30002', 3, 3, N'60 kWh',  4200, '3_2.jpg', 'AVAILABLE'),
    ('51C-30003', 3, 1, N'60 kWh',  1100, '3_3.jpg', 'FIXING'),

    -- vehicle_id = 4 (4 bản ghi)
    ('51D-40001', 4, 1, N'37 kWh',  1500, '4_1.jpg', 'AVAILABLE'),
    ('51D-40002', 4, 2, N'37 kWh',   900, '4_2.jpg', 'AVAILABLE'),
    ('51D-40003', 4, 3, N'37 kWh',  2100, '4_3.jpg', 'AVAILABLE'),
    ('51D-40004', 4, 4, N'37 kWh',   300, '4_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 5 (3 bản ghi)
    ('51E-50001', 5, 2, N'92 kWh',  2000, '5_1.jpg', 'AVAILABLE'),
    ('51E-50002', 5, 3, N'92 kWh',   450, '5_2.jpg', 'AVAILABLE'),
    ('51E-50003', 5, 1, N'92 kWh',  1800, '5_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 6 (4 bản ghi)
    ('51F-60001', 6, 1, N'75 kWh',  1200, '6_1.jpg', 'AVAILABLE'),
    ('51F-60002', 6, 2, N'75 kWh',   700, '6_2.jpg', 'AVAILABLE'),
    ('51F-60003', 6, 3, N'75 kWh',  2300, '6_3.jpg', 'AVAILABLE'),
    ('51F-60004', 6, 4, N'75 kWh',   200, '6_4.jpg', 'MAINTENANCE'),

    -- vehicle_id = 7 (3 bản ghi)
    ('51G-70001', 7, 2, N'100 kWh', 2500, '7_1.jpg', 'AVAILABLE'),
    ('51G-70002', 7, 3, N'100 kWh', 1100, '7_2.jpg', 'AVAILABLE'),
    ('51G-70003', 7, 1, N'100 kWh',  500, '7_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 8 (4 bản ghi)
    ('51H-80001', 8, 3, N'58 kWh',  1700, '8_1.jpg', 'AVAILABLE'),
    ('51H-80002', 8, 4, N'58 kWh',   900, '8_2.jpg', 'AVAILABLE'),
    ('51H-80003', 8, 5, N'58 kWh',  3200, '8_3.jpg', 'AVAILABLE'),
    ('51H-80004', 8, 1, N'58 kWh',   400, '8_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 9 (3 bản ghi)
    ('51J-90001', 9, 1, N'77 kWh',  2300, '9_1.jpg', 'AVAILABLE'),
    ('51J-90002', 9, 2, N'77 kWh',  1500, '9_2.jpg', 'AVAILABLE'),
    ('51J-90003', 9, 3, N'77 kWh',   800, '9_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 10 (4 bản ghi)
    ('51K-10001', 10, 2, N'40 kWh',  800, '10_1.jpg', 'AVAILABLE'),
    ('51K-10002', 10, 3, N'40 kWh',  120, '10_2.jpg', 'AVAILABLE'),
    ('51K-10003', 10, 1, N'40 kWh', 2000, '10_3.jpg', 'AVAILABLE'),
    ('51K-10004', 10, 4, N'40 kWh',  450, '10_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 11 (3 bản ghi)
    ('51L-11001', 11, 1, N'83 kWh',  900, '11_1.jpg', 'AVAILABLE'),
    ('51L-11002', 11, 2, N'83 kWh', 1300, '11_2.jpg', 'AVAILABLE'),
    ('51L-11003', 11, 3, N'83 kWh',  250, '11_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 12 (4 bản ghi)
    ('51M-12001', 12, 2, N'90 kWh', 1100, '12_1.jpg', 'AVAILABLE'),
    ('51M-12002', 12, 3, N'90 kWh',  600, '12_2.jpg', 'AVAILABLE'),
    ('51M-12003', 12, 1, N'90 kWh', 1900, '12_3.jpg', 'AVAILABLE'),
    ('51M-12004', 12, 4, N'90 kWh',  350, '12_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 13 (3 bản ghi)
    ('51N-13001', 13, 1, N'93 kWh', 3000, '13_1.jpg', 'AVAILABLE'),
    ('51N-13002', 13, 2, N'93 kWh', 1500, '13_2.jpg', 'AVAILABLE'),
    ('51N-13003', 13, 3, N'93 kWh',  700, '13_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 14 (4 bản ghi)
    ('51P-14001', 14, 3, N'42 kWh',  800, '14_1.jpg', 'AVAILABLE'),
    ('51P-14002', 14, 4, N'42 kWh', 1000, '14_2.jpg', 'AVAILABLE'),
    ('51P-14003', 14, 5, N'42 kWh',  200, '14_3.jpg', 'AVAILABLE'),
    ('51P-14004', 14, 1, N'42 kWh', 1500, '14_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 15 (3 bản ghi)
    ('51Q-15001', 15, 4, N'82 kWh', 1200, '15_1.jpg', 'AVAILABLE'),
    ('51Q-15002', 15, 5, N'82 kWh',  300, '15_2.jpg', 'AVAILABLE'),
    ('51Q-15003', 15, 2, N'82 kWh', 2100, '15_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 16 (4 bản ghi)
    ('51R-16001', 16, 5, N'60 kWh', 1500, '16_1.jpg', 'AVAILABLE'),
    ('51R-16002', 16, 6, N'60 kWh',  900, '16_2.jpg', 'AVAILABLE'),
    ('51R-16003', 16, 3, N'60 kWh', 2500, '16_3.jpg', 'AVAILABLE'),
    ('51R-16004', 16, 1, N'60 kWh',  100, '16_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 17 (3 bản ghi)
    ('51S-17001', 17, 6, N'37 kWh',  900, '17_1.jpg', 'AVAILABLE'),
    ('51S-17002', 17, 4, N'37 kWh',  600, '17_2.jpg', 'AVAILABLE'),
    ('51S-17003', 17, 2, N'37 kWh', 1100, '17_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 18 (4 bản ghi)
    ('51T-18001', 18, 7, N'92 kWh', 2000, '18_1.jpg', 'AVAILABLE'),
    ('51T-18002', 18, 1, N'92 kWh',  450, '18_2.jpg', 'AVAILABLE'),
    ('51T-18003', 18, 2, N'92 kWh', 1800, '18_3.jpg', 'AVAILABLE'),
    ('51T-18004', 18, 3, N'92 kWh',  220, '18_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 19 (3 bản ghi)
    ('51U-19001', 19, 3, N'75 kWh',  500, '19_1.jpg', 'AVAILABLE'),
    ('51U-19002', 19, 4, N'75 kWh', 1100, '19_2.jpg', 'AVAILABLE'),
    ('51U-19003', 19, 5, N'75 kWh',  250, '19_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 20 (4 bản ghi)
    ('51V-20001', 20, 4, N'100 kWh',1100, '20_1.jpg', 'AVAILABLE'),
    ('51V-20002', 20, 5, N'100 kWh', 300, '20_2.jpg', 'AVAILABLE'),
    ('51V-20003', 20, 6, N'100 kWh',2000, '20_3.jpg', 'AVAILABLE'),
    ('51V-20004', 20, 1, N'100 kWh',  50, '20_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 21 (3 bản ghi)
    ('51W-21001', 21, 5, N'58 kWh',  700, '21_1.jpg', 'AVAILABLE'),
    ('51W-21002', 21, 6, N'58 kWh', 1300, '21_2.jpg', 'AVAILABLE'),
    ('51W-21003', 21, 2, N'58 kWh',  120, '21_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 22 (4 bản ghi)
    ('51X-22001', 22, 6, N'77 kWh', 1600, '22_1.jpg', 'AVAILABLE'),
    ('51X-22002', 22, 7, N'77 kWh',  900, '22_2.jpg', 'AVAILABLE'),
    ('51X-22003', 22, 1, N'77 kWh', 2400, '22_3.jpg', 'AVAILABLE'),
    ('51X-22004', 22, 3, N'77 kWh',  430, '22_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 23 (3 bản ghi)
    ('51Y-23001', 23, 7, N'40 kWh',  300, '23_1.jpg', 'AVAILABLE'),
    ('51Y-23002', 23, 1, N'40 kWh',  900, '23_2.jpg', 'AVAILABLE'),
    ('51Y-23003', 23, 2, N'40 kWh', 1500, '23_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 24 (4 bản ghi)
    ('51Z-24001', 24, 1, N'83 kWh', 1300, '24_1.jpg', 'AVAILABLE'),
    ('51Z-24002', 24, 2, N'83 kWh',  700, '24_2.jpg', 'AVAILABLE'),
    ('51Z-24003', 24, 3, N'83 kWh', 2200, '24_3.jpg', 'AVAILABLE'),
    ('51Z-24004', 24, 4, N'83 kWh',  420, '24_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 25 (3 bản ghi)
    ('52A-25001', 25, 2, N'85 kWh',  700, '25_1.jpg', 'AVAILABLE'),
    ('52A-25002', 25, 3, N'85 kWh', 1100, '25_2.jpg', 'AVAILABLE'),
    ('52A-25003', 25, 1, N'85 kWh',  300, '25_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 26 (4 bản ghi)
    ('52B-26001', 26, 3, N'88 kWh',  900, '26_1.jpg', 'AVAILABLE'),
    ('52B-26002', 26, 4, N'88 kWh',  500, '26_2.jpg', 'AVAILABLE'),
    ('52B-26003', 26, 5, N'88 kWh', 2000, '26_3.jpg', 'AVAILABLE'),
    ('52B-26004', 26, 1, N'88 kWh',  110, '26_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 27 (3 bản ghi)
    ('52C-27001', 27, 4, N'95 kWh',  600, '27_1.jpg', 'AVAILABLE'),
    ('52C-27002', 27, 5, N'95 kWh',  300, '27_2.jpg', 'AVAILABLE'),
    ('52C-27003', 27, 2, N'95 kWh', 1200, '27_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 28 (4 bản ghi)
    ('52D-28001', 28, 5, N'70 kWh',  400, '28_1.jpg', 'AVAILABLE'),
    ('52D-28002', 28, 6, N'70 kWh',  850, '28_2.jpg', 'AVAILABLE'),
    ('52D-28003', 28, 1, N'70 kWh', 1600, '28_3.jpg', 'AVAILABLE'),
    ('52D-28004', 28, 2, N'70 kWh',  220, '28_4.jpg', 'AVAILABLE'),

    -- vehicle_id = 29 (3 bản ghi)
    ('52E-29001', 29, 6, N'93 kWh',  500, '29_1.jpg', 'AVAILABLE'),
    ('52E-29002', 29, 7, N'93 kWh',  900, '29_2.jpg', 'AVAILABLE'),
    ('52E-29003', 29, 1, N'93 kWh', 1400, '29_3.jpg', 'AVAILABLE'),

    -- vehicle_id = 30 (4 bản ghi)
    ('52F-30001', 30, 1, N'78 kWh',  850, '30_1.jpg', 'AVAILABLE'),
    ('52F-30002', 30, 2, N'78 kWh', 1200, '30_2.jpg', 'AVAILABLE'),
    ('52F-30003', 30, 3, N'78 kWh', 2100, '30_3.jpg', 'AVAILABLE'),
    ('52F-30004', 30, 4, N'78 kWh',  320, '30_4.jpg', 'AVAILABLE');
GO

-- ========================
-- 7. Promotion
-- ========================
INSERT INTO Promotion (promo_name, [code], discount_percent, start_time, end_time, [status])
VALUES ('SALE10', N'Giảm 10% cho tất cả đơn trong tháng này', 10, GETDATE(), DATEADD(DAY, 30, GETDATE()), 'ACTIVE'),
       ('NEWUSER20', N'Ưu đãi 20% cho khách hàng mới', 20, GETDATE(), DATEADD(DAY, 60, GETDATE()), 'ACTIVE');
GO

-- ========================
-- 8. Booking
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
INSERT INTO Contract (booking_id, staff_id ,[status], otp_code)
VALUES (2, 2,'COMPLETED', '123456');
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
