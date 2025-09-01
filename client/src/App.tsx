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
import { TutorialBot } from "@/components/tutorial-bot";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/tools" component={Tools} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/community" component={Community} />
          <Route path="/media" component={Media} />
          <Route path="/verification" component={Verification} />
          <Route path="/billing" component={Billing} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <TutorialBot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
