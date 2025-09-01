import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Gift, Users, DollarSign, TrendingUp, Share2, Star } from "lucide-react";
import type { ReferralCode, Referral } from "@shared/schema";

const createCodeSchema = z.object({
  customCode: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length >= 3 && val.length <= 20 && /^[A-Z0-9]+$/.test(val);
  }, "Code must be 3-20 characters, uppercase letters and numbers only")
});

export default function ReferralsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCode, setSelectedCode] = useState<string>("");

  // Get user's referral codes
  const { data: referralCodes = [], isLoading: codesLoading } = useQuery<ReferralCode[]>({
    queryKey: ["/api/referrals/my-codes"],
  });

  // Get referral stats
  const { data: stats = { totalReferrals: 0, qualifiedReferrals: 0, totalCreditsEarned: 0, pendingReferrals: 0 }, isLoading: statsLoading } = useQuery<{
    totalReferrals: number;
    qualifiedReferrals: number;
    totalCreditsEarned: number;
    pendingReferrals: number;
  }>({
    queryKey: ["/api/referrals/stats"],
  });

  // Get referral history
  const { data: referralHistory = [], isLoading: historyLoading } = useQuery<Referral[]>({
    queryKey: ["/api/referrals/history"],
  });

  // Create referral code form
  const form = useForm<z.infer<typeof createCodeSchema>>({
    resolver: zodResolver(createCodeSchema),
    defaultValues: {
      customCode: ""
    }
  });

  // Create referral code mutation
  const createCodeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createCodeSchema>) => {
      return await apiRequest("/api/referrals/create-code", "POST", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Referral Code Created!",
        description: `Your referral code "${data.referralCode.code}" is ready to share`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/my-codes"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Code",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Deactivate code mutation
  const deactivateCodeMutation = useMutation({
    mutationFn: async (codeId: string) => {
      return await apiRequest(`/api/referrals/codes/${codeId}/deactivate`, "PATCH");
    },
    onSuccess: () => {
      toast({
        title: "Code Deactivated",
        description: "Referral code has been deactivated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/my-codes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Deactivate",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const getReferralUrl = (code: string) => {
    return `${window.location.origin}/?ref=${code}`;
  };

  const onSubmit = (data: z.infer<typeof createCodeSchema>) => {
    createCodeMutation.mutate(data);
  };

  if (codesLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Referral Program</h1>
          <p className="text-amber-200 mt-1">Share Bravo Zulu Films and earn credits together</p>
        </div>
        <div className="flex items-center gap-2 text-amber-300">
          <Users className="h-5 w-5" />
          <span className="text-sm">Earn 50 credits per qualified referral</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-300 text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Qualified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.qualifiedReferrals}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Credits Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCreditsEarned}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingReferrals}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Referral Code */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-amber-400" />
              Create Referral Code
            </CardTitle>
            <CardDescription className="text-slate-300">
              Generate a custom referral code to share with friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Custom Code (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., JOHN2024"
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                          maxLength={20}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Leave empty for auto-generated code. Only uppercase letters and numbers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createCodeMutation.isPending}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  data-testid="button-create-referral-code"
                >
                  {createCodeMutation.isPending ? "Creating..." : "Create Code"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-400" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="text-white font-medium">Share Your Code</p>
                <p className="text-slate-300 text-sm">Send your referral link to friends and family</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="text-white font-medium">They Join & Spend</p>
                <p className="text-slate-300 text-sm">New users get 25 credits when they spend $9.99+</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="text-white font-medium">You Both Earn</p>
                <p className="text-slate-300 text-sm">You get 50 credits for each qualified referral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Referral Codes */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Your Referral Codes</CardTitle>
          <CardDescription className="text-slate-300">
            Share these codes to earn referral bonuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralCodes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No referral codes yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referralCodes.map((code: ReferralCode) => (
                <div key={code.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <code className="bg-amber-600 text-white px-3 py-1 rounded font-mono font-bold">
                        {code.code}
                      </code>
                      <Badge variant={code.isActive ? "default" : "secondary"}>
                        {code.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(getReferralUrl(code.code))}
                        className="text-amber-400 hover:text-amber-300"
                        data-testid={`button-copy-${code.code}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {code.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deactivateCodeMutation.mutate(code.id)}
                          disabled={deactivateCodeMutation.isPending}
                          className="text-red-400 hover:text-red-300"
                          data-testid={`button-deactivate-${code.code}`}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Uses</p>
                      <p className="text-white font-medium">{code.currentUses} / {code.maxUses}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Your Reward</p>
                      <p className="text-white font-medium">{code.referrerReward} credits</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Their Reward</p>
                      <p className="text-white font-medium">{code.referredReward} credits</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Min. Spend</p>
                      <p className="text-white font-medium">${(code.minimumSpend / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-slate-600/30 rounded border border-slate-600">
                    <p className="text-slate-300 text-sm font-medium mb-1">Share this link:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded font-mono">
                        {getReferralUrl(code.code)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(getReferralUrl(code.code))}
                        className="text-amber-400 hover:text-amber-300"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      {referralHistory.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Referrals</CardTitle>
            <CardDescription className="text-slate-300">
              Track your referral success and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralHistory.slice(0, 10).map((referral: Referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      referral.status === 'credited' ? 'bg-green-400' :
                      referral.status === 'qualified' ? 'bg-blue-400' :
                      'bg-yellow-400'
                    }`}></div>
                    <div>
                      <p className="text-white font-medium">{referral.referredUserEmail}</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(referral.createdAt || new Date()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      referral.status === 'credited' ? 'default' :
                      referral.status === 'qualified' ? 'secondary' :
                      'outline'
                    }>
                      {referral.status}
                    </Badge>
                    {referral.referrerCreditsAwarded > 0 && (
                      <p className="text-green-400 text-sm font-medium mt-1">
                        +{referral.referrerCreditsAwarded} credits
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}