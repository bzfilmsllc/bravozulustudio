import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Settings, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ErrorPreferences {
  automaticReporting: boolean;
  includeUserData: boolean;
  includeUrl: boolean;
  includeBrowserInfo: boolean;
  notifyOnResolution: boolean;
}

export function ErrorConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ErrorPreferences>({
    automaticReporting: true,
    includeUserData: false,
    includeUrl: true,
    includeBrowserInfo: true,
    notifyOnResolution: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current preferences
  const { data: currentPreferences, isLoading } = useQuery({
    queryKey: ["/api/error-preferences"],
  });

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (prefs: ErrorPreferences) => {
      await apiRequest("POST", "/api/error-preferences", prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/error-preferences"] });
      toast({
        title: "Preferences Saved",
        description: "Your error reporting preferences have been updated.",
      });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save error reporting preferences.",
        variant: "destructive",
      });
    },
  });

  // Update local state when data loads
  useEffect(() => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
    }
  }, [currentPreferences]);

  // DISABLED FOR TESTING - No automatic popup during Facebook launch
  useEffect(() => {
    // Auto-popup disabled to prevent barriers during launch
    return;
  }, [currentPreferences, isLoading]);

  const handleSave = () => {
    savePreferences.mutate(preferences);
  };

  const updatePreference = (key: keyof ErrorPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Button to open preferences */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-slate-400 hover:text-slate-200"
        data-testid="button-error-preferences"
      >
        <Settings className="w-4 h-4 mr-1" />
        Error Reporting
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 font-tactical flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ERROR REPORTING PREFERENCES
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Help us improve the platform by automatically reporting errors. You control what information is shared.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Automatic Reporting */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-reporting"
                    checked={preferences.automaticReporting}
                    onCheckedChange={(checked) => updatePreference('automaticReporting', !!checked)}
                    data-testid="checkbox-auto-reporting"
                  />
                  <label htmlFor="auto-reporting" className="text-sm font-medium text-slate-200">
                    Automatic Error Reporting
                  </label>
                </div>
                <Badge variant={preferences.automaticReporting ? "default" : "secondary"} className="text-xs">
                  {preferences.automaticReporting ? "ENABLED" : "DISABLED"}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 ml-6">
                Automatically send error reports when issues occur. Helps us fix problems faster.
              </p>
            </div>

            {/* Privacy Options */}
            <div className="border-t border-slate-700 pt-4">
              <h4 className="text-sm font-tactical text-yellow-400 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                PRIVACY CONTROLS
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-url"
                      checked={preferences.includeUrl}
                      onCheckedChange={(checked) => updatePreference('includeUrl', !!checked)}
                      data-testid="checkbox-include-url"
                    />
                    <label htmlFor="include-url" className="text-sm text-slate-200">
                      Include page URL
                    </label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    RECOMMENDED
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-browser"
                    checked={preferences.includeBrowserInfo}
                    onCheckedChange={(checked) => updatePreference('includeBrowserInfo', !!checked)}
                    data-testid="checkbox-include-browser"
                  />
                  <label htmlFor="include-browser" className="text-sm text-slate-200">
                    Include browser information
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-user-data"
                    checked={preferences.includeUserData}
                    onCheckedChange={(checked) => updatePreference('includeUserData', !!checked)}
                    data-testid="checkbox-include-user-data"
                  />
                  <label htmlFor="include-user-data" className="text-sm text-slate-200">
                    Include user account information
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notify-resolution"
                    checked={preferences.notifyOnResolution}
                    onCheckedChange={(checked) => updatePreference('notifyOnResolution', !!checked)}
                    data-testid="checkbox-notify-resolution"
                  />
                  <label htmlFor="notify-resolution" className="text-sm text-slate-200">
                    Notify me when issues are resolved
                  </label>
                </div>
              </div>
            </div>

            {/* What gets shared */}
            <div className="bg-slate-800/50 border border-slate-700 rounded p-3">
              <h4 className="text-xs font-tactical text-yellow-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                WHAT WE COLLECT:
              </h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Error message and technical details</li>
                <li>• Time when error occurred</li>
                {preferences.includeUrl && <li>• Page where error happened</li>}
                {preferences.includeBrowserInfo && <li>• Browser type and version</li>}
                {preferences.includeUserData && <li>• Your user ID (for follow-up)</li>}
                <li>• Anonymous session identifier</li>
              </ul>
            </div>

            {/* Privacy note */}
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <EyeOff className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                We never collect passwords, personal messages, or sensitive content. 
                All error reports are used solely for debugging and improving the platform.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-slate-600 text-slate-300"
              data-testid="button-cancel-preferences"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={savePreferences.isPending}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-tactical"
              data-testid="button-save-preferences"
            >
              {savePreferences.isPending ? "SAVING..." : "SAVE PREFERENCES"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}