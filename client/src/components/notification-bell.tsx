import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationCenter } from "./notification-center";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 10000, // Refetch every 10 seconds
    enabled: isAuthenticated,
  });

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;
    
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('Notification WebSocket connected');
          // Send authentication message
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.id) {
            ws.send(JSON.stringify({
              type: 'authenticate',
              userId: user.id
            }));
          }
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              // Refresh notification count when new notification received
              // The actual notification will be handled by the NotificationCenter
              setTimeout(() => {
                window.location.reload(); // Simple refresh for now
              }, 100);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('Notification WebSocket disconnected');
          // Attempt to reconnect after 3 seconds
          reconnectTimer = setTimeout(connect, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reconnectTimer = setTimeout(connect, 3000);
      }
    };
    
    connect();
    
    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.close();
      }
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative text-honor-gold hover:text-honor-gold/80 hover:bg-honor-gold/10",
            className
          )}
          data-testid="notification-bell"
        >
          <Bell className="h-5 w-5" />
          {unreadCount.count > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                "bg-red-500 hover:bg-red-500 border-tactical-black"
              )}
              data-testid="notification-count"
            >
              {unreadCount.count > 99 ? '99+' : unreadCount.count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 border-honor-gold/20 bg-tactical-black/95 backdrop-blur-sm" 
        align="end"
        side="bottom"
        sideOffset={5}
      >
        <NotificationCenter onNotificationClick={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}