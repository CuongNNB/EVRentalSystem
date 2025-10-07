import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CarPages from "./pages/CarPages";
import StationCarPages from "./pages/StationCarPages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/AvailableCar" element={<CarPages />} />
        <Route path="/StationCar" element={<StationCarPages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<h2>Xin chào! Bạn đã đăng nhập thành công 🎉</h2>} />
      </Routes>
    </Router>
  );
}

export default App;


