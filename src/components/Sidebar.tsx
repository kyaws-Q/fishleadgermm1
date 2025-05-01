
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BarChart3, 
  FileDown, 
  Settings, 
  LogOut,
  User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const location = useLocation();
  const { user, logout, companyName } = useApp();
  
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
    <div className="bg-white border-r h-screen w-64 p-5 flex flex-col fixed">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-8">
        <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
          <AvatarImage src="" />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-medium text-sm">{user?.name || "User"}</p>
          <p className="text-xs text-muted-foreground">{companyName || "FishLedger"}</p>
        </div>
      </div>
      
      {/* Main Categories */}
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground mb-3 px-3 uppercase">
          Main
        </p>
        <nav className="space-y-1">
          {navItems.slice(0, 2).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Tools Categories */}
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground mb-3 px-3 uppercase">
          Tools
        </p>
        <nav className="space-y-1">
          {navItems.slice(2, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Settings */}
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground mb-3 px-3 uppercase">
          Preferences
        </p>
        <nav className="space-y-1">
          {navItems.slice(4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User Profile at Bottom */}
      <div className="mt-auto border-t pt-4">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Log Out</span>
        </button>
      </div>
    </div>
  );
}
