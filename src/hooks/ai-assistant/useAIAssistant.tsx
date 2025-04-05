
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSavedMessages, saveMessages, getWelcomeMessage } from "./utils";
import { useAIAssistantState } from "./useAIAssistantState";
import { useAIAssistantMessages } from "./useAIAssistantMessages";

export const useAIAssistant = () => {
  // Create state hook instance
  const {
    state,
    setPrompt,
    setIsOpen,
    toggleChat,
    minimizeChat,
    expandChat,
    setMessages,
    clearConversation
  } = useAIAssistantState();
  
  // Create messages hook instance
  const {
    messagesEndRef,
    inputRef,
    sendMessage,
    handleTextareaChange
  } = useAIAssistantMessages();
  
  const { user } = useAuth();
  
  // Return null on server-side to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  // Load saved messages on component mount
  useEffect(() => {
    setMounted(true);
    if (user) {
      setMessages(getSavedMessages(user.id));
    }
  }, [user]);

  // Save messages to local storage when they change
  useEffect(() => {
    if (user) {
      saveMessages(user.id, state.messages);
    }
  }, [state.messages, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  // Auto focus input when chat is opened or expanded
  useEffect(() => {
    if (state.isOpen && !state.isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
        }
      }, 200);
    }
  }, [state.isOpen, state.isMinimized]);

  return {
    ...state,
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
  };
};

export type { ChatMessage } from "./types";
