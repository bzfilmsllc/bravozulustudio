import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface CreditCheckResult {
  hasEnoughCredits: boolean;
  currentCredits: number;
  requiredCredits: number;
  shortfall: number;
}

export function useCreditManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<CreditCheckResult | null>(null);

  // Get current credit balance
  const { data: currentCredits = 0, refetch: refetchCredits } = useQuery<number>({
    queryKey: ["/api/billing/user-credits"],
    enabled: !!user,
  });

  // Check if user is super user (unlimited credits)
  const isSuperUser = user?.email && ['bravozulufilms@gmail.com', 'usmc2532@gmail.com'].includes(user.email.toLowerCase());

  // Main credit checking function
  const checkCredits = useCallback((requiredCredits: number): CreditCheckResult => {
    const result: CreditCheckResult = {
      hasEnoughCredits: isSuperUser || currentCredits >= requiredCredits,
      currentCredits,
      requiredCredits,
      shortfall: Math.max(0, requiredCredits - currentCredits)
    };

    setLastCheckResult(result);
    return result;
  }, [currentCredits, isSuperUser]);

  // Check credits and show modal if insufficient
  const requireCredits = useCallback((requiredCredits: number, featureName?: string): boolean => {
    const result = checkCredits(requiredCredits);
    
    if (!result.hasEnoughCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${requiredCredits} credits to use ${featureName || 'this feature'}. You currently have ${currentCredits} credits.`,
        variant: "destructive",
      });
      
      setShowTopUpModal(true);
      return false;
    }
    
    return true;
  }, [checkCredits, currentCredits, toast]);

  // Auto-check for low balance and warn user
  const checkLowBalance = useCallback((threshold: number = 50) => {
    if (isSuperUser) return false;
    
    if (currentCredits <= threshold && currentCredits > 0) {
      toast({
        title: "Low Credit Balance",
        description: `You have ${currentCredits} credits remaining. Consider topping up to avoid interruptions.`,
        variant: "destructive",
      });
      return true;
    }
    
    if (currentCredits === 0) {
      toast({
        title: "No Credits Remaining",
        description: "You're out of credits! Top up now to continue using premium features.",
        variant: "destructive",
      });
      setShowTopUpModal(true);
      return true;
    }
    
    return false;
  }, [currentCredits, isSuperUser, toast]);

  // Success handler for when credits are added
  const handleTopUpSuccess = useCallback(() => {
    refetchCredits();
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    toast({
      title: "Credits Added Successfully!",
      description: "Your account has been topped up. You can now continue using all features.",
    });
  }, [refetchCredits, queryClient, toast]);

  // Close modal handler
  const closeTopUpModal = useCallback(() => {
    setShowTopUpModal(false);
  }, []);

  return {
    // State
    currentCredits,
    isSuperUser,
    showTopUpModal,
    lastCheckResult,
    
    // Functions
    checkCredits,
    requireCredits,
    checkLowBalance,
    handleTopUpSuccess,
    closeTopUpModal,
    refetchCredits,
    
    // Modal control
    setShowTopUpModal,
  };
}