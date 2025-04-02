
import React from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "./ChatWindow";
import { useChatbot } from "@/hooks/useChatbot";

export const AIChatbot = () => {
  const {
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    message,
    setMessage,
    messages,
    isLoading,
    inputRef,
    handleSendMessage,
    toggleChat,
  } = useChatbot();

  return (
    <>
      {/* Chatbot trigger button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg bg-indigo-600 hover:bg-indigo-700 z-50"
          aria-label="Open AI Assistant"
        >
          <Bot size={24} />
        </Button>
      )}

      {/* Chatbot window */}
      <ChatWindow
        isOpen={isOpen}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        setIsOpen={setIsOpen}
        message={message}
        setMessage={setMessage}
        messages={messages}
        isLoading={isLoading}
        inputRef={inputRef}
        handleSendMessage={handleSendMessage}
      />
    </>
  );
};
