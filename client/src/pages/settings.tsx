import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ErrorConsentModal } from "@/components/error-consent-modal";
import type { UploadResult } from "@uppy/core";
import {
  User,
  Camera,
  Shield,
  Save,
  Edit,
  Lock,
  Mail,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  Users,
} from "lucide-react";

// Form validation schema
const settingsFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function Settings() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user data
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      location: user?.location || "",
      bio: user?.bio || "",
      specialties: user?.specialties || "",
    },
  });

  // Update form when user data loads
  if (user && !form.formState.isDirty) {
    form.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      location: user.location || "",
      bio: user.bio || "",
      specialties: user.specialties || "",
    });
  }

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  // Profile picture upload handlers
  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleProfilePictureComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const profileImageURL = uploadedFile.uploadURL;
      
      try {
        await apiRequest("PUT", "/api/profile/picture", { profileImageURL });
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been successfully updated.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to update profile picture.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = (data: SettingsFormData) => {
    updateProfileMutation.mutate(data);
  };

  const getServiceBadge = (user: any) => {
    if (!user?.isVerified || !user?.militaryBranch) return null;

    const getBadgeStyle = (branch: string, relationshipType: string) => {
      const isActiveDuty = relationshipType === "active_duty";
      const isVeteran = relationshipType === "veteran";
      const isReserve = relationshipType === "reserve";
      const isNationalGuard = relationshipType === "national_guard";

      if (isActiveDuty) return "bg-red-600 text-white border-yellow-400 animate-pulse";
      if (isVeteran) return "bg-blue-600 text-white border-red-400";
      if (isReserve) return "bg-green-600 text-white border-yellow-400";
      if (isNationalGuard) return "bg-purple-600 text-white border-yellow-400";
      return "bg-gray-600 text-white border-gray-400";
    };

    return (
      <Badge className={`${getBadgeStyle(user.militaryBranch, user.relationshipType)} border-2 font-military text-xs`}>
        <Shield className="w-3 h-3 mr-1" />
        {user.militaryBranch.toUpperCase()} {user.relationshipType?.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="military-card p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-gold font-military">USER SETTINGS</h1>
          <p className="text-muted-foreground">Configure your profile and account preferences</p>
        </div>

        {/* Profile Overview Card */}
        <Card className="military-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5242880} // 5MB
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleProfilePictureComplete}
                      buttonClassName="w-8 h-8 rounded-full p-0 bg-primary hover:bg-primary/90"
                    >
                      <Camera className="w-4 h-4" />
                    </ObjectUploader>
                  </div>
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <span className="font-military">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email || "User"
                      }
                    </span>
                    {getServiceBadge(user)}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </span>
                    {user?.location && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                variant="outline"
                size="sm"
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditingProfile ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          {user?.bio && (
            <CardContent>
              <p className="text-muted-foreground">{user.bio}</p>
            </CardContent>
          )}
        </Card>

        {/* Profile Edit Form */}
        {isEditingProfile && (
          <Card className="military-card">
            <CardHeader>
              <CardTitle className="font-military">EDIT PROFILE</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State/Country" {...field} data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself, your background, and what you do..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialties</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Screenwriting, Directing, Cinematography, Sound Design"
                            {...field}
                            data-testid="input-specialties"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card className="military-card">
          <CardHeader>
            <CardTitle className="font-military">ACCOUNT INFORMATION</CardTitle>
            <CardDescription>View your account status and subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-medium">Role</span>
                </div>
                <Badge variant={user?.role === 'verified' ? 'default' : 'secondary'}>
                  {user?.role === 'verified' ? 'Verified Member' : 
                   user?.role === 'pending' ? 'Pending Verification' : 'Public Member'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">Member Since</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-medium">Credits</span>
                </div>
                <p className="text-sm font-bold text-primary">{user?.credits || 0} Credits</p>
              </div>
            </div>

            {user?.isVerified && (
              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-2">Military Service Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Branch:</span>
                    <span className="ml-2 font-medium">{user.militaryBranch?.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Service Type:</span>
                    <span className="ml-2 font-medium">
                      {user.relationshipType?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {user.yearsOfService && (
                    <div>
                      <span className="text-muted-foreground">Years of Service:</span>
                      <span className="ml-2 font-medium">{user.yearsOfService}</span>
                    </div>
                  )}
                  {user.rank && (
                    <div>
                      <span className="text-muted-foreground">Rank:</span>
                      <span className="ml-2 font-medium">{user.rank}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="military-card">
          <CardHeader>
            <CardTitle className="font-military flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>SECURITY</span>
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Managed through Replit authentication
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled data-testid="button-change-password">
                  Managed by Replit
                </Button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled data-testid="button-setup-2fa">
                  Coming Soon
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Error Reporting</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure automatic error reporting and privacy settings
                  </p>
                </div>
                <ErrorConsentModal />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}