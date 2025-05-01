
import { ChatMessage } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const sendMessageToAssistant = async (
  message: string,
  userId: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    console.log("Sending message to assistant:", message);
    
    // Convert history to format expected by API
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('skill-assistant', {
      body: {
        message,
        userId,
        history: formattedHistory
      },
    });
    
    if (error) {
      console.error("Error from skill-assistant edge function:", error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
    
    if (!data || !data.response) {
      console.error("Invalid response from AI assistant:", data);
      throw new Error("Received invalid response from AI assistant");
    }
    
    console.log("AI assistant response received:", data.response.slice(0, 50) + "...");
    return data.response;
  } catch (error) {
    console.error("Error in sendMessageToAssistant:", error);
    
    // Show user-friendly error toast
    toast.error("Could not connect to AI assistant. Please try again.");
    
    // Re-throw for further handling
    throw error;
  }
};
