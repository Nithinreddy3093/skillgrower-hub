
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
      topic = "",
      difficulty = "intermediate"
    } = body;

    console.log("Request type:", requestType);
    console.log("Topic:", topic || message);
    console.log("Difficulty:", difficulty);
    console.log("User ID:", userId);
    console.log("History length:", history.length);

    // Apply different validation based on request type
    if (requestType === "chat" && (!message || typeof message !== 'string' || message.trim() === '')) {
      throw new Error("Message is required and must be a non-empty string for chat requests");
    }
    
    if (requestType === "generateQuiz") {
      console.log("Generating quiz question on topic:", topic || message, "with difficulty:", difficulty);
      // If topic is not provided but message is, use message as topic
    }

    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // For quiz generation, construct a more specific prompt
        let processedMessage = message;
        if (requestType === "generateQuiz") {
          const quizTopic = topic || message;
          processedMessage = quizTopic + (quizTopic.toLowerCase().includes(difficulty) ? "" : ` (${difficulty} difficulty)`);
        }
        
        // Process the message and get AI response based on request type
        const aiResponse = await processUserMessage(
          processedMessage, 
          userId, 
          history,
          requestType
        );
        
        console.log("OpenAI response received successfully");
        
        // Handle quiz generation specially
        if (requestType === "generateQuiz") {
          try {
            // Parse the response as JSON
            console.log("Quiz generation response:", aiResponse.substring(0, 100) + "...");
            
            // Parse the question
            const question = JSON.parse(aiResponse);
            
            // Enhanced validation to ensure the question meets requirements
            if (!question.question || 
                !Array.isArray(question.options) || 
                question.options.length !== 4 || 
                question.options.some(opt => 
                  !opt || 
                  opt.includes("Concept") || 
                  opt.includes("Option ") ||
                  opt.length < 5
                ) ||
                typeof question.correctAnswer !== 'number' ||
                question.correctAnswer < 0 ||
                question.correctAnswer > 3 ||
                !question.explanation) {
              
              console.error("Generated question does not meet requirements:", question);
              throw new Error("Generated question does not meet quality requirements");
            }
            
            return new Response(
              JSON.stringify({ question }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } catch (parseError) {
            console.error("Error parsing quiz question:", parseError);
            console.error("Raw response:", aiResponse);
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
        if (error.message.includes("timeout") || 
            error.message.includes("rate limit") ||
            error.message.includes("overloaded")) {
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
    throw lastError || new Error("Failed to get response after multiple attempts");
    
  } catch (error) {
    return handleError(error);
  }
});
