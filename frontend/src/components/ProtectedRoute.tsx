import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // 或显示加载组件
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
