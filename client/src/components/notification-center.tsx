import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Check, CheckCheck, X, ExternalLink, MessageSquare, Clapperboard, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'ai_task_complete' | 'message_received' | 'friend_request' | 'project_invite' | 'script_shared' | 'forum_reply' | 'system_alert' | 'credit_awarded';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: any;
  createdAt: string;
  readAt?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'ai_task_complete':
      return <Clapperboard className="h-4 w-4 text-honor-gold" />;
    case 'message_received':
      return <MessageSquare className="h-4 w-4 text-blue-400" />;
    case 'friend_request':
      return <Bell className="h-4 w-4 text-green-400" />;
    case 'project_invite':
      return <ExternalLink className="h-4 w-4 text-purple-400" />;
    case 'script_shared':
      return <BarChart3 className="h-4 w-4 text-orange-400" />;
    case 'forum_reply':
      return <MessageSquare className="h-4 w-4 text-cyan-400" />;
    case 'system_alert':
      return <Bell className="h-4 w-4 text-red-400" />;
    case 'credit_awarded':
      return <Zap className="h-4 w-4 text-yellow-400" />;
    default:
      return <Bell className="h-4 w-4 text-gray-400" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'ai_task_complete':
      return 'border-l-honor-gold bg-honor-gold/5';
    case 'message_received':
      return 'border-l-blue-400 bg-blue-400/5';
    case 'friend_request':
      return 'border-l-green-400 bg-green-400/5';
    case 'project_invite':
      return 'border-l-purple-400 bg-purple-400/5';
    case 'script_shared':
      return 'border-l-orange-400 bg-orange-400/5';
    case 'forum_reply':
      return 'border-l-cyan-400 bg-cyan-400/5';
    case 'system_alert':
      return 'border-l-red-400 bg-red-400/5';
    case 'credit_awarded':
      return 'border-l-yellow-400 bg-yellow-400/5';
    default:
      return 'border-l-gray-400 bg-gray-400/5';
  }
};

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationCenter({ onNotificationClick }: NotificationCenterProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest("PATCH", `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "All notifications marked as read",
        description: "Your notification center has been cleared.",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest("DELETE", `/api/notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <Card className="w-full max-w-md bg-tactical-black/90 border-honor-gold/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-honor-gold font-orbitron flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Tactical Command Center
        </CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount.count > 0 && (
            <Badge variant="secondary" className="bg-honor-gold text-tactical-black">
              {unreadCount.count} new
            </Badge>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="border-honor-gold/20 text-honor-gold hover:bg-honor-gold/10"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">All Clear, Commander</p>
            <p className="text-sm">No new notifications at this time.</p>
          </div>
        ) : (
          <ScrollArea className="h-80 max-h-80">
            <div className="space-y-3">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200",
                    getNotificationColor(notification.type),
                    !notification.isRead ? "opacity-100" : "opacity-70",
                    "hover:shadow-lg"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-medium text-foreground text-sm truncate">
                            {notification.title}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1 line-clamp-2 break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-2 truncate">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-honor-gold rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                            data-testid={`delete-notification-${notification.id}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {notification.actionUrl && (
                    <div className="mt-2 pt-2 border-t border-muted/20">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-honor-gold text-xs hover:text-honor-gold/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = notification.actionUrl!;
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}