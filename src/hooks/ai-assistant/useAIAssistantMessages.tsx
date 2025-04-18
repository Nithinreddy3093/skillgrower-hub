
import { useRef, useEffect } from "react";
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

  // Focus the input field whenever needed
  useEffect(() => {
    if (inputRef.current && !messageState.isLoading) {
      // Short timeout to allow animations to complete
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messageState.isLoading]);

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
    
    // Add user message to chat
    const updatedMessagesWithUser: ChatMessage[] = [...messageState.messages, userMessage];
    setMessages(updatedMessagesWithUser);
    setPrompt("");
    setIsLoading(true);
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const placeholderId = crypto.randomUUID();
      
      // Add placeholder for assistant response
      const assistantPlaceholder: ChatMessage = {
        id: placeholderId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
      };
      
      const messagesWithPlaceholder: ChatMessage[] = [...updatedMessagesWithUser, assistantPlaceholder];
      setMessages(messagesWithPlaceholder);
      setIsStreaming(true);

      // Debug logs to trace request
      console.log("Sending message:", trimmedPrompt);
      console.log("User ID:", user?.id);
      console.log("Message history length:", messageState.messages.length);

      // Explicitly handle the case where user is undefined
      if (!user?.id) {
        console.warn("User ID is undefined, using anonymous session");
      }

      // Call the API with more explicit error handling
      const response = await sendMessageToAssistant(
        trimmedPrompt, 
        user?.id || 'anonymous', 
        messageState.messages
      );
      
      console.log("Response received:", response ? "Success" : "Empty");
      
      // Validate response content
      if (!response || response.trim() === "") {
        throw new Error("Empty response received from assistant");
      }
      
      // Update the placeholder message with the actual response
      const updatedMessages: ChatMessage[] = messagesWithPlaceholder.map(msg => 
        msg.id === placeholderId 
          ? { ...msg, content: response } 
          : msg
      );
      
      setMessages(updatedMessages);
      setIsStreaming(false);
      setRetryCount(0);
      
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      
      // Enhanced error handling with more specific messages
      let errorMessage = "I'm having trouble answering that. Could you rephrase your question?";
      let toastMessage = "Unable to get response. Try a different question.";
      
      // Handle different error scenarios with appropriate messages
      if (error.message?.includes("timeout") || error.message?.includes("network")) {
        toastMessage = messageState.retryCount < 2 
          ? "Connection issue. Retrying..." 
          : "Network issue persists. Please try again later.";
          
        if (messageState.retryCount < 2) {
          const filteredMessages = messageState.messages.filter(msg => msg.content !== "");
          setMessages(filteredMessages);
          setRetryCount(messageState.retryCount + 1);
          
          // Try again after a short delay
          toast.error(toastMessage);
          setTimeout(() => {
            sendMessage();
          }, 1500);
          return;
        } else {
          errorMessage = "I'm having trouble connecting right now. Please try again in a few minutes.";
        }
      } else if (error.message?.includes("API key") || error.message?.includes("quota") || error.message?.includes("insufficient")) {
        errorMessage = "Our AI service is currently unavailable. The team has been notified and is working to fix this issue.";
        toastMessage = "AI service temporarily unavailable. Please try again later.";
      } else if (error.message?.includes("rate limit")) {
        errorMessage = "I've reached my usage limit. Please try again in a few minutes.";
        toastMessage = "Usage limit reached. Please try again later.";
      } else if (error.message?.includes("empty response")) {
        errorMessage = "I couldn't generate a good answer for that question. Could you try something more specific?";
        toastMessage = "Couldn't generate a response. Try a more specific question.";
      }
      
      toast.error(toastMessage);
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: errorMessage,
        role: "assistant",
        timestamp: new Date(),
      };
      
      const messagesWithError: ChatMessage[] = [
        ...messageState.messages.filter(msg => msg.content !== ""),
        errorChatMessage
      ];
      
      setMessages(messagesWithError);
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
