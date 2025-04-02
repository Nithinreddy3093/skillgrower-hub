
import React from "react";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`mb-4 ${
        message.sender === "user" ? "ml-auto" : "mr-auto"
      } max-w-[80%]`}
    >
      <div
        className={`p-3 rounded-lg ${
          message.sender === "user"
            ? "bg-indigo-600 text-white"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        }`}
      >
        {message.content}
      </div>
      <div
        className={`text-xs mt-1 text-gray-500 dark:text-gray-400 ${
          message.sender === "user" ? "text-right" : "text-left"
        }`}
      >
        {formatTime(message.timestamp)}
      </div>
    </div>
  );
};
