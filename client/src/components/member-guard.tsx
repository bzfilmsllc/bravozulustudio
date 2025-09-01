import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, UserCheck } from "lucide-react";

interface MemberGuardProps {
  children: React.ReactNode;
  requiredRole?: "pending" | "verified";
  fallbackComponent?: React.ReactNode;
}

export function MemberGuard({ 
  children, 
  requiredRole = "verified", 
  fallbackComponent 
}: MemberGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-slow">
          <Shield className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access this feature.
            </p>
            <Button onClick={() => window.location.href = "/api/login"} data-testid="button-signin-guard">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-slow">
          <UserCheck className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole === "verified" && user.role !== "verified") {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Verification Required</h2>
            <p className="text-muted-foreground mb-6">
              This feature requires verified military veteran status. Please complete the verification process to access professional studio tools.
            </p>
            <div className="space-y-3">
              <Button onClick={() => window.location.href = "/verification"} data-testid="button-verify-guard">
                Get Verified
              </Button>
              {user.role === "pending" && (
                <p className="text-sm text-primary">
                  Your verification is pending review.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredRole === "pending" && user.role === "public") {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Membership Required</h2>
            <p className="text-muted-foreground mb-6">
              Please apply for membership to access this feature.
            </p>
            <Button onClick={() => window.location.href = "/verification"} data-testid="button-apply-guard">
              Apply for Membership
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
