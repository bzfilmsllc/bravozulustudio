import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreditManagement } from "@/hooks/useCreditManagement";
import { QuickCreditTopUp } from "@/components/quick-credit-topup";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Zap, 
  Wand2, 
  Search, 
  AlertTriangle, 
  CreditCard,
  Brain,
  Sparkles,
  FileText,
  Target,
  Shield,
  MessageCircle,
  Send,
  Bot,
  User
} from "lucide-react";

interface UserBillingInfo {
  credits: number;
}

export function AIScriptGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    currentCredits,
    requireCredits,
    checkLowBalance,
    showTopUpModal,
    closeTopUpModal,
    handleTopUpSuccess,
    isSuperUser
  } = useCreditManagement();
  
  // Form states
  const [generateForm, setGenerateForm] = useState({
    prompt: '',
    genre: '',
    tone: '',
    length: ''
  });
  
  const [enhanceForm, setEnhanceForm] = useState({
    scriptContent: '',
    enhancement: ''
  });
  
  const [analyzeForm, setAnalyzeForm] = useState({
    scriptContent: ''
  });

  // Chat interface states
  const [chatMessage, setChatMessage] = useState('');
  const [currentScript, setCurrentScript] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Results states
  const [generatedScript, setGeneratedScript] = useState('');
  const [enhancedScript, setEnhancedScript] = useState('');
  const [scriptAnalysis, setScriptAnalysis] = useState('');

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Check for low balance on component mount
  useState(() => {
    if (!isSuperUser) {
      setTimeout(() => checkLowBalance(25), 1000); // Check after 1 second
    }
  });

  // Generate script mutation
  const generateMutation = useMutation({
    mutationFn: (data: typeof generateForm) => apiRequest("/api/ai/generate-script", "POST", data),
    onSuccess: async (response: any) => {
      setGeneratedScript(response.script);
      queryClient.invalidateQueries({ queryKey: ["/api/billing/user-credits"] });
      toast({
        title: "Script Generated!",
        description: `Used ${response.creditsUsed} credits. ${response.remainingCredits} credits remaining.`,
      });
      
      // Check for low balance after usage
      setTimeout(() => checkLowBalance(25), 500);
    },
    onError: (error: any) => {
      console.log('Script generation error:', error);
      if (error.message?.includes('401')) {
        toast({
          title: "Authentication Required",
          description: "Please log in again to continue using AI features",
          variant: "destructive",
        });
        // Redirect to login after a delay
        // DISABLED FOR TESTING: Skip login redirect for Facebook launch
        // setTimeout(() => {
        //   window.location.href = "/api/login";
        // }, 2000);
      } else if (error.message?.includes('402')) {
        // Credit management hook will handle this
        return;
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate script. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Enhance script mutation
  const enhanceMutation = useMutation({
    mutationFn: (data: typeof enhanceForm) => apiRequest("/api/ai/enhance-script", "POST", data),
    onSuccess: async (response: any) => {
      setEnhancedScript(response.enhancedScript);
      queryClient.invalidateQueries({ queryKey: ["/api/billing/user-credits"] });
      toast({
        title: "Script Enhanced!",
        description: `Used ${response.creditsUsed} credits. ${response.remainingCredits} credits remaining.`,
      });
      
      // Check for low balance after usage
      setTimeout(() => checkLowBalance(25), 500);
    },
    onError: async (error: any) => {
      const errorData = await error.response?.json();
      if (error.response?.status === 402) {
        // Credit management hook will handle this
        return;
      } else {
        toast({
          title: "Enhancement Failed",
          description: errorData?.message || "Failed to enhance script",
          variant: "destructive",
        });
      }
    },
  });

  // Analyze script mutation
  const analyzeMutation = useMutation({
    mutationFn: (data: typeof analyzeForm) => apiRequest("/api/ai/analyze-script", "POST", data),
    onSuccess: async (response: any) => {
      setScriptAnalysis(response.analysis);
      queryClient.invalidateQueries({ queryKey: ["/api/billing/user-credits"] });
      toast({
        title: "Script Analyzed!",
        description: `Used ${response.creditsUsed} credits. ${response.remainingCredits} credits remaining.`,
      });
      
      // Check for low balance after usage
      setTimeout(() => checkLowBalance(25), 500);
    },
    onError: async (error: any) => {
      const errorData = await error.response?.json();
      if (error.response?.status === 402) {
        // Credit management hook will handle this
        return;
      } else {
        toast({
          title: "Analysis Failed",
          description: errorData?.message || "Failed to analyze script",
          variant: "destructive",
        });
      }
    },
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: (data: { message: string; scriptContent: string; chatHistory: Array<{role: 'user' | 'assistant', content: string}> }) => 
      apiRequest("/api/ai/chat", "POST", data),
    onSuccess: async (response: any) => {
      // Add assistant response to chat history
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
      queryClient.invalidateQueries({ queryKey: ["/api/billing/user-credits"] });
      toast({
        title: "AI Response Received",
        description: `Used ${response.creditsUsed} credits. ${response.remainingCredits} credits remaining.`,
      });
      
      // Check for low balance after usage
      setTimeout(() => checkLowBalance(25), 500);
    },
    onError: async (error: any) => {
      const errorData = await error.response?.json();
      if (error.response?.status === 402) {
        // Credit management hook will handle this
        return;
      } else {
        toast({
          title: "Chat Failed",
          description: errorData?.message || "Failed to get AI response",
          variant: "destructive",
        });
      }
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a script prompt",
        variant: "destructive",
      });
      return;
    }
    
    // Check credits before generation
    if (!requireCredits(10, "Script Generation")) {
      return;
    }
    
    generateMutation.mutate(generateForm);
  };

  const handleEnhance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enhanceForm.scriptContent.trim() || !enhanceForm.enhancement.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both script content and enhancement requirements",
        variant: "destructive",
      });
      return;
    }
    
    // Check credits before enhancement
    if (!requireCredits(15, "Script Enhancement")) {
      return;
    }
    
    enhanceMutation.mutate(enhanceForm);
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyzeForm.scriptContent.trim()) {
      toast({
        title: "Missing Script",
        description: "Please provide script content to analyze",
        variant: "destructive",
      });
      return;
    }
    
    // Check credits before analysis
    if (!requireCredits(8, "Script Analysis")) {
      return;
    }
    
    analyzeMutation.mutate(analyzeForm);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send to the AI assistant",
        variant: "destructive",
      });
      return;
    }
    
    // Check credits before sending
    if (!requireCredits(5, "AI Chat")) {
      return;
    }

    // Add user message to chat history immediately
    const userMessage = { role: 'user' as const, content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    
    // Send to API
    chatMutation.mutate({
      message: chatMessage,
      scriptContent: currentScript,
      chatHistory: chatHistory
    });
    
    // Clear input
    setChatMessage('');
  };

  const clearChat = () => {
    setChatHistory([]);
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared",
    });
  };

  const loadScriptToChat = (script: string) => {
    setCurrentScript(script);
    toast({
      title: "Script Loaded",
      description: "Script content loaded into chat context. You can now discuss it with the AI assistant.",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Credits Header */}
      <Card className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-yellow-600/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-yellow-400 flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            AI Script Operations Center
            <Shield className="w-6 h-6" />
          </CardTitle>
          <CardDescription className="text-slate-300">
            Advanced AI-powered scriptwriting tools for military filmmakers
          </CardDescription>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50 text-lg px-4 py-2">
              <Zap className="w-5 h-5 mr-2" />
              {isSuperUser ? '∞' : currentCredits} Credits Available
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
              onClick={() => window.location.href = '/billing'}
              data-testid="button-get-credits"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Get More Credits
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-yellow-600/30">
          <TabsTrigger value="generate" className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Script
          </TabsTrigger>
          <TabsTrigger value="enhance" className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400">
            <Sparkles className="w-4 h-4 mr-2" />
            Enhance Script
          </TabsTrigger>
          <TabsTrigger value="analyze" className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400">
            <Search className="w-4 h-4 mr-2" />
            Analyze Script
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-yellow-400">
            <MessageCircle className="w-4 h-4 mr-2" />
            AI Chat Assistant
          </TabsTrigger>
        </TabsList>

        {/* Generate Script Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-yellow-600/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Script Generation
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Generate professional military-themed scripts with AI
                </CardDescription>
                <Badge className="bg-red-900/50 text-red-300 border-red-600/50 w-fit">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  10 Credits Required
                </Badge>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <Label htmlFor="prompt" className="text-yellow-400">Script Prompt *</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe your military script idea... (e.g., 'A Navy SEAL team infiltrates an enemy compound to rescue hostages')"
                      value={generateForm.prompt}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, prompt: e.target.value }))}
                      className="bg-slate-950/50 border-slate-600 text-white placeholder-slate-400"
                      rows={4}
                      data-testid="input-script-prompt"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="genre" className="text-yellow-400">Genre</Label>
                      <Select value={generateForm.genre} onValueChange={(value) => setGenerateForm(prev => ({ ...prev, genre: value }))}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-600 text-white" data-testid="select-genre">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-600">
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="thriller">Thriller</SelectItem>
                          <SelectItem value="drama">Drama</SelectItem>
                          <SelectItem value="war">War</SelectItem>
                          <SelectItem value="suspense">Suspense</SelectItem>
                          <SelectItem value="adventure">Adventure</SelectItem>
                          <SelectItem value="biography">Biography</SelectItem>
                          <SelectItem value="comedy">Comedy</SelectItem>
                          <SelectItem value="crime">Crime</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="fantasy">Fantasy</SelectItem>
                          <SelectItem value="history">Historical</SelectItem>
                          <SelectItem value="horror">Horror</SelectItem>
                          <SelectItem value="mystery">Mystery</SelectItem>
                          <SelectItem value="romance">Romance</SelectItem>
                          <SelectItem value="sci-fi">Science Fiction</SelectItem>
                          <SelectItem value="western">Western</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="tone" className="text-yellow-400">Tone</Label>
                      <Select value={generateForm.tone} onValueChange={(value) => setGenerateForm(prev => ({ ...prev, tone: value }))}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-600 text-white" data-testid="select-tone">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-600">
                          <SelectItem value="dramatic">Dramatic</SelectItem>
                          <SelectItem value="intense">Intense</SelectItem>
                          <SelectItem value="heroic">Heroic</SelectItem>
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="length" className="text-yellow-400">Length</Label>
                      <Select value={generateForm.length} onValueChange={(value) => setGenerateForm(prev => ({ ...prev, length: value }))}>
                        <SelectTrigger className="bg-slate-950/50 border-slate-600 text-white" data-testid="select-length">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-600">
                          <SelectItem value="scene">Single Scene (2-3 pages)</SelectItem>
                          <SelectItem value="short">Short Script (5-10 pages)</SelectItem>
                          <SelectItem value="medium">Medium Script (15-25 pages)</SelectItem>
                          <SelectItem value="long">Feature Length Treatment (outline only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={generateMutation.isPending || (!isSuperUser && currentCredits < 10)}
                    className="w-full bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-black font-bold"
                    data-testid="button-generate-script"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-spin" />
                        Generating Script...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Script (10 Credits)
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {generatedScript && (
              <Card className="bg-slate-900/50 border-green-600/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Script
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-600">
                    <pre className="text-white text-sm whitespace-pre-wrap font-mono" data-testid="text-generated-script">
                      {generatedScript}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Enhance Script Tab */}
        <TabsContent value="enhance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-yellow-600/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Script Enhancement
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Improve existing scripts with AI assistance
                </CardDescription>
                <Badge className="bg-orange-900/50 text-orange-300 border-orange-600/50 w-fit">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  15 Credits Required
                </Badge>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEnhance} className="space-y-4">
                  <div>
                    <Label htmlFor="scriptContent" className="text-yellow-400">Original Script *</Label>
                    <Textarea
                      id="scriptContent"
                      placeholder="Paste your script content here..."
                      value={enhanceForm.scriptContent}
                      onChange={(e) => setEnhanceForm(prev => ({ ...prev, scriptContent: e.target.value }))}
                      className="bg-slate-950/50 border-slate-600 text-white placeholder-slate-400"
                      rows={8}
                      data-testid="input-script-content"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="enhancement" className="text-yellow-400">Enhancement Focus *</Label>
                    <Textarea
                      id="enhancement"
                      placeholder="What would you like to improve? (e.g., 'Enhance dialogue realism and add more tactical authenticity')"
                      value={enhanceForm.enhancement}
                      onChange={(e) => setEnhanceForm(prev => ({ ...prev, enhancement: e.target.value }))}
                      className="bg-slate-950/50 border-slate-600 text-white placeholder-slate-400"
                      rows={3}
                      data-testid="input-enhancement-focus"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={enhanceMutation.isPending || (!isSuperUser && currentCredits < 15)}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-bold"
                    data-testid="button-enhance-script"
                  >
                    {enhanceMutation.isPending ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-spin" />
                        Enhancing Script...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Enhance Script (15 Credits)
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {enhancedScript && (
              <Card className="bg-slate-900/50 border-green-600/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Enhanced Script
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-600">
                    <pre className="text-white text-sm whitespace-pre-wrap font-mono" data-testid="text-enhanced-script">
                      {enhancedScript}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analyze Script Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-yellow-600/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Script Analysis
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Get professional feedback on your script
                </CardDescription>
                <Badge className="bg-blue-900/50 text-blue-300 border-blue-600/50 w-fit">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  8 Credits Required
                </Badge>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div>
                    <Label htmlFor="analyzeScript" className="text-yellow-400">Script to Analyze *</Label>
                    <Textarea
                      id="analyzeScript"
                      placeholder="Paste your script content here for analysis..."
                      value={analyzeForm.scriptContent}
                      onChange={(e) => setAnalyzeForm(prev => ({ ...prev, scriptContent: e.target.value }))}
                      className="bg-slate-950/50 border-slate-600 text-white placeholder-slate-400"
                      rows={10}
                      data-testid="input-analyze-script"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={analyzeMutation.isPending || (!isSuperUser && currentCredits < 8)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-black font-bold"
                    data-testid="button-analyze-script"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Script...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Analyze Script (8 Credits)
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {scriptAnalysis && (
              <Card className="bg-slate-900/50 border-green-600/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Script Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-600">
                    <div className="text-white text-sm whitespace-pre-wrap" data-testid="text-script-analysis">
                      {scriptAnalysis}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* AI Chat Assistant Tab */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Script Context Input */}
            <Card className="bg-slate-900/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Script Context
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Load your script for the AI to reference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scriptContext" className="text-purple-400">Current Script (Optional)</Label>
                  <Textarea
                    id="scriptContext"
                    placeholder="Paste your script here so the AI can reference it during conversation..."
                    value={currentScript}
                    onChange={(e) => setCurrentScript(e.target.value)}
                    className="bg-slate-950/50 border-slate-600 text-white placeholder-slate-400"
                    rows={8}
                    data-testid="input-script-context"
                  />
                </div>
                
                {/* Load Script Buttons */}
                <div className="space-y-2">
                  <Label className="text-purple-400">Quick Load</Label>
                  <div className="flex gap-2 flex-wrap">
                    {generatedScript && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadScriptToChat(generatedScript)}
                        className="border-purple-600/50 text-purple-400 hover:bg-purple-600/10"
                        data-testid="button-load-generated"
                      >
                        Load Generated Script
                      </Button>
                    )}
                    {enhancedScript && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadScriptToChat(enhancedScript)}
                        className="border-purple-600/50 text-purple-400 hover:bg-purple-600/10"
                        data-testid="button-load-enhanced"
                      >
                        Load Enhanced Script
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2 bg-slate-900/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Script Assistant
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Chat with AI about your scripts, get feedback, and brainstorm ideas
                </CardDescription>
                <Badge className="bg-purple-900/50 text-purple-300 border-purple-600/50 w-fit">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  5 Credits per Message
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat History */}
                <div className="border border-slate-600 rounded-lg bg-slate-950/50 h-96 overflow-hidden">
                  <ScrollArea className="h-full p-4" ref={chatScrollRef}>
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-slate-400 py-8">
                        <Bot className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                        <p>Start a conversation with your AI script assistant!</p>
                        <p className="text-sm mt-2">Ask about story structure, character development, dialogue, or any script-related questions.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatHistory.map((message, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div
                              className={`rounded-lg p-3 max-w-[70%] ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-800 text-slate-100 border border-slate-600'
                              }`}
                            >
                              <div className="text-sm whitespace-pre-wrap" data-testid={`message-${message.role}-${index}`}>
                                {message.content}
                              </div>
                            </div>
                            {message.role === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                        {chatMutation.isPending && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <div className="bg-slate-800 text-slate-100 border border-slate-600 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                                <span className="text-sm">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask about your script, request edits, brainstorm ideas, or get writing advice..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="bg-slate-950/50 border-slate-600 text-white placeholder-slate-400 resize-none"
                      rows={2}
                      data-testid="input-chat-message"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <div className="flex flex-col gap-2">
                      <Button 
                        type="submit" 
                        disabled={chatMutation.isPending || (!isSuperUser && currentCredits < 5) || !chatMessage.trim()}
                        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold px-6"
                        data-testid="button-send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearChat}
                        disabled={chatHistory.length === 0}
                        className="border-slate-600 text-slate-400 hover:bg-slate-800 px-6"
                        data-testid="button-clear-chat"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Chat Instructions */}
                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong>Tips:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Ask specific questions about character development, plot structure, or dialogue</li>
                    <li>Request edits or improvements to specific scenes</li>
                    <li>Get feedback on pacing, tone, or genre conventions</li>
                    <li>Brainstorm ideas for plot twists or character arcs</li>
                    <li>Press Enter to send, Shift+Enter for new line</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Quick Credit Top-Up Modal */}
      <QuickCreditTopUp
        isOpen={showTopUpModal}
        onClose={closeTopUpModal}
        currentCredits={currentCredits}
        onSuccess={handleTopUpSuccess}
      />
    </div>
  );
}