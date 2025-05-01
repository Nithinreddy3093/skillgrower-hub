
import { Button } from "@/components/ui/button";
import { Sparkles, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PageHeaderProps {
  clearConversation: () => void;
}

export const PageHeader = ({ clearConversation }: PageHeaderProps) => {
  return (
    <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5 text-white/80" />
        <h1 className="text-xl font-semibold">AI Learning Assistant Pro</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-6 w-6 bg-white/10 hover:bg-white/20">
                <Info className="h-3.5 w-3.5 text-white/80" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">
                Expert AI assistant specializing in computer science, programming, and technology topics.
                Ask any questions to enhance your learning!
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white/20 text-white border-white/30 hover:bg-white/30"
        onClick={clearConversation}
      >
        New Chat
      </Button>
    </div>
  );
};
