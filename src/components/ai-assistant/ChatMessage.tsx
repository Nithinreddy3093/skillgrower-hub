
import { useState, useEffect } from "react";
import { Bot, User } from "lucide-react";
import { ChatMessage as MessageType } from "@/hooks/useAIAssistant";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Animate typing effect for assistant messages when streaming
  useEffect(() => {
    if (isUser || (!isStreaming && message.content)) {
      setDisplayedText(message.content);
      return;
    }

    if (isStreaming && message.content === "") {
      // Blinking cursor effect
      const interval = setInterval(() => {
        setCursorVisible(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isUser, isStreaming, message.content]);

  // Format links with Markdown style [text](url)
  const formatTextWithLinks = (text: string) => {
    // Match Markdown links [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    return text.split(markdownLinkRegex).map((part, index) => {
      // Even indexes are non-link text
      if (index % 3 === 0) {
        return <span key={index}>{part}</span>;
      } 
      // Index % 3 === 1 is the link text, Index % 3 === 2 is the URL
      else if (index % 3 === 1) {
        return (
          <a 
            key={index}
            href={text.split(markdownLinkRegex)[index + 1]} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            {part}
          </a>
        );
      }
      return null;
    });
  };

  return (
    <div className={cn(
      "flex items-start gap-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* Avatar for assistant message */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      )}
      
      {/* Message bubble */}
      <div className={cn(
        "max-w-[85%] p-3 rounded-lg text-sm",
        isUser 
          ? "bg-indigo-600 text-white rounded-tr-none" 
          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
      )}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="whitespace-pre-wrap">
            {formatTextWithLinks(message.content)}
            {isStreaming && message.content === "" && (
              <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>▋</span>
            )}
          </div>
        )}
      </div>

      {/* Avatar for user message */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-white" />
        </div>
      )}
    </div>
  );
};
