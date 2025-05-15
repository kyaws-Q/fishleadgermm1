import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Fish,
  BarChart4,
  Ship,
  Settings,
  LayoutDashboard,
  ShoppingCart,
  FileDown,
  Map,
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import ShipTrackingInfo from "@/components/ShipTrackingInfo";
import { Sidebar } from "@/components/Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background transition-all duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
        <div className="max-w-7xl mx-auto">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </div>
          </main>
    </div>
  );
}