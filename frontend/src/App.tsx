import "./css/App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import OTPVerification from "./pages/OTPVerification.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/auth/login" element={<Login/>}/>
              <Route path="/auth/signup" element={<Signup/>}/>
              <Route path="/auth/otp" element={<OTPVerification/>}/>
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
