
import React from "react";
import { Bot, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatHeader = ({ isMinimized, onMinimize, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-indigo-600 dark:bg-indigo-700 text-white">
      <div className="flex items-center gap-2">
        <Bot size={20} />
        <h3 className="font-medium">Skill Assistant</h3>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-8 w-8 text-white hover:bg-indigo-500 rounded-full"
          aria-label={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-white hover:bg-indigo-500 rounded-full"
          aria-label="Close"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};
