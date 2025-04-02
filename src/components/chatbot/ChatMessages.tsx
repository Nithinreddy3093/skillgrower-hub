
import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ChatMessage, Message } from "./ChatMessage";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of message container
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex items-center mb-4 mr-auto max-w-[80%]">
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 flex items-center">
            <Loader2 size={16} className="animate-spin mr-2" />
            <span>Thinking...</span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
