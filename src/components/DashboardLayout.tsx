
import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useApp } from "@/contexts/AppContext";
import { Navigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useApp();
  
  // If still loading, don't redirect yet
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
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
        {children}
      </main>
    </div>
  );
}
