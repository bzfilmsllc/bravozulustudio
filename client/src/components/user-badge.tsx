import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Trophy, Star, Award, Crown, Heart, Users, Shield, 
  Zap, Medal
} from "lucide-react";

// Icon mapping for tiers
const iconMap = {
  Trophy, Star, Award, Crown, Heart, Users, Shield, Zap, Medal
};

interface UserBadgeProps {
  variant?: "compact" | "full";
  showAchievementCount?: boolean;
}

export function UserBadge({ variant = "compact", showAchievementCount = false }: UserBadgeProps) {
  const { data: userTier, isLoading: tierLoading } = useQuery({
    queryKey: ["/api/user/tier"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/achievements/stats"],
    enabled: showAchievementCount,
  });

  if (tierLoading || (showAchievementCount && statsLoading)) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  const currentTier = (userTier as any)?.currentTier;
  const totalSpent = (userTier as any)?.spending?.totalCreditsSpent || 0;

  if (!currentTier) {
    // Default badge for new users
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {variant === "full" && <span>New Member</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">New Member</p>
            <p className="text-sm text-muted-foreground">
              Spend {totalSpent > 0 ? `${50 - totalSpent} more` : "50"} credits to reach Supporter tier
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Trophy;
  };

  const IconComponent = getIconComponent(currentTier.badgeIcon);

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1.5 ${currentTier.badgeColor} border-current`}
            data-testid="user-tier-badge"
          >
            <IconComponent className="w-3 h-3" />
            {variant === "full" && <span>{currentTier.name}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center max-w-xs">
            <p className="font-semibold">{currentTier.name}</p>
            <p className="text-sm text-muted-foreground mb-2">
              {currentTier.description}
            </p>
            <div className="text-xs">
              <p>Credits spent: {totalSpent}</p>
              {currentTier.benefits && (
                <p className="mt-1 text-muted-foreground">{currentTier.benefits}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {showAchievementCount && stats && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Medal className="w-3 h-3" />
              <span>{String((stats as any).unlockedAchievements)}/{String((stats as any).totalAchievements)}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Achievements Unlocked</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}