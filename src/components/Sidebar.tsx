
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BarChart3, 
  FileDown, 
  Settings, 
  LogOut 
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const { logout } = useApp();
  
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      name: "Purchases", 
      path: "/purchases", 
      icon: <ShoppingCart className="h-5 w-5" /> 
    },
    { 
      name: "Analytics", 
      path: "/analytics", 
      icon: <BarChart3 className="h-5 w-5" /> 
    },
    { 
      name: "Export Data", 
      path: "/export", 
      icon: <FileDown className="h-5 w-5" /> 
    },
    { 
      name: "Settings", 
      path: "/settings", 
      icon: <Settings className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="bg-background border-r h-screen w-64 p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center mb-8 pl-2">
        <div className="bg-ocean-600 text-white rounded-full p-2 mr-2">
          <div className="font-bold text-xl">FL</div>
        </div>
        <span className="font-bold text-xl text-ocean-600">FishLedger</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout Button */}
      <button
        onClick={logout}
        className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted mt-auto"
      >
        <LogOut className="h-5 w-5" />
        <span className="ml-3">Log Out</span>
      </button>
    </div>
  );
}
