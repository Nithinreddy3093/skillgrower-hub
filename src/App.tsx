
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { IntroAnimation } from "./components/IntroAnimation";
import AppRoutes from "./AppRoutes";
// Import DevTools conditionally to avoid build issues
import { lazy } from "react";
const ReactQueryDevtools = lazy(() => 
  import('@tanstack/react-query-devtools').then(module => ({ 
    default: module.ReactQueryDevtools 
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  // Check if intro has been shown before in this session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro === "true") {
      setShowIntro(false);
      setIntroComplete(true);
    }
  }, []);

  // Handle intro animation completion
  const handleIntroComplete = () => {
    setIntroComplete(true);
    sessionStorage.setItem("hasSeenIntro", "true");
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              {showIntro ? (
                <IntroAnimation onComplete={handleIntroComplete} />
              ) : (
                <>
                  <AppRoutes />
                  <Toaster />
                </>
              )}
              {introComplete && (
                <>
                  <AppRoutes />
                  <Toaster />
                </>
              )}
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
