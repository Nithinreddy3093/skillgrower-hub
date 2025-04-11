
import { Bot, Minimize2, Maximize2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  isMinimized: boolean;
  expandChat: () => void;
  minimizeChat: () => void;
  clearConversation: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const ChatHeader = ({
  isMinimized,
  expandChat,
  minimizeChat,
  clearConversation,
  setIsOpen
}: ChatHeaderProps) => {
  return (
    <div className="p-3 bg-indigo-600 dark:bg-indigo-800 text-white flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Bot size={18} />
        <h3 className="font-medium text-sm">AI Learning Assistant</h3>
      </div>
      <div className="flex items-center space-x-2">
        {isMinimized ? (
          <button 
            onClick={expandChat} 
            className="text-white/80 hover:text-white transition p-1"
            aria-label="Maximize"
          >
            <Maximize2 size={16} />
          </button>
        ) : (
          <>
            <button 
              onClick={minimizeChat} 
              className="text-white/80 hover:text-white transition p-1"
              aria-label="Minimize"
            >
              <Minimize2 size={16} />
            </button>
            <button 
              onClick={clearConversation} 
              className="text-white/80 hover:text-white transition p-1"
              aria-label="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-white/80 hover:text-white transition p-1"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
