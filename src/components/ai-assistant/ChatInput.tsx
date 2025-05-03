
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefObject, FormEvent, ChangeEvent, useEffect } from "react";

interface ChatInputProps {
  prompt: string;
  isLoading: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  handleTextareaChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  sendMessage: (e?: FormEvent) => void;
}

export const ChatInput = ({
  prompt,
  isLoading,
  inputRef,
  handleTextareaChange,
  sendMessage
}: ChatInputProps) => {
  // Auto focus the textarea when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        sendMessage(e);
      }} 
      className="p-3 border-t dark:border-gray-700 flex items-end gap-2 sticky bottom-0 bg-white dark:bg-gray-800"
    >
      <textarea
        ref={inputRef}
        value={prompt}
        onChange={handleTextareaChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!prompt.trim()) return;
            sendMessage();
          }
        }}
        placeholder="Ask about programming, algorithms, etc..."
        className="flex-1 border dark:border-gray-700 rounded-md p-2 resize-none outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[42px] max-h-32"
        disabled={isLoading}
        rows={1}
      />
      <Button 
        type="submit"
        className={cn(
          "flex-shrink-0 h-10 w-10 p-0",
          isLoading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-indigo-600 hover:bg-indigo-700"
        )}
        disabled={isLoading || !prompt.trim()}
        aria-label="Send message"
      >
        <Send size={16} />
      </Button>
    </form>
  );
};
