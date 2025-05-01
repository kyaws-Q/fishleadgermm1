
import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useApp } from "@/contexts/AppContext";
import { Navigate } from "react-router-dom";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
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
    <div className="flex min-h-screen bg-[#f8f9fd]">
      {/* Mobile sidebar toggle */}
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen || isDesktop ? 'block' : 'hidden'} w-64 shrink-0`}>
        <Sidebar />
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 pt-4">
        {children}
      </main>
    </div>
  );
}
