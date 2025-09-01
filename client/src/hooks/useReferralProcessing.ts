import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useReferralProcessing() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const processReferralMutation = useMutation({
    mutationFn: async (referralCode: string) => {
      return await apiRequest("/api/referrals/process", "POST", { referralCode });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Welcome Bonus!",
        description: `You've been referred by a friend! Check your notifications for bonus credits.`,
      });
      // Clear the pending referral code
      sessionStorage.removeItem('pendingReferralCode');
      sessionStorage.removeItem('referralProcessed');
    },
    onError: (error: any) => {
      console.error("Failed to process referral:", error);
      // Don't show error toast to user, just log it
      // Clear the pending referral code anyway to prevent retry loops
      sessionStorage.removeItem('pendingReferralCode');
      sessionStorage.removeItem('referralProcessed');
    },
  });

  useEffect(() => {
    // Only process if user is authenticated and not loading
    if (!isAuthenticated || isLoading || !user) {
      return;
    }

    // Check if we already processed a referral for this session
    const alreadyProcessed = sessionStorage.getItem('referralProcessed');
    if (alreadyProcessed) {
      return;
    }

    // Check for pending referral code
    const pendingReferralCode = sessionStorage.getItem('pendingReferralCode');
    if (pendingReferralCode) {
      // Mark as processed to prevent multiple attempts
      sessionStorage.setItem('referralProcessed', 'true');
      
      // Process the referral code
      processReferralMutation.mutate(pendingReferralCode);
    }
  }, [isAuthenticated, isLoading, user, processReferralMutation]);

  return {
    isProcessing: processReferralMutation.isPending,
  };
}