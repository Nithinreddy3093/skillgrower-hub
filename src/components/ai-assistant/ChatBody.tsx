
import { ChatMessage } from "./ChatMessage";
import { ChatMessage as MessageType } from "@/hooks/ai-assistant/types";
import { RefObject, useEffect } from "react";
import { EmptyChat } from "./EmptyChat";
import { ConnectionErrorMessage } from "./ConnectionErrorMessage";

interface ChatBodyProps {
  messages: MessageType[];
  isStreaming: boolean;
  connectionError: boolean;
  setPrompt: (prompt: string) => void;
  setConnectionError: (error: boolean) => void;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export const ChatBody = ({
  messages,
  isStreaming,
  connectionError,
  setPrompt,
  setConnectionError,
  messagesEndRef
}: ChatBodyProps) => {
  // Auto-scroll effect when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messagesEndRef]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
      {messages.length === 0 ? (
        <EmptyChat setPrompt={setPrompt} />
      ) : (
        messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isStreaming={isStreaming && message.content === ""}
          />
        ))
      )}
      {/* Loading animation for when AI is processing */}
      {isStreaming && (
        <div className="flex items-center space-x-1 p-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      )}
      <div ref={messagesEndRef} />
      
      {/* Connection error message */}
      {connectionError && (
        <ConnectionErrorMessage onRetry={() => setConnectionError(false)} />
      )}
    </div>
  );
};
