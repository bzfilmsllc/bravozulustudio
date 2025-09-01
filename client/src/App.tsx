import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Tools from "@/pages/tools";
import Portfolio from "@/pages/portfolio";
import Community from "@/pages/community";
import Media from "@/pages/media";
import Verification from "@/pages/verification";
import Billing from "@/pages/billing";
import DirectorsToolkit from "@/pages/directors-toolkit";
import EditorsToolkit from "@/pages/editors-toolkit";
import FileManager from "@/pages/file-manager";
import CreativeSuite from "@/pages/creative-suite";
import AdminPanel from "@/pages/admin";
import Settings from "@/pages/settings";
import Referrals from "@/pages/referrals";
import Achievements from "@/pages/achievements";
import { TutorialBot } from "@/components/tutorial-bot";
import { ErrorBoundary } from "@/components/error-boundary";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Always accessible pages */}
      <Route path="/verification" component={Verification} />
      <Route path="/tools" component={Tools} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/community" component={Community} />
      <Route path="/media" component={Media} />
      <Route path="/directors-toolkit" component={DirectorsToolkit} />
      <Route path="/editors-toolkit" component={EditorsToolkit} />
      <Route path="/file-manager" component={FileManager} />
      <Route path="/creative-suite" component={CreativeSuite} />
      
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/billing" component={Billing} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/settings" component={Settings} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/achievements" component={Achievements} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <TutorialBot />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
