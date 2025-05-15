import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useApp();
  
  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  // If not logged in, redirect to home page
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // If logged in, render the children
  return <>{children}</>;
}
