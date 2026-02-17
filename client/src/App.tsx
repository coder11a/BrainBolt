import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { AppNav } from "@/components/app-nav";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import NotFound from "@/pages/not-found";

const LandingPage = lazy(() => import("@/pages/landing"));
const AuthPage = lazy(() => import("@/pages/auth"));
const QuizPage = lazy(() => import("@/pages/quiz"));
const LeaderboardPage = lazy(() => import("@/pages/leaderboard"));
const MetricsPage = lazy(() => import("@/pages/metrics"));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="pb-8">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={QuizPage} />
            <Route path="/leaderboard" component={LeaderboardPage} />
            <Route path="/stats" component={MetricsPage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <AuthenticatedApp />;
  }

  if (showAuth) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AuthPage onBack={() => setShowAuth(false)} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LandingPage onAuth={() => setShowAuth(true)} />
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
