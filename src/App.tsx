
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { IntroAnimation } from "./components/IntroAnimation";
import Index from "./pages/Index";
import Goals from "./pages/Goals";
import Journal from "./pages/Journal";
import Resources from "./pages/Resources";
import Collaborate from "./pages/Collaborate";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import AIAssistant from "./pages/AiAssistant";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { AIAssistant as AIAssistantComponent } from "@/components/ai-assistant/AIAssistant";
import { GlobalAIHelper } from "@/components/GlobalAIHelper";
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
    if (hasSeenIntro) {
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
        <AuthProvider>
          <BrowserRouter>
            <IntroAnimation onComplete={handleIntroComplete}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <ProtectedRoute>
                      <Goals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/journal"
                  element={
                    <ProtectedRoute>
                      <Journal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resources"
                  element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/collaborate"
                  element={
                    <ProtectedRoute>
                      <Collaborate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz"
                  element={
                    <ProtectedRoute>
                      <Quiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <ProtectedRoute>
                      <AIAssistantComponent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <AIAssistantComponent />
              <GlobalAIHelper />
            </IntroAnimation>
          </BrowserRouter>
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
