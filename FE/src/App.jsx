import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<h2>Xin chào! Bạn đã đăng nhập thành công 🎉</h2>} />
        <Route path="/cars" element={<CarPages />} />
        <Route path="/car/:id" element={<CarDetail />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/contract/:id" element={<ContractPage />} />
        <Route path="/contract-success" element={<ProtectedRoute><ContractSuccessPage /></ProtectedRoute>} />
        <Route path="/deposit-payment" element={<ProtectedRoute><DepositPaymentPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

