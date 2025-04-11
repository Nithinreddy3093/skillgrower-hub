
import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { ChatBody } from "./ChatBody";
import { ChatInput } from "./ChatInput";

export const AIAssistant = () => {
  const {
    isOpen,
    isMinimized,
    prompt,
    messages,
    isLoading,
    isStreaming,
    messagesEndRef,
    inputRef,
    setIsOpen,
    setPrompt,
    toggleChat,
    minimizeChat,
    expandChat,
    sendMessage,
    clearConversation,
    handleTextareaChange,
  } = useAIAssistant();

  const [connectionError, setConnectionError] = useState(false);
  
  // Clear connection error when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setConnectionError(false);
    }
  }, [messages]);

  // Return null on server-side to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <>
      {/* Chat button with quick tips indicator */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors z-50"
            onClick={toggleChat}
            aria-label="Open AI Assistant"
          >
            <div className="relative">
              <Bot size={24} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed right-6 shadow-xl z-50 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
              isMinimized 
                ? "bottom-6 w-72 h-14" 
                : "bottom-6 w-96 h-[520px] max-h-[80vh]"
            )}
          >
            {/* Header */}
            <ChatHeader
              isMinimized={isMinimized}
              expandChat={expandChat}
              minimizeChat={minimizeChat}
              clearConversation={clearConversation}
              setIsOpen={setIsOpen}
            />

            {/* Chat body - conditionally rendered based on minimized state */}
            {!isMinimized && (
              <>
                <ChatBody
                  messages={messages}
                  isStreaming={isStreaming}
                  connectionError={connectionError}
                  setPrompt={setPrompt}
                  setConnectionError={setConnectionError}
                  messagesEndRef={messagesEndRef}
                />
                
                <ChatInput
                  prompt={prompt}
                  isLoading={isLoading}
                  inputRef={inputRef}
                  handleTextareaChange={handleTextareaChange}
                  sendMessage={sendMessage}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
