
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage as MessageType } from "@/hooks/ai-assistant/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const isUser = message.role === "user";
  
  return (
    <div
      className={cn(
        "flex gap-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-7 w-7 border">
        <AvatarFallback className={cn(
          isUser ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-800",
          "dark:bg-gray-700 dark:text-gray-200"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
        <AvatarImage src={isUser ? "/avatars/user.png" : "/avatars/ai-bot.png"} />
      </Avatar>
      
      <div className={cn(
        "p-2 rounded-md text-sm max-w-[80%]",
        isUser ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200" :
                "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      )}>
        {isStreaming ? (
          <div className="flex items-center space-x-1 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        ) : message.content.trim().startsWith('```') ? (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre({ node, className, children, ...props }) {
                  return (
                    <pre
                      className="bg-gray-800 dark:bg-black text-white rounded-md p-2 overflow-x-auto my-2"
                      {...props}
                    >
                      {children}
                    </pre>
                  );
                },
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return (
                    <code
                      className={cn(
                        "text-xs",
                        match ? `language-${match[1]}` : "",
                        !className?.includes('language-') && "bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs"
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                // Fix: Removed 'inline' property as it doesn't exist in the type
                // Instead, we can check if the code is inline by examining the className or other properties
                const isInlineCode = !className || !className.includes('language-');
                return isInlineCode ? (
                  <code
                    className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code {...props}>{children}</code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};
