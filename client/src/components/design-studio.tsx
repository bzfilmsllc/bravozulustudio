import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Palette,
  WandSparkles,
  Image,
  Download,
  Share,
  Trash2,
  Edit,
  Eye,
  Plus,
  Loader2,
  Sparkles,
  Film,
  Building,
  Users,
  Star,
} from "lucide-react";
import type { DesignAsset } from "@shared/schema";

export function DesignStudio() {
  const [activeView, setActiveView] = useState("generator");
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's design assets
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["/api/design-assets"],
  });

  // Fetch user's projects for linking assets
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Generate design asset mutation
  const generateAsset = useMutation({
    mutationFn: async (data: {
      prompt: string;
      title: string;
      assetType: string;
      category?: string;
      projectId?: string;
      tags?: string[];
    }) => {
      return apiRequest("POST", "/api/design-assets/generate", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/design-assets"] });
      toast({
        title: "Success",
        description: "Design asset generated successfully!",
      });
      setGeneratorOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate design asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete asset mutation
  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/design-assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/design-assets"] });
      toast({
        title: "Success",
        description: "Design asset deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete design asset.",
        variant: "destructive",
      });
    },
  });

  const assetTypes = [
    { value: "logo", label: "Logo", icon: Building },
    { value: "poster", label: "Movie Poster", icon: Film },
    { value: "banner", label: "Banner", icon: Image },
    { value: "thumbnail", label: "Thumbnail", icon: Star },
    { value: "social_media", label: "Social Media", icon: Share },
  ];

  const categories = [
    { value: "production_company", label: "Production Company" },
    { value: "film_title", label: "Film Title" },
    { value: "character", label: "Character" },
    { value: "event", label: "Event" },
    { value: "marketing", label: "Marketing" },
  ];

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const downloadImage = async (asset: DesignAsset) => {
    try {
      // Record download
      await apiRequest("POST", `/api/design-assets/${asset.id}/download`);

      // Download the image
      const link = document.createElement("a");
      link.href = asset.imageUrl;
      link.download = `${asset.title.replace(/\s+/g, "_")}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your design asset is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the asset.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-6 h-6 text-primary mr-3" />
            Design Studio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generator" data-testid="tab-generator">AI Generator</TabsTrigger>
              <TabsTrigger value="library" data-testid="tab-library">Asset Library</TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
            </TabsList>

            {/* AI Generator Tab */}
            <TabsContent value="generator" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assetTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card key={type.value} className="hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">{type.label}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          AI-powered {type.label.toLowerCase()} creation
                        </p>
                        <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full" data-testid={`button-generate-${type.value}`}>
                              <WandSparkles className="w-4 h-4 mr-2" />
                              Generate {type.label}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <GeneratorForm
                              assetType={type.value}
                              assetTypeLabel={type.label}
                              projects={projects}
                              categories={categories}
                              onSubmit={(data) => generateAsset.mutate({ ...data, assetType: type.value })}
                              isLoading={generateAsset.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Asset Library Tab */}
            <TabsContent value="library" className="space-y-6">
              {assetsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : assets && Array.isArray(assets) && assets.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(assets as any[]).map((asset: DesignAsset & { project?: any }) => (
                    <Card key={asset.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted relative">
                        <img
                          src={asset.imageUrl}
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadImage(asset)}
                            data-testid={`button-download-${asset.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAsset.mutate(asset.id)}
                            data-testid={`button-delete-${asset.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold truncate">{asset.title}</h3>
                          <Badge variant="outline">{asset.assetType}</Badge>
                        </div>
                        {asset.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {asset.description}
                          </p>
                        )}
                        {asset.project && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Project: {asset.project.title}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Created {formatDate(asset.createdAt)}</span>
                          <span>{asset.downloadCount} downloads</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Assets Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start creating your first design asset using our AI generator.
                    </p>
                    <Button onClick={() => setActiveView("generator")} data-testid="button-start-creating">
                      <Plus className="w-4 h-4 mr-2" />
                      Start Creating
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardContent className="text-center py-12">
                  <WandSparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Premium Templates Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Professional templates for posters, logos, and marketing materials will be available soon.
                  </p>
                  <Button variant="outline" data-testid="button-notify-templates">
                    Notify When Available
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function GeneratorForm({
  assetType,
  assetTypeLabel,
  projects,
  categories,
  onSubmit,
  isLoading,
}: {
  assetType: string;
  assetTypeLabel: string;
  projects: unknown;
  categories: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    category: "",
    projectId: "",
    tags: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : [];
    onSubmit({
      ...formData,
      tags,
      projectId: formData.projectId || undefined,
      category: formData.category || undefined,
    });
  };

  const getPromptSuggestion = (type: string) => {
    const suggestions: Record<string, string> = {
      logo: "Modern, professional logo for a film production company, clean design, cinematic style",
      poster: "Movie poster for an action thriller, dramatic lighting, bold typography, compelling character",
      banner: "Website banner for film festival, elegant and sophisticated design, film reel elements",
      thumbnail: "YouTube thumbnail for movie trailer, attention-grabbing, high contrast, exciting",
      social_media: "Instagram post for movie promotion, vibrant colors, engaging visual elements",
    };
    return suggestions[type] || "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          Generate {assetTypeLabel}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={`My ${assetTypeLabel}`}
            required
            data-testid="input-title"
          />
        </div>

        <div>
          <Label htmlFor="prompt">Description</Label>
          <Textarea
            id="prompt"
            value={formData.prompt}
            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            placeholder={getPromptSuggestion(assetType)}
            rows={3}
            required
            data-testid="input-prompt"
          />
        </div>

        <div>
          <Label htmlFor="category">Category (Optional)</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {Array.isArray(projects) && projects.length > 0 && (
          <div>
            <Label htmlFor="project">Link to Project (Optional)</Label>
            <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
              <SelectTrigger data-testid="select-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {(projects as any[]).map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="tags">Tags (Optional)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="action, thriller, dark, professional (comma separated)"
            data-testid="input-tags"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full" data-testid="button-generate">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <WandSparkles className="w-4 h-4 mr-2" />
              Generate {assetTypeLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}