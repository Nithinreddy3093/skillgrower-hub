
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./types";
import { toast } from "sonner";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // milliseconds

export const sendMessageToAssistant = async (
  userMessage: string, 
  userId: string | undefined, 
  history: ChatMessage[]
) => {
  console.log("Sending message to skill-assistant function");
  
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount <= MAX_RETRIES) {
    try {
      // Provide better context by sending more message history
      const messageHistory = history
        .slice(-5)
        .map(m => ({ 
          role: m.role, 
          content: m.content 
        }));

      // Use a Promise.race with a timeout promise instead of AbortController
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 20000);
      });

      const responsePromise = supabase.functions.invoke("skill-assistant", {
        method: "POST",
        body: { 
          message: userMessage,
          userId,
          history: messageHistory
        }
      });
      
      // Race between the timeout and the actual request
      const { data, error } = await Promise.race([
        responsePromise,
        timeoutPromise.then(() => {
          throw new Error("Request timed out");
        })
      ]) as any;

      if (error) {
        console.error("Error from skill-assistant function:", error);
        
        // Check for specific error types that might benefit from retrying
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
        
        // Enhance error messages for better user feedback
        let errorMessage = error.message;
        if (error.message?.includes("API key")) {
          errorMessage = "AI service API key issue. Please contact support.";
        } else if (error.message?.includes("rate limit")) {
          errorMessage = "AI service rate limit reached. Please try again later.";
        } else if (error.message?.includes("model")) {
          errorMessage = "AI model issue. Please try a different query.";
        }
        
        throw new Error(errorMessage || "Error communicating with assistant");
      }

      if (!data || !data.response) {
        throw new Error("Invalid or empty response from assistant");
      }

      return data.response;
    } catch (error: any) {
      lastError = error;
      
      // Only retry specific errors
      if (error.name === "AbortError" || error.message?.includes("timeout") || error.message?.includes("network")) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          continue;
        }
      }
      
      console.error("Error in sendMessageToAssistant:", error);
      throw error;
    }
  }
  
  throw lastError || new Error("Failed to get a response after multiple attempts");
};
