
import { useState, useEffect, useCallback } from "react";

export interface AIAssistantUIState {
  isOpen: boolean;
  isMinimized: boolean;
}

export const useAIAssistantUIState = () => {
  const [uiState, setUIState] = useState<AIAssistantUIState>({
    isOpen: false,
    isMinimized: false
  });
  
  const setIsOpen = useCallback((value: boolean) => {
    setUIState(prev => ({
      ...prev,
      isOpen: value,
      // If we're opening, make sure it's not minimized
      isMinimized: value ? false : prev.isMinimized
    }));
  }, []);
  
  const toggleChat = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      isMinimized: false // Always expand when toggling
    }));
  }, []);

  const minimizeChat = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      isMinimized: true
    }));
  }, []);

  const expandChat = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      isMinimized: false
    }));
  }, []);

  // Keyboard shortcut to toggle chat (Alt+/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        toggleChat();
      }
      // ESC key to close or minimize
      if (e.key === 'Escape' && uiState.isOpen) {
        e.preventDefault();
        if (!uiState.isMinimized) {
          minimizeChat();
        } else {
          setIsOpen(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChat, minimizeChat, uiState, setIsOpen]);

  return {
    uiState,
    setIsOpen,
    toggleChat,
    minimizeChat,
    expandChat
  };
};
