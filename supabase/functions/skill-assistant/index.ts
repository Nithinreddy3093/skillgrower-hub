
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
    console.log("Topic:", topic);

    // Apply different validation based on request type
    if (requestType === "chat" && (!message || typeof message !== 'string' || message.trim() === '')) {
      throw new Error("Message is required and must be a non-empty string for chat requests");
    }
    
    if (requestType === "generateQuiz") {
      console.log("Generating quiz question on topic:", topic || message);
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
          processedMessage = `Create a single quiz question about "${quizTopic}" with the following requirements:
          1. The question should be challenging but fair
          2. Provide exactly 4 distinct answer options (labeled A, B, C, D)
          3. Indicate which option is correct (0-3 index)
          4. Include a brief explanation of why the correct answer is right
          5. Categorize the question (Computer Science, Data Structures, etc.)
          6. Set difficulty level (easy, intermediate, or advanced)
          7. Return ONLY valid JSON with this structure:
          {
            "question": "What is X?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "category": "Computer Science",
            "difficulty": "intermediate",
            "explanation": "Explanation here"
          }`;
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
            // Try to parse the response as JSON
            console.log("Quiz generation response:", aiResponse.substring(0, 100) + "...");
            
            // Parse the question
            const question = JSON.parse(aiResponse);
            
            // Add validation to ensure the question meets requirements
            if (!question.question || !Array.isArray(question.options) || 
                question.options.length !== 4 || typeof question.correctAnswer !== 'number' ||
                !question.explanation) {
              throw new Error("Invalid quiz question format");
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
