
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export const useChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: "Hi there! I'm your SkillTrack AI assistant. How can I help with your learning journey today?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmedMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    
    try {
      console.log("Sending message to skill-assistant function");
      
      // Get message history for context (last 6 messages)
      const chatHistory = messages
        .slice(-6)
        .map(m => ({ 
          role: m.sender === "user" ? "user" : "assistant", 
          content: m.content 
        }));
      
      // Get response from AI with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const { data, error } = await supabase.functions.invoke("skill-assistant", {
        method: "POST",
        body: { 
          message: trimmedMessage,
          userId: user?.id,
          history: chatHistory
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Error from skill-assistant function:", error);
        throw new Error(error.message);
      }
      
      console.log("Received response from skill-assistant:", data);
      
      if (!data || !data.response) {
        throw new Error("Invalid response from assistant");
      }
      
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.response,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      console.error("Error in handleSendMessage:", error);
      
      let errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error.name === "AbortError") {
        errorMessage = "The request took too long to complete. Please try a shorter message or try again later.";
      } else if (error.message.includes("API key")) {
        errorMessage = "There seems to be an issue with the AI service configuration. Please contact support.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from assistant. Please try again.",
      });
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: errorMessage,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  return {
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
  };
};
