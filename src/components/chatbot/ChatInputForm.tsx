
import React, { forwardRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputFormProps {
  message: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ChatInputForm = forwardRef<HTMLInputElement, ChatInputFormProps>(
  ({ message, onChange, onSubmit, isLoading }, ref) => {
    return (
      <form onSubmit={onSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Input
            ref={ref}
            value={message}
            onChange={onChange}
            placeholder="Ask about skills, learning goals..."
            disabled={isLoading}
            className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !message.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
            aria-label="Send message"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    );
  }
);

ChatInputForm.displayName = "ChatInputForm";
