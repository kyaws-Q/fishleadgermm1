import {
  Bell,
  CalendarDays,
  Menu,
  Search,
  ShoppingCart,
  UserCircle,
  RefreshCw,
  LayoutGrid,
  Settings,
  LogOut,
  Fish,
  Anchor,
  Ship,
  Users,
  LineChart,
  X,
  Check,
  ExternalLink,
  DollarSign,
  FileDown, // Added for Export
  Map as LucideMap // Added for Tracker, aliased
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DashboardHeaderProps {
  onNewPurchaseClick: () => void;
  onRefreshDataClick: () => void;
  isDataLoading: boolean;
  userName?: string;
  lastUpdated?: Date;
}

// Define the interface for a notification item
interface NotificationItem {
  id: number;
  title: string;
  description: string;
  details: string;
  time: string;
  read: boolean;
  type: string;
}

export function DashboardHeader({
  onNewPurchaseClick,
  onRefreshDataClick,
  isDataLoading,
  userName,
  lastUpdated
}: DashboardHeaderProps) {
  const { user, logout, companyName } = useApp();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  
  // State for notifications with read/unread status
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: "New Purchase Added",
      description: "A new purchase of 500kg Red Snapper was added by admin",
      details: "Purchase ID: PUR-2023-42\nVendor: Ocean Fresh Supplies\nAmount: $2,450.00\nDate: May 9, 2023\nStatus: Processing",
      time: "10 minutes ago",
      read: false,
      type: "purchase"
    },
    {
      id: 2,
      title: "Payment Received",
      description: "Payment $750.00 received from Ocean Treasures Inc.",
      details: "Transaction ID: TRX-58921\nCustomer: Ocean Treasures Inc.\nAmount: $750.00\nPayment Method: Bank Transfer\nReference: INV-2023-089",
      time: "2 hours ago",
      read: false,
      type: "payment"
    },
    {
      id: 3,
      title: "System Update",
      description: "System will be updated tonight at 2AM. Please save your work.",
      details: "Update Version: 2.4.1\nScheduled Time: May 10, 2023, 2:00 AM\nEstimated Downtime: 30 minutes\n\nChanges include:\n- Improved purchase tracking\n- New reporting features\n- Bug fixes for inventory management",
      time: "Yesterday",
      read: false,
      type: "system"
    }
  ]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: <LayoutGrid className="h-4 w-4" />, path: "/dashboard" },
    { name: "Purchases", icon: <ShoppingCart className="h-4 w-4" />, path: "/purchases" },
    { name: "Shipments", icon: <Ship className="h-4 w-4" />, path: "/shipments" },
    { name: "Export", icon: <FileDown className="h-4 w-4" />, path: "/export" },
    { name: "Tracker", icon: <LucideMap className="h-4 w-4" />, path: "/tracker" },
    { name: "Settings", icon: <Settings className="h-4 w-4" />, path: "/settings" },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = userName || user?.name || user?.email?.split('@')[0] || "User";

  // Mark a single notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map((notification: NotificationItem) => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notification: NotificationItem) => ({ ...notification, read: true })));
  };

  // View a notification's details
  const viewNotificationDetails = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    markAsRead(notification.id);
    setNotificationDialogOpen(true);
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-0 border-b bg-white px-4 md:px-8 shadow-sm">
      <div className="flex items-center justify-between h-16 w-full">
        {/* Search Bar */}
        <form className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search transactions, customers..."
              className="pl-9 pr-3 py-2 w-full rounded-lg border border-gray-200 bg-white focus:border-gray-400 focus:bg-white text-sm shadow-none"
            />
          </div>
        </form>
        {/* Right Side: Notifications and User */}
        <div className="flex items-center gap-4 ml-4">
          {/* Notification Icon */}
        <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full text-gray-700 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-600 text-white shadow-md" color="green">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b bg-muted/10 flex justify-between items-center">
              <h4 className="font-medium leading-none">Notifications</h4>
              {notifications.filter(n => !n.read).length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 px-2 text-primary"
                  onClick={markAllAsRead}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "px-4 py-3 border-b last:border-0 hover:bg-muted/10 transition-colors duration-200",
                      !notification.read && "bg-blue-50/10"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <h5 className={cn(
                            "font-medium text-sm", 
                            !notification.read && "text-blue-600"
                          )}>
                            {notification.title}
                          </h5>
                          <p className="text-xs mt-1 text-muted-foreground line-clamp-2">{notification.description}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{notification.time}</span>
                    </div>
                    <div className="flex mt-2 justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2 text-primary"
                        onClick={() => viewNotificationDetails(notification)}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2 text-primary"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t bg-muted/10 text-center">
                <Button variant="link" size="sm" className="text-xs text-primary hover:no-underline">
                  View all notifications
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{user?.name || userName}</p>
              <p className="text-xs text-gray-500 max-w-[120px] truncate">{user?.email}</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                  <Avatar className="h-9 w-9 ring-2 ring-gray-200">
                    <AvatarImage src={user?.profileUrl} alt={user?.name || userName} />
                    <AvatarFallback className="bg-gray-200 text-gray-700 font-medium">{(user?.name || userName || "U").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="py-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">{user?.name || "User Profile"}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
                </div>
                <hr className="my-1" />
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={onRefreshDataClick} disabled={isDataLoading}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isDataLoading && "animate-spin")} />
                  {isDataLoading ? "Refreshing..." : "Refresh Data"}
                </Button>
                <hr className="my-1" />
                <Button variant="ghost" className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      </div>
      {/* Notification detail dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && getNotificationIcon(selectedNotification.type)}
              {selectedNotification?.title}
            </DialogTitle>
            <DialogDescription className="text-right text-xs">
              {selectedNotification?.time}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{selectedNotification?.description}</p>
            <div className="bg-muted/20 p-3 rounded-md whitespace-pre-line text-sm text-muted-foreground">
              {selectedNotification?.details}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setNotificationDialogOpen(false)}>
                Close
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  // Action would depend on notification type
                  if (selectedNotification?.type === 'purchase') {
                    setNotificationDialogOpen(false);
                    navigate('/purchases');
                  } else if (selectedNotification?.type === 'payment') {
                    setNotificationDialogOpen(false);
                    navigate('/reports');
                  }
                }}
              >
                {selectedNotification?.type === 'purchase' ? 'View Purchase' : 
                 selectedNotification?.type === 'payment' ? 'View Payment' : 'Acknowledge'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
