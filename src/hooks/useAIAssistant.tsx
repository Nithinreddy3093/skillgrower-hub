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
  
  const autoResizeTextarea = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 150)}px`;
  };

  useEffect(() => {
    if (user) {
      const savedMessages = localStorage.getItem(`skilltrack-chat-${user.id}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (e) {
          console.error("Error parsing saved messages:", e);
          setMessages([getWelcomeMessage()]);
        }
      } else {
        setMessages([getWelcomeMessage()]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && messages.length > 0) {
      const messagesToSave = messages.slice(-20);
      localStorage.setItem(`skilltrack-chat-${user.id}`, JSON.stringify(messagesToSave));
    }
  }, [messages, user]);

  const getWelcomeMessage = (): ChatMessage => ({
    id: crypto.randomUUID(),
    content: "Hi there! I'm your SkillTrack AI assistant. Ask me anything about learning, skill development, or how to reach your goals faster.",
    role: "assistant",
    timestamp: new Date(),
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        autoResizeTextarea(inputRef.current);
      }, 200);
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
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: trimmedPrompt,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      console.log("Sending message to skill-assistant function");
      
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

      const history = messages
        .slice(-3)
        .map(m => ({ 
          role: m.role, 
          content: m.content 
        }));

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

      setIsStreaming(false);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === placeholderId 
            ? { ...msg, content: data.response } 
            : msg
        )
      );
      
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      
      toast.error("Assistant couldn't respond. Try again with a shorter question.");
      
      setMessages(prev => prev.filter(msg => msg.content !== ""));
      
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: "I'm having trouble processing that. Try asking a shorter, more specific question.",
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
    setMessages([getWelcomeMessage()]);
    toast.success("Conversation cleared");
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    autoResizeTextarea(e.target);
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
    handleTextareaChange,
  };
};
