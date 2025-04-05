
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Constants for error handling and retries
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // milliseconds

serve(async (req) => {
  // CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to skill-assistant function");
    
    // API key validation
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      throw new Error("OpenAI API key is not configured");
    }

    // Validate request
    if (!req.body) {
      throw new Error("Request body is missing");
    }
    
    const body = await req.json().catch(err => {
      console.error("Error parsing request body:", err);
      throw new Error("Invalid JSON in request body");
    });
    
    const { message, userId, history = [] } = body;

    console.log("Received message:", message);
    console.log("User ID:", userId);
    console.log("History length:", history.length);

    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new Error("Message is required and must be a non-empty string");
    }

    // Enhanced system message for more effective and quick responses
    const systemMessage = {
      role: "system",
      content: `You are SkillTrack Assistant, an AI designed to help users improve their skills and learning.
      
      Response Guidelines:
      - Keep responses SHORT and DIRECT (1-3 sentences whenever possible)
      - Respond QUICKLY with the most relevant information first
      - Focus on ANSWERING THE SPECIFIC QUESTION or requirement
      - Be ADAPTABLE and understand the context of the user's question
      - Provide SPECIFIC, ACTIONABLE learning advice focused on efficiency
      - When suggesting resources, be HIGHLY SELECTIVE (only the best 1-2 options)
      - Use BULLET POINTS for multiple items
      - Focus on PRACTICAL techniques that save time and maximize learning
      - Include QUICK WINS that can be implemented immediately
      - Use a FRIENDLY but CONCISE tone
      
      Avoid:
      - Generic advice
      - Long explanations
      - Multiple options when one clear recommendation would suffice
      - Theoretical discussions without practical applications
      - Misunderstanding the user's intent
      
      Remember: Users value SPEED, EFFECTIVENESS, and RELEVANCE above all. Be their efficient learning partner.`
    };

    // Limit history to last 5 exchanges for better context
    const recentHistory = history.slice(-5);

    // Create message array with system message, recent chat history, and current user message
    const messages = [
      systemMessage,
      ...recentHistory,
      { role: "user", content: message }
    ];

    console.log("Calling OpenAI API...");
    console.log("Using model: gpt-4o");
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Set up a safer timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
        
        // Call OpenAI API with optimized parameters
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4o",     // More capable model for better understanding
            messages,
            temperature: 0.3,    // Lower temperature for more precise responses
            max_tokens: 250,     // Increased slightly for more complete answers
            presence_penalty: 0.2,
            frequency_penalty: 0.5,
            top_p: 0.95,         // High focus on top tokens
            timeout: 30          // Optional timeout parameter
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle API errors with specific status codes
        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenAI API error:", errorData);
          
          // Handle different error types appropriately
          if (response.status === 429) {
            console.log("Rate limit exceeded, retrying after delay...");
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
              continue;
            }
            throw new Error("Rate limit exceeded. Try again later.");
          } else if (response.status === 401) {
            throw new Error("Invalid API key. Please check your OpenAI API key.");
          } else if (response.status === 404) {
            throw new Error("The requested model was not found. Please check the model name.");
          } else {
            throw new Error(errorData.error?.message || "Failed to get response from AI");
          }
        }

        const data = await response.json();
        console.log("OpenAI response received successfully");
        
        // Validate response format
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error("Invalid response format from OpenAI API");
        }
        
        const aiResponse = data.choices[0].message.content;
        
        // Validate response content
        if (!aiResponse || aiResponse.trim() === "") {
          throw new Error("Empty response from AI");
        }

        return new Response(
          JSON.stringify({ response: aiResponse }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (fetchError) {
        lastError = fetchError;
        
        // Only retry for certain errors
        if (fetchError.name === 'AbortError') {
          console.error("OpenAI API call timed out");
          if (retryCount < MAX_RETRIES) {
            console.log(`Retry attempt ${retryCount + 1} after timeout...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
            continue;
          }
          throw new Error("The request timed out after multiple attempts. Try a shorter question for faster response.");
        }
        
        // For other errors, don't retry
        break;
      }
    }
    
    // If we got here, all retries failed
    throw lastError || new Error("Failed to get a response after multiple attempts");
    
  } catch (error) {
    console.error("Error in skill-assistant function:", error);
    
    // Provide more specific error messages based on error type
    let errorMessage = error.message || "An unexpected error occurred";
    let statusCode = 500;
    
    if (errorMessage.includes("API key")) {
      statusCode = 401;
      errorMessage = "API key issue: " + errorMessage;
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
      statusCode = 429;
      errorMessage = "Rate limit exceeded: " + errorMessage;
    } else if (errorMessage.includes("model")) {
      errorMessage = "Model issue: " + errorMessage;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        errorCode: statusCode,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
