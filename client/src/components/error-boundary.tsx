import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Bug, Send, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showReportDialog: boolean;
  isSubmitting: boolean;
  reportSubmitted: boolean;
  includeDetails: boolean;
  userDescription: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showReportDialog: false,
      isSubmitting: false,
      reportSubmitted: false,
      includeDetails: true,
      userDescription: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to console for development
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Check if automatic reporting is enabled
    this.checkAndAutoReport(error, errorInfo);
  }

  private async checkAndAutoReport(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // Check user preferences for automatic reporting
      const response = await fetch("/api/error-preferences", {
        credentials: "include",
      });
      
      if (response.ok) {
        const preferences = await response.json();
        if (preferences.automaticReporting) {
          await this.submitErrorReport(error, errorInfo, true);
        }
      } else {
        // If user not authenticated or no preferences, don't auto-report
        console.log("No automatic error reporting - user not authenticated or no preferences set");
      }
    } catch (err) {
      console.error("Failed to check error reporting preferences:", err);
    }
  }

  private async submitErrorReport(error: Error, errorInfo: React.ErrorInfo, isAutomatic = false) {
    try {
      const reportData = {
        errorType: "javascript" as const,
        severity: "high" as const,
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        userReported: !isAutomatic,
        additionalData: {
          componentStack: errorInfo.componentStack,
          userDescription: this.state.userDescription || undefined,
          timestamp: new Date().toISOString(),
          includeDetails: this.state.includeDetails,
        },
      };

      await apiRequest("POST", "/api/error-reports", reportData);
      
      if (!isAutomatic) {
        this.setState({ reportSubmitted: true });
      }
    } catch (err) {
      console.error("Failed to submit error report:", err);
    }
  }

  private getSessionId(): string {
    // Create or get session ID from localStorage
    let sessionId = localStorage.getItem("error-session-id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("error-session-id", sessionId);
    }
    return sessionId;
  }

  private handleReportError = () => {
    this.setState({ showReportDialog: true });
  };

  private handleCloseDialog = () => {
    this.setState({ 
      showReportDialog: false,
      userDescription: "",
      includeDetails: true,
      reportSubmitted: false,
    });
  };

  private handleSubmitReport = async () => {
    if (!this.state.error || !this.state.errorInfo) return;

    this.setState({ isSubmitting: true });
    
    try {
      await this.submitErrorReport(this.state.error, this.state.errorInfo, false);
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <>
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900/50 border border-red-600/30 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <h1 className="text-xl font-tactical text-red-400 mb-2">
                SYSTEM ERROR DETECTED
              </h1>
              
              <p className="text-slate-300 mb-6 text-sm">
                An unexpected error occurred in the application. Our team has been notified.
              </p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <Badge variant="destructive" className="text-xs">
                  <Bug className="w-3 h-3 mr-1" />
                  Error ID: {this.state.error?.name || "Unknown"}
                </Badge>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={this.handleReload}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-tactical"
                  data-testid="button-reload-page"
                >
                  RELOAD PAGE
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleReportError}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  data-testid="button-report-error"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Report This Error
                </Button>
              </div>
              
              <p className="text-xs text-slate-500 mt-4">
                Error occurred at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Error Report Dialog */}
          <Dialog open={this.state.showReportDialog} onOpenChange={this.handleCloseDialog}>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-yellow-400 font-tactical flex items-center gap-2">
                  <Bug className="w-5 h-5" />
                  REPORT ERROR
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {this.state.reportSubmitted 
                    ? "Thank you! Your error report has been submitted."
                    : "Help us fix this issue by providing additional details."
                  }
                </DialogDescription>
              </DialogHeader>

              {!this.state.reportSubmitted ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">
                      What were you trying to do when this error occurred?
                    </label>
                    <Textarea
                      value={this.state.userDescription}
                      onChange={(e) => this.setState({ userDescription: e.target.value })}
                      placeholder="Describe what you were doing..."
                      className="bg-slate-800 border-slate-600 text-slate-100"
                      rows={3}
                      data-testid="textarea-error-description"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-details"
                      checked={this.state.includeDetails}
                      onCheckedChange={(checked) => this.setState({ includeDetails: !!checked })}
                      data-testid="checkbox-include-details"
                    />
                    <label htmlFor="include-details" className="text-sm text-slate-300">
                      Include technical details (browser info, error stack)
                    </label>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded p-3">
                    <h4 className="text-xs font-tactical text-yellow-400 mb-1">ERROR DETAILS:</h4>
                    <p className="text-xs text-slate-400 font-mono break-all">
                      {this.state.error?.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Send className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-green-400 font-tactical">REPORT SUBMITTED</p>
                  <p className="text-slate-400 text-sm mt-1">
                    We'll investigate this issue and work on a fix.
                  </p>
                </div>
              )}

              <DialogFooter>
                {!this.state.reportSubmitted ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={this.handleCloseDialog}
                      className="border-slate-600 text-slate-300"
                      data-testid="button-cancel-report"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={this.handleSubmitReport}
                      disabled={this.state.isSubmitting}
                      className="bg-yellow-600 hover:bg-yellow-700 text-black font-tactical"
                      data-testid="button-submit-report"
                    >
                      {this.state.isSubmitting ? "SUBMITTING..." : "SUBMIT REPORT"}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={this.handleCloseDialog}
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-tactical"
                    data-testid="button-close-report"
                  >
                    CLOSE
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }

    return this.props.children;
  }
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = async (error: Error, context?: any) => {
    try {
      const reportData = {
        errorType: "javascript" as const,
        severity: "medium" as const,
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: localStorage.getItem("error-session-id") || `manual_${Date.now()}`,
        userReported: true,
        additionalData: {
          context,
          timestamp: new Date().toISOString(),
        },
      };

      await apiRequest("POST", "/api/error-reports", reportData);
      return { success: true };
    } catch (err) {
      console.error("Failed to report error:", err);
      return { success: false, error: err };
    }
  };

  return { reportError };
}