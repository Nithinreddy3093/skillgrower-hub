
import { useState } from "react";
import { AIAssistantState } from "./types";
import { getWelcomeMessage } from "./utils";

export const useAIAssistantState = () => {
  const [state, setState] = useState<AIAssistantState>({
    isOpen: false,
    isMinimized: false,
    prompt: "",
    messages: [],
    isLoading: false,
    isStreaming: false,
    retryCount: 0
  });
  
  const setPrompt = (value: string) => {
    setState(prev => ({
      ...prev,
      prompt: value
    }));
  };

  const setIsOpen = (value: boolean) => {
    setState(prev => ({
      ...prev,
      isOpen: value
    }));
  };
  
  const toggleChat = () => {
    setState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      isMinimized: false
    }));
  };

  const minimizeChat = () => {
    setState(prev => ({
      ...prev,
      isMinimized: true
    }));
  };

  const expandChat = () => {
    setState(prev => ({
      ...prev,
      isMinimized: false
    }));
  };
  
  const setMessages = (messages: AIAssistantState["messages"]) => {
    setState(prev => ({
      ...prev,
      messages
    }));
  };

  const setIsLoading = (isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading
    }));
  };

  const setIsStreaming = (isStreaming: boolean) => {
    setState(prev => ({
      ...prev,
      isStreaming
    }));
  };

  const setRetryCount = (retryCount: number) => {
    setState(prev => ({
      ...prev,
      retryCount
    }));
  };
  
  const clearConversation = () => {
    setState(prev => ({
      ...prev,
      messages: [getWelcomeMessage()],
      retryCount: 0
    }));
  };

  return {
    state,
    setPrompt,
    setIsOpen,
    toggleChat,
    minimizeChat,
    expandChat,
    setMessages,
    setIsLoading,
    setIsStreaming,
    setRetryCount,
    clearConversation
  };
};
