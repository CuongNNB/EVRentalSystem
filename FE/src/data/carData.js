// Centralized car data for the application
export const carDatabase = {
  "tesla-model-3": {
    id: "tesla-model-3",
    name: "Tesla Model 3",
    brand: "Tesla",
    price: 1200000,
    currency: "VND",
    period: "1 ngày",
    images: [
      "/anhxe/Tesla Model 3.jpg",
      "/anhxe/Tesla Model 3.jpg", 
      "/anhxe/Tesla Model 3.jpg",
      "/anhxe/Tesla Model 3.jpg"
    ],
    specifications: {
      seats: 5,
      transmission: "Số tự động",
      power: "283 HP",
      trunk: "425L",
      range: "491km (WLTP)",
      airbags: 8,
      type: "Sedan",
      limit: "300 km/ngày"
    },
    equipment: [
      "ABS", "Túi khí", "Cruise Control", "Phanh ABS", 
      "Máy lạnh", "Bluetooth", "Camera lùi", "Cảm biến va chạm",
      "Autopilot", "Tesla Supercharger", "Over-the-air updates"
    ],
    description: "Tesla Model 3 là mẫu xe điện hiện đại với hiệu suất mạnh mẽ và công nghệ Autopilot tiên tiến. Xe được trang bị đầy đủ các tính năng an toàn và tiện nghi, phù hợp cho cả gia đình và doanh nhân.",
    features: [
      "Hiệu suất mạnh mẽ với 0-100 km/h trong 4.4s",
      "Công nghệ Autopilot thông minh",
      "Sạc nhanh với Tesla Supercharger",
      "Cập nhật phần mềm qua không dây",
      "An toàn 5 sao Euro NCAP"
    ],
    rating: 4.8,
    reviews: 1247
  },
  "bmw-ix-xdrive50": {
    id: "bmw-ix-xdrive50",
    name: "BMW iX xDrive50",
    brand: "BMW",
    price: 1800000,
    currency: "VND",
    period: "1 ngày",
    images: [
      "/anhxe/BMW iX xDrive50.jpg",
      "/anhxe/BMW iX xDrive50.jpg", 
      "/anhxe/BMW iX xDrive50.jpg",
      "/anhxe/BMW iX xDrive50.jpg"
    ],
    specifications: {
      seats: 5,
      transmission: "Số tự động",
      power: "385 HP",
      trunk: "500L",
      range: "630km (WLTP)",
      airbags: 6,
      type: "SUV",
      limit: "300 km/ngày"
    },
    equipment: [
      "ABS", "Túi khí", "Cruise Control", "Phanh ABS", 
      "Máy lạnh", "Bluetooth", "Camera lùi", "Cảm biến va chạm",
      "xDrive", "BMW iDrive", "Wireless Charging"
    ],
    description: "BMW iX xDrive50 là SUV điện cao cấp với thiết kế tương lai và công nghệ tiên tiến. Xe mang đến trải nghiệm lái xe sang trọng và hiệu suất vượt trội.",
    features: [
      "Thiết kế tương lai với BMW iDrive 8",
      "Hiệu suất mạnh mẽ với xDrive AWD",
      "Nội thất sang trọng với vật liệu tái chế",
      "Công nghệ sạc nhanh 200kW",
      "Hệ thống âm thanh Harman Kardon"
    ],
    rating: 4.7,
    reviews: 892
  },
  "mercedes-eqe-350": {
    id: "mercedes-eqe-350",
    name: "Mercedes-Benz EQE 350+",
    brand: "Mercedes-Benz",
    price: 2200000,
    currency: "VND",
    period: "1 ngày",
    images: [
      "/anhxe/Mercedes-Benz EQE 350+.jpg",
      "/anhxe/Mercedes-Benz EQE 350+.jpg", 
      "/anhxe/Mercedes-Benz EQE 350+.jpg",
      "/anhxe/Mercedes-Benz EQE 350+.jpg"
    ],
    specifications: {
      seats: 5,
      transmission: "Số tự động",
      power: "292 HP",
      trunk: "430L",
      range: "660km (WLTP)",
      airbags: 7,
      type: "Sedan",
      limit: "300 km/ngày"
    },
    equipment: [
      "ABS", "Túi khí", "Cruise Control", "Phanh ABS", 
      "Máy lạnh", "Bluetooth", "Camera lùi", "Cảm biến va chạm",
      "MBUX", "Burmester Sound", "Ambient Lighting"
    ],
    description: "Mercedes-Benz EQE 350+ là sedan điện cao cấp với thiết kế sang trọng và công nghệ MBUX tiên tiến. Xe mang đến trải nghiệm lái xe đẳng cấp và tiện nghi tối đa.",
    features: [
      "Thiết kế sang trọng với Mercedes-Benz DNA",
      "Công nghệ MBUX Hyperscreen",
      "Nội thất cao cấp với vật liệu premium",
      "Hệ thống âm thanh Burmester 3D",
      "Đèn nội thất ambient lighting"
    ],
    rating: 4.9,
    reviews: 1156
  },
  "porsche-taycan-turbo-s": {
    id: "porsche-taycan-turbo-s",
    name: "Porsche Taycan Turbo S",
    brand: "Porsche",
    price: 3500000,
    currency: "VND",
    period: "1 ngày",
    images: [
      "/anhxe/Porsche Taycan Turbo S.jpg",
      "/anhxe/Porsche Taycan Turbo S.jpg", 
      "/anhxe/Porsche Taycan Turbo S.jpg",
      "/anhxe/Porsche Taycan Turbo S.jpg"
    ],
    specifications: {
      seats: 4,
      transmission: "Số tự động",
      power: "560 kW",
      trunk: "366L",
      range: "412km (WLTP)",
      airbags: 6,
      type: "Sports Car",
      limit: "300 km/ngày"
    },
    equipment: [
      "ABS", "Túi khí", "Cruise Control", "Phanh ABS", 
      "Máy lạnh", "Bluetooth", "Camera lùi", "Cảm biến va chạm",
      "Porsche Active Suspension", "Sport Chrono", "BOSE Sound"
    ],
    description: "Porsche Taycan Turbo S là siêu xe điện với hiệu suất đỉnh cao và thiết kế thể thao. Xe mang đến trải nghiệm lái xe đầy cảm xúc và hiệu suất vượt trội.",
    features: [
      "Hiệu suất đỉnh cao với 0-100 km/h trong 2.8s",
      "Thiết kế thể thao với DNA Porsche",
      "Công nghệ sạc nhanh 270kW",
      "Hệ thống treo Porsche Active Suspension",
      "Nội thất thể thao với Sport Chrono"
    ],
    rating: 4.9,
    reviews: 743
  },
  "audi-q8-etron": {
    id: "audi-q8-etron",
    name: "Audi Q8 e-tron",
    brand: "Audi",
    price: 2800000,
    currency: "VND",
    period: "1 ngày",
    images: [
      "/anhxe/Audi Q8 e-tron.jpg",
      "/anhxe/Audi Q8 e-tron.jpg", 
      "/anhxe/Audi Q8 e-tron.jpg",
      "/anhxe/Audi Q8 e-tron.jpg"
    ],
    specifications: {
      seats: 5,
      transmission: "Số tự động",
      power: "300 HP",
      trunk: "605L",
      range: "600km (WLTP)",
      airbags: 6,
      type: "SUV",
      limit: "300 km/ngày"
    },
    equipment: [
      "ABS", "Túi khí", "Cruise Control", "Phanh ABS", 
      "Máy lạnh", "Bluetooth", "Camera lùi", "Cảm biến va chạm",
      "quattro", "MMI Touch", "Virtual Cockpit"
    ],
    description: "Audi Q8 e-tron là SUV điện cao cấp với thiết kế hiện đại và công nghệ quattro. Xe mang đến trải nghiệm lái xe sang trọng và hiệu suất vượt trội.",
    features: [
      "Thiết kế hiện đại với Audi quattro",
      "Công nghệ MMI Touch Response",
      "Virtual Cockpit Plus",
      "Nội thất sang trọng với Bang & Olufsen",
      "Hệ thống treo air suspension"
    ],
    rating: 4.8,
    reviews: 967
  },
  "hyundai-ioniq-5": {
    id: "hyundai-ioniq-5",
    name: "Hyundai Ioniq 5",
    brand: "Hyundai",
    price: 1500000,
    currency: "VND",
    period: "1 ngày",
    images: [
      "/anhxe/Hyundai Ioniq 5.jpg",
      "/anhxe/Hyundai Ioniq 5.jpg", 
      "/anhxe/Hyundai Ioniq 5.jpg",
      "/anhxe/Hyundai Ioniq 5.jpg"
    ],
    specifications: {
      seats: 5,
      transmission: "Số tự động",
      power: "225 HP",
      trunk: "527L",
      range: "507km (WLTP)",
      airbags: 6,
      type: "SUV",
      limit: "300 km/ngày"
    },
    equipment: [
      "ABS", "Túi khí", "Cruise Control", "Phanh ABS", 
      "Máy lạnh", "Bluetooth", "Camera lùi", "Cảm biến va chạm",
      "SmartSense", "Vehicle-to-Load", "BOSE Sound"
    ],
    description: "Hyundai Ioniq 5 là SUV điện với thiết kế tương lai và công nghệ tiên tiến. Xe mang đến trải nghiệm lái xe hiện đại và tiện nghi tối đa.",
    features: [
      "Thiết kế tương lai với Parametric Pixels",
      "Công nghệ Vehicle-to-Load (V2L)",
      "Nội thất rộng rãi với sliding console",
      "Hệ thống an toàn SmartSense",
      "Sạc nhanh 350kW"
    ],
    rating: 4.6,
    reviews: 1234
  }
  ,
  "volvo-xc40-recharge": {
    id: "volvo-xc40-recharge",
    name: "Volvo XC40 Recharge",
    brand: "Volvo",
    price: 1600000,
    currency: "VND",
    period: "1 ngày",
    images: [
      "/anhxe/Volvo XC40 Recharge.jpg"
    ],
    specifications: {
      seats: 5,
      transmission: "Số tự động",
      power: "402 HP",
      trunk: "452L",
      range: "418km (WLTP)",
      airbags: 6,
      type: "SUV",
      limit: "300 km/ngày"
    },
    equipment: ["ABS", "Túi khí", "Cruise Control", "Camera lùi"],
    description: "Volvo XC40 Recharge là SUV cỡ nhỏ chạy điện, an toàn và tiện nghi.",
    features: [
      "Thiết kế gọn cho đô thị",
      "Hệ thống an toàn Volvo",
      "Sạc nhanh",
      "Nội thất cao cấp"
    ],
    rating: 4.5,
    reviews: 312
  },
  "volkswagen-id4-pro": {
    id: "volkswagen-id4-pro",
    name: "Volkswagen ID.4 Pro",
    brand: "Volkswagen",
    price: 1400000,
    currency: "VND",
    period: "1 ngày",
    images: [
      "/anhxe/Volkswagen ID.4 Pro.jpg"
    ],
    specifications: {
      seats: 5,
      transmission: "Số tự động",
      power: "201 HP",
      trunk: "543L",
      range: "520km (WLTP)",
      airbags: 6,
      type: "SUV",
      limit: "300 km/ngày"
    },
    equipment: ["ABS", "Túi khí", "Cruise Control", "Giữ làn"],
    description: "ID.4 Pro là crossover điện của Volkswagen, phù hợp cho gia đình.",
    features: ["Không gian rộng", "Tiết kiệm năng lượng", "Hệ thống trợ lái"],
    rating: 4.4,
    reviews: 210
  },
  "vinfast-vf-e34": {
    id: "vinfast-vf-e34",
    name: "VinFast VF e34",
    brand: "VinFast",
    price: 600000,
    currency: "VND",
    period: "1 ngày",
    images: ["/anhxe/VinFast VF e34.jpg"],
    specifications: { seats: 5, transmission: "Số tự động", power: "110 HP", trunk: "440L", range: "300km", airbags: 4, type: "SUV", limit: "250 km/ngày" },
    equipment: ["Camera lùi", "Bluetooth", "Cruise Control"],
    description: "VF e34 là lựa chọn kinh tế cho nhu cầu di chuyển hàng ngày.",
    features: ["Chi phí thấp", "Dễ vận hành", "Phù hợp đô thị"],
    rating: 4.0,
    reviews: 540
  },
  "vinfast-vf-8-plus": {
    id: "vinfast-vf-8-plus",
    name: "VinFast VF 8 Plus",
    brand: "VinFast",
    price: 1700000,
    currency: "VND",
    period: "1 ngày",
    images: ["/anhxe/VinFast VF 8 Plus.jpg"],
    specifications: { seats: 7, transmission: "Số tự động", power: "300 HP", trunk: "700L", range: "480km", airbags: 6, type: "SUV", limit: "300 km/ngày" },
    equipment: ["Hệ thống 7 chỗ", "Cảm biến va chạm", "Camera 360"],
    description: "VF 8 Plus cung cấp không gian rộng rãi và tiện nghi cho gia đình.",
    features: ["7 chỗ ngồi", "Tiện nghi cao cấp", "Khoang chứa lớn"],
    rating: 4.2,
    reviews: 198
  },
  "vinfast-vf-5-plus": {
    id: "vinfast-vf-5-plus",
    name: "VinFast VF 5 Plus",
    brand: "VinFast",
    price: 800000,
    currency: "VND",
    period: "1 ngày",
    images: ["/anhxe/VinFast VF 5 Plus.jpg"],
    specifications: { seats: 5, transmission: "Số tự động", power: "120 HP", trunk: "350L", range: "350km", airbags: 4, type: "Compact", limit: "200 km/ngày" },
    equipment: ["Giữ làn", "Camera lùi", "Bluetooth"],
    description: "VF 5 Plus là xe hatchback điện nhỏ gọn, thích hợp cho đô thị.",
    features: ["Kích thước nhỏ gọn", "Tiện lợi đô thị", "Tiết kiệm"],
    rating: 4.1,
    reviews: 150
  },
  "tesla-model-y": {
    id: "tesla-model-y",
    name: "Tesla Model Y",
    brand: "Tesla",
    price: 1900000,
    currency: "VND",
    period: "1 ngày",
    images: ["/anhxe/Tesla Model Y.jpg"],
    specifications: { seats: 5, transmission: "Số tự động", power: "456 HP", trunk: "854L", range: "505km (WLTP)", airbags: 8, type: "SUV", limit: "300 km/ngày" },
    equipment: ["Autopilot", "Supercharger", "OTA Updates"],
    description: "Model Y là SUV điện của Tesla, kết hợp hiệu suất và tính tiện dụng.",
    features: ["Hiệu suất cao", "Không gian lớn", "Hệ sinh thái Tesla"],
    rating: 4.7,
    reviews: 842
  },
  "tesla-model-s-plaid": {
    id: "tesla-model-s-plaid",
    name: "Tesla Model S Plaid",
    brand: "Tesla",
    price: 4200000,
    currency: "VND",
    period: "1 ngày",
    images: ["/anhxe/Tesla Model S Plaid.jpg"],
    specifications: { seats: 5, transmission: "Số tự động", power: "1020 HP", trunk: "804L", range: "637km (WLTP)", airbags: 8, type: "Sedan", limit: "300 km/ngày" },
    equipment: ["Autopilot", "Hiệu suất cao", "Sạc nhanh"],
    description: "Model S Plaid là sedan hiệu suất cao với khả năng tăng tốc ấn tượng.",
    features: ["Tốc độ nhanh", "Công nghệ cao", "Nội thất sang trọng"],
    rating: 4.9,
    reviews: 410
  },
  "polestar-2-performance": {
    id: "polestar-2-performance",
    name: "Polestar 2 Performance",
    brand: "Polestar",
    price: 1600000,
    currency: "VND",
    period: "1 ngày",
    images: ["/anhxe/Polestar 2 Performance.jpg"],
    specifications: { seats: 5, transmission: "Số tự động", power: "408 HP", trunk: "405L", range: "470km (WLTP)", airbags: 6, type: "Sedan", limit: "300 km/ngày" },
    equipment: ["Hệ thống an toàn", "Bluetooth", "Công nghệ tiên tiến"],
    description: "Polestar 2 là sedan điện mang phong cách Scandinavian, cân bằng giữa hiệu suất và thiết kế.",
    features: ["Thiết kế tối giản", "Cân bằng hiệu suất", "Hệ thống an toàn"],
    rating: 4.5,
    reviews: 234
  },
  "nissan-leaf-eplus": {
    id: "nissan-leaf-eplus",
    name: "Nissan Leaf e+",
    brand: "Nissan",
    price: 700000,
    currency: "VND",
    period: "1 ngày",
    images: ["/anhxe/Nissan Leaf e+.jpg"],
    specifications: { seats: 5, transmission: "Số tự động", power: "214 HP", trunk: "435L", range: "385km", airbags: 6, type: "Compact", limit: "200 km/ngày" },
    equipment: ["Camera 360", "Bluetooth", "Cruise Control"],
    description: "Nissan Leaf e+ là xe điện cỡ nhỏ phổ biến, phù hợp cho di chuyển hàng ngày.",
    features: ["Chi phí vận hành thấp", "Dễ lái", "Tiện nghi cơ bản"],
    rating: 4.0,
    reviews: 398
  },
  "mini-cooper-se": {
    id: "mini-cooper-se",
    name: "MINI Cooper SE",
    brand: "MINI",
    price: 900000,
    currency: "VND",
    period: "1 ngày",
    images: ["/anhxe/MINI Cooper SE.jpg"],
    specifications: { seats: 4, transmission: "Số tự động", power: "181 HP", trunk: "211L", range: "270km", airbags: 4, type: "Compact", limit: "150 km/ngày" },
    equipment: ["Thiết kế retro", "Bluetooth", "Hệ thống an toàn"],
    description: "MINI Cooper SE là xe điện nhỏ gọn, phong cách cho đô thị.",
    features: ["Kích thước nhỏ gọn", "Linh hoạt trong phố", "Thiết kế phong cách"],
    rating: 4.2,
    reviews: 176
  }
};

// Helper function to get car data by ID
export const getCarById = (carId) => {
  return carDatabase[carId] || null;
};

// Helper function to get all car IDs
export const getAllCarIds = () => {
  return Object.keys(carDatabase);
};
