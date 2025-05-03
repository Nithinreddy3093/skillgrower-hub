
import { useState, useEffect } from "react";
import { Bot, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export const GlobalAIHelper = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();
  
  // Context-aware help suggestions based on current route
  const getHelpSuggestion = () => {
    const path = location.pathname;
    
    if (path === "/") {
      return "Need help getting started? Ask your AI assistant for learning recommendations.";
    } else if (path.includes("quiz")) {
      return "Stuck on a quiz? Your AI assistant can explain concepts or provide study tips.";
    } else if (path.includes("ai-assistant")) {
      return "Try asking specific technical questions about programming languages or algorithms.";
    } else if (path.includes("resources")) {
      return "Want curated learning resources? Ask your AI assistant for recommendations.";
    } else if (path.includes("profile")) {
      return "Your AI assistant can help you create a learning plan based on your goals.";
    } else {
      return "Need help? Your AI assistant is one click away.";
    }
  };
  
  // Reset visibility when route changes
  useEffect(() => {
    if (!isDismissed) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Reset after some time
    setTimeout(() => {
      setIsDismissed(false);
    }, 3600000); // Reset after 1 hour
  };

  if (isDismissed) return null;

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-20 right-6 z-40 max-w-xs"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-lg shadow-lg border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
              <Bot className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">{getHelpSuggestion()}</p>
                <div className="mt-2 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={handleDismiss}
                  >
                    <X className="h-3 w-3 mr-1" /> Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="fixed bottom-24 right-6 z-40 rounded-full h-10 w-10 shadow-md bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-800"
            onClick={() => window.open("/ai-assistant", "_blank")}
          >
            <HelpCircle className="h-5 w-5 text-indigo-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="text-sm">Get AI help with your studies</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
