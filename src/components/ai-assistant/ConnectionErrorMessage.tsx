
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionErrorMessageProps {
  onRetry: () => void;
}

export const ConnectionErrorMessage = ({ onRetry }: ConnectionErrorMessageProps) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mt-2">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-red-800 dark:text-red-300">
            Connection issue: Unable to reach the AI service.
          </p>
          <Button 
            variant="link" 
            className="text-xs text-red-600 dark:text-red-400 p-0 h-auto mt-1"
            onClick={onRetry}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};
