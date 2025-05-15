import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useApp } from "@/contexts/AppContext";
import { Navigate, Outlet } from "react-router-dom";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const { user, isLoading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If still loading, don't redirect yet
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 to-background">
        <div className="animate-pulse p-4 bg-white/80 rounded-lg shadow-md">
          <div className="h-6 w-24 bg-ocean-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-32 bg-ocean-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to home page
  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className={cn(
      "flex min-h-screen bg-gradient-to-br from-ocean-50 to-background transition-all duration-300",
      mounted ? "opacity-100" : "opacity-0"
    )}>
      {/* Mobile sidebar toggle */}
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-[60] lg:hidden shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out shadow-lg bg-white z-50",
          isDesktop ? "w-64 shrink-0" : sidebarOpen ? "w-64 fixed inset-y-0 left-0 shrink-0" : "-translate-x-full fixed"
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
