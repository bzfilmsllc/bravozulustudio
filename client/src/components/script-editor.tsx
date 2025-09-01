import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Save,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  WandSparkles,
  BarChart3,
  Calendar,
} from "lucide-react";
import type { Script } from "@shared/schema";

const scriptFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  genre: z.string().optional(),
  logline: z.string().optional(),
  isPublic: z.boolean().default(false),
  festivalScore: z.string().optional(),
});

type ScriptFormData = z.infer<typeof scriptFormSchema>;

interface ScriptEditorProps {
  scriptId?: string;
  onSave?: (script: Script) => void;
}

export function ScriptEditor({ scriptId, onSave }: ScriptEditorProps) {
  const [isNewScriptOpen, setIsNewScriptOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ScriptFormData>({
    resolver: zodResolver(scriptFormSchema),
    defaultValues: {
      title: "",
      content: "",
      genre: "",
      logline: "",
      isPublic: false,
    },
  });

  // Fetch user scripts
  const { data: scripts = [], isLoading: scriptsLoading } = useQuery({
    queryKey: ["/api/scripts"],
    retry: false,
  });

  // Fetch specific script if scriptId is provided
  const { data: script, isLoading: scriptLoading } = useQuery({
    queryKey: ["/api/scripts", scriptId],
    enabled: !!scriptId,
    retry: false,
  });

  // Create script mutation
  const createScriptMutation = useMutation({
    mutationFn: async (data: ScriptFormData) => {
      const response = await apiRequest("POST", "/api/scripts", data);
      return response.json();
    },
    onSuccess: (newScript) => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      setIsNewScriptOpen(false);
      setSelectedScript(newScript);
      form.reset();
      onSave?.(newScript);
      toast({
        title: "Script Created",
        description: "Your new script has been created successfully.",
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
        description: "Failed to create script. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update script mutation
  const updateScriptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ScriptFormData> }) => {
      const response = await apiRequest("PUT", `/api/scripts/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedScript) => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scripts", updatedScript.id] });
      setSelectedScript(updatedScript);
      onSave?.(updatedScript);
      toast({
        title: "Script Saved",
        description: "Your script has been saved successfully.",
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
        description: "Failed to save script. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete script mutation
  const deleteScriptMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/scripts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      setSelectedScript(null);
      toast({
        title: "Script Deleted",
        description: "Script has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete script. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Load script data when script prop changes
  useEffect(() => {
    if (script) {
      setSelectedScript(script);
      form.reset({
        title: script.title,
        content: script.content || "",
        genre: script.genre || "",
        logline: script.logline || "",
        isPublic: script.isPublic,
      });
    }
  }, [script, form]);

  const onSubmit = (data: ScriptFormData) => {
    if (selectedScript) {
      updateScriptMutation.mutate({ id: selectedScript.id, data });
    } else {
      createScriptMutation.mutate(data);
    }
  };

  const handleNewScript = () => {
    setSelectedScript(null);
    form.reset({
      title: "",
      content: "",
      genre: "",
      logline: "",
      isPublic: false,
    });
    setIsNewScriptOpen(true);
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
    form.reset({
      title: script.title,
      content: script.content || "",
      genre: script.genre || "",
      logline: script.logline || "",
      isPublic: script.isPublic,
    });
  };

  const handleDeleteScript = (scriptToDelete: Script) => {
    if (confirm("Are you sure you want to delete this script? This action cannot be undone.")) {
      deleteScriptMutation.mutate(scriptToDelete.id);
    }
  };

  const generateFestivalScore = () => {
    // Simulate AI festival scoring
    const scores = ["A+", "A", "A-", "B+", "B", "B-"];
    const randomScore = scores[Math.floor(Math.random() * scores.length)];
    
    if (selectedScript) {
      updateScriptMutation.mutate({
        id: selectedScript.id,
        data: { festivalScore: randomScore }
      });
    }
  };

  if (scriptsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold flex items-center">
            <Edit className="w-8 h-8 text-primary mr-3" />
            AI Script Editor
          </h2>
          <p className="text-muted-foreground">Professional screenwriting tools with AI assistance</p>
        </div>
        <Button onClick={handleNewScript} data-testid="button-new-script">
          <Plus className="w-4 h-4 mr-2" />
          New Script
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Scripts List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="w-5 h-5 mr-2" />
              My Scripts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scripts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No scripts yet. Create your first script to get started.
              </p>
            ) : (
              scripts.map((script: Script) => (
                <div
                  key={script.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                    selectedScript?.id === script.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleSelectScript(script)}
                  data-testid={`script-item-${script.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm truncate">{script.title}</h4>
                    <div className="flex items-center space-x-1">
                      {script.isPublic ? (
                        <Eye className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-muted-foreground" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScript(script);
                        }}
                        data-testid={`button-delete-script-${script.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {script.genre && (
                    <Badge variant="secondary" className="text-xs mb-2">
                      {script.genre}
                    </Badge>
                  )}
                  {script.festivalScore && (
                    <Badge variant="outline" className="text-xs">
                      Festival Score: {script.festivalScore}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(script.updatedAt!).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedScript ? `Editing: ${selectedScript.title}` : "Script Editor"}
              </span>
              <div className="flex items-center space-x-2">
                {selectedScript && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateFestivalScore}
                    data-testid="button-festival-score"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Festival Score
                  </Button>
                )}
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={createScriptMutation.isPending || updateScriptMutation.isPending}
                  data-testid="button-save-script"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {selectedScript ? "Save" : "Create"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Script Metadata */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Enter script title"
                    data-testid="input-script-title"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={form.watch("genre")} onValueChange={(value) => form.setValue("genre", value)}>
                    <SelectTrigger data-testid="select-genre">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="drama">Drama</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="documentary">Documentary</SelectItem>
                      <SelectItem value="animation">Animation</SelectItem>
                      <SelectItem value="sci-fi">Science Fiction</SelectItem>
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="war">War</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="logline">Logline</Label>
                <Input
                  id="logline"
                  {...form.register("logline")}
                  placeholder="One sentence summary of your story"
                  data-testid="input-logline"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={form.watch("isPublic")}
                  onCheckedChange={(checked) => form.setValue("isPublic", checked)}
                  data-testid="switch-public"
                />
                <Label htmlFor="isPublic" className="flex items-center space-x-2">
                  <span>Make script public</span>
                  {form.watch("isPublic") ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Label>
              </div>

              <Separator />

              {/* AI Writing Assistant */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">AI Writing Assistant</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Get AI-powered suggestions for character development, dialogue, and scene structure.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" data-testid="button-ai-character">
                    Character Ideas
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-ai-dialogue">
                    Dialogue Polish
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-ai-structure">
                    Scene Structure
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-ai-format">
                    Format Check
                  </Button>
                </div>
              </div>

              {/* Script Content Editor */}
              <div className="script-editor">
                <Label htmlFor="content">Script Content</Label>
                <Textarea
                  id="content"
                  {...form.register("content")}
                  placeholder="FADE IN:

EXT. MILITARY BASE - DAY

A sprawling military installation stretches across the horizon. The American flag waves proudly in the foreground.

SERGEANT JOHNSON (30s), a decorated veteran with weathered hands and determined eyes, walks across the parade ground."
                  className="min-h-[500px] font-mono text-sm leading-relaxed"
                  data-testid="textarea-script-content"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {form.watch("content")?.length || 0} characters
                  </span>
                  <div className="flex items-center space-x-4">
                    <span>Auto-save enabled</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      Last saved: {selectedScript?.updatedAt ? new Date(selectedScript.updatedAt).toLocaleTimeString() : "Never"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Format Helper */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm">Formatting Guide</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div><strong>SCENE HEADING:</strong> EXT./INT. LOCATION - TIME</div>
                  <div><strong>CHARACTER NAME:</strong> (Centered, uppercase)</div>
                  <div><strong>Dialogue:</strong> (Indented from character name)</div>
                  <div><strong>(Parenthetical):</strong> (Character direction in parentheses)</div>
                  <div><strong>Action:</strong> Present tense, concise descriptions</div>
                  <div><strong>TRANSITION:</strong> FADE IN:, CUT TO:, FADE OUT:</div>
                </CardContent>
              </Card>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* New Script Dialog */}
      <Dialog open={isNewScriptOpen} onOpenChange={setIsNewScriptOpen}>
        <DialogContent data-testid="dialog-new-script">
          <DialogHeader>
            <DialogTitle>Create New Script</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newTitle">Title</Label>
              <Input
                id="newTitle"
                {...form.register("title")}
                placeholder="Enter script title"
                data-testid="input-new-script-title"
              />
            </div>
            <div>
              <Label htmlFor="newGenre">Genre</Label>
              <Select value={form.watch("genre")} onValueChange={(value) => form.setValue("genre", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="drama">Drama</SelectItem>
                  <SelectItem value="comedy">Comedy</SelectItem>
                  <SelectItem value="thriller">Thriller</SelectItem>
                  <SelectItem value="horror">Horror</SelectItem>
                  <SelectItem value="documentary">Documentary</SelectItem>
                  <SelectItem value="animation">Animation</SelectItem>
                  <SelectItem value="sci-fi">Science Fiction</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                  <SelectItem value="war">War</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newLogline">Logline</Label>
              <Input
                id="newLogline"
                {...form.register("logline")}
                placeholder="One sentence summary"
                data-testid="input-new-logline"
              />
            </div>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={createScriptMutation.isPending}
              className="w-full"
              data-testid="button-create-script"
            >
              {createScriptMutation.isPending ? "Creating..." : "Create Script"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
