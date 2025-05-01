
import { FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { autoResizeTextarea } from "@/hooks/ai-assistant/utils";
import { toast } from "sonner";

interface ChatInputAreaProps {
  prompt: string;
  isLoading: boolean;
  topicName: string;
  handleSendMessage: (e?: FormEvent) => void;
  setPrompt: (value: string) => void;
}

export const ChatInputArea = ({
  prompt,
  isLoading,
  topicName,
  handleSendMessage,
  setPrompt
}: ChatInputAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    autoResizeTextarea(e.target);
  };
  
  // Auto-focus the textarea when component mounts or loading state changes
  useEffect(() => {
    if (textareaRef.current && !isLoading) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isLoading]);

  const submitMessage = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!prompt.trim()) {
      toast.error("Please enter a message first");
      return;
    }
    
    handleSendMessage(e);
  };

  return (
    <form 
      onSubmit={submitMessage}
      className="border-t dark:border-gray-700 p-4 flex items-end gap-2"
    >
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={handleTextareaChange}
        placeholder={`Ask about ${topicName}...`}
        className="flex-1 border dark:border-gray-600 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
          }
        }}
        disabled={isLoading}
      />
      <Button
        type="button" // Changed from submit to button
        disabled={isLoading || !prompt.trim()}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        onClick={() => submitMessage()} // Ensure click handler works
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <>
            <Send size={18} />
            <span>Send</span>
          </>
        )}
      </Button>
    </form>
  );
};
