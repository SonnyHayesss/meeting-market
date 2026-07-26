import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../types";

export function ProtectedRoute({ children, role }: { children: ReactElement; role?: Role }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="p-8 text-center text-cream/70">Загружаем расписание...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace />;
  }

  return children;
}
