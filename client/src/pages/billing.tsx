import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Crown, Shield, Zap, Users, Gift, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  creditsIncluded: number;
  militaryDiscountPercent: number;
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface UserBillingInfo {
  credits: number;
}

function CreditPurchaseForm({ planData, onSuccess }: { planData: any; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/billing/create-payment-intent", planData);
      const { clientSecret, finalAmount, discountApplied } = await response.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await apiRequest("POST", "/api/billing/confirm-payment", {
          paymentIntentId: paymentIntent.id
        });

        toast({
          title: "Payment Successful!",
          description: `${planData.credits} credits added to your account${discountApplied ? ' (military discount applied!)' : ''}`,
        });
        
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-slate-950/50 border-yellow-600/30">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#FFD700',
                '::placeholder': {
                  color: '#94a3b8',
                },
              },
            },
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-bold"
        data-testid="button-submit-payment"
      >
        {isProcessing ? "Processing..." : `Purchase ${planData.credits} Credits`}
      </Button>
    </form>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Fetch user billing info
  const { data: billingInfo, isLoading: billingLoading } = useQuery<UserBillingInfo>({
    queryKey: ['/api/billing/credits'],
  });

  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/billing/plans'],
  });

  // Fetch credit transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<CreditTransaction[]>({
    queryKey: ['/api/billing/transactions'],
  });

  // Initialize plans mutation
  const initPlansMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/init-plans"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/plans'] });
      toast({
        title: "Success",
        description: "Subscription plans initialized",
      });
    },
  });

  const onPurchaseSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/billing/credits'] });
    queryClient.invalidateQueries({ queryKey: ['/api/billing/transactions'] });
    setSelectedPlan(null);
  };

  // Quick credit packages
  const quickPackages = [
    { credits: 50, price: 5, label: "Starter Pack" },
    { credits: 200, price: 15, label: "Creator Pack" },
    { credits: 500, price: 30, label: "Studio Pack" },
    { credits: 1000, price: 50, label: "Enterprise Pack" },
  ];

  const isMilitary = user?.militaryBranch && user.militaryBranch !== 'civilian' && user.militaryBranch !== 'not_applicable';

  if (billingLoading || plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-yellow-400 text-lg">Loading billing information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Military Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-900/10 to-amber-900/10" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
              Mission Control
            </h1>
            <Crown className="w-10 h-10 text-yellow-400" />
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Fuel your creative operations with our tactical credit system. Honor your service with exclusive military pricing.
          </p>
        </div>

        {/* Credit Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-yellow-600/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-yellow-400 flex items-center justify-center gap-2">
              <Zap className="w-6 h-6" />
              Current Credits: {billingInfo?.credits || 0}
              <Zap className="w-6 h-6" />
            </CardTitle>
            {isMilitary && (
              <Badge className="bg-green-900/50 text-green-300 border-green-600/50 mx-auto">
                <Shield className="w-4 h-4 mr-1" />
                Military Discount: 20% OFF
              </Badge>
            )}
          </CardHeader>
        </Card>

        <Tabs defaultValue="purchase" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-yellow-600/30">
            <TabsTrigger value="purchase" className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400">
              Purchase Credits
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400">
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400">
              Transaction History
            </TabsTrigger>
          </TabsList>

          {/* Credit Purchase Tab */}
          <TabsContent value="purchase" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Quick Credit Packages</h2>
              <p className="text-slate-300">Choose the perfect credit package for your mission</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickPackages.map((pkg) => {
                const discountedPrice = isMilitary ? Math.round(pkg.price * 0.8) : pkg.price;
                return (
                  <Card 
                    key={pkg.credits}
                    className="bg-slate-900/50 border-yellow-600/30 hover:border-yellow-500/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedPlan({
                      credits: pkg.credits,
                      amount: discountedPrice * 100, // Convert to cents
                      plan: pkg.label
                    })}
                    data-testid={`card-credit-package-${pkg.credits}`}
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-yellow-400">{pkg.label}</CardTitle>
                      <div className="text-3xl font-bold text-white">
                        {pkg.credits} <span className="text-sm text-slate-400">credits</span>
                      </div>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="mb-4">
                        {isMilitary && (
                          <div className="text-slate-400 line-through text-sm">${pkg.price}</div>
                        )}
                        <div className="text-2xl font-bold text-green-400">
                          ${discountedPrice}
                        </div>
                        {isMilitary && (
                          <Badge className="bg-green-900/50 text-green-300 text-xs mt-1">
                            Military Discount
                          </Badge>
                        )}
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-bold group-hover:scale-105 transition-transform"
                        data-testid={`button-select-${pkg.credits}-credits`}
                      >
                        Select Package
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Payment Form */}
            {selectedPlan && (
              <Card className="bg-slate-900/80 border-yellow-600/50 max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-yellow-400 text-center">
                    Complete Purchase
                  </CardTitle>
                  <CardDescription className="text-center">
                    {selectedPlan.credits} credits for ${selectedPlan.amount / 100}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise}>
                    <CreditPurchaseForm planData={selectedPlan} onSuccess={onPurchaseSuccess} />
                  </Elements>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedPlan(null)}
                    className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-800"
                    data-testid="button-cancel-purchase"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Subscription Plans</h2>
              <p className="text-slate-300">Consistent firepower for ongoing operations</p>
            </div>

            {plans.length === 0 ? (
              <Card className="bg-slate-900/50 border-yellow-600/30 text-center p-8">
                <CardContent>
                  <p className="text-slate-300 mb-4">No subscription plans available</p>
                  <Button 
                    onClick={() => initPlansMutation.mutate()}
                    disabled={initPlansMutation.isPending}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black"
                    data-testid="button-init-plans"
                  >
                    {initPlansMutation.isPending ? "Initializing..." : "Initialize Plans"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => {
                  const discountedPrice = isMilitary ? Math.round(plan.price * 0.8) : plan.price;
                  const isPopular = index === 1; // Mark monthly as popular
                  
                  return (
                    <Card 
                      key={plan.id}
                      className={`relative bg-slate-900/50 border-yellow-600/30 hover:border-yellow-500/50 transition-all ${
                        isPopular ? 'ring-2 ring-yellow-500/50 scale-105' : ''
                      }`}
                      data-testid={`card-subscription-${plan.id}`}
                    >
                      {isPopular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-600 text-black">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      )}
                      
                      <CardHeader className="text-center">
                        <CardTitle className="text-yellow-400">{plan.name}</CardTitle>
                        <CardDescription className="text-slate-300">
                          {plan.description}
                        </CardDescription>
                        <div className="text-center mt-4">
                          {isMilitary && (
                            <div className="text-slate-400 line-through text-sm">
                              ${(plan.price / 100).toFixed(2)}/{plan.interval}
                            </div>
                          )}
                          <div className="text-3xl font-bold text-white">
                            ${(discountedPrice / 100).toFixed(2)}
                            <span className="text-sm text-slate-400">/{plan.interval}</span>
                          </div>
                          {isMilitary && (
                            <Badge className="bg-green-900/50 text-green-300 text-xs mt-1">
                              Military Discount
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            {plan.creditsIncluded} credits included
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Users className="w-4 h-4 text-yellow-400" />
                            Unlimited projects
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Shield className="w-4 h-4 text-yellow-400" />
                            Priority support
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-bold"
                          data-testid={`button-subscribe-${plan.id}`}
                        >
                          Start Subscription
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="history">
            <Card className="bg-slate-900/50 border-yellow-600/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8 text-slate-400">
                    Loading transactions...
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No transactions yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div>
                          <div className="text-white font-medium">{transaction.description}</div>
                          <div className="text-sm text-slate-400">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`font-bold ${
                          transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}