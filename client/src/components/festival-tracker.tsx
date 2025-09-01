import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Film,
  Star,
  Target,
  Globe,
} from "lucide-react";
import type { FestivalSubmission, Script, Project } from "@shared/schema";

const submissionFormSchema = z.object({
  projectId: z.string().optional(),
  scriptId: z.string().optional(),
  festivalName: z.string().min(1, "Festival name is required"),
  festivalLocation: z.string().optional(),
  festivalWebsite: z.string().optional(),
  submissionCategory: z.string().optional(),
  submissionDeadline: z.string().optional(),
  submissionFee: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn']).default('draft'),
  notes: z.string().optional(),
});

type SubmissionFormData = z.infer<typeof submissionFormSchema>;

export function FestivalTracker() {
  const [isNewSubmissionOpen, setIsNewSubmissionOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FestivalSubmission | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      festivalName: "",
      festivalLocation: "",
      festivalWebsite: "",
      submissionCategory: "",
      submissionDeadline: "",
      submissionFee: "",
      status: "draft",
      notes: "",
    },
  });

  // Fetch submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/festival-submissions"],
    retry: false,
  });

  // Fetch user's scripts and projects for the form
  const { data: scripts = [] } = useQuery({
    queryKey: ["/api/scripts"],
    retry: false,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects/my"],
    retry: false,
  });

  // Create submission mutation
  const createSubmissionMutation = useMutation({
    mutationFn: async (data: SubmissionFormData) => {
      const response = await apiRequest("POST", "/api/festival-submissions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/festival-submissions"] });
      setIsNewSubmissionOpen(false);
      form.reset();
      toast({
        title: "Submission Created",
        description: "Your festival submission has been created successfully.",
      });
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
        title: "Error",
        description: "Failed to create submission. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update submission status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/festival-submissions/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/festival-submissions"] });
      toast({
        title: "Status Updated",
        description: "Submission status has been updated successfully.",
      });
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
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmission = (data: SubmissionFormData) => {
    // Convert deadline string to proper format if provided
    const processedData = {
      ...data,
      submissionDeadline: data.submissionDeadline ? new Date(data.submissionDeadline).toISOString() : undefined,
    };
    createSubmissionMutation.mutate(processedData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return FileText;
      case "submitted": return Send;
      case "under_review": return Clock;
      case "accepted": return CheckCircle;
      case "rejected": return XCircle;
      case "withdrawn": return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "submitted": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "under_review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accepted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "withdrawn": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredSubmissions = activeTab === "all" 
    ? submissions 
    : submissions.filter((submission: FestivalSubmission) => submission.status === activeTab);

  const submissionStats = {
    total: submissions.length,
    draft: submissions.filter((s: FestivalSubmission) => s.status === "draft").length,
    submitted: submissions.filter((s: FestivalSubmission) => s.status === "submitted").length,
    under_review: submissions.filter((s: FestivalSubmission) => s.status === "under_review").length,
    accepted: submissions.filter((s: FestivalSubmission) => s.status === "accepted").length,
    rejected: submissions.filter((s: FestivalSubmission) => s.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold flex items-center">
            <Trophy className="w-8 h-8 text-primary mr-3" />
            Festival Tracker
          </h2>
          <p className="text-muted-foreground mt-2">
            Track your submissions to film festivals and competitions
          </p>
        </div>
        <Dialog open={isNewSubmissionOpen} onOpenChange={setIsNewSubmissionOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-submission">
              <Plus className="w-4 h-4 mr-2" />
              New Submission
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="dialog-new-submission">
            <DialogHeader>
              <DialogTitle>Create Festival Submission</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateSubmission)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="festivalName">Festival Name *</Label>
                  <Input
                    id="festivalName"
                    {...form.register("festivalName")}
                    placeholder="e.g., Sundance Film Festival"
                    data-testid="input-festival-name"
                  />
                  {form.formState.errors.festivalName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.festivalName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="festivalLocation">Location</Label>
                  <Input
                    id="festivalLocation"
                    {...form.register("festivalLocation")}
                    placeholder="e.g., Park City, Utah"
                    data-testid="input-festival-location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="festivalWebsite">Festival Website</Label>
                <Input
                  id="festivalWebsite"
                  {...form.register("festivalWebsite")}
                  placeholder="https://sundance.org"
                  data-testid="input-festival-website"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submissionCategory">Category</Label>
                  <Input
                    id="submissionCategory"
                    {...form.register("submissionCategory")}
                    placeholder="e.g., Short Film, Documentary"
                    data-testid="input-submission-category"
                  />
                </div>
                <div>
                  <Label htmlFor="submissionFee">Submission Fee</Label>
                  <Input
                    id="submissionFee"
                    {...form.register("submissionFee")}
                    placeholder="e.g., $50, $75"
                    data-testid="input-submission-fee"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submissionDeadline">Deadline</Label>
                  <Input
                    id="submissionDeadline"
                    type="date"
                    {...form.register("submissionDeadline")}
                    data-testid="input-submission-deadline"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as any)}>
                    <SelectTrigger data-testid="select-submission-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectId">Link to Project (Optional)</Label>
                  <Select value={form.watch("projectId") || ""} onValueChange={(value) => form.setValue("projectId", value || undefined)}>
                    <SelectTrigger data-testid="select-project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No project</SelectItem>
                      {projects.map((project: Project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scriptId">Link to Script (Optional)</Label>
                  <Select value={form.watch("scriptId") || ""} onValueChange={(value) => form.setValue("scriptId", value || undefined)}>
                    <SelectTrigger data-testid="select-script">
                      <SelectValue placeholder="Select script" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No script</SelectItem>
                      {scripts.map((script: Script) => (
                        <SelectItem key={script.id} value={script.id}>
                          {script.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Add any additional notes about this submission..."
                  className="min-h-[80px]"
                  data-testid="textarea-notes"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewSubmissionOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createSubmissionMutation.isPending}
                  data-testid="button-create-submission"
                >
                  {createSubmissionMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Submission
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-6 gap-4">
        <Card className="text-center" data-testid="card-total-submissions">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{submissionStats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="text-center" data-testid="card-draft-submissions">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{submissionStats.draft}</div>
            <div className="text-sm text-muted-foreground">Draft</div>
          </CardContent>
        </Card>
        <Card className="text-center" data-testid="card-submitted-submissions">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{submissionStats.submitted}</div>
            <div className="text-sm text-muted-foreground">Submitted</div>
          </CardContent>
        </Card>
        <Card className="text-center" data-testid="card-review-submissions">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{submissionStats.under_review}</div>
            <div className="text-sm text-muted-foreground">Under Review</div>
          </CardContent>
        </Card>
        <Card className="text-center" data-testid="card-accepted-submissions">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{submissionStats.accepted}</div>
            <div className="text-sm text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
        <Card className="text-center" data-testid="card-rejected-submissions">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{submissionStats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card data-testid="card-submissions">
        <CardHeader>
          <CardTitle>Festival Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="under_review">Review</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {submissionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-24 bg-muted rounded-lg"></div>
                  ))}
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4">
                    {activeTab === "all" ? "No Submissions Yet" : `No ${activeTab.replace("_", " ")} submissions`}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {activeTab === "all" 
                      ? "Start tracking your festival submissions to keep organized and never miss a deadline."
                      : `You don't have any ${activeTab.replace("_", " ")} submissions yet.`
                    }
                  </p>
                  {activeTab === "all" && (
                    <Button onClick={() => setIsNewSubmissionOpen(true)} data-testid="button-first-submission">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Submission
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission: any) => {
                    const StatusIcon = getStatusIcon(submission.status);
                    return (
                      <div
                        key={submission.id}
                        className="border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200"
                        data-testid={`submission-${submission.id}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold">{submission.festivalName}</h3>
                              <Badge className={`${getStatusColor(submission.status)} text-xs`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {submission.status.replace("_", " ")}
                              </Badge>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                              {submission.festivalLocation && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{submission.festivalLocation}</span>
                                </div>
                              )}
                              {submission.submissionDeadline && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Due: {new Date(submission.submissionDeadline).toLocaleDateString()}</span>
                                </div>
                              )}
                              {submission.submissionFee && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>Fee: {submission.submissionFee}</span>
                                </div>
                              )}
                            </div>

                            {(submission.project || submission.script) && (
                              <div className="flex items-center space-x-4 mt-3">
                                {submission.project && (
                                  <div className="flex items-center space-x-1 text-sm">
                                    <Film className="w-3 h-3" />
                                    <span>Project: {submission.project.title}</span>
                                  </div>
                                )}
                                {submission.script && (
                                  <div className="flex items-center space-x-1 text-sm">
                                    <FileText className="w-3 h-3" />
                                    <span>Script: {submission.script.title}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {submission.festivalWebsite && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(submission.festivalWebsite, "_blank")}
                                data-testid={`button-website-${submission.id}`}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Select
                              value={submission.status}
                              onValueChange={(status) => updateStatusMutation.mutate({ id: submission.id, status })}
                            >
                              <SelectTrigger className="w-32" data-testid={`select-status-${submission.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {submission.notes && (
                          <div className="bg-muted/30 rounded-lg p-3 mt-4">
                            <p className="text-sm">{submission.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}