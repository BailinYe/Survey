import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard"
import PageNotFound from "./pages/PageNotFound";
import AdminLayout from "@/components/layout/AdminLayout";
import SurveyAnalytics from "@/pages/SurveyAnalytics";
import CreateSurvey from "@/pages/CreateSurvey";

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
                  <Route path="surveys/new" element={<CreateSurvey />}/>
                  <Route path="results" element={<SurveyAnalytics />} />
              </Route>

              <Route path="*" element={<PageNotFound />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
