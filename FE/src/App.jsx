import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CheckoutProvider } from "./contexts/CheckoutContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CarPages from "./pages/CarPages";
import CarDetail from "./pages/CarDetail";
import BookingPage from "./pages/BookingPage";
import ContractPage from "./pages/ContractPage";
import DepositPaymentPage from "./pages/DepositPaymentPage";
import DashboardUser from "./pages/DashboardUser";
import CustomerInfoPage from "./pages/CustomerInfoPage";
import StaffLayout from "./pages/staff/StaffLayout";
import OrdersList from "./pages/staff/Orders/OrdersList";
import OrderDetail from "./pages/staff/Orders/OrderDetail";
import HandoverCar from "./pages/staff/Orders/HandoverCar";
import ExtraFee from "./pages/staff/Orders/ExtraFee";
import StationCarView from "./pages/StationCarView";
import MapStationsDemo from "./pages/MapStations";
import CheckCar from "./pages/staff/Orders/CheckCar";
import UserContract from "./pages/renter/UserContract";
import MyBookings from "./pages/MyBookings";
import BookingDetailHistory from "./pages/BookingDetailHistory.jsx";
import UserProfilePage from "./pages/UserProfilePage";
import Forbidden from "./pages/Forbidden";
import PromoPage from "./pages/PromoList.jsx";
import StaffReport from "./pages/staff/StaffReport.jsx";
import ReceiveCar from "./pages/staff/Orders/ReceiveCar.jsx";


import StaffGuard from "./components/StaffGuard";
function App() {
    console.log('App component is rendering...');

    return (
        <AuthProvider>
            <CheckoutProvider>
                <Router>
                    <Routes>
                        //Phần trang của Renter
                        <Route path="/user-contract" element={<UserContract />} /> //Trang Hợp đồng người thuê
                        <Route path="/" element={<Homepage />} /> //Trang Homepage
                        <Route path="/login" element={<Login />} /> //Trang Đăng nhập
                        <Route path="/register" element={<Register />} /> //Trang Đăng ký
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardUser /></ProtectedRoute>} /> //Trang
                        Dashboard người dùng
                        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} /> //Trang
                        Đơn đặt xe của tôi
                        <Route path="/my-bookings/:id"
                               element={<ProtectedRoute><BookingDetailHistory /></ProtectedRoute>} /> //Trang Chi tiết đơn
                        đặt xe
                        <Route path="/account" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} /> //Trang
                        Hồ sơ người dùng
                        <Route path="/cars" element={<CarPages />} /> //Trang danh sách xe có sẵn
                        <Route path="/car/:id" element={<CarDetail />} /> //Trang Chi tiết xe
                        <Route path="/booking/:carId" element={<BookingPage />} /> //Trang Đặt xe
                        <Route path="/contract/:carId" element={<ContractPage />} /> //Trang Hợp đồng
                        <Route path="/deposit-payment"
                               element={<ProtectedRoute><DepositPaymentPage /></ProtectedRoute>} /> //Trang Thanh toán đặt
                        cọc
                        <Route path="/customer-info"
                               element={<ProtectedRoute><CustomerInfoPage /></ProtectedRoute>} /> //Trang Thông tin khách
                        hàng
                        <Route path="/station-cars" element={<StationCarView />} />
                        <Route path="/map-stations" element={<MapStationsDemo />} />
                        <Route path="/promo" element={<PromoPage />} />

                        //Phần trang của Staff
                        <Route element={<StaffGuard />}>
                            <Route path="/staff" element={<ProtectedRoute><StaffLayout /></ProtectedRoute>} />
                            <Route path="/staff/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
                            <Route path="/staff/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                            <Route path="/staff/orders/:orderId/handover" element={<ProtectedRoute><HandoverCar /></ProtectedRoute>} />
                            <Route path="/staff/orders/:orderId/handover/check" element={<ProtectedRoute><CheckCar /></ProtectedRoute>} />
                            <Route path="/staff/orders/:orderId/extra-fee" element={<ProtectedRoute><ExtraFee /></ProtectedRoute>} />
                            <Route path="/staff/report" element={<ProtectedRoute><StaffReport /></ProtectedRoute>} />
                            <Route path="/staff/orders/:orderId/receive" element={<ProtectedRoute><ReceiveCar /></ProtectedRoute>} />
                        </Route>

                        

                        <Route path="/403" element={<Forbidden />} />
                    </Routes>
                </Router>
            </CheckoutProvider>
        </AuthProvider>
    );
}

export default App;
