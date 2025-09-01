import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Crown,
  Award,
  Star,
  Users,
  CreditCard,
  UserCheck,
  UserX,
  Medal,
  Zap,
  Target,
  Gift,
  Calendar,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Edit,
} from "lucide-react";

// Gift Code Generator Component
const GiftCodeGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    credits: 100,
    description: '',
    maxUses: 1,
    expiresAt: '',
    codePrefix: 'BZ'
  });

  const createGiftCodeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/admin/gift-codes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (newCode) => {
      toast({
        title: "Gift Code Created",
        description: `Code ${newCode.code} created successfully!`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gift-codes'] });
      setFormData({
        credits: 100,
        description: '',
        maxUses: 1,
        expiresAt: '',
        codePrefix: 'BZ'
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create gift code",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.credits || formData.credits <= 0) {
      toast({
        title: "Invalid Credits",
        description: "Credits must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description for the gift code",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      ...formData,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
    };

    createGiftCodeMutation.mutate(submitData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="credits">Credits to Award</Label>
          <Input
            id="credits"
            type="number"
            min="1"
            max="10000"
            value={formData.credits}
            onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
            placeholder="100"
            data-testid="input-gift-credits"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Contest prize, promotion, etc."
            data-testid="input-gift-description"
          />
        </div>

        <div>
          <Label htmlFor="max-uses">Max Uses</Label>
          <Input
            id="max-uses"
            type="number"
            min="1"
            max="1000"
            value={formData.maxUses}
            onChange={(e) => setFormData(prev => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
            placeholder="1"
            data-testid="input-gift-max-uses"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="code-prefix">Code Prefix</Label>
          <Input
            id="code-prefix"
            value={formData.codePrefix}
            onChange={(e) => setFormData(prev => ({ ...prev, codePrefix: e.target.value }))}
            placeholder="BZ"
            maxLength={5}
            data-testid="input-gift-prefix"
          />
        </div>

        <div>
          <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
          <Input
            id="expires-at"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            data-testid="input-gift-expiry"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createGiftCodeMutation.isPending}
          className="w-full bg-honor-gold hover:bg-honor-gold/90 text-tactical-black font-bold"
          data-testid="button-create-gift-code"
        >
          {createGiftCodeMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Generate Gift Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Gift Code List Component
const GiftCodeList = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: giftCodes = [], isLoading } = useQuery({
    queryKey: ['/api/admin/gift-codes']
  });

  const deactivateCodeMutation = useMutation({
    mutationFn: async (codeId: string) => {
      return await apiRequest(`/api/admin/gift-codes/${codeId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Gift Code Deactivated",
        description: "The gift code has been deactivated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/gift-codes'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate gift code",
        variant: "destructive"
      });
    }
  });

  const filteredCodes = giftCodes.filter((code: any) =>
    code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    code.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading gift codes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search gift codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-gift-codes"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredCodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {giftCodes.length === 0 ? "No gift codes created yet" : "No gift codes match your search"}
          </div>
        ) : (
          filteredCodes.map((code: any) => (
            <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 bg-muted rounded font-mono font-bold text-lg">
                    {code.code}
                  </code>
                  <Badge variant={code.isActive ? "default" : "secondary"}>
                    {code.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {code.expiresAt && new Date(code.expiresAt) < new Date() && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{code.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {code.credits} credits
                  </span>
                  <span>{code.usedCount}/{code.maxUses} uses</span>
                  {code.expiresAt && (
                    <span>Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>
                  )}
                  <span>Created: {new Date(code.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                {code.isActive && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deactivateCodeMutation.mutate(code.id)}
                    disabled={deactivateCodeMutation.isPending}
                    data-testid={`button-deactivate-${code.code}`}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Service Badge Components with Animated Glowing Effects
const ServiceBadge = ({ serviceType, size = "md" }: { serviceType: string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const badges = {
    active_duty: {
      icon: "🎖️",
      name: "Active Duty",
      gradient: "from-red-400 via-yellow-400 to-red-600",
      shadowColor: "shadow-red-500/50",
      pulseColor: "animate-pulse bg-red-500/20"
    },
    veteran: {
      icon: "🏅", 
      name: "Veteran",
      gradient: "from-blue-400 via-white to-red-400",
      shadowColor: "shadow-blue-500/50",
      pulseColor: "animate-pulse bg-blue-500/20"
    },
    reserve: {
      icon: "⭐",
      name: "Reserve",
      gradient: "from-green-400 via-yellow-400 to-green-600",
      shadowColor: "shadow-green-500/50", 
      pulseColor: "animate-pulse bg-green-500/20"
    },
    national_guard: {
      icon: "🛡️",
      name: "National Guard",
      gradient: "from-purple-400 via-yellow-400 to-purple-600",
      shadowColor: "shadow-purple-500/50",
      pulseColor: "animate-pulse bg-purple-500/20"
    }
  };

  const badge = badges[serviceType as keyof typeof badges];
  if (!badge) return null;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Breathing Glow Background */}
      <div className={`absolute inset-0 rounded-full ${badge.pulseColor} blur-sm ${sizeClasses[size]}`}></div>
      
      {/* Main Badge */}
      <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${badge.gradient} 
                     flex items-center justify-center text-white font-bold shadow-lg ${badge.shadowColor}
                     ring-2 ring-honor-gold/30 hover:ring-honor-gold/60 transition-all duration-300`}>
        <span className={size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-lg"}>
          {badge.icon}
        </span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-tactical-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {badge.name}
      </div>
    </div>
  );
};

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAwardCredits, setShowAwardCredits] = useState(false);
  const [showVerifyUser, setShowVerifyUser] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Check admin access
  const isAdmin = user?.email === "bravozulufilms@gmail.com";

  // Get all users for admin management
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAdmin,
  });

  // Get credit transactions
  const { data: creditTransactions = [] } = useQuery({
    queryKey: ['/api/admin/credit-transactions'],
    enabled: isAdmin,
  });

  // Get military verification requests
  const { data: verificationRequests = [] } = useQuery({
    queryKey: ['/api/admin/verification-requests'],
    enabled: isAdmin,
  });

  // Get system stats
  const { data: systemStats = {} } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAdmin,
  });

  // Award credits mutation
  const awardCreditsMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: number; reason: string }) => {
      return apiRequest('POST', '/api/admin/award-credits', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credit-transactions'] });
      toast({
        title: "💰 Credits Awarded",
        description: "Credits have been successfully awarded to the user!",
      });
      setShowAwardCredits(false);
    },
  });

  // Verify military service mutation
  const verifyServiceMutation = useMutation({
    mutationFn: async (data: { 
      userId: string; 
      serviceType: string; 
      branch: string; 
      verified: boolean;
      notes?: string;
    }) => {
      return apiRequest('POST', '/api/admin/verify-service', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification-requests'] });
      toast({
        title: "🎖️ Service Verified",
        description: "Military service verification has been updated!",
      });
      setShowVerifyUser(false);
    },
  });

  // Update military service mutation
  const updateMilitaryServiceMutation = useMutation({
    mutationFn: async (data: { 
      userId: string; 
      serviceType: string; 
      branch: string; 
      yearsServed: string;
      notes?: string;
    }) => {
      return apiRequest('PUT', '/api/admin/update-military-service', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] }); // Refresh user session
      toast({
        title: "🎖️ Service Updated",
        description: "Military service information has been updated successfully! Please refresh to see changes.",
      });
      setShowEditService(false);
    },
  });

  // Process monthly veteran credits
  const processMonthlyCredits = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/process-monthly-credits');
    },
    onSuccess: (data) => {
      toast({
        title: "🎁 Monthly Credits Processed",
        description: `Awarded 150 credits to ${(data as any).veteransAwarded} verified veterans!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credit-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Processing Failed",
        description: error.message || "Failed to process monthly credits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = (allUsers as any[]).filter((u: any) => {
    const matchesSearch = u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "verified" && u.isVerified) ||
                         (filterStatus === "pending" && (u.militaryBranch || u.relationshipType) && !u.isVerified) ||
                         (filterStatus === "civilian" && !u.militaryBranch && !u.relationshipType);
    
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-red-500" />
              RESTRICTED ACCESS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              This area is restricted to authorized administrators only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-tactical-gray hover:text-white hover:bg-red-500/20 border-tactical-gray"
            onClick={() => window.location.href = "/"}
            data-testid="button-back-to-app"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
              Admin Mode
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="text-tactical-gray hover:text-white hover:bg-red-500/20 border-tactical-gray"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-500/20 rounded-full ring-2 ring-red-500/50">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="font-command text-4xl font-bold text-red-500 mb-2">
            🛡️ ADMIN COMMAND CENTER
          </h1>
          <p className="font-rajdhani text-xl text-tactical-gray mb-4">
            MILITARY SERVICE VERIFICATION • CREDIT MANAGEMENT • SYSTEM CONTROL
          </p>
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-honor-gold" />
            <Badge variant="secondary" className="bg-red-500 text-white font-bold">
              ADMINISTRATOR ACCESS
            </Badge>
            <Crown className="w-5 h-5 text-honor-gold" />
          </div>
        </div>

        {/* System Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-red-500">{(systemStats as any).totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Veterans</p>
                  <p className="text-2xl font-bold text-green-500">{(systemStats as any).verifiedVeterans || 0}</p>
                </div>
                <Medal className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verifications</p>
                  <p className="text-2xl font-bold text-yellow-500">{(verificationRequests as any[]).length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-honor-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Awarded</p>
                  <p className="text-2xl font-bold text-honor-gold">{(systemStats as any).creditsAwarded || 0}</p>
                </div>
                <CreditCard className="w-8 h-8 text-honor-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Interface */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-tactical-black/20 h-auto">
            <TabsTrigger value="users" className="font-rajdhani data-[state=active]:text-white data-[state=active]:bg-red-500 text-xs lg:text-sm px-2 py-3">
              <span className="hidden sm:inline">User Management</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="font-rajdhani data-[state=active]:text-white data-[state=active]:bg-red-500 text-xs lg:text-sm px-2 py-3">
              <span className="hidden sm:inline">Service Verification</span>
              <span className="sm:hidden">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="font-rajdhani data-[state=active]:text-white data-[state=active]:bg-red-500 text-xs lg:text-sm px-2 py-3">
              <span className="hidden sm:inline">Credit System</span>
              <span className="sm:hidden">Credits</span>
            </TabsTrigger>
            <TabsTrigger value="gift-codes" className="font-rajdhani data-[state=active]:text-white data-[state=active]:bg-red-500 text-xs lg:text-sm px-2 py-3">
              <span className="hidden sm:inline">Gift Codes</span>
              <span className="sm:hidden">Codes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-rajdhani data-[state=active]:text-white data-[state=active]:bg-red-500 text-xs lg:text-sm px-2 py-3">
              <span className="hidden sm:inline">System Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-users"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="verified">Verified Military</SelectItem>
                      <SelectItem value="pending">Pending Verification</SelectItem>
                      <SelectItem value="civilian">Civilian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Users</CardTitle>
                <CardDescription>Manage user accounts and military service verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No users found matching your criteria.
                    </p>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <div key={user.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg space-y-3 lg:space-y-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {user.isVerified && user.relationshipType && (
                              <ServiceBadge serviceType={user.relationshipType} size="sm" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              {user.militaryBranch && (
                                <p className="text-xs text-blue-500">
                                  {user.militaryBranch.replace('_', ' ').toUpperCase()} • {user.relationshipType?.toUpperCase()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                          <Badge variant={user.isVerified ? "default" : "secondary"} className="text-xs px-2 py-1 mb-1 sm:mb-0">
                            {user.isVerified ? "Verified" : 
                             user.militaryBranch || user.relationshipType ? "Pending" : "Civilian"}
                          </Badge>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowAwardCredits(true);
                              }}
                              data-testid={`button-award-credits-${user.id}`}
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Credits</span>
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowVerifyUser(true);
                              }}
                              data-testid={`button-verify-user-${user.id}`}
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Verify</span>
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditService(true);
                              }}
                              data-testid={`button-edit-service-${user.id}`}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <h2 className="font-command text-2xl font-bold">Military Service Verification</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="w-full lg:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Service Badge Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Service Recognition Badges</CardTitle>
                <CardDescription>Distinctive badges awarded upon verification with animated glowing effects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <ServiceBadge serviceType="active_duty" size="lg" />
                    <p className="font-medium mt-2">Active Duty</p>
                    <p className="text-xs text-muted-foreground">Currently serving</p>
                  </div>
                  <div className="text-center">
                    <ServiceBadge serviceType="veteran" size="lg" />
                    <p className="font-medium mt-2">Veteran</p>
                    <p className="text-xs text-muted-foreground">150 monthly credits</p>
                  </div>
                  <div className="text-center">
                    <ServiceBadge serviceType="reserve" size="lg" />
                    <p className="font-medium mt-2">Reserve</p>
                    <p className="text-xs text-muted-foreground">Part-time service</p>
                  </div>
                  <div className="text-center">
                    <ServiceBadge serviceType="national_guard" size="lg" />
                    <p className="font-medium mt-2">National Guard</p>
                    <p className="text-xs text-muted-foreground">State and federal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Verification Requests</CardTitle>
                <CardDescription>Review and approve military service documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(verificationRequests as any[]).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No pending verification requests.
                    </p>
                  ) : (
                    (verificationRequests as any[]).map((request: any) => (
                      <div key={request.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg space-y-3 lg:space-y-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{request.user.firstName} {request.user.lastName}</p>
                          <p className="text-sm text-muted-foreground truncate">{request.user.email}</p>
                          <p className="text-xs text-blue-500">
                            {request.branch} • {request.serviceType} • {request.yearsServed} years
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                            onClick={() => verifyServiceMutation.mutate({
                              userId: request.userId,
                              serviceType: request.serviceType,
                              branch: request.branch,
                              verified: true
                            })}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full sm:w-auto"
                            onClick={() => verifyServiceMutation.mutate({
                              userId: request.userId,
                              serviceType: request.serviceType,
                              branch: request.branch,
                              verified: false,
                              notes: "Requires additional documentation"
                            })}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credit System Tab */}
          <TabsContent value="credits" className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <h2 className="font-command text-2xl font-bold">Credit Management System</h2>
              <Button
                className="bg-green-500 hover:bg-green-600 w-full lg:w-auto"
                onClick={() => processMonthlyCredits.mutate()}
                disabled={processMonthlyCredits.isPending}
                data-testid="button-process-monthly-credits"
              >
                {processMonthlyCredits.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Gift className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">Process Monthly Veteran Credits</span>
                <span className="sm:hidden">Monthly Credits</span>
              </Button>
            </div>

            {/* Credit System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-500" />
                  Veteran Monthly Credits Program
                </CardTitle>
                <CardDescription>
                  Verified veterans automatically receive 150 credits monthly as appreciation for their service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Medal className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      Automatic Monthly Benefit
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Every verified veteran receives 150 bonus credits on the 1st of each month.
                    This ongoing benefit recognizes their service and provides additional access to premium features.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Credit Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Credit Transactions</CardTitle>
                <CardDescription>Track credit awards and system transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(creditTransactions as any[]).slice(0, 10).map((transaction: any) => (
                    <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <CreditCard className="w-5 h-5 text-honor-gold flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{transaction.user.firstName} {transaction.user.lastName}</p>
                          <p className="text-sm text-muted-foreground truncate">{transaction.description}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="font-bold text-green-500">+{transaction.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gift Code Management Tab */}
          <TabsContent value="gift-codes" className="space-y-6">
            <h2 className="font-command text-2xl font-bold">Gift Code Management</h2>
            
            {/* Create New Gift Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-honor-gold" />
                  Create New Gift Code
                </CardTitle>
                <CardDescription>
                  Generate gift codes for contests, giveaways, and promotions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GiftCodeGenerator />
              </CardContent>
            </Card>

            {/* Existing Gift Codes */}
            <Card>
              <CardHeader>
                <CardTitle>Active Gift Codes</CardTitle>
                <CardDescription>Manage and monitor existing gift codes</CardDescription>
              </CardHeader>
              <CardContent>
                <GiftCodeList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="font-command text-2xl font-bold">System Configuration</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure system-wide preferences and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-Verify Veterans</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically process monthly veteran credit awards
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Military Badge Display</Label>
                    <p className="text-sm text-muted-foreground">
                      Show service badges throughout the platform
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">Monthly Credit Amount</Label>
                  <Input
                    type="number"
                    defaultValue="150"
                    className="w-32"
                    data-testid="input-monthly-credits"
                  />
                  <p className="text-sm text-muted-foreground">
                    Credits awarded to verified veterans each month
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Award Credits Dialog */}
        <Dialog open={showAwardCredits} onOpenChange={setShowAwardCredits}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award Credits</DialogTitle>
              <DialogDescription>
                Grant credits to {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="credit-amount">Credit Amount</Label>
                <Input
                  id="credit-amount"
                  type="number"
                  placeholder="Enter amount..."
                  data-testid="input-credit-amount"
                />
              </div>
              <div>
                <Label htmlFor="credit-reason">Reason</Label>
                <Textarea
                  id="credit-reason"
                  placeholder="Reason for awarding credits..."
                  data-testid="textarea-credit-reason"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAwardCredits(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                  data-testid="button-confirm-award-credits"
                >
                  Award Credits
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Verify Service Dialog */}
        <Dialog open={showVerifyUser} onOpenChange={setShowVerifyUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Military Service</DialogTitle>
              <DialogDescription>
                Update military service verification for {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="service-type">Service Type</Label>
                <Select>
                  <SelectTrigger data-testid="select-service-type">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active_duty">Active Duty</SelectItem>
                    <SelectItem value="veteran">Veteran</SelectItem>
                    <SelectItem value="reserve">Reserve</SelectItem>
                    <SelectItem value="national_guard">National Guard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="branch">Military Branch</Label>
                <Select>
                  <SelectTrigger data-testid="select-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="army">Army</SelectItem>
                    <SelectItem value="navy">Navy</SelectItem>
                    <SelectItem value="air_force">Air Force</SelectItem>
                    <SelectItem value="marines">Marines</SelectItem>
                    <SelectItem value="coast_guard">Coast Guard</SelectItem>
                    <SelectItem value="space_force">Space Force</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="verification-notes">Notes</Label>
                <Textarea
                  id="verification-notes"
                  placeholder="Additional verification notes..."
                  data-testid="textarea-verification-notes"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowVerifyUser(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  data-testid="button-confirm-verify"
                >
                  Verify Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Military Service Dialog */}
        <Dialog open={showEditService} onOpenChange={setShowEditService}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>🎖️ Edit Military Service</DialogTitle>
              <DialogDescription>
                Update military service information for {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-service-type">Service Type</Label>
                <Select 
                  defaultValue={selectedUser?.militaryVerification?.serviceType || ""}
                  onValueChange={(value) => {
                    document.getElementById('edit-service-type')?.setAttribute('data-value', value);
                  }}
                >
                  <SelectTrigger id="edit-service-type" data-testid="select-edit-service-type">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active_duty">Active Duty</SelectItem>
                    <SelectItem value="veteran">Veteran</SelectItem>
                    <SelectItem value="reserve">Reserve</SelectItem>
                    <SelectItem value="national_guard">National Guard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-branch">Military Branch</Label>
                <Select 
                  defaultValue={selectedUser?.militaryVerification?.branch || ""}
                  onValueChange={(value) => {
                    document.getElementById('edit-branch')?.setAttribute('data-value', value);
                  }}
                >
                  <SelectTrigger id="edit-branch" data-testid="select-edit-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="army">Army</SelectItem>
                    <SelectItem value="navy">Navy</SelectItem>
                    <SelectItem value="air_force">Air Force</SelectItem>
                    <SelectItem value="marines">Marines</SelectItem>
                    <SelectItem value="coast_guard">Coast Guard</SelectItem>
                    <SelectItem value="space_force">Space Force</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-years-served">Years of Service</Label>
                <Input
                  id="edit-years-served"
                  placeholder="e.g., 10"
                  defaultValue={selectedUser?.militaryVerification?.yearsServed || ""}
                  data-testid="input-edit-years-served"
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Additional Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Any additional notes about service..."
                  defaultValue={selectedUser?.militaryVerification?.notes || ""}
                  data-testid="textarea-edit-notes"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditService(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => {
                    const serviceType = document.getElementById('edit-service-type')?.getAttribute('data-value') || 
                                      selectedUser?.militaryVerification?.serviceType || '';
                    const branch = document.getElementById('edit-branch')?.getAttribute('data-value') || 
                                  selectedUser?.militaryVerification?.branch || '';
                    const yearsServed = (document.getElementById('edit-years-served') as HTMLInputElement)?.value || '';
                    const notes = (document.getElementById('edit-notes') as HTMLTextAreaElement)?.value || '';
                    
                    if (selectedUser && serviceType && branch) {
                      updateMilitaryServiceMutation.mutate({
                        userId: selectedUser.id,
                        serviceType,
                        branch,
                        yearsServed,
                        notes
                      });
                    }
                  }}
                  data-testid="button-confirm-edit-service"
                >
                  Update Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}