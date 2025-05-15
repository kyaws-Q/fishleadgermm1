import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NotificationCenterProps {
  maxHeight?: string;
  className?: string;
}

export function NotificationCenter({
  maxHeight = '400px',
  className,
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotifications();
  
  const [open, setOpen] = useState(false);
  
  // Handle opening the notification center
  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    // Mark all as read when closing
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };
  
  // Render a single notification
  const renderNotification = (notification: Notification) => {
    const { id, title, message, type, timestamp, read, action } = notification;
    
    return (
      <div
        key={id}
        className={cn(
          'p-4 transition-colors duration-200 hover:bg-muted/50 relative',
          !read && 'bg-muted/30'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-2 h-2 rounded-full mt-2',
              type === 'info' && 'bg-blue-500',
              type === 'success' && 'bg-green-500',
              type === 'warning' && 'bg-yellow-500',
              type === 'error' && 'bg-red-500',
              read && 'opacity-50'
            )}
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm">{title}</h4>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(timestamp)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{message}</p>
            {action && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {!read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => markAsRead(id)}
              >
                <Check className="h-3 w-3" />
                <span className="sr-only">Mark as read</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => removeNotification(id)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'No new notifications'}
            </p>
          </div>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={clearNotifications}
                title="Clear all notifications"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {notifications.length > 0 ? (
          <ScrollArea className={`max-h-[${maxHeight}]`}>
            <div className="divide-y">
              {notifications.map(renderNotification)}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
