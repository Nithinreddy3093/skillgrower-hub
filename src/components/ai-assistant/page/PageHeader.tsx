
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  clearConversation: () => void;
}

export const PageHeader = ({ clearConversation }: PageHeaderProps) => {
  return (
    <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white flex items-center justify-between">
      <div className="flex items-center">
        <Bot className="mr-3" size={24} />
        <h1 className="text-xl font-semibold">AI Learning Assistant Pro</h1>
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
