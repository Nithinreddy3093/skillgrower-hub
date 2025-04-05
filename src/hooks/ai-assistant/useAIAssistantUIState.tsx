
import { useState } from "react";

export interface AIAssistantUIState {
  isOpen: boolean;
  isMinimized: boolean;
}

export const useAIAssistantUIState = () => {
  const [uiState, setUIState] = useState<AIAssistantUIState>({
    isOpen: false,
    isMinimized: false
  });
  
  const setIsOpen = (value: boolean) => {
    setUIState(prev => ({
      ...prev,
      isOpen: value
    }));
  };
  
  const toggleChat = () => {
    setUIState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      isMinimized: false
    }));
  };

  const minimizeChat = () => {
    setUIState(prev => ({
      ...prev,
      isMinimized: true
    }));
  };

  const expandChat = () => {
    setUIState(prev => ({
      ...prev,
      isMinimized: false
    }));
  };

  return {
    uiState,
    setIsOpen,
    toggleChat,
    minimizeChat,
    expandChat
  };
};
