
import { ChatMessage } from "./ChatMessage";
import { ChatMessage as MessageType } from "@/hooks/ai-assistant/types";
import { RefObject } from "react";
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
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
      <div ref={messagesEndRef} />
      
      {/* Connection error message */}
      {connectionError && (
        <ConnectionErrorMessage onRetry={() => setConnectionError(false)} />
      )}
    </div>
  );
};
