import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Film,
  Edit,
  UserPlus,
  MessageSquare,
  Star,
  Trophy,
  Heart,
  ExternalLink,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type:
    | "script_created"
    | "project_created"
    | "member_joined"
    | "forum_post"
    | "friend_added"
    | "festival_submission";
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
    militaryBranch?: string;
  };
  content: {
    title: string;
    description?: string;
    link?: string;
  };
  createdAt: string;
  metadata?: any;
}

export function ActivityFeed() {
  // typed query + fetcher
  const { data: activities = [], isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities");
      if (!res.ok) return [];
      return (await res.json()) as ActivityItem[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "script_created":
        return <Edit className="w-5 h-5 text-blue-500" />;
      case "project_created":
        return <Film className="w-5 h-5 text-purple-500" />;
      case "member_joined":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "forum_post":
        return <MessageSquare className="w-5 h-5 text-orange-500" />;
      case "friend_added":
        return <Heart className="w-5 h-5 text-pink-500" />;
      case "festival_submission":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const name = `${activity.user.firstName} ${activity.user.lastName}`;
    switch (activity.type) {
      case "script_created":
        return `${name} created a new script: "${activity.content.title}"`;
      case "project_created":
        return `${name} started a new project: "${activity.content.title}"`;
      case "member_joined":
        return `${name} joined the community`;
      case "forum_post":
        return `${name} posted in the forum: "${activity.content.title}"`;
      case "friend_added":
        return `${name} connected with ${activity.content.title}`;
      case "festival_submission":
        return `${name} submitted to "${activity.content.title}"`;
      default:
        return `${name} had an activity`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 animate-pulse"
              >
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Community Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={activity.user.profileImageUrl || undefined}
                      alt={activity.user.firstName || "User"}
                    />
                    <AvatarFallback>
                      {activity.user.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                    {activity.user.role === "verified" && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-1 py-0"
                      >
                        <Star className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed">
                    {getActivityText(activity)}
                  </p>

                  {activity.content.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {activity.content.description}
                    </p>
                  )}

                  {activity.content.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 px-0 h-auto text-xs"
                      data-testid={`activity-link-${activity.id}`}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">
              Community activity will appear here as members engage
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
