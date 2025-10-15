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
import ContractSuccessPage from "./pages/ContractSuccessPage";
import DepositPaymentPage from "./pages/DepositPaymentPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ContractDemoPage from "./pages/ContractDemoPage";
import DemoFlowPage from "./pages/DemoFlowPage";
import DashboardUser from "./pages/DashboardUser";
import CustomerInfoPage from "./pages/CustomerInfoPage";
import StaffLayout from "./pages/staff/StaffLayout";
import OrdersList from "./pages/staff/Orders/OrdersList";
import OrderDetail from "./pages/staff/Orders/OrderDetail";
import HandoverCar from "./pages/staff/Orders/HandoverCar";
import ReturnCar from "./pages/staff/Orders/CheckCar";
import ExtraFee from "./pages/staff/Orders/ExtraFee";
import StationCarView from "./pages/StationCarView";
import MapStationsDemo from "./pages/MapStationsDemo";
import TestPage from "./pages/TestPage";
import CheckCar from "./pages/staff/Orders/CheckCar";

import UserContract from "./pages/renter/UserContract";
import MyBookings from "./pages/MyBookings";
import BookingDetail from "./pages/BookingDetail";

function App() {
    console.log('App component is rendering...');

    return (
        <AuthProvider>
            <CheckoutProvider>
                <Router>
                    <Routes>
                        <Route path="/user-contract" element={<UserContract/>} />
                        <Route path="/" element={<Homepage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardUser /></ProtectedRoute>} />
                        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                        <Route path="/my-bookings/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
                        <Route path="/cars" element={<CarPages />} />
                        <Route path="/car/:id" element={<CarDetail />} />
                        <Route path="/booking/:carId" element={<BookingPage />} />
                        <Route path="/contract/:carId" element={<ContractPage />} />
                        <Route path="/contract-success" element={<ProtectedRoute><ContractSuccessPage /></ProtectedRoute>} />
                        <Route path="/deposit-payment" element={<ProtectedRoute><DepositPaymentPage /></ProtectedRoute>} />
                        <Route path="/customer-info" element={<ProtectedRoute><CustomerInfoPage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/checkout/success" element={<PaymentSuccessPage />} />
                        <Route path="/contract-demo" element={<ContractDemoPage />} />
                        <Route path="/demo-flow" element={<DemoFlowPage />} />
                        <Route path="/staff" element={<ProtectedRoute><StaffLayout /></ProtectedRoute>} />
                        <Route path="/staff/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
                        <Route path="/staff/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                        <Route path="/staff/orders/:orderId/handover" element={<ProtectedRoute><HandoverCar /></ProtectedRoute>} />
                        <Route path="/staff/orders/:orderId/handover/check" element={<ProtectedRoute><CheckCar /></ProtectedRoute>} />
                        <Route path="/staff/orders/:orderId/extra-fee" element={<ProtectedRoute><ExtraFee /></ProtectedRoute>} />
                        <Route path="/station-cars" element={<StationCarView />} />
                        <Route path="/map-stations" element={<MapStationsDemo />} />
                        <Route path="/test" element={<TestPage />} />
                    </Routes>
                </Router>
            </CheckoutProvider>
        </AuthProvider>
    );
}

export default App;
// Compare this snippet from src/pages/ContractDemoPage.jsx: