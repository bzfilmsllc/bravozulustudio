import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Target, 
  Zap, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Medal,
  Sparkles,
  Users,
  MessageSquare,
  FileText,
  Play,
  Award,
  Coins
} from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Stripe setup
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
  reward?: string;
  isComplete?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to BravoZulu Films",
    description: "Welcome, Commander! You've been assigned to our elite film production unit. Let's get you mission-ready with your tactical briefing.",
    icon: Shield,
    reward: "5 bonus credits for starting"
  },
  {
    id: 2,
    title: "Complete Your Military Profile",
    description: "Every operator needs proper identification. Complete your military profile to unlock verified status and special features.",
    icon: Target,
    action: "Go to Profile",
    reward: "10 bonus credits + verification priority"
  },
  {
    id: 3,
    title: "Generate Your First Script",
    description: "Test our AI-powered script generation system. Create a military-themed script to see the power of our tactical writing tools.",
    icon: FileText,
    action: "Try Script Generator",
    reward: "Script saved + 5 bonus credits"
  },
  {
    id: 4,
    title: "Join the Community",
    description: "Connect with fellow military filmmakers in our secure forum. Share ideas, get feedback, and build your network.",
    icon: Users,
    action: "Visit Forum",
    reward: "Community access unlocked"
  },
  {
    id: 5,
    title: "Start Your First Project",
    description: "Create a film project and start collaborating. Use our project management tools to organize your production.",
    icon: Play,
    action: "Create Project",
    reward: "Project management tools unlocked"
  }
];

interface TutorialBotProps {
  onComplete?: () => void;
}

function PaymentForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'pro' | 'elite'>('basic');
  const { toast } = useToast();

  const creditPackages = {
    basic: { credits: 50, price: 999, name: "Basic Package" },
    pro: { credits: 150, price: 2499, name: "Pro Package" },
    elite: { credits: 500, price: 7999, name: "Elite Package" }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Create payment intent
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: creditPackages[selectedPackage].price,
        credits: creditPackages[selectedPackage].credits,
        metadata: { type: 'tutorial_credit_purchase' }
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
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
      } else {
        toast({
          title: "Payment Successful!",
          description: `${creditPackages[selectedPackage].credits} credits added to your account`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {/* Package Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-orbitron text-honor-gold">Select Credit Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(creditPackages).map(([key, pkg]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all ${
                selectedPackage === key 
                  ? 'border-honor-gold bg-honor-gold/10' 
                  : 'border-tactical-gray bg-tactical-black/50 hover:border-honor-gold/50'
              }`}
              onClick={() => setSelectedPackage(key as typeof selectedPackage)}
            >
              <CardContent className="p-4 text-center">
                <div className="mb-2">
                  <Coins className="w-8 h-8 mx-auto text-honor-gold" />
                </div>
                <h4 className="font-bold text-white">{pkg.name}</h4>
                <p className="text-2xl font-orbitron text-honor-gold">{pkg.credits}</p>
                <p className="text-sm text-muted-foreground">Credits</p>
                <p className="text-lg font-bold text-white mt-2">${(pkg.price / 100).toFixed(2)}</p>
                {key === 'pro' && (
                  <Badge className="mt-2 bg-honor-gold/20 text-honor-gold">Most Popular</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-orbitron text-honor-gold">Payment Details</h3>
        <div className="p-4 border border-tactical-gray rounded-lg bg-tactical-black/50">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#94a3b8',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-tactical-gray text-white hover:bg-tactical-gray/20"
        >
          Skip for Now
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-honor-gold text-tactical-black hover:bg-honor-gold/90 font-bold"
        >
          {loading ? "Processing..." : `Purchase ${creditPackages[selectedPackage].credits} Credits`}
        </Button>
      </div>
    </form>
  );
}

export function TutorialBot({ onComplete }: TutorialBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  // Get user data and tutorial progress
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Check if tutorial should be shown
  useEffect(() => {
    if (user && !(user as any).hasCompletedOnboarding && !(user as any).tutorialCompletedAt) {
      setIsOpen(true);
      setCurrentStep((user as any).tutorialStep || 0);
    } else {
      setIsOpen(false); // Ensure it's closed if tutorial is completed
    }
  }, [user]);

  // Update tutorial progress
  const updateTutorialMutation = useMutation({
    mutationFn: async (data: { step: number; completed?: boolean }) => {
      return apiRequest('PUT', '/api/tutorial/progress', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  // Complete tutorial and award welcome package
  const completeTutorialMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/tutorial/complete');
    },
    onSuccess: async () => {
      // Create welcome notification
      await apiRequest('POST', '/api/notifications', {
        type: 'system',
        title: 'Mission Complete: Tutorial Finished',
        message: 'Congratulations! You\'ve completed basic training and earned your welcome package: 25 bonus credits!'
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription-status'] });
      
      toast({
        title: "🎖️ Mission Complete!",
        description: "Tutorial finished! You've earned your welcome package with 25 bonus credits.",
      });
      
      onComplete?.();
    },
  });

  const handleStepComplete = (stepId: number) => {
    const nextStep = stepId + 1;
    setCurrentStep(nextStep);
    updateTutorialMutation.mutate({ step: nextStep });

    if (nextStep >= tutorialSteps.length) {
      // Tutorial complete, show payment option
      setShowPayment(true);
    }
  };

  const handleTutorialComplete = () => {
    completeTutorialMutation.mutate();
    setIsOpen(false);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    handleTutorialComplete();
  };

  const handleSkipPayment = () => {
    setShowPayment(false);
    handleTutorialComplete();
  };

  const currentStepData = tutorialSteps[currentStep];
  const progress = (currentStep / tutorialSteps.length) * 100;

  if (!user || (user as any).hasCompletedOnboarding) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-tactical-black border-honor-gold/30">
        <DialogHeader>
          <DialogTitle className="text-honor-gold font-orbitron flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Basic Training Protocol
            <Shield className="w-6 h-6" />
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Welcome to BravoZulu Films Command Center. Complete your tactical briefing to unlock full access.
          </DialogDescription>
        </DialogHeader>

        {!showPayment ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Mission Progress</span>
                <span className="text-honor-gold font-bold">{currentStep}/{tutorialSteps.length} Complete</span>
              </div>
              <Progress value={progress} className="h-2 bg-tactical-gray" />
            </div>

            {currentStepData && (
              <Card className="bg-gradient-to-r from-tactical-black to-slate-900/90 border-honor-gold/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-honor-gold">
                    <currentStepData.icon className="w-8 h-8" />
                    <div>
                      <div className="text-lg">{currentStepData.title}</div>
                      <Badge className="bg-honor-gold/20 text-honor-gold border-honor-gold/50 mt-1">
                        Step {currentStepData.id} of {tutorialSteps.length}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300 leading-relaxed">
                    {currentStepData.description}
                  </p>
                  
                  {currentStepData.reward && (
                    <div className="flex items-center gap-2 p-3 bg-honor-gold/10 border border-honor-gold/20 rounded-lg">
                      <Star className="w-5 h-5 text-honor-gold" />
                      <span className="text-honor-gold font-medium">Reward: {currentStepData.reward}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    {currentStepData.action ? (
                      <>
                        <Button
                          onClick={() => handleStepComplete(currentStepData.id)}
                          className="flex-1 bg-honor-gold text-tactical-black hover:bg-honor-gold/90 font-bold"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          {currentStepData.action}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStepComplete(currentStepData.id)}
                          className="border-tactical-gray text-slate-300 hover:bg-tactical-gray/20"
                        >
                          Skip
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleStepComplete(currentStepData.id)}
                        className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90 font-bold"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Continue Mission
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Steps */}
            {currentStep > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400">Completed Objectives:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tutorialSteps.slice(0, currentStep).map((step) => (
                    <div key={step.id} className="flex items-center gap-2 p-2 bg-green-900/20 border border-green-600/30 rounded">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Elements stripe={stripePromise}>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Medal className="w-16 h-16 mx-auto text-honor-gold" />
                <h3 className="text-xl font-orbitron text-honor-gold">Mission Complete!</h3>
                <p className="text-slate-300">
                  Excellent work, Commander! You've completed basic training. 
                  Would you like to add more credits to your account for extended operations?
                </p>
              </div>
              
              <PaymentForm onSuccess={handlePaymentSuccess} onCancel={handleSkipPayment} />
            </div>
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}