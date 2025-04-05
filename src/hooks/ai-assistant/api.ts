
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./types";
import { toast } from "sonner";

export const sendMessageToAssistant = async (
  userMessage: string, 
  userId: string | undefined, 
  history: ChatMessage[]
) => {
  console.log("Sending message to skill-assistant function");
  
  try {
    // Provide better context by sending more message history
    const messageHistory = history
      .slice(-5)
      .map(m => ({ 
        role: m.role, 
        content: m.content 
      }));

    const { data, error } = await supabase.functions.invoke("skill-assistant", {
      method: "POST",
      body: { 
        message: userMessage,
        userId,
        history: messageHistory
      }
    });

    if (error) {
      console.error("Error from skill-assistant function:", error);
      throw new Error(error.message);
    }

    if (!data || !data.response) {
      throw new Error("Invalid response from assistant");
    }

    return data.response;
  } catch (error: any) {
    console.error("Error in sendMessageToAssistant:", error);
    throw error;
  }
};
