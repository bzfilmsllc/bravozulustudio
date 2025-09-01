import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/navigation";
import { MemberGuard } from "@/components/member-guard";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  Award,
  Users,
  Star,
  Eye,
  EyeOff,
  Info,
  Mail,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react";

const verificationSchema = z.object({
  militaryEmail: z.string().email("Please enter a valid email address"),
  militaryBranch: z.enum(["army", "navy", "air_force", "marines", "coast_guard", "space_force"]),
  yearsOfService: z.string().min(1, "Years of service is required"),
  rank: z.string().optional(),
  specialty: z.string().optional(),
  deployments: z.string().optional(),
  bio: z.string().min(50, "Please provide at least 50 characters about your background"),
  linkedinProfile: z.string().url().optional().or(z.literal("")),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
  agreeToVerification: z.boolean().refine((val) => val === true, "You must consent to verification"),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function Verification() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      militaryEmail: "",
      militaryBranch: undefined,
      yearsOfService: "",
      rank: "",
      specialty: "",
      deployments: "",
      bio: "",
      linkedinProfile: "",
      agreeToTerms: false,
      agreeToVerification: false,
    },
  });

  const verificationMutation = useMutation({
    mutationFn: async (data: VerificationFormData) => {
      const response = await apiRequest("PUT", "/api/users/verification", {
        militaryBranch: data.militaryBranch,
        yearsOfService: data.yearsOfService,
        militaryEmail: data.militaryEmail,
        bio: data.bio,
        specialties: data.specialty,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Verification Submitted",
        description: "Your verification application has been submitted for review. You'll receive an email once it's processed.",
      });
      setCurrentStep(4);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Verification Failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VerificationFormData) => {
    verificationMutation.mutate(data);
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
  };

  const steps = [
    { number: 1, title: "Military Information", description: "Verify your military service" },
    { number: 2, title: "Professional Background", description: "Share your experience" },
    { number:3, title: "Verification Consent", description: "Agree to verification process" },
    { number: 4, title: "Review & Submit", description: "Complete your application" },
  ];

  const militaryBranches = [
    { value: "army", label: "Army" },
    { value: "navy", label: "Navy" },
    { value: "air_force", label: "Air Force" },
    { value: "marines", label: "Marines" },
    { value: "coast_guard", label: "Coast Guard" },
    { value: "space_force", label: "Space Force" },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Verified Badge",
      description: "Display verified military status throughout the platform",
    },
    {
      icon: FileText,
      title: "Script Editor Access",
      description: "Full access to AI-powered script writing tools",
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Connect with verified veteran filmmakers",
    },
    {
      icon: Award,
      title: "Festival Support",
      description: "Script analysis and festival submission guidance",
    },
  ];

  if (user?.role === "verified") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-24 h-24 text-primary mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold mb-4">Verification Complete</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  You are already a verified member of Bravo Zulu Films. Welcome to our professional community!
                </p>
                <div className="flex justify-center space-x-4">
                  <Button asChild data-testid="button-go-to-tools">
                    <a href="/tools">
                      <FileText className="w-5 h-5 mr-2" />
                      Access Studio Tools
                    </a>
                  </Button>
                  <Button variant="outline" asChild data-testid="button-go-to-community">
                    <a href="/community">
                      <Users className="w-5 h-5 mr-2" />
                      Explore Community
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (user?.role === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-12 text-center">
                <Clock className="w-24 h-24 text-primary mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold mb-4">Verification Pending</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Your verification application is currently under review. We'll notify you once the process is complete.
                </p>
                <div className="bg-background rounded-lg p-6 mb-8">
                  <h3 className="font-semibold mb-4">What's Next?</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Manual review of your military background (1-2 business days)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Email notification of verification status</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Full access to professional tools upon approval</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" asChild data-testid="button-back-to-home">
                  <a href="/">
                    <Star className="w-5 h-5 mr-2" />
                    Back to Home
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <MemberGuard>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold mb-4">Military Verification</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join our verified community of military veteran filmmakers and gain access to professional studio tools
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Verification Benefits */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-6 h-6 text-primary mr-3" />
                      Verification Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {benefits.map((benefit) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={benefit.title} className="flex items-start space-x-3" data-testid={`benefit-${benefit.title.toLowerCase().replace(" ", "-")}`}>
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{benefit.title}</h4>
                            <p className="text-xs text-muted-foreground">{benefit.description}</p>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-6 border-t border-border">
                      <div className="bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Info className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-sm">Verification Process</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          All applications are manually reviewed to ensure authenticity and maintain 
                          the highest standards of our veteran community.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Verification Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Verification Application</span>
                      <Badge variant="outline">
                        Step {currentStep} of {steps.length}
                      </Badge>
                    </CardTitle>
                    
                    {/* Progress Steps */}
                    <div className="flex items-center space-x-4 mt-6">
                      {steps.map((step, index) => (
                        <div key={step.number} className="flex-1">
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                getStepStatus(step.number) === "completed"
                                  ? "bg-primary text-primary-foreground"
                                  : getStepStatus(step.number) === "current"
                                  ? "bg-primary/20 text-primary border-2 border-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {getStepStatus(step.number) === "completed" ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                step.number
                              )}
                            </div>
                            {index < steps.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 ml-2 ${
                                  getStepStatus(step.number) === "completed" ? "bg-primary" : "bg-muted"
                                }`}
                              />
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium">{step.title}</p>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Step 1: Military Information */}
                      {currentStep === 1 && (
                        <div className="space-y-6" data-testid="step-military-info">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="militaryEmail">Military Email Address *</Label>
                              <div className="relative">
                                <Input
                                  id="militaryEmail"
                                  type={showEmailPassword ? "text" : "email"}
                                  {...form.register("militaryEmail")}
                                  placeholder="your.name@military.mil"
                                  data-testid="input-military-email"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                                >
                                  {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                              {form.formState.errors.militaryEmail && (
                                <p className="text-sm text-destructive mt-1">
                                  {form.formState.errors.militaryEmail.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="militaryBranch">Service Branch *</Label>
                              <Select value={form.watch("militaryBranch")} onValueChange={(value) => form.setValue("militaryBranch", value as any)}>
                                <SelectTrigger data-testid="select-military-branch">
                                  <SelectValue placeholder="Select your service branch" />
                                </SelectTrigger>
                                <SelectContent>
                                  {militaryBranches.map((branch) => (
                                    <SelectItem key={branch.value} value={branch.value}>
                                      {branch.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {form.formState.errors.militaryBranch && (
                                <p className="text-sm text-destructive mt-1">
                                  {form.formState.errors.militaryBranch.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="yearsOfService">Years of Service *</Label>
                              <Input
                                id="yearsOfService"
                                {...form.register("yearsOfService")}
                                placeholder="e.g., 4, 8, 20"
                                data-testid="input-years-service"
                              />
                              {form.formState.errors.yearsOfService && (
                                <p className="text-sm text-destructive mt-1">
                                  {form.formState.errors.yearsOfService.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="rank">Final Rank (Optional)</Label>
                              <Input
                                id="rank"
                                {...form.register("rank")}
                                placeholder="e.g., Staff Sergeant, Lieutenant, etc."
                                data-testid="input-rank"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="specialty">Military Specialty/MOS (Optional)</Label>
                            <Input
                              id="specialty"
                              {...form.register("specialty")}
                              placeholder="e.g., 25B (Information Technology), 11B (Infantry), etc."
                              data-testid="input-specialty"
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button 
                              type="button" 
                              onClick={() => setCurrentStep(2)}
                              data-testid="button-next-step-1"
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Professional Background */}
                      {currentStep === 2 && (
                        <div className="space-y-6" data-testid="step-professional-background">
                          <div>
                            <Label htmlFor="deployments">Deployments/Assignments (Optional)</Label>
                            <Textarea
                              id="deployments"
                              {...form.register("deployments")}
                              placeholder="Briefly describe your key deployments or assignments (optional)"
                              className="min-h-20"
                              data-testid="textarea-deployments"
                            />
                          </div>

                          <div>
                            <Label htmlFor="bio">Professional Background *</Label>
                            <Textarea
                              id="bio"
                              {...form.register("bio")}
                              placeholder="Tell us about your military background and filmmaking interests. Include any relevant experience in media, communications, or creative fields. (Minimum 50 characters)"
                              className="min-h-32"
                              data-testid="textarea-bio"
                            />
                            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                              <span>{form.watch("bio")?.length || 0} / 50 minimum characters</span>
                            </div>
                            {form.formState.errors.bio && (
                              <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.bio.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="linkedinProfile">LinkedIn Profile (Optional)</Label>
                            <Input
                              id="linkedinProfile"
                              {...form.register("linkedinProfile")}
                              placeholder="https://linkedin.com/in/yourprofile"
                              data-testid="input-linkedin"
                            />
                            {form.formState.errors.linkedinProfile && (
                              <p className="text-sm text-destructive mt-1">
                                {form.formState.errors.linkedinProfile.message}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-between">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setCurrentStep(1)}
                              data-testid="button-back-step-2"
                            >
                              Back
                            </Button>
                            <Button 
                              type="button" 
                              onClick={() => setCurrentStep(3)}
                              data-testid="button-next-step-2"
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Verification Consent */}
                      {currentStep === 3 && (
                        <div className="space-y-6" data-testid="step-consent">
                          <div className="bg-muted/30 rounded-lg p-6">
                            <h3 className="font-semibold mb-4 flex items-center">
                              <Shield className="w-5 h-5 text-primary mr-2" />
                              Verification Process
                            </h3>
                            <div className="space-y-3 text-sm text-muted-foreground">
                              <p>
                                To maintain the integrity of our veteran community, we manually verify all military backgrounds. 
                                This process includes:
                              </p>
                              <ul className="space-y-2 ml-4">
                                <li>• Verification of military email domain</li>
                                <li>• Cross-reference with military databases (when applicable)</li>
                                <li>• Review of provided service information</li>
                                <li>• Optional document verification for expedited processing</li>
                              </ul>
                              <p className="text-xs">
                                All information is kept strictly confidential and used only for verification purposes.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id="agreeToTerms"
                                checked={form.watch("agreeToTerms")}
                                onCheckedChange={(checked) => form.setValue("agreeToTerms", !!checked)}
                                data-testid="checkbox-terms"
                              />
                              <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                                I agree to the{" "}
                                <a href="#" className="text-primary hover:underline">
                                  Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="text-primary hover:underline">
                                  Privacy Policy
                                </a>
                                , and understand that my account will be subject to community guidelines.
                              </Label>
                            </div>

                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id="agreeToVerification"
                                checked={form.watch("agreeToVerification")}
                                onCheckedChange={(checked) => form.setValue("agreeToVerification", !!checked)}
                                data-testid="checkbox-verification"
                              />
                              <Label htmlFor="agreeToVerification" className="text-sm leading-relaxed">
                                I consent to the verification of my military background and understand that 
                                providing false information may result in permanent account suspension.
                              </Label>
                            </div>
                          </div>

                          {(form.formState.errors.agreeToTerms || form.formState.errors.agreeToVerification) && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-destructive" />
                                <p className="text-sm text-destructive">
                                  Please agree to all terms and verification consent to continue.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setCurrentStep(2)}
                              data-testid="button-back-step-3"
                            >
                              Back
                            </Button>
                            <Button 
                              type="button" 
                              onClick={() => setCurrentStep(4)}
                              disabled={!form.watch("agreeToTerms") || !form.watch("agreeToVerification")}
                              data-testid="button-next-step-3"
                            >
                              Review Application
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Review & Submit */}
                      {currentStep === 4 && (
                        <div className="space-y-6" data-testid="step-review">
                          <div className="bg-muted/30 rounded-lg p-6">
                            <h3 className="font-semibold mb-4">Application Review</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-sm mb-2">Military Information</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>Email: {form.watch("militaryEmail")}</p>
                                  <p>Branch: {militaryBranches.find(b => b.value === form.watch("militaryBranch"))?.label}</p>
                                  <p>Years of Service: {form.watch("yearsOfService")}</p>
                                  {form.watch("rank") && <p>Rank: {form.watch("rank")}</p>}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm mb-2">Professional Background</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>Bio: {form.watch("bio")?.substring(0, 100)}...</p>
                                  {form.watch("specialty") && <p>Specialty: {form.watch("specialty")}</p>}
                                  {form.watch("linkedinProfile") && <p>LinkedIn: Provided</p>}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                            <div className="flex items-start space-x-3">
                              <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-sm mb-2">What Happens Next?</h4>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <p>1. Your application will be reviewed within 1-2 business days</p>
                                  <p>2. You'll receive an email notification of your verification status</p>
                                  <p>3. Upon approval, you'll gain full access to all professional tools</p>
                                  <p>4. You can immediately start connecting with other verified members</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setCurrentStep(3)}
                              data-testid="button-back-step-4"
                            >
                              Back
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={verificationMutation.isPending}
                              data-testid="button-submit-verification"
                            >
                              {verificationMutation.isPending ? "Submitting..." : "Submit Application"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Information */}
            <Card className="mt-12" data-testid="verification-faq">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-6 h-6 text-primary mr-3" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-2">What if I don't have a military email?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      You can use your personal email, but additional verification steps may be required. 
                      Contact support for alternative verification methods.
                    </p>

                    <h4 className="font-semibold mb-2">How long does verification take?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Most applications are reviewed within 1-2 business days. Complex cases may take longer.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Is my information secure?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      All information is encrypted and stored securely. We follow strict privacy protocols 
                      and only use information for verification purposes.
                    </p>

                    <h4 className="font-semibold mb-2">Can family members join?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Yes, military family members are welcome. Additional verification steps may apply.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </MemberGuard>
  );
}
