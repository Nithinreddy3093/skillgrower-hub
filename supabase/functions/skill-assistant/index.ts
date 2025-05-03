
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, MAX_RETRIES, RETRY_DELAY } from "./config.ts";
import { processUserMessage } from "./openai.ts";
import { handleError } from "./error-handler.ts";

serve(async (req) => {
  // CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to skill-assistant function");

    // Validate request
    if (!req.body) {
      throw new Error("Request body is missing");
    }
    
    const body = await req.json().catch(err => {
      console.error("Error parsing request body:", err);
      throw new Error("Invalid JSON in request body");
    });
    
    // Extract request parameters with defaults
    const { 
      message, 
      userId, 
      history = [], 
      requestType = "chat", 
      topic = ""
    } = body;

    console.log("Request type:", requestType);
    console.log("Received message:", message);
    console.log("User ID:", userId);
    console.log("History length:", history.length);

    // Apply different validation based on request type
    if (requestType === "chat" && (!message || typeof message !== 'string' || message.trim() === '')) {
      throw new Error("Message is required and must be a non-empty string for chat requests");
    }
    
    if (requestType === "generateQuiz" && (!topic || typeof topic !== 'string')) {
      console.log("Using message as topic for quiz generation");
      // If topic is not provided but message is, use message as topic
    }

    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Process the message and get AI response based on request type
        const aiResponse = await processUserMessage(
          message, 
          userId, 
          history,
          requestType
        );
        
        console.log("OpenAI response received successfully");
        
        // Handle quiz generation specially
        if (requestType === "generateQuiz") {
          try {
            // Try to parse the response as JSON
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
            
            // Parse the question
            const question = JSON.parse(jsonStr);
            return new Response(
              JSON.stringify({ question }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } catch (parseError) {
            console.error("Error parsing quiz question:", parseError);
            throw new Error("Failed to generate a valid quiz question");
          }
        }
        
        // Return normal chat response
        return new Response(
          JSON.stringify({ response: aiResponse }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${retryCount + 1} failed:`, error.message);
        
        // Only retry for certain types of errors
        if (error.message.includes("timeout") || error.message.includes("rate limit")) {
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying attempt ${retryCount + 1} after delay...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
            continue;
          }
        }
        
        // For other errors, don't retry
        break;
      }
    }
    
    // If we got here, all retries failed
    throw lastError || new Error("Failed to get a response after multiple attempts");
    
  } catch (error) {
    return handleError(error);
  }
});
