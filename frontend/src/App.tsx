import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import PageNotFound from "./pages/PageNotFound";
import AdminLayout from "@/components/layout/AdminLayout";
import RespondSurveyLayout from "@/components/layout/RespondSurveyLayout";
import SurveyAnalytics from "@/pages/SurveyAnalytics";
import CreateSurvey from "@/pages/CreateSurvey";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import RespondSurvey from "@/pages/RespondSurvey";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/otp" element={<OTPVerification />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />

            {/* Admin routes - protected */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="surveys/new" element={<CreateSurvey />}/>
                <Route path="surveys/:surveyId/edit" element={<CreateSurvey />} />
                <Route path="surveys/:surveyId/analytics" element={<SurveyAnalytics />} />
            </Route>
            {/* Public survey response route */}
            <Route path="/survey/:surveyId" element={<RespondSurveyLayout />}>
                <Route index element={<RespondSurvey />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
