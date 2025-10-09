import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./BookingPage.css";

// Mock data - trong thực tế sẽ fetch từ API dựa trên carId
const getCarData = (carId) => {
  // Mock data cho các xe khác nhau
  const carDatabase = {
    "vf3": {
      id: "vf3",
      name: "VinFast VF3",
      brand: "VinFast",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/VinFast VF 5 Plus.jpg",
      specifications: {
        seats: "2 chỗ",
        battery: "18.64 kWh",
        range: "210 km",
        type: "Hatchback",
        brand: "VinFast",
        transmission: "Tự động"
      },
      features: [
        "Điều hòa tự động",
        "Màn hình cảm ứng 10 inch",
        "Hệ thống âm thanh 6 loa",
        "Kết nối smart phone",
        "Camera lùi",
        "Sạc không dây cho điện thoại"
      ],
      price: 1000000,
      currency: "VND"
    },
    "vf8": {
      id: "vf8",
      name: "VinFast VF 8 Plus",
      brand: "VinFast",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/VinFast VF 8 Plus.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "87.7 kWh",
        range: "471 km",
        type: "SUV",
        brand: "VinFast",
        transmission: "Tự động"
      },
      features: [
        "Điều hòa 2 vùng",
        "Màn hình cảm ứng 15.6 inch",
        "Hệ thống âm thanh 12 loa",
        "ADAS cấp độ 2",
        "Sạc nhanh 30 phút",
        "AWD toàn thời gian"
      ],
      price: 2200000,
      currency: "VND"
    },
    "ioniq5": {
      id: "ioniq5",
      name: "Hyundai Ioniq 5",
      brand: "Hyundai",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Hyundai Ioniq 5.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "77 kWh",
        range: "507 km",
        type: "SUV",
        brand: "Hyundai",
        transmission: "Tự động"
      },
      features: [
        "Thiết kế tương lai",
        "Nội thất rộng rãi",
        "Ghế sưởi & làm mát",
        "Khoang chứa 527L",
        "Sạc nhanh 18 phút",
        "Hệ thống V2L"
      ],
      price: 1950000,
      currency: "VND"
    },
    "tesla3": {
      id: "tesla3",
      name: "Tesla Model 3",
      brand: "Tesla",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Tesla Model 3.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "75 kWh",
        range: "491 km",
        type: "Sedan",
        brand: "Tesla",
        transmission: "Tự động"
      },
      features: [
        "Autopilot cơ bản",
        "Màn hình cảm ứng 15 inch",
        "Sạc siêu nhanh",
        "Over-the-air updates",
        "Cabin filter HEPA",
        "Premium audio system"
      ],
      price: 1500000,
      currency: "VND"
    },
    "bmwix": {
      id: "bmwix",
      name: "BMW iX xDrive50",
      brand: "BMW",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/BMW iX xDrive50.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "111.5 kWh",
        range: "630 km",
        type: "SUV",
        brand: "BMW",
        transmission: "Tự động"
      },
      features: [
        "Thiết kế iconic",
        "Nội thất cao cấp",
        "Hệ thống âm thanh Bowers & Wilkins",
        "Massage seats",
        "Sky Lounge roof",
        "BMW iDrive 8"
      ],
      price: 3500000,
      currency: "VND"
    },
    "kia-ev6": {
      id: "kia-ev6",
      name: "Kia EV6 GT-Line",
      brand: "Kia",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Kia EV6 GT-Line.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "77.4 kWh",
        range: "528 km",
        type: "SUV",
        brand: "Kia",
        transmission: "Tự động"
      },
      features: [
        "SUV coupe hiệu suất cao",
        "Sạc siêu nhanh",
        "Hệ thống AWD",
        "Nội thất cao cấp",
        "Kia Connect",
        "Hệ thống âm thanh Meridian"
      ],
      price: 2050000,
      currency: "VND"
    },
    "porsche-taycan": {
      id: "porsche-taycan",
      name: "Porsche Taycan Turbo S",
      brand: "Porsche",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Porsche Taycan Turbo S.jpg",
      specifications: {
        seats: "4 chỗ",
        battery: "93.4 kWh",
        range: "412 km",
        type: "Sedan",
        brand: "Porsche",
        transmission: "Tự động"
      },
      features: [
        "Hiệu suất cực cao",
        "Thiết kế thể thao",
        "Hệ thống âm thanh Burmester",
        "Nội thất da cao cấp",
        "Porsche Connect",
        "Hệ thống treo khí nén"
      ],
      price: 4500000,
      currency: "VND"
    },
    "mercedes-eqe": {
      id: "mercedes-eqe",
      name: "Mercedes-Benz EQE 350+",
      brand: "Mercedes-Benz",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Mercedes-Benz EQE 350+.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "90.6 kWh",
        range: "660 km",
        type: "Sedan",
        brand: "Mercedes-Benz",
        transmission: "Tự động"
      },
      features: [
        "Thiết kế sang trọng",
        "Nội thất cao cấp",
        "Hệ thống âm thanh Burmester",
        "MBUX Hyperscreen",
        "Mercedes Connect",
        "Hệ thống treo khí nén"
      ],
      price: 3200000,
      currency: "VND"
    },
    "audi-q8-etron": {
      id: "audi-q8-etron",
      name: "Audi Q8 e-tron",
      brand: "Audi",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Audi Q8 e-tron.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "114 kWh",
        range: "600 km",
        type: "SUV",
        brand: "Audi",
        transmission: "Tự động"
      },
      features: [
        "Thiết kế quattaro",
        "Nội thất cao cấp",
        "Hệ thống âm thanh Bang & Olufsen",
        "Virtual Cockpit",
        "Audi Connect",
        "Hệ thống treo khí nén"
      ],
      price: 2800000,
      currency: "VND"
    },
    "model3": {
      id: "model3",
      name: "Tesla Model 3",
      brand: "Tesla",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Tesla Model 3.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "75 kWh",
        range: "491 km",
        type: "Sedan",
        brand: "Tesla",
        transmission: "Tự động"
      },
      features: [
        "Autopilot cơ bản",
        "Màn hình cảm ứng 15 inch",
        "Sạc siêu nhanh",
        "Over-the-air updates",
        "Cabin filter HEPA",
        "Premium audio system"
      ],
      price: 2400000,
      currency: "VND"
    },
    "tesla-model-y": {
      id: "tesla-model-y",
      name: "Tesla Model Y",
      brand: "Tesla",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Tesla Model Y.jpg",
      specifications: {
        seats: "7 chỗ",
        battery: "75 kWh",
        range: "565 km",
        type: "SUV",
        brand: "Tesla",
        transmission: "Tự động"
      },
      features: [
        "Full Self-Driving",
        "0-100 km/h 3.7s",
        "An toàn 5 sao",
        "Gaming System",
        "Over-the-air updates",
        "Premium audio system"
      ],
      price: 2600000,
      currency: "VND"
    },
    "bmw-ix": {
      id: "bmw-ix",
      name: "BMW iX xDrive50",
      brand: "BMW",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/BMW iX xDrive50.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "111.5 kWh",
        range: "630 km",
        type: "SUV",
        brand: "BMW",
        transmission: "Tự động"
      },
      features: [
        "Thiết kế iconic",
        "Nội thất cao cấp",
        "Hệ thống âm thanh Bowers & Wilkins",
        "Massage seats",
        "Sky Lounge roof",
        "BMW iDrive 8"
      ],
      price: 3200000,
      currency: "VND"
    },
    "vf8-plus": {
      id: "vf8-plus",
      name: "VinFast VF 8 Plus",
      brand: "VinFast",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/VinFast VF 8 Plus.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "87.7 kWh",
        range: "471 km",
        type: "SUV",
        brand: "VinFast",
        transmission: "Tự động"
      },
      features: [
        "Phiên bản pin nâng cao",
        "Động cơ kép",
        "ADAS cấp độ 2",
        "Sạc nhanh 30 phút",
        "AWD toàn thời gian",
        "Nội thất cao cấp"
      ],
      price: 2200000,
      currency: "VND"
    },
    "vf5": {
      id: "vf5",
      name: "VinFast VF 5 Plus",
      brand: "VinFast",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/VinFast VF 5 Plus.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "37.23 kWh",
        range: "300 km",
        type: "Compact",
        brand: "VinFast",
        transmission: "Tự động"
      },
      features: [
        "Cỡ nhỏ linh hoạt",
        "Di chuyển nội đô",
        "Hỗ trợ đỗ xe",
        "Kết nối ứng dụng",
        "Ghế nỉ cao cấp",
        "Thiết kế hiện đại"
      ],
      price: 990000,
      currency: "VND"
    },
    "vfe34": {
      id: "vfe34",
      name: "VinFast VF e34",
      brand: "VinFast",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/VinFast VF e34.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "42 kWh",
        range: "318 km",
        type: "Compact",
        brand: "VinFast",
        transmission: "Tự động"
      },
      features: [
        "Crossover điện thông minh",
        "Trợ lý giọng nói ViVi",
        "Ứng dụng VinFast",
        "ADAS cấp độ 2",
        "Thiết kế hiện đại",
        "Nội thất cao cấp"
      ],
      price: 1200000,
      currency: "VND"
    },
    "byd-dolphin": {
      id: "byd-dolphin",
      name: "BYD Dolphin Premium",
      brand: "BYD",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/BYD Dolphin Premium.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "60 kWh",
        range: "405 km",
        type: "Compact",
        brand: "BYD",
        transmission: "Tự động"
      },
      features: [
        "Hatchback điện trẻ trung",
        "Tiện nghi cao",
        "Pin Blade 60 kWh",
        "Sạc nhanh DC 30 phút",
        "Khoang nội thất 2 tông màu",
        "Ghế chỉnh điện 6 hướng"
      ],
      price: 1050000,
      currency: "VND"
    },
    "volkswagen-id4": {
      id: "volkswagen-id4",
      name: "Volkswagen ID.4 Pro",
      brand: "Volkswagen",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Volkswagen ID.4 Pro.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "77 kWh",
        range: "520 km",
        type: "SUV",
        brand: "Volkswagen",
        transmission: "Tự động"
      },
      features: [
        "SUV điện gia đình",
        "Thiết kế hiện đại",
        "ID. Light",
        "IQ.DRIVE",
        "Nội thất rộng rãi",
        "Hệ thống sạc nhanh"
      ],
      price: 1800000,
      currency: "VND"
    },
    "nissan-leaf": {
      id: "nissan-leaf",
      name: "Nissan Leaf e+",
      brand: "Nissan",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Nissan Leaf e+.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "62 kWh",
        range: "385 km",
        type: "Compact",
        brand: "Nissan",
        transmission: "Tự động"
      },
      features: [
        "Hatchback điện tiên phong",
        "Đã được chứng minh",
        "e-Pedal",
        "ProPILOT",
        "Thiết kế hiện đại",
        "Tiết kiệm năng lượng"
      ],
      price: 1100000,
      currency: "VND"
    },
    "ford-mustang-mach-e": {
      id: "ford-mustang-mach-e",
      name: "Ford Mustang Mach-E GT",
      brand: "Ford",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Ford Mustang Mach-E GT.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "88 kWh",
        range: "402 km",
        type: "SUV",
        brand: "Ford",
        transmission: "Tự động"
      },
      features: [
        "SUV điện Mustang",
        "Hiệu suất mạnh mẽ",
        "0-100 km/h 3.7s",
        "B&O Sound System",
        "Thiết kế thể thao",
        "Nội thất cao cấp"
      ],
      price: 2300000,
      currency: "VND"
    },
    "polestar-2": {
      id: "polestar-2",
      name: "Polestar 2 Performance",
      brand: "Polestar",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Polestar 2 Performance.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "78 kWh",
        range: "470 km",
        type: "Sedan",
        brand: "Polestar",
        transmission: "Tự động"
      },
      features: [
        "Sedan điện cao cấp",
        "Thiết kế Bắc Âu",
        "Công suất 300 kW",
        "Android Automotive",
        "Nội thất sang trọng",
        "Hiệu suất cao"
      ],
      price: 2800000,
      currency: "VND"
    },
    "rivian-r1t": {
      id: "rivian-r1t",
      name: "Rivian R1T Adventure",
      brand: "Rivian",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Rivian R1T Adventure.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "135 kWh",
        range: "505 km",
        type: "SUV",
        brand: "Rivian",
        transmission: "Tự động"
      },
      features: [
        "Pickup điện đầu tiên",
        "Khả năng off-road",
        "Gear Tunnel",
        "Thiết kế adventure",
        "Nội thất cao cấp",
        "Hệ thống sạc nhanh"
      ],
      price: 3800000,
      currency: "VND"
    },
    "lucid-air": {
      id: "lucid-air",
      name: "Lucid Air Dream Range",
      brand: "Lucid",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Lucid Air Dream Range.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "112 kWh",
        range: "832 km",
        type: "Sedan",
        brand: "Lucid",
        transmission: "Tự động"
      },
      features: [
        "Sedan điện tầm xa",
        "Nội thất sang trọng",
        "Surreal Sound",
        "Thiết kế cao cấp",
        "Hiệu suất vượt trội",
        "Công nghệ tiên tiến"
      ],
      price: 4200000,
      currency: "VND"
    },
    "hyundai-ioniq-6": {
      id: "hyundai-ioniq-6",
      name: "Hyundai Ioniq 6",
      brand: "Hyundai",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Hyundai Ioniq 6.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "77.4 kWh",
        range: "610 km",
        type: "Sedan",
        brand: "Hyundai",
        transmission: "Tự động"
      },
      features: [
        "Sedan điện tương lai",
        "Hiệu suất khí động học",
        "Hệ số cản 0.21",
        "Cockpit 12.3 inch",
        "Thiết kế hiện đại",
        "Nội thất rộng rãi"
      ],
      price: 2100000,
      currency: "VND"
    },
    "kia-ev9": {
      id: "kia-ev9",
      name: "Kia EV9 GT-Line",
      brand: "Kia",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Kia EV9 GT-Line.jpg",
      specifications: {
        seats: "7 chỗ",
        battery: "99.8 kWh",
        range: "541 km",
        type: "SUV",
        brand: "Kia",
        transmission: "Tự động"
      },
      features: [
        "SUV điện 7 chỗ",
        "Thiết kế bold",
        "Ghế xoay 180°",
        "ADAS cấp độ 3",
        "Nội thất linh hoạt",
        "Hiệu suất cao"
      ],
      price: 2700000,
      currency: "VND"
    },
    "genesis-gv60": {
      id: "genesis-gv60",
      name: "Genesis GV60 Performance",
      brand: "Genesis",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Genesis GV60 Performance.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "77.4 kWh",
        range: "451 km",
        type: "SUV",
        brand: "Genesis",
        transmission: "Tự động"
      },
      features: [
        "SUV điện hạng sang",
        "Thiết kế độc đáo",
        "Crystal Sphere",
        "Công suất 320 kW",
        "Nội thất cao cấp",
        "Hệ thống âm thanh premium"
      ],
      price: 2400000,
      currency: "VND"
    },
    "volvo-xc40-recharge": {
      id: "volvo-xc40-recharge",
      name: "Volvo XC40 Recharge",
      brand: "Volvo",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Volvo XC40 Recharge.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "78 kWh",
        range: "418 km",
        type: "SUV",
        brand: "Volvo",
        transmission: "Tự động"
      },
      features: [
        "SUV điện an toàn",
        "Thiết kế Bắc Âu",
        "City Safety",
        "Nội thất tái chế",
        "Thân thiện môi trường",
        "Hệ thống an toàn tiên tiến"
      ],
      price: 1900000,
      currency: "VND"
    },
    "mazda-mx-30": {
      id: "mazda-mx-30",
      name: "Mazda MX-30",
      brand: "Mazda",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Mazda MX-30.jpg",
      specifications: {
        seats: "4 chỗ",
        battery: "35.5 kWh",
        range: "200 km",
        type: "Compact",
        brand: "Mazda",
        transmission: "Tự động"
      },
      features: [
        "Crossover điện nhỏ gọn",
        "Thiết kế độc đáo",
        "Cửa ngược",
        "Nội thất Cork",
        "Thiết kế Kodo",
        "Thân thiện môi trường"
      ],
      price: 1300000,
      currency: "VND"
    },
    "mini-cooper-se": {
      id: "mini-cooper-se",
      name: "MINI Cooper SE",
      brand: "MINI",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/MINI Cooper SE.jpg",
      specifications: {
        seats: "4 chỗ",
        battery: "32.6 kWh",
        range: "233 km",
        type: "Compact",
        brand: "MINI",
        transmission: "Tự động"
      },
      features: [
        "Hatchback điện nhỏ gọn",
        "Vui nhộn",
        "Thiết kế cá nhân hóa",
        "Âm thanh Harman Kardon",
        "Thiết kế iconic",
        "Lái xe thú vị"
      ],
      price: 1150000,
      currency: "VND"
    },
    "fiat-500e": {
      id: "fiat-500e",
      name: "Fiat 500e",
      brand: "Fiat",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Fiat 500e.jpg",
      specifications: {
        seats: "4 chỗ",
        battery: "42 kWh",
        range: "320 km",
        type: "Compact",
        brand: "Fiat",
        transmission: "Tự động"
      },
      features: [
        "Hatchback điện Ý",
        "Thiết kế retro",
        "50 màu sắc",
        "Nội thất tái chế",
        "Thiết kế độc đáo",
        "Thân thiện môi trường"
      ],
      price: 1000000,
      currency: "VND"
    },
    "tesla-model-s": {
      id: "tesla-model-s",
      name: "Tesla Model S Plaid",
      brand: "Tesla",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Tesla Model S Plaid.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "100 kWh",
        range: "628 km",
        type: "Sedan",
        brand: "Tesla",
        transmission: "Tự động"
      },
      features: [
        "Sedan điện hiệu suất cao nhất",
        "0-100km/h 2.1s",
        "Full Self-Driving",
        "Gaming System",
        "Thiết kế sang trọng",
        "Công nghệ tiên tiến"
      ],
      price: 3500000,
      currency: "VND"
    },
    "jaguar-i-pace": {
      id: "jaguar-i-pace",
      name: "Jaguar I-PACE",
      brand: "Jaguar",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/Jaguar I-PACE.jpg",
      specifications: {
        seats: "5 chỗ",
        battery: "90 kWh",
        range: "470 km",
        type: "SUV",
        brand: "Jaguar",
        transmission: "Tự động"
      },
      features: [
        "SUV điện sang trọng Anh",
        "Thiết kế thể thao",
        "Nội thất da cao cấp",
        "Âm thanh Meridian",
        "Thiết kế iconic",
        "Hiệu suất cao"
      ],
      price: 2500000,
      currency: "VND"
    },
    "smart-eq-fortwo": {
      id: "smart-eq-fortwo",
      name: "smart EQ fortwo",
      brand: "smart",
      location: "Thành phố Hồ Chí Minh",
      image: "/anhxe/smart EQ fortwo.jpg",
      specifications: {
        seats: "2 chỗ",
        battery: "17.6 kWh",
        range: "159 km",
        type: "Compact",
        brand: "smart",
        transmission: "Tự động"
      },
      features: [
        "Xe điện đô thị nhỏ gọn",
        "Dễ đỗ xe",
        "Thân thiện môi trường",
        "Thiết kế compact",
        "Lý tưởng cho thành phố",
        "Tiết kiệm năng lượng"
      ],
      price: 850000,
      currency: "VND"
    }
  };
  
  // Trả về dữ liệu xe hoặc xe mặc định
  return carDatabase[carId] || carDatabase["vf3"];
};

const paymentMethods = [
  "Thanh toán qua điện thoại",
  "Thanh toán qua thẻ tín dụng",
  "Thanh toán qua ví điện tử",
  "Thanh toán khi nhận xe"
];

const pickupLocations = [
  "EV Station - Bình Thạnh",
  "EV Station - Thủ Đức", 
  "EV Station - Biên Hòa",
  "EV Station - TP Mỹ Tho",
  "EV Station - TP Bến Tre",
  "EV Station - Tân Bình",
  "EV Station - Long An",
  "EV Station - Cần Thơ",
  "EV Station - Bình Dương",
  "EV Station - Vũng Tàu"
];

export default function BookingPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Lấy dữ liệu xe dựa trên carId
  const carData = getCarData(carId);
  // Nếu từ trang danh sách đã truyền kèm ảnh/tên/giá qua state, ưu tiên dùng để đảm bảo đồng nhất
  const bookingImage = location.state?.image || carData.image;
  const bookingName = location.state?.name || carData.name;
  const bookingPrice = location.state?.price || carData.price;
  
  // Debug log
  console.log('BookingPage - carData:', carData);
  console.log('BookingPage - image used:', bookingImage);
  
  // Phí đặt cọc sẽ tự động cập nhật khi carData thay đổi
  // Logic: deposit = dailyPrice * 0.3 (30% giá thuê xe 1 ngày)
  
  const [formData, setFormData] = useState({
    renterName: "VD: Nguyễn Văn A",
    phoneNumber: "",
    email: "xxxxxx@gmail.com",
    bookingDate: "2025-09-29",
    returnDate: "2025-09-30",
    pickupTime: "12:00",
    returnTime: "12:00",
    paymentMethod: "Thanh toán qua điện thoại",
    discountCode: "",
    pickupLocation: "EV Station - Bình Thạnh"
  });

  const [isBooking, setIsBooking] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateRentalDays = () => {
    const start = new Date(formData.bookingDate);
    const end = new Date(formData.returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  // Hàm tính phí đặt cọc (30% giá thuê xe 1 ngày)
  const calculateDeposit = (dailyPrice) => {
    const depositRate = 0.3; // 30%
    const deposit = dailyPrice * depositRate;
    return Math.round(deposit);
  };

  const calculateTotal = () => {
    const days = calculateRentalDays();
    const dailyPrice = bookingPrice || carData.price;
    const totalRental = dailyPrice * days;
    
    // Phí đặt cọc = 30% giá thuê xe 1 ngày (không phụ thuộc vào số ngày thuê)
    const deposit = calculateDeposit(dailyPrice);
    
    // Debug log để kiểm tra tính toán
    console.log(`Car: ${bookingName}, Daily Price: ${dailyPrice}, Deposit (30%): ${deposit}`);
    
    return {
      dailyPrice: dailyPrice,
      days: days,
      totalRental: totalRental,
      deposit: deposit,
      totalToPay: deposit
    };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleBooking = async () => {
    setIsBooking(true);
    
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      // Lưu bản tóm tắt đặt chỗ cho các trang sau (CustomerInfoPage, Checkout)
      const summary = {
        car: { id: carId, name: bookingName, image: bookingImage },
        rental: {
          pickupLocation: formData.pickupLocation,
          pickupDate: formData.bookingDate,
          pickupTime: formData.pickupTime,
          returnLocation: formData.pickupLocation,
          returnDate: formData.returnDate,
          returnTime: formData.returnTime,
          days: calculateRentalDays()
        },
        pricing: {
          dailyRate: calculateTotal().dailyPrice,
          days: calculateTotal().days,
          subtotal: calculateTotal().totalRental,
          vat: Math.round(calculateTotal().totalRental * 0.1),
          total: Math.round(calculateTotal().totalRental * 1.1),
          km_limit: "200km/ngày",
          overage_fee: "2.000 đ/km"
        }
      };
      localStorage.setItem('currentBooking', JSON.stringify(summary));
      // Chuyển đến trang hợp đồng thay vì alert
      navigate(`/contract/${carId}`);
    }, 2000);
  };

  const totals = calculateTotal();

  return (
    <div className="booking-page">
      <Header />
      
      <main className="booking-main">
        <div className="booking-container">
          <h1 className="booking-title">Đặt xe</h1>
          
          <div className="booking-content">
            {/* Left Column - Booking Form */}
            <div className="booking-form-section">
              <div className="form-card">
                <h2 className="form-title">Thông tin đặt xe</h2>
                
                <div className="form-group">
                  <label className="form-label">Tên người thuê</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.renterName}
                    onChange={(e) => handleInputChange('renterName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày đặt</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.bookingDate}
                      onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày trả</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.returnDate}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Giờ nhận</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.pickupTime}
                      onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giờ trả</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.returnTime}
                      onChange={(e) => handleInputChange('returnTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phương thức thanh toán</label>
                  <div className="form-select-wrapper">
                    <select
                      className="form-select"
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    <span className="select-icon">▼</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mã giảm giá (nếu có)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.discountCode}
                    onChange={(e) => handleInputChange('discountCode', e.target.value)}
                    placeholder="Nhập mã giảm giá"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Địa điểm nhận xe</label>
                  <div className="form-select-wrapper">
                    <select
                      className="form-select"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    >
                      {pickupLocations.map((location) => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    <span className="select-icon">▼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Car Details & Summary */}
            <div className="car-details-section">
              <div className="car-details-card">
                <div className="car-image-container">
                  {bookingImage ? (
                    <img 
                      src={bookingImage} 
                      alt={bookingName}
                      className="car-image"
                      onError={(e) => {
                        console.error('Error loading car image:', bookingImage);
                        e.target.src = '/anhxe/VinFast VF 5 Plus.jpg'; // Fallback image
                      }}
                      onLoad={() => {
                        console.log('Car image loaded successfully:', bookingImage);
                      }}
                    />
                  ) : (
                    <div className="car-image-placeholder">
                      <div className="placeholder-icon">🚗</div>
                      <div className="placeholder-text">Đang tải ảnh xe...</div>
                    </div>
                  )}
                </div>

                <div className="car-info">
                  <h3 className="car-name">{bookingName}</h3>
                  <p className="car-location">{carData.location}</p>
                </div>

                <div className="car-specifications">
                  <h4 className="specs-title">Thông số kỹ thuật</h4>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <span className="spec-icon">🪑</span>
                      <span className="spec-value">{carData.specifications.seats}</span>
                      <span className="spec-label">Số chỗ</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">🔋</span>
                      <span className="spec-value">{carData.specifications.battery}</span>
                      <span className="spec-label">Dung lượng pin</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">🛣️</span>
                      <span className="spec-value">{carData.specifications.range}</span>
                      <span className="spec-label">Tầm hoạt động</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">🚗</span>
                      <span className="spec-value">{carData.specifications.type}</span>
                      <span className="spec-label">Loại xe</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">🏷️</span>
                      <span className="spec-value">{carData.specifications.brand}</span>
                      <span className="spec-label">Hãng xe</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">⚙️</span>
                      <span className="spec-value">{carData.specifications.transmission}</span>
                      <span className="spec-label">Hộp số</span>
                    </div>
                  </div>
                </div>

                <div className="car-features">
                  <h4 className="features-title">Tính năng nổi bật:</h4>
                  <ul className="features-list">
                    {carData.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span className="feature-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="cost-summary">
                  <div className="cost-item">
                    <span className="cost-label">Giá thuê xe/ngày:</span>
                    <span className="cost-value">{formatPrice(totals.dailyPrice)}₫</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Thời gian thuê:</span>
                    <span className="cost-value">{totals.days} ngày</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Tổng tiền thuê:</span>
                    <span className="cost-value">{formatPrice(totals.totalRental)}₫</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">Số tiền đặt trước (30% giá/ngày):</span>
                    <span className="cost-value">{formatPrice(totals.deposit)}₫</span>
                  </div>
                  <div className="cost-item total-cost">
                    <span className="cost-label">Tổng cần thanh toán:</span>
                    <span className="cost-value">{formatPrice(totals.totalToPay)} VNĐ</span>
                  </div>
                </div>

                <button 
                  className={`book-button ${isBooking ? 'loading' : ''}`}
                  onClick={handleBooking}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <span className="spinner"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt xe'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
