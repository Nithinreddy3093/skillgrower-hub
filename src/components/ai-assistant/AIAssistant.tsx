
import { useState, useEffect } from "react";
import { Bot, X, Minimize2, Maximize2, Send, Trash2, MessagesSquare, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
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
            <div className="p-3 bg-indigo-600 dark:bg-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot size={18} />
                <div className="flex items-center">
                  <h3 className="font-medium text-sm">SkillTrack Assistant</h3>
                  <div className="flex items-center ml-1.5">
                    <Zap size={12} className="text-yellow-300 mr-0.5" />
                    <span className="text-xs text-yellow-200">Fast Mode</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isMinimized ? (
                  <button 
                    onClick={expandChat} 
                    className="text-white/80 hover:text-white transition p-1"
                    aria-label="Maximize"
                  >
                    <Maximize2 size={16} />
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={minimizeChat} 
                      className="text-white/80 hover:text-white transition p-1"
                      aria-label="Minimize"
                    >
                      <Minimize2 size={16} />
                    </button>
                    <button 
                      onClick={clearConversation} 
                      className="text-white/80 hover:text-white transition p-1"
                      aria-label="Clear chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-white/80 hover:text-white transition p-1"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat body - conditionally rendered based on minimized state */}
            {!isMinimized && (
              <>
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message} 
                      isStreaming={isStreaming && message.content === ""}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <form onSubmit={sendMessage} className="p-3 border-t dark:border-gray-700 flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={prompt}
                    onChange={handleTextareaChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask for quick learning tips..."
                    className="flex-1 border dark:border-gray-700 rounded-md p-2 resize-none outline-none text-sm bg-transparent max-h-32 min-h-[42px]"
                    disabled={isLoading}
                    rows={1}
                  />
                  <Button 
                    type="submit"
                    className={cn(
                      "flex-shrink-0 h-10 w-10 p-0",
                      isLoading 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-700"
                    )}
                    disabled={isLoading || !prompt.trim()}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
