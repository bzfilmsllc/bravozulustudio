import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/hooks/useAuth";
import { Zap, CreditCard, Crown, Sparkles, RefreshCw } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface QuickTopUpProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  requiredCredits?: number;
  onSuccess?: () => void;
}

const QUICK_PLANS = [
  {
    id: 'quick_50',
    name: '50 Credits',
    credits: 50,
    price: 499, // $4.99 in cents
    description: 'Perfect for a few AI operations',
    popular: false,
    icon: Zap,
    color: 'bg-blue-500'
  },
  {
    id: 'quick_125',
    name: '125 Credits',
    credits: 125,
    price: 999, // $9.99 in cents
    description: 'Great value for regular use',
    popular: true,
    icon: Sparkles,
    color: 'bg-amber-500'
  },
  {
    id: 'quick_300',
    name: '300 Credits',
    credits: 300,
    price: 1999, // $19.99 in cents
    description: 'Best for power users',
    popular: false,
    icon: Crown,
    color: 'bg-purple-500'
  }
];

export function QuickCreditTopUp({ isOpen, onClose, currentCredits, requiredCredits, onSuccess }: QuickTopUpProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const purchaseMutation = useMutation({
    mutationFn: async (plan: typeof QUICK_PLANS[0]) => {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Create payment intent
      const paymentResponse: any = await apiRequest("/api/billing/create-payment-intent", "POST", {
        amount: plan.price,
        credits: plan.credits,
        plan: plan.name
      });

      if (!paymentResponse.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Redirect to Stripe Checkout or handle payment
      const { error } = await stripe.confirmPayment({
        clientSecret: paymentResponse.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/billing?success=true`,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      return paymentResponse;
    },
    onSuccess: () => {
      toast({
        title: "Credits Added!",
        description: "Your credits have been successfully added to your account.",
      });
      
      // Refresh user data and credits
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/user-credits"] });
      
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong with your purchase.",
        variant: "destructive",
      });
    },
  });

  const handleQuickPurchase = async (plan: typeof QUICK_PLANS[0]) => {
    setIsProcessing(true);
    try {
      await purchaseMutation.mutateAsync(plan);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDiscountedPrice = (price: number) => {
    // Apply military discount if user is verified military
    if (user?.militaryBranch && user.militaryBranch !== 'civilian' && user.militaryBranch !== 'not_applicable') {
      return Math.round(price * 0.8); // 20% military discount
    }
    return price;
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-400" />
            Quick Credit Top-Up
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            {requiredCredits ? (
              <>You need {requiredCredits} credits but only have {currentCredits}. Get credits instantly to continue.</>
            ) : (
              <>Top up your credits instantly to unlock all premium features.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Balance */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Current Balance</p>
                  <p className="text-white text-2xl font-bold">{currentCredits} Credits</p>
                </div>
                {requiredCredits && (
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Required</p>
                    <p className="text-amber-400 text-2xl font-bold">{requiredCredits} Credits</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Purchase Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUICK_PLANS.map((plan) => {
              const discountedPrice = getDiscountedPrice(plan.price);
              const hasDiscount = discountedPrice < plan.price;
              const Icon = plan.icon;

              return (
                <Card 
                  key={plan.id} 
                  className={`relative bg-slate-800/50 border-slate-600 hover:border-amber-500/50 transition-all cursor-pointer ${
                    plan.popular ? 'ring-2 ring-amber-500/50' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-full ${plan.color} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      {hasDiscount && (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          20% OFF
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-white text-2xl font-bold">
                          ${formatPrice(discountedPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-slate-500 line-through text-lg">
                            ${formatPrice(plan.price)}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">
                        ${(discountedPrice / plan.credits * 100).toFixed(1)}¢ per credit
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleQuickPurchase(plan)}
                      disabled={isProcessing || purchaseMutation.isPending}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
                      data-testid={`button-buy-${plan.id}`}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Military Discount Note */}
          {user?.militaryBranch && user.militaryBranch !== 'civilian' && user.militaryBranch !== 'not_applicable' && (
            <Card className="bg-green-900/20 border-green-700/50">
              <CardContent className="p-3">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Military Discount Applied: 20% off all credit packages
                </p>
              </CardContent>
            </Card>
          )}

          {/* Alternative Options */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/billing'}
              className="text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black"
            >
              View All Plans
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}