
import { useState } from "react";
import { ChatMessage } from "./types";
import { getWelcomeMessage } from "./utils";

export interface AIAssistantMessageState {
  prompt: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  retryCount: number;
  selectedTopic?: string;
}

export const useAIAssistantState = () => {
  const [messageState, setMessageState] = useState<AIAssistantMessageState>({
    prompt: "",
    messages: [],
    isLoading: false,
    isStreaming: false,
    retryCount: 0,
    selectedTopic: undefined
  });
  
  const setPrompt = (value: string) => {
    setMessageState(prev => ({
      ...prev,
      prompt: value
    }));
  };
  
  const setMessages = (messages: AIAssistantMessageState["messages"]) => {
    setMessageState(prev => ({
      ...prev,
      messages
    }));
  };

  const setIsLoading = (isLoading: boolean) => {
    setMessageState(prev => ({
      ...prev,
      isLoading
    }));
  };

  const setIsStreaming = (isStreaming: boolean) => {
    setMessageState(prev => ({
      ...prev,
      isStreaming
    }));
  };

  const setRetryCount = (retryCount: number) => {
    setMessageState(prev => ({
      ...prev,
      retryCount
    }));
  };
  
  const setSelectedTopic = (selectedTopic?: string) => {
    setMessageState(prev => ({
      ...prev,
      selectedTopic
    }));
  };
  
  const clearConversation = () => {
    setMessageState(prev => ({
      ...prev,
      prompt: "",
      messages: [],
      retryCount: 0
    }));
  };

  return {
    messageState,
    setPrompt,
    setMessages,
    setIsLoading,
    setIsStreaming,
    setRetryCount,
    setSelectedTopic,
    clearConversation
  };
};
