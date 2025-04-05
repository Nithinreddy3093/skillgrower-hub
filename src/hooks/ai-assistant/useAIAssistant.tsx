
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChatMessage, AIAssistantState } from "./types";
import { autoResizeTextarea, getWelcomeMessage, getSavedMessages, saveMessages } from "./utils";
import { sendMessageToAssistant } from "./api";

export const useAIAssistant = () => {
  const [state, setState] = useState<AIAssistantState>({
    isOpen: false,
    isMinimized: false,
    prompt: "",
    messages: [],
    isLoading: false,
    isStreaming: false,
    retryCount: 0
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  
  // Load saved messages on component mount
  useEffect(() => {
    if (user) {
      setState(prev => ({
        ...prev,
        messages: getSavedMessages(user.id)
      }));
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
        autoResizeTextarea(inputRef.current);
      }, 200);
    }
  }, [state.isOpen, state.isMinimized]);

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
    setTimeout(() => inputRef.current?.focus(), 200);
  };

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

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedPrompt = state.prompt.trim();
    if (!trimmedPrompt || state.isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: trimmedPrompt,
      role: "user",
      timestamp: new Date(),
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      prompt: "",
      isLoading: true
    }));
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const placeholderId = crypto.randomUUID();
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: placeholderId,
            content: "",
            role: "assistant",
            timestamp: new Date(),
          },
        ],
        isStreaming: true
      }));

      const response = await sendMessageToAssistant(trimmedPrompt, user?.id, state.messages);
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === placeholderId 
            ? { ...msg, content: response } 
            : msg
        ),
        isStreaming: false,
        retryCount: 0
      }));
      
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      
      // Handle different error scenarios with appropriate messages
      if (error.message.includes("timeout") || error.message.includes("network")) {
        if (state.retryCount < 2) {
          toast.error("Connection issue. Retrying...");
          
          // Remove empty message
          setState(prev => ({
            ...prev,
            messages: prev.messages.filter(msg => msg.content !== ""),
            retryCount: prev.retryCount + 1
          }));
          
          // Try again after a short delay
          setTimeout(() => {
            sendMessage();
          }, 1500);
          return;
        } else {
          toast.error("Network issue persists. Please try again later.");
        }
      } else {
        toast.error("Unable to get response. Try a different question.");
      }
      
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages.filter(msg => msg.content !== ""),
          {
            id: crypto.randomUUID(),
            content: "I'm having trouble answering that. Could you rephrase your question or try something more specific?",
            role: "assistant",
            timestamp: new Date(),
          },
        ],
        isLoading: false,
        isStreaming: false
      }));
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false
      }));
    }
  };

  const clearConversation = () => {
    setState(prev => ({
      ...prev,
      messages: [getWelcomeMessage()],
      retryCount: 0
    }));
    toast.success("Conversation cleared");
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    autoResizeTextarea(e.target);
  };

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
