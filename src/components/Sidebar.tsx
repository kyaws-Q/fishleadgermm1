
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart4,
  FileDown,
  Settings,
  LogOut,
  Ship,
} from "lucide-react";
import { ShipTrackingInfo } from "./ShipTrackingInfo";

export function Sidebar() {
  const { user, logout } = useApp();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }
  
  const handleLogout = () => {
    if (logout) logout();
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Purchases",
      href: "/purchases",
      icon: ShoppingCart,
    },
    {
      name: "Shipments",
      href: "/shipments",
      icon: Ship,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart4,
    },
    {
      name: "Export",
      href: "/export",
      icon: FileDown,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-white border-r flex flex-col">
      {/* App Logo & Title */}
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/fishledger-logo.svg"
            alt="FishLedger Logo"
            className="h-8 w-8"
          />
          <h1 className="font-bold text-xl">FishLedger</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link to={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Ship Tracking Component */}
      <div className="mt-auto p-4">
        <ShipTrackingInfo />
      </div>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="font-medium truncate">
              {user.name || user.email}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:inline-block">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
