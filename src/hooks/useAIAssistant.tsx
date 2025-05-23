
// This is a placeholder file to prevent import errors
// The AI Assistant functionality has been removed from the application

export const useAIAssistant = () => {
  return {
    isOpen: false,
    isMinimized: false,
    prompt: '',
    messages: [],
    isLoading: false,
    isStreaming: false,
    messagesEndRef: { current: null },
    inputRef: { current: null },
    setIsOpen: () => {},
    setPrompt: (_prompt: string) => {},
    toggleChat: () => {},
    minimizeChat: () => {},
    expandChat: () => {},
    sendMessage: (_event?: React.FormEvent, _customPrompt?: string) => {},
    clearConversation: () => {},
    handleTextareaChange: () => {},
  };
};

export type ChatMessage = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};
