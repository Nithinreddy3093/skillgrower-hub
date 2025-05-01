import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./types";
import { toast } from "sonner";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // milliseconds

export const sendMessageToAssistant = async (
  userMessage: string, 
  userId: string, 
  history: ChatMessage[]
) => {
  console.log("Sending message to skill-assistant-gemini function");
  
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount <= MAX_RETRIES) {
    try {
      // Provide better context by sending more message history
      const messageHistory = history
        .slice(-15) // Increased from 10 to 15 messages for even better context
        .map(m => ({ 
          role: m.role, 
          content: m.content 
        }));

      // Use a Promise.race with a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 60000); // Increased timeout to 60s for more detailed responses
      });

      console.log("Preparing request with message:", userMessage);

      const responsePromise = supabase.functions.invoke("skill-assistant-gemini", {
        method: "POST",
        body: { 
          message: userMessage,
          userId,
          history: messageHistory,
          requestType: "chat"
        }
      });
      
      // Race between the timeout and the actual request
      const response = await Promise.race([
        responsePromise,
        timeoutPromise
      ]) as any;
      
      console.log("Response received from API");
      
      if (!response) {
        throw new Error("No response received from function");
      }

      const { data, error } = response;

      if (error) {
        console.error("Error from skill-assistant-gemini function:", error);
        
        // Better error handling with more specific messages
        if (error.message?.includes("quota") || 
            error.message?.includes("insufficient") ||
            error.response?.status === 429) {
          throw new Error("AI service quota exceeded. Please try again later.");
        }
        
        if (error.message?.includes("timeout") || 
            error.message?.includes("network") || 
            error.message?.includes("rate limit")) {
          if (retryCount < MAX_RETRIES) {
            console.log(`Retry attempt ${retryCount + 1}...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
            continue;
          }
        }
        
        throw new Error(error.message || "Error communicating with assistant");
      }

      if (!data || !data.response) {
        throw new Error("Invalid or empty response from assistant");
      }

      return data.response;
    } catch (error: any) {
      lastError = error;
      console.error("Error in sendMessageToAssistant:", error);
      
      if (error.message?.includes("quota") || error.message?.includes("insufficient")) {
        console.error("API quota exceeded:", error);
        throw new Error("AI service quota exceeded. Please try again later.");
      }
      
      if (error.message?.includes("timeout") || error.message?.includes("network")) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Retry attempt ${retryCount + 1}...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error("Failed to get a response after multiple attempts");
};

export const generateQuizQuestion = async (topic: string) => {
  console.log("Generating quiz question for topic:", topic);
  
  try {
    // Improved error handling with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 30000);
    });

    const responsePromise = supabase.functions.invoke("skill-assistant-gemini", {
      method: "POST",
      body: { 
        requestType: "generateQuiz",
        topic
      }
    });

    const response = await Promise.race([
      responsePromise,
      timeoutPromise
    ]) as any;
    
    const { data, error } = response;

    if (error) {
      console.error("Error generating quiz question:", error);
      throw new Error(error.message || "Failed to generate quiz question");
    }

    if (!data || !data.question) {
      throw new Error("Invalid response format from quiz generation");
    }

    console.log("Successfully generated quiz question:", data.question.question.substring(0, 30) + "...");
    return data.question;
  } catch (error: any) {
    console.error("Error in generateQuizQuestion:", error);
    toast.error(error.message || "Failed to generate quiz question. Please try again.");
    throw error;
  }
};
