import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import clsx from "clsx"; // Install if not available: npm install clsx

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === "light";

  // Memoized theme toggle function to improve performance
  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggle}
            aria-label={`Switch to ${isLightMode ? "dark" : "light"} mode`}
            aria-live="polite"
            aria-pressed={!isLightMode} // Indicates active state
            className={clsx(
              "rounded-full w-9 h-9 transition-colors shadow-sm",
              "border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-800",
              "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            {isLightMode ? (
              <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 transition-transform hover:rotate-12" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500 transition-transform hover:rotate-12" />
            )}
            <span className="sr-only">Switch to {isLightMode ? "dark" : "light"} mode</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
          <p>Switch to {isLightMode ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
