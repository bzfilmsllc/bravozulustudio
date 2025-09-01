import { useState, useRef } from "react";
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
import { UploadedFile, FestivalPacket, ExportTemplate } from "@shared/schema";
import {
  Upload,
  Download,
  FileText,
  Film,
  Image,
  Music,
  Archive,
  Package,
  Award,
  Send,
  FileCheck,
  Folder,
  Search,
  Filter,
  Calendar,
  Tag,
  Share2,
  ExternalLink,
  Trash2,
  Edit,
  Copy,
  MoreHorizontal,
  Target,
  Crown,
  Zap,
} from "lucide-react";

export default function FileManager() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePacket, setShowCreatePacket] = useState(false);

  // Get user's uploaded files
  const { data: files = [], isLoading: loadingFiles } = useQuery({
    queryKey: ['/api/files'],
    enabled: isAuthenticated,
  });

  // Get festival packets
  const { data: packets = [] } = useQuery({
    queryKey: ['/api/festival-packets'],
    enabled: isAuthenticated,
  });

  // Get export templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/export-templates'],
    enabled: isAuthenticated,
  });

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiRequest('POST', '/api/files/upload', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      toast({
        title: "📁 File Uploaded",
        description: "Your file has been successfully uploaded and processed!",
      });
    },
  });

  // Create festival packet mutation
  const createPacketMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/festival-packets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/festival-packets'] });
      toast({
        title: "🏆 Festival Packet Created",
        description: "Your submission package is ready for festival entry!",
      });
      setShowCreatePacket(false);
    },
  });

  // Export packet mutation
  const exportPacketMutation = useMutation({
    mutationFn: async (packetId: string) => {
      return apiRequest('POST', `/api/festival-packets/${packetId}/export`);
    },
    onSuccess: (response) => {
      // Download the exported package
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "📦 Package Exported",
        description: "Your festival submission package has been downloaded!",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      uploadFileMutation.mutate(file);
    });
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    Array.from(files).forEach(file => {
      uploadFileMutation.mutate(file);
    });
  };

  const getFileIcon = (fileType: string, mimeType: string) => {
    switch (fileType) {
      case 'script':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Film className="w-8 h-8 text-red-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-green-500" />;
      case 'image':
        return <Image className="w-8 h-8 text-purple-500" />;
      case 'document':
        return <FileCheck className="w-8 h-8 text-orange-500" />;
      default:
        return <Folder className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter((file: UploadedFile) => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || file.fileType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please log in to access the File Manager.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-honor-gold/20 rounded-full ring-2 ring-honor-gold/50">
              <Archive className="w-8 h-8 text-honor-gold" />
            </div>
          </div>
          <h1 className="font-command text-4xl font-bold gradient-medal-gold mb-2">
            📁 FILE COMMAND CENTER
          </h1>
          <p className="font-rajdhani text-xl text-tactical-gray mb-4">
            ADVANCED FILE MANAGEMENT & FESTIVAL SUBMISSION SYSTEM
          </p>
          <div className="flex items-center justify-center gap-2">
            <Target className="w-5 h-5 text-honor-gold" />
            <Badge variant="secondary" className="bg-honor-gold text-tactical-black font-bold">
              MISSION CRITICAL
            </Badge>
            <Target className="w-5 h-5 text-honor-gold" />
          </div>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="files" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-tactical-black/20">
            <TabsTrigger value="files" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              File Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Upload Center
            </TabsTrigger>
            <TabsTrigger value="festival" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Festival Packets
            </TabsTrigger>
            <TabsTrigger value="export" className="font-rajdhani data-[state=active]:text-tactical-black data-[state=active]:bg-honor-gold">
              Export Templates
            </TabsTrigger>
          </TabsList>

          {/* File Library Tab */}
          <TabsContent value="files" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search files by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-files"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Files</SelectItem>
                      <SelectItem value="script">Scripts</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* File Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loadingFiles ? (
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center h-48">
                    <div className="animate-spin w-8 h-8 border-4 border-honor-gold border-t-transparent rounded-full"></div>
                  </CardContent>
                </Card>
              ) : filteredFiles.length === 0 ? (
                <Card className="border-dashed col-span-full">
                  <CardContent className="flex flex-col items-center justify-center h-48">
                    <Archive className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      {searchQuery || filterType !== "all" ? "No files match your criteria" : "No files uploaded yet. Start by uploading your first file!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFiles.map((file: UploadedFile) => (
                  <Card 
                    key={file.id} 
                    className="hover:ring-2 hover:ring-honor-gold/50 transition-all cursor-pointer"
                    data-testid={`card-file-${file.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        {getFileIcon(file.fileType, file.mimeType)}
                        <Badge variant={file.category === 'final' ? 'default' : 'secondary'}>
                          {file.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm truncate" title={file.originalName}>
                        {file.originalName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{formatFileSize(file.fileSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{file.fileType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downloads:</span>
                          <span>{file.downloadCount}</span>
                        </div>
                        {file.tags && file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {file.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Upload Center Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="border-dashed border-2 border-honor-gold/30 hover:border-honor-gold/60 transition-colors">
              <CardContent 
                className="p-12 text-center"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-6 bg-honor-gold/20 rounded-full">
                    <Upload className="w-12 h-12 text-honor-gold" />
                  </div>
                  <h3 className="font-command text-2xl font-bold">Upload Files</h3>
                  <p className="text-muted-foreground max-w-md">
                    Drag and drop your scripts, videos, audio files, and documents here, or click to browse.
                    Supports all major file formats for film production.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                      data-testid="button-upload-files"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                    <Button variant="outline">
                      <Folder className="w-4 h-4 mr-2" />
                      Upload Folder
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upload Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Scripts & Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your screenplays, treatments, and production documents.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Supported: PDF, DOC, DOCX, TXT, FDX, FOUNTAIN
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-red-500" />
                    Video Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Share your films, trailers, and video assets securely.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Supported: MP4, MOV, AVI, MKV, WEBM
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-500" />
                    Visual Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Store posters, stills, and promotional imagery.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Supported: JPG, PNG, GIF, TIFF, BMP, SVG
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Festival Packets Tab */}
          <TabsContent value="festival" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-command text-2xl font-bold">Festival Submission Packets</h2>
              <Dialog open={showCreatePacket} onOpenChange={setShowCreatePacket}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                    data-testid="button-create-packet"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Create Packet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Festival Submission Packet</DialogTitle>
                    <DialogDescription>
                      Organize your files into a professional submission package for film festivals.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="packet-title">Packet Title</Label>
                        <Input 
                          id="packet-title" 
                          placeholder="e.g., Sundance 2024 Submission"
                          data-testid="input-packet-title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="festival-name">Festival Name</Label>
                        <Input 
                          id="festival-name" 
                          placeholder="e.g., Sundance Film Festival"
                          data-testid="input-festival-name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="submission-deadline">Submission Deadline</Label>
                      <Input 
                        id="submission-deadline" 
                        type="date"
                        data-testid="input-deadline"
                      />
                    </div>
                    <div>
                      <Label htmlFor="submission-notes">Submission Notes</Label>
                      <Textarea 
                        id="submission-notes" 
                        placeholder="Add any special requirements or notes for this submission..."
                        data-testid="textarea-notes"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowCreatePacket(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-honor-gold text-tactical-black hover:bg-honor-gold/90"
                        data-testid="button-save-packet"
                      >
                        Create Packet
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packets.length === 0 ? (
                <Card className="border-dashed col-span-full">
                  <CardContent className="flex flex-col items-center justify-center h-48">
                    <Award className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No festival packets created yet. Create your first submission package!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                packets.map((packet: FestivalPacket) => (
                  <Card key={packet.id} className="hover:ring-2 hover:ring-honor-gold/50 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {packet.title}
                        <Badge variant={packet.status === 'ready' ? 'default' : 'secondary'}>
                          {packet.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{packet.festivalName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {packet.submissionDeadline && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Deadline: {new Date(packet.submissionDeadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => exportPacketMutation.mutate(packet.id)}
                            data-testid={`button-export-${packet.id}`}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Export Templates Tab */}
          <TabsContent value="export" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-command text-2xl font-bold">Export Templates</h2>
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Default Templates */}
              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-honor-gold" />
                    Sundance Submission
                  </CardTitle>
                  <CardDescription>Complete package for Sundance Film Festival</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Required Files:</span>
                      <span>7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>Festival Submission</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4 bg-honor-gold text-tactical-black hover:bg-honor-gold/90">
                    Use Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-honor-gold" />
                    Press Kit Package
                  </CardTitle>
                  <CardDescription>Professional press materials bundle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Required Files:</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>Press Kit</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4 bg-honor-gold text-tactical-black hover:bg-honor-gold/90">
                    Use Template
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-honor-gold/20 hover:border-honor-gold/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-honor-gold" />
                    Distribution Package
                  </CardTitle>
                  <CardDescription>Ready for distributor delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Required Files:</span>
                      <span>12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>Distribution</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4 bg-honor-gold text-tactical-black hover:bg-honor-gold/90">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}