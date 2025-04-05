
import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChatMessage } from "./types";
import { autoResizeTextarea } from "./utils";
import { sendMessageToAssistant } from "./api";
import { useAIAssistantState } from "./useAIAssistantState";

export const useAIAssistantMessages = () => {
  const {
    messageState,
    setPrompt,
    setMessages,
    setIsLoading,
    setIsStreaming,
    setRetryCount,
    clearConversation: clearState
  } = useAIAssistantState();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    autoResizeTextarea(e.target);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmedPrompt = messageState.prompt.trim();
    if (!trimmedPrompt || messageState.isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: trimmedPrompt,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages([...messageState.messages, userMessage]);
    setPrompt("");
    setIsLoading(true);
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const placeholderId = crypto.randomUUID();
      setMessages([
        ...messageState.messages,
        userMessage,
        {
          id: placeholderId,
          content: "",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
      setIsStreaming(true);

      const response = await sendMessageToAssistant(trimmedPrompt, user?.id, messageState.messages);
      
      setMessages(messageState.messages.map(msg => 
        msg.id === placeholderId 
          ? { ...msg, content: response } 
          : msg
      ));
      
      setIsStreaming(false);
      setRetryCount(0);
      
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      
      // Handle different error scenarios with appropriate messages
      if (error.message.includes("timeout") || error.message.includes("network")) {
        if (messageState.retryCount < 2) {
          toast.error("Connection issue. Retrying...");
          
          // Remove empty message
          setMessages(messageState.messages.filter(msg => msg.content !== ""));
          setRetryCount(messageState.retryCount + 1);
          
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
      
      setMessages([
        ...messageState.messages.filter(msg => msg.content !== ""),
        {
          id: crypto.randomUUID(),
          content: "I'm having trouble answering that. Could you rephrase your question or try something more specific?",
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
    clearState();
    toast.success("Conversation cleared");
  };

  return {
    messages: messageState.messages,
    prompt: messageState.prompt,
    isLoading: messageState.isLoading,
    isStreaming: messageState.isStreaming,
    inputRef,
    messagesEndRef,
    sendMessage,
    handleTextareaChange,
    clearConversation
  };
};
