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

function App() {
  return (
    <AuthProvider>
      <CheckoutProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardUser /></ProtectedRoute>} />
            <Route path="/cars" element={<CarPages />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/contract/:id" element={<ContractPage />} />
            <Route path="/contract-success" element={<ProtectedRoute><ContractSuccessPage /></ProtectedRoute>} />
            <Route path="/deposit-payment" element={<ProtectedRoute><DepositPaymentPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<PaymentSuccessPage />} />
              <Route path="/contract-demo" element={<ContractDemoPage />} />
              <Route path="/demo-flow" element={<DemoFlowPage />} />
          </Routes>
        </Router>
      </CheckoutProvider>
    </AuthProvider>
  );
}

export default App;

