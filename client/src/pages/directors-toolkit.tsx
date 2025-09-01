import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Camera, 
  MapPin, 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  FilmIcon as Film,
  Settings
} from "lucide-react";

// Define schemas for forms
const shotListSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const shotSchema = z.object({
  shotNumber: z.string().min(1, "Shot number is required"),
  sceneNumber: z.string().optional(),
  shotType: z.enum(['wide', 'medium', 'close_up', 'extreme_close_up', 'over_shoulder', 'two_shot', 'insert', 'cutaway', 'establishing']),
  cameraMovement: z.enum(['static', 'pan', 'tilt', 'zoom', 'dolly', 'crane', 'handheld', 'steadicam']),
  description: z.string().optional(),
  duration: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

const scheduleItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(['shoot', 'rehearsal', 'meeting', 'prep', 'post', 'other']),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const crewMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  department: z.enum(['direction', 'camera', 'sound', 'lighting', 'art', 'wardrobe', 'makeup', 'production', 'post', 'other']),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  rate: z.string().optional(),
  notes: z.string().optional(),
});

const budgetItemSchema = z.object({
  category: z.enum(['pre_production', 'production', 'post_production', 'distribution', 'marketing', 'other']),
  subcategory: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  estimatedCost: z.number().min(0, "Cost must be positive"),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});

export default function DirectorsToolkit() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const { toast } = useToast();

  // Fetch user projects
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects/my"],
  });

  // Fetch project data based on selected project
  const { data: shotLists = [] } = useQuery({
    queryKey: [`/api/projects/${selectedProject}/shot-lists`],
    enabled: !!selectedProject,
  });

  const { data: schedule = [] } = useQuery({
    queryKey: [`/api/projects/${selectedProject}/schedule`],
    enabled: !!selectedProject,
  });

  const { data: crew = [] } = useQuery({
    queryKey: [`/api/projects/${selectedProject}/crew`],
    enabled: !!selectedProject,
  });

  const { data: budget = [] } = useQuery({
    queryKey: [`/api/projects/${selectedProject}/budget`],
    enabled: !!selectedProject,
  });

  const { data: equipment = [] } = useQuery({
    queryKey: [`/api/projects/${selectedProject}/equipment`],
    enabled: !!selectedProject,
  });

  const { data: locations = [] } = useQuery({
    queryKey: [`/api/projects/${selectedProject}/locations`],
    enabled: !!selectedProject,
  });

  // Mutation hooks
  const createShotListMutation = useMutation({
    mutationFn: async (data: z.infer<typeof shotListSchema>) => {
      return apiRequest('POST', `/api/projects/${selectedProject}/shot-lists`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/shot-lists`] });
      toast({ title: "Shot list created successfully!" });
    },
  });

  const createScheduleItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof scheduleItemSchema>) => {
      return apiRequest('POST', `/api/projects/${selectedProject}/schedule`, {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/schedule`] });
      toast({ title: "Schedule item created successfully!" });
    },
  });

  const addCrewMemberMutation = useMutation({
    mutationFn: async (data: z.infer<typeof crewMemberSchema>) => {
      return apiRequest('POST', `/api/projects/${selectedProject}/crew`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/crew`] });
      toast({ title: "Crew member added successfully!" });
    },
  });

  const createBudgetItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof budgetItemSchema>) => {
      return apiRequest('POST', `/api/projects/${selectedProject}/budget`, {
        ...data,
        estimatedCost: Math.round(data.estimatedCost * 100), // Convert to cents
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProject}/budget`] });
      toast({ title: "Budget item created successfully!" });
    },
  });

  // Form instances
  const shotListForm = useForm<z.infer<typeof shotListSchema>>({
    resolver: zodResolver(shotListSchema),
    defaultValues: { name: "", description: "" },
  });

  const scheduleForm = useForm<z.infer<typeof scheduleItemSchema>>({
    resolver: zodResolver(scheduleItemSchema),
    defaultValues: { 
      title: "", 
      type: "shoot",
      startDate: "",
      endDate: "",
      location: "",
      description: "",
      notes: ""
    },
  });

  const crewForm = useForm<z.infer<typeof crewMemberSchema>>({
    resolver: zodResolver(crewMemberSchema),
    defaultValues: { 
      name: "", 
      role: "", 
      department: "direction",
      email: "",
      phone: "",
      emergencyContact: "",
      rate: "",
      notes: ""
    },
  });

  const budgetForm = useForm<z.infer<typeof budgetItemSchema>>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: { 
      category: "production",
      subcategory: "",
      description: "",
      estimatedCost: 0,
      vendor: "",
      notes: ""
    },
  });

  // Calculate budget totals
  const budgetTotal = budget.reduce((sum: number, item: any) => sum + (item.estimatedCost || 0), 0);
  const budgetActual = budget.reduce((sum: number, item: any) => sum + (item.actualCost || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-honor-gold/20 rounded-lg">
                <Film className="w-8 h-8 text-honor-gold" />
              </div>
              <div>
                <h1 className="text-4xl font-orbitron font-bold text-honor-gold mb-2">
                  Director's Toolkit
                </h1>
                <p className="text-xl text-muted-foreground font-rajdhani">
                  Command Central for Film Production Operations
                </p>
              </div>
            </div>

            {/* Project Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-rajdhani font-medium text-honor-gold">Mission:</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64 border-tactical-gray bg-tactical-black/50" data-testid="select-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedProject ? (
            <Card className="border-tactical-gray bg-tactical-black/50">
              <CardContent className="pt-6 text-center">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-orbitron font-bold mb-2">Select Your Mission</h3>
                <p className="text-muted-foreground">
                  Choose a project above to access your Director's Toolkit and manage production operations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 bg-tactical-black/50 border border-tactical-gray">
                <TabsTrigger value="overview" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">Overview</TabsTrigger>
                <TabsTrigger value="shots" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">Shot Lists</TabsTrigger>
                <TabsTrigger value="schedule" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">Schedule</TabsTrigger>
                <TabsTrigger value="crew" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">Crew</TabsTrigger>
                <TabsTrigger value="budget" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">Budget</TabsTrigger>
                <TabsTrigger value="equipment" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">Equipment</TabsTrigger>
                <TabsTrigger value="locations" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">Locations</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-tactical-gray bg-tactical-black/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-honor-gold/20 rounded-lg">
                          <Camera className="w-6 h-6 text-honor-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-rajdhani">Shot Lists</p>
                          <p className="text-2xl font-bold font-orbitron text-honor-gold">{shotLists.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-tactical-gray bg-tactical-black/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-honor-gold/20 rounded-lg">
                          <Calendar className="w-6 h-6 text-honor-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-rajdhani">Schedule Items</p>
                          <p className="text-2xl font-bold font-orbitron text-honor-gold">{schedule.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-tactical-gray bg-tactical-black/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-honor-gold/20 rounded-lg">
                          <Users className="w-6 h-6 text-honor-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-rajdhani">Crew Members</p>
                          <p className="text-2xl font-bold font-orbitron text-honor-gold">{crew.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-tactical-gray bg-tactical-black/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-honor-gold/20 rounded-lg">
                          <DollarSign className="w-6 h-6 text-honor-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-rajdhani">Budget</p>
                          <p className="text-2xl font-bold font-orbitron text-honor-gold">
                            ${(budgetTotal / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="border-tactical-gray bg-tactical-black/50">
                  <CardHeader>
                    <CardTitle className="text-honor-gold font-orbitron">Mission Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-tactical-gray rounded-lg">
                        <div>
                          <h4 className="font-rajdhani font-semibold">Production Status</h4>
                          <p className="text-sm text-muted-foreground">Track your project progress</p>
                        </div>
                        <Badge variant="outline" className="border-honor-gold text-honor-gold">
                          {projects.find((p: any) => p.id === selectedProject)?.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Shot Lists Tab */}
              <TabsContent value="shots" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-orbitron font-bold text-honor-gold">Shot Lists</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90 font-rajdhani" data-testid="button-create-shot-list">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Shot List
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-tactical-gray bg-tactical-black">
                      <DialogHeader>
                        <DialogTitle className="text-honor-gold font-orbitron">Create New Shot List</DialogTitle>
                      </DialogHeader>
                      <Form {...shotListForm}>
                        <form onSubmit={shotListForm.handleSubmit((data) => createShotListMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={shotListForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-honor-gold font-rajdhani">Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g., Main Unit - Day 1" 
                                    className="border-tactical-gray bg-tactical-black/50"
                                    data-testid="input-shot-list-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shotListForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-honor-gold font-rajdhani">Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Optional description..."
                                    className="border-tactical-gray bg-tactical-black/50"
                                    data-testid="input-shot-list-description"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            disabled={createShotListMutation.isPending}
                            className="w-full bg-honor-gold text-tactical-black hover:bg-honor-gold/90 font-rajdhani"
                            data-testid="button-submit-shot-list"
                          >
                            {createShotListMutation.isPending ? "Creating..." : "Create Shot List"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shotLists.map((shotList: any) => (
                    <Card key={shotList.id} className="border-tactical-gray bg-tactical-black/50">
                      <CardHeader>
                        <CardTitle className="text-honor-gold font-rajdhani">{shotList.name}</CardTitle>
                        {shotList.description && (
                          <p className="text-sm text-muted-foreground">{shotList.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="border-honor-gold text-honor-gold">
                            <Camera className="w-3 h-3 mr-1" />
                            Shot List
                          </Badge>
                          <Button variant="outline" size="sm" className="border-tactical-gray text-white hover:bg-tactical-gray/20">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {shotLists.length === 0 && (
                    <Card className="border-tactical-gray bg-tactical-black/50 col-span-full">
                      <CardContent className="pt-6 text-center">
                        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-rajdhani font-semibold mb-2">No Shot Lists Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first shot list to start planning your shots and camera work.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Other tabs would continue with similar structure... */}
              <TabsContent value="schedule">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-orbitron font-bold mb-2">Production Schedule</h3>
                  <p className="text-muted-foreground">Schedule management coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="crew">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-orbitron font-bold mb-2">Crew Management</h3>
                  <p className="text-muted-foreground">Crew management coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="budget">
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-orbitron font-bold mb-2">Budget Tracking</h3>
                  <p className="text-muted-foreground">Budget management coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="equipment">
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-orbitron font-bold mb-2">Equipment Management</h3>
                  <p className="text-muted-foreground">Equipment tracking coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="locations">
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-orbitron font-bold mb-2">Location Scouting</h3>
                  <p className="text-muted-foreground">Location management coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
    </div>
  );
}