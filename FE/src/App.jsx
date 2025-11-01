// import "./App.css";
// import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
// import {AuthProvider} from "./contexts/AuthContext";
// import {CheckoutProvider} from "./contexts/CheckoutContext";

// // Guards
// import ProtectedRoute from "./components/ProtectedRoute";
// import StaffGuard from "./components/StaffGuard";
// import AdminGuard from "./pages/admin/AdminGuard";

// // Public pages
// import Homepage from "./pages/Homepage";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import CarPages from "./pages/CarPages";
// import CarDetail from "./pages/CarDetail";
// import BookingPage from "./pages/BookingPage";
// import ContractPage from "./pages/ContractPage";
// import StationCarView from "./pages/StationCarView";
// import MapStationsDemo from "./pages/MapStations";
// import UserContract from "./pages/renter/UserContract";
// import PromoPage from "./pages/PromoList.jsx";
// import Forbidden from "./pages/Forbidden";

// // Auth-required (renter)
// import DepositPaymentPage from "./pages/DepositPaymentPage";
// import DashboardUser from "./pages/DashboardUser";
// import CustomerInfoPage from "./pages/CustomerInfoPage";
// import MyBookings from "./pages/MyBookings";
// import BookingDetailHistory from "./pages/BookingDetailHistory.jsx";
// import UserProfilePage from "./pages/UserProfilePage";

// // Staff area (/staff)
// import StaffLayout from "./pages/staff/StaffLayout";
// import OrdersList from "./pages/staff/Orders/OrdersList";
// import OrderDetail from "./pages/staff/Orders/OrderDetail";
// import HandoverCar from "./pages/staff/Orders/HandoverCar";
// import ExtraFee from "./pages/staff/Orders/ExtraFee";
// import CheckCar from "./pages/staff/Orders/CheckCar";
// import StaffReport from "./pages/staff/StaffReport.jsx";
// import ReceiveCar from "./pages/staff/Orders/ReceiveCar.jsx";

// // Admin area (/admin)
// import AdminDashboard, {AdminOverview} from "./pages/admin/AdminDashboard";
// import AnalyticsPage from "./pages/admin/AnalyticsPage";
// import CustomerManagement from "./pages/admin/CustomerManagement";
// import CustomerDetailManagement from './pages/admin/CustomerDetailManagement'
// import StaffManagement from "./pages/admin/StaffManagement";
// import VehicleManagement from "./pages/admin/VehicleManagement";
// import StaffDetailPage from "./components/admin/StaffDetailPage";
// import AddStaffPage from "./components/admin/AddStaffPage";

// function App() {
//     console.log("App component is rendering...");

//     return (
//         <AuthProvider>
//             <CheckoutProvider>
//                 <Router>
//                     <Routes>
//                         {/* PUBLIC */}
//                         <Route path="/" element={<Homepage/>}/>
//                         <Route path="/login" element={<Login/>}/>
//                         <Route path="/register" element={<Register/>}/>
//                         <Route path="/cars" element={<CarPages/>}/>
//                         <Route path="/car/:id" element={<CarDetail/>}/>
//                         <Route path="/booking/:carId" element={<BookingPage/>}/>
//                         <Route path="/contract/:carId" element={<ContractPage/>}/>
//                         <Route path="/user-contract" element={<UserContract/>}/>
//                         <Route path="/station-cars" element={<StationCarView/>}/>
//                         <Route path="/map-stations" element={<MapStationsDemo/>}/>
//                         <Route path="/promo" element={<PromoPage/>}/>

//                         {/* AUTH-REQUIRED (RENTER) */}
//                         <Route element={<ProtectedRoute/>}>
//                             <Route path="/dashboard" element={<DashboardUser/>}/>
//                             <Route path="/my-bookings" element={<MyBookings/>}/>
//                             <Route path="/my-bookings/:id" element={<BookingDetailHistory/>}/>
//                             <Route path="/account" element={<UserProfilePage/>}/>
//                             <Route path="/deposit-payment" element={<DepositPaymentPage/>}/>
//                             <Route path="/customer-info" element={<CustomerInfoPage/>}/>
//                         </Route>

//                         {/* STAFF AREA (/staff) */}
//                         <Route element={<ProtectedRoute/>}>
//                             <Route element={<StaffGuard/>}>
//                                 <Route path="/staff" element={<StaffLayout/>}>
//                                     <Route index element={<OrdersList/>}/>
//                                     <Route path="orders" element={<OrdersList/>}/>
//                                     <Route path="orders/:orderId" element={<OrderDetail/>}/>
//                                     <Route path="orders/:orderId/handover" element={<HandoverCar/>}/>
//                                     <Route path="orders/:orderId/handover/check" element={<CheckCar/>}/>
//                                     <Route path="orders/:orderId/extra-fee" element={<ExtraFee/>}/>
//                                     <Route path="orders/:orderId/receive" element={<ReceiveCar/>}/>
//                                     <Route path="report" element={<StaffReport/>}/>
//                                 </Route>
//                             </Route>
//                         </Route>

//                         {/* ADMIN AREA (/admin) */}
//                         <Route element={<AdminGuard/>}>
//                             <Route path="/admin" element={<AdminDashboard/>}>
//                                 <Route index element={<AdminOverview/>}/>
//                                 <Route path="overview" element={<AdminOverview/>}/>
//                                 <Route path="analytics" element={<AnalyticsPage/>}/>
//                                 <Route path="customers" element={<CustomerManagement/>}/>
//                                 <Route path="staff" element={<StaffManagement/>}/>
//                                 <Route path="vehicles" element={<VehicleManagement/>}/>
//                                 <Route path="staff/:id" element={<StaffDetailPage/>}/>
//                                 <Route path="staff/new" element={<AddStaffPage/>}/>
//                                 <Route path="/admin/customers/:userId" element={<CustomerDetailManagement/>}/>
//                             </Route>
//                         </Route>

//                         {/* SYSTEM PAGES */}
//                         <Route path="/403" element={<Forbidden/>}/>

//                         <Route path="*" element={<Navigate to="/403" replace/>}/>
//                     </Routes>
//                 </Router>
//             </CheckoutProvider>
//         </AuthProvider>
//     );
// }

// export default App;

import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CheckoutProvider } from "./contexts/CheckoutContext";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";
import StaffGuard from "./components/StaffGuard";
import AdminGuard from "./pages/admin/AdminGuard";

// Public pages
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CarPages from "./pages/CarPages";
import CarDetail from "./pages/CarDetail";
import BookingPage from "./pages/BookingPage";
import ContractPage from "./pages/ContractPage";
import StationCarView from "./pages/StationCarView";
import MapStationsDemo from "./pages/MapStations";
import UserContract from "./pages/renter/UserContract";
import PromoPage from "./pages/PromoList.jsx";
import Forbidden from "./pages/Forbidden";

// Auth-required (renter)
import DepositPaymentPage from "./pages/DepositPaymentPage";
import DashboardUser from "./pages/DashboardUser";
import CustomerInfoPage from "./pages/CustomerInfoPage";
import MyBookings from "./pages/MyBookings";
import BookingDetailHistory from "./pages/BookingDetailHistory.jsx";
import UserProfilePage from "./pages/UserProfilePage";

// Staff area (/staff)
import StaffLayout from "./pages/staff/StaffLayout";
import OrdersList from "./pages/staff/Orders/OrdersList";
import OrderDetail from "./pages/staff/Orders/OrderDetail";
import HandoverCar from "./pages/staff/Orders/HandoverCar";
import ExtraFee from "./pages/staff/Orders/ExtraFee";
import CheckCar from "./pages/staff/Orders/CheckCar";
import StaffReport from "./pages/staff/StaffReport.jsx";
import ReceiveCar from "./pages/staff/Orders/ReceiveCar.jsx";

// Admin area (/admin)
import AdminDashboard, { AdminOverview } from "./pages/admin/AdminDashboard";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import CustomerManagement from "./pages/admin/CustomerManagement";
import CustomerDetailManagement from "./pages/admin/CustomerDetailManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import VehicleManagement from "./pages/admin/VehicleManagement";
import StaffDetailPage from "./components/admin/StaffDetailPage";
import AddStaffPage from "./components/admin/AddStaffPage";

function App() {
  console.log("App component is rendering...");

  return (
    <AuthProvider>
      <CheckoutProvider>
        <Router>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cars" element={<CarPages />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/booking/:carId" element={<BookingPage />} />
            <Route path="/contract/:carId" element={<ContractPage />} />
            <Route path="/user-contract" element={<UserContract />} />
            <Route path="/station-cars" element={<StationCarView />} />
            <Route path="/map-stations" element={<MapStationsDemo />} />
            <Route path="/promo" element={<PromoPage />} />

            {/* AUTH-REQUIRED (RENTER) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardUser />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/my-bookings/:id" element={<BookingDetailHistory />} />
              <Route path="/account" element={<UserProfilePage />} />
              <Route path="/deposit-payment" element={<DepositPaymentPage />} />
              <Route path="/customer-info" element={<CustomerInfoPage />} />
            </Route>

            {/* STAFF AREA (/staff) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<StaffGuard />}>
                <Route path="/staff" element={<StaffLayout />}>
                  <Route index element={<OrdersList />} />
                  <Route path="orders" element={<OrdersList />} />
                  <Route path="orders/:orderId" element={<OrderDetail />} />
                  <Route path="orders/:orderId/handover" element={<HandoverCar />} />
                  <Route path="orders/:orderId/handover/check" element={<CheckCar />} />
                  <Route path="orders/:orderId/extra-fee" element={<ExtraFee />} />
                  <Route path="orders/:orderId/receive" element={<ReceiveCar />} />
                  <Route path="report" element={<StaffReport />} />
                </Route>
              </Route>
            </Route>

            {/* ADMIN AREA (/admin) */}
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<AdminOverview />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="customers/:userId" element={<CustomerDetailManagement />} /> {/* fixed */}
                <Route path="staff" element={<StaffManagement />} />
                <Route path="vehicles" element={<VehicleManagement />} />
                <Route path="staff/:id" element={<StaffDetailPage />} />
                <Route path="staff/new" element={<AddStaffPage />} />
              </Route>
            </Route>

            {/* SYSTEM PAGES */}
            <Route path="/403" element={<Forbidden />} />

            <Route path="*" element={<Navigate to="/403" replace />} />
          </Routes>
        </Router>
      </CheckoutProvider>
    </AuthProvider>
  );
}

export default App;
