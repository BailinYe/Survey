import "./css/App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import OTPVerification from "./pages/OTPVerification.tsx";
import ForgotPassword_step1 from "./pages/ForgotPassword_step1";
import ForgotPassword_step2 from "./pages/ForgotPassword_step2";
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
              <Route path="/auth/forgot-password/step1" element={<ForgotPassword_step1 />} />
              <Route path="/auth/forgot-password/step2" element={<ForgotPassword_step2 />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
