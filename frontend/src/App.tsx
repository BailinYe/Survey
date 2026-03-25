import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import OTPVerification from "./pages/OTPVerification.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import AdminDashboard from "./pages/AdminDashboard"
import PageNotFound from "./pages/PageNotFound";
import AdminLayout from "@/components/layout/AdminLayout";
import SurveyAnalytics from "@/pages/SurveyAnalytics";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/otp" element={<OTPVerification />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />

              {/* Admin routes */}
              <Route path="/admin-dashboard" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="results" element={<SurveyAnalytics />} />
              </Route>

              <Route path="*" element={<PageNotFound />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
