
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyChatProps {
  setPrompt: (prompt: string) => void;
}

export const EmptyChat = ({ setPrompt }: EmptyChatProps) => {
  return (
    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center p-4">
      <div>
        <Bot size={36} className="mx-auto mb-2 text-indigo-500 opacity-80" />
        <p>Ask me anything about programming, algorithms, operating systems, or how to solve technical problems.</p>
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPrompt("How do I implement binary search in C?")}
            className="text-xs mr-2"
          >
            Binary search in C?
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPrompt("Explain virtual memory in operating systems")}
            className="text-xs"
          >
            Virtual memory?
          </Button>
        </div>
      </div>
    </div>
  );
};
