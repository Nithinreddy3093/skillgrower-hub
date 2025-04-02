
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export const useAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          content: "Hi there! I'm your SkillTrack AI assistant. How can I help with your learning journey today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const expandChat = () => {
    setIsMinimized(false);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: trimmedPrompt,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
      console.log("Sending message to skill-assistant function");
      
      // Add placeholder message for streaming effect
      const placeholderId = crypto.randomUUID();
      setMessages(prev => [
        ...prev,
        {
          id: placeholderId,
          content: "",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
      setIsStreaming(true);

      // Get message history for context (last 10 messages)
      const history = messages
        .slice(-10)
        .map(m => ({ 
          role: m.role, 
          content: m.content 
        }));

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("skill-assistant", {
        method: "POST",
        body: { 
          message: trimmedPrompt,
          userId: user?.id,
          history
        }
      });

      if (error) {
        console.error("Error from skill-assistant function:", error);
        throw new Error(error.message);
      }

      if (!data || !data.response) {
        throw new Error("Invalid response from assistant");
      }

      // Update the placeholder message with the actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === placeholderId 
            ? { ...msg, content: data.response } 
            : msg
        )
      );
      
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      
      toast.error("Failed to get a response. Please try again.");
      
      // Remove the placeholder message
      setMessages(prev => prev.filter(msg => msg.content !== ""));
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        content: "Hi there! I'm your SkillTrack AI assistant. How can I help with your learning journey today?",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  return {
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
  };
};
