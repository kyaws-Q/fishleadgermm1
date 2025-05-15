import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import ShipTrackingInfo from "@/components/ShipTrackingInfo";
import {
  LayoutDashboard,
  ShoppingCart,
  Ship,
  BarChart4,
  FileDown,
  Map,
  Settings,
  LogOut,
  Fish,
  Bell
} from "lucide-react";

export function Sidebar() {
  const { user, logout, companyName } = useApp();
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

  // Grouped navigation for clarity
  const mainNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Purchases", href: "/purchases", icon: ShoppingCart },
    { name: "Shipments", href: "/shipments", icon: Ship },
  ];
  const analyticsNav = [
    { name: "Analytics", href: "/analytics", icon: BarChart4 },
    { name: "Export", href: "/export", icon: FileDown },
    { name: "Tracker", href: "/tracker", icon: Map },
  ];
  const settingsNav = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="h-full flex flex-col py-6 px-3 bg-[#f6f7f9] rounded-2xl shadow-xl border border-[#e5e7eb] min-w-[220px] max-w-[260px] transition-all duration-300 font-sans">
      {/* Logo and brand */}
      <div className="px-2 mb-8">
        <div className="flex items-center gap-2">
          <Fish className="h-7 w-7 text-green-600" />
          <h1 className="text-xl font-bold tracking-tight font-sans text-gray-900">FishLedger</h1>
        </div>
        <div className="mt-1 text-xs text-gray-400 font-medium font-sans">
          {companyName || "Fish Export Company"}
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1">
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 pb-2 font-sans">Main</div>
          <div className="space-y-1">
            {mainNav.map((item) => (
              <Link key={item.name} to={item.href} className="block">
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="lg"
                  className={cn(
                    "w-full justify-start rounded-xl px-4 py-2 text-base font-semibold font-sans transition-all duration-200",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                      : "hover:bg-gray-100 hover:text-green-700 text-gray-700"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 pb-2 font-sans">Data & Tools</div>
          <div className="space-y-1">
            {analyticsNav.map((item) => (
              <Link key={item.name} to={item.href} className="block">
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="lg"
                  className={cn(
                    "w-full justify-start rounded-xl px-4 py-2 text-base font-semibold font-sans transition-all duration-200",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                      : "hover:bg-gray-100 hover:text-green-700 text-gray-700"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 pb-2 font-sans">Settings</div>
          <div className="space-y-1">
            {settingsNav.map((item) => (
              <Link key={item.name} to={item.href} className="block">
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="lg"
                  className={cn(
                    "w-full justify-start rounded-xl px-4 py-2 text-base font-semibold font-sans transition-all duration-200",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                      : "hover:bg-gray-100 hover:text-green-700 text-gray-700"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Ship Tracking Component */}
      <div className="px-2 mb-6">
        <ShipTrackingInfo />
      </div>

      {/* Footer with user controls */}
      <div className="px-2 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-gray-500 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>
          <ThemeSwitcher size="sm" />
        </div>
        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl px-4 py-2 text-base font-semibold font-sans"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
