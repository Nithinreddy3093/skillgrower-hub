
import React from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInputForm } from "./ChatInputForm";
import { Message } from "./ChatMessage";

interface ChatWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  setIsOpen: (value: boolean) => void;
  message: string;
  setMessage: (value: string) => void;
  messages: Message[];
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  handleSendMessage: (e: React.FormEvent) => void;
}

export const ChatWindow = ({
  isOpen,
  isMinimized,
  setIsMinimized,
  setIsOpen,
  message,
  setMessage,
  messages,
  isLoading,
  inputRef,
  handleSendMessage,
}: ChatWindowProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed ${isMinimized ? 'bottom-6 right-6 w-auto h-auto' : 'bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px]'} 
        bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 
        flex flex-col transition-all duration-200 overflow-hidden z-50`}
    >
      <ChatHeader 
        isMinimized={isMinimized}
        onMinimize={() => setIsMinimized(!isMinimized)}
        onClose={() => setIsOpen(false)}
      />

      {!isMinimized && (
        <>
          <ChatMessages 
            messages={messages}
            isLoading={isLoading}
          />

          <ChatInputForm 
            ref={inputRef}
            message={message}
            onChange={(e) => setMessage(e.target.value)}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};
