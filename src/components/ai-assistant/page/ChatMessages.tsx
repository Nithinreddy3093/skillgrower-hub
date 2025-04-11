
import { ChatMessage } from "@/hooks/ai-assistant/types";
import { RefObject } from "react";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface ChatMessagesProps {
  messages: ChatMessage[];
  messagesEndRef: RefObject<HTMLDivElement>;
  activeTopic: string;
  topicName: string;
}

export const ChatMessages = ({ messages, messagesEndRef, activeTopic, topicName }: ChatMessagesProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <Bot size={48} className="mx-auto mb-4 text-indigo-500 opacity-80" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            How can I help you learn today?
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Ask me anything about {topicName}. I'm here to help with explanations, examples, and tips.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {messages.map((message: ChatMessage) => (
        <div 
          key={message.id}
          className={cn(
            "flex",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div 
            className={cn(
              "max-w-3/4 rounded-lg p-4",
              message.role === "user" 
                ? "bg-indigo-600 text-white rounded-br-none" 
                : "bg-gray-100 dark:bg-gray-700 rounded-bl-none"
            )}
          >
            {message.content}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};
