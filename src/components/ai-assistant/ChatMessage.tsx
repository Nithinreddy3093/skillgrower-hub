
import { useState, useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import { ChatMessage as MessageType } from "@/hooks/ai-assistant/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  // Optimize message rendering with a small delay for UI performance
  useEffect(() => {
    if (isUser || (!isStreaming && message.content)) {
      // For user messages or completed assistant messages, display immediately
      setDisplayedText(message.content);
      setIsRendered(true);
      return;
    }

    if (isStreaming && message.content === "") {
      // Blinking cursor effect for pending responses
      const interval = setInterval(() => {
        setCursorVisible(prev => !prev);
      }, 400); // Slightly faster blink for more responsive feel
      return () => clearInterval(interval);
    }
  }, [isUser, isStreaming, message.content]);

  // Format text with special handling for links, bullet points, and lists
  const formatContent = (text: string) => {
    // Check if this is an error message
    const isErrorMessage = text.includes("I'm having trouble") || 
                           text.includes("error") ||
                           text.includes("issue");

    // Process markdown links [text](url)
    const withLinks = text.split(/(\[([^\]]+)\]\(([^)]+)\))/).map((part, index) => {
      // Every third part is a link match
      if (index % 4 === 1) {
        const linkText = text.split(/(\[([^\]]+)\]\(([^)]+)\))/)[index + 1];
        const linkUrl = text.split(/(\[([^\]]+)\]\(([^)]+)\))/)[index + 2];
        return (
          <a 
            key={index}
            href={linkUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-300 underline hover:text-green-800 dark:hover:text-green-200"
          >
            {linkText}
          </a>
        );
      } else if (index % 4 !== 0) {
        // Skip the captured groups
        return null;
      }
      return part;
    });

    // Process text with special formatting for better readability
    return withLinks.filter(Boolean).map((part, i) => {
      if (typeof part !== 'string') return part;
      
      // Handle bullet points for better display
      return part.split('\n').map((line, j) => {
        // Enhance bullet points display
        if (line.trim().startsWith('- ')) {
          return (
            <div key={j} className="flex items-start gap-1 mt-1 ml-1">
              <span className="text-green-500 dark:text-green-300 font-bold mt-0.5">•</span>
              <span className="dark:text-gray-150">{line.substring(2)}</span>
            </div>
          );
        }
        // Handle numbered lists
        const numberedListMatch = line.match(/^(\d+)\.\s(.*)$/);
        if (numberedListMatch) {
          return (
            <div key={j} className="flex items-start gap-1.5 mt-1 ml-1">
              <span className="text-green-500 dark:text-green-300 font-medium">{numberedListMatch[1]}.</span>
              <span className="dark:text-gray-150">{numberedListMatch[2]}</span>
            </div>
          );
        }
        
        // Apply error styling for error messages
        if (isErrorMessage) {
          return <div key={j} className="dark:text-amber-300 text-amber-600 font-medium">{line || <br />}</div>;
        }
        
        return <div key={j} className="dark:text-gray-150">{line || <br />}</div>;
      });
    });
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 transition-opacity duration-200",
        isUser ? "justify-end" : "justify-start",
        isRendered ? "opacity-100" : "opacity-0"
      )}
      ref={messageRef}
    >
      {/* Avatar for assistant message */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-green-600 dark:text-green-300" />
        </div>
      )}
      
      {/* Message bubble */}
      <div className={cn(
        "max-w-[85%] p-3 rounded-lg text-sm",
        isUser 
          ? "bg-green-600 text-white rounded-tr-none" 
          : "bg-gray-100 dark:bg-gray-750 text-gray-800 dark:text-white rounded-tl-none"
      )}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="whitespace-pre-wrap text-gray-800 dark:text-white">
            {formatContent(message.content)}
            {isStreaming && message.content === "" && (
              <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>▋</span>
            )}
          </div>
        )}
      </div>

      {/* Avatar for user message */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-white" />
        </div>
      )}
    </div>
  );
};
