
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the Gemini API key from environment variables
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Constants for error handling and retries
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // milliseconds

serve(async (req) => {
  // CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to skill-assistant-gemini function");
    
    // API key validation
    if (!GEMINI_API_KEY) {
      console.error("Gemini API key is not configured");
      throw new Error("Gemini API key is not configured");
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

    // Enhanced system message with more detailed training instructions for improved responses
    const systemMessage = {
      role: "system",
      content: `You are SkillTrack Assistant, an AI designed to help users improve their skills and learning.
      
      Response Guidelines:
      - Keep responses CONCISE and FOCUSED (1-3 sentences whenever possible)
      - Be DIRECT, providing the most valuable information first
      - UNDERSTAND the specific context of the user's question
      - Provide CONCRETE, ACTIONABLE advice on skill improvement
      - Focus on EFFICIENCY and EFFECTIVENESS in learning approaches
      - When suggesting resources, only recommend the HIGHEST QUALITY options
      - Use BULLET POINTS for clear organization when providing multiple steps or items
      - Include PRACTICAL techniques that can be implemented immediately
      - ADAPT to the user's skill level (beginner, intermediate, advanced)
      - Maintain a FRIENDLY but PROFESSIONAL tone
      - If you don't know something, admit it rather than making up information
      - STAY RESPONSIVE - never stall or send blank responses
      - If a user message is unclear, ASK CLARIFYING QUESTIONS instead of guessing
      - When users express frustration, acknowledge it and focus on solutions
      - For technical questions, provide accurate, tested answers with examples
      
      Your primary goal is to help users learn efficiently, overcome obstacles, and make meaningful progress in their skill development.`
    };

    // Process user history for better context
    const recentHistory = history.slice(-5).map(msg => {
      return {
        role: msg.role,
        parts: [{ text: msg.content }]
      };
    });

    // Create message array with system message, recent chat history, and current user message
    const messages = [
      {
        role: "user",
        parts: [{ text: systemMessage.content }]
      },
      ...recentHistory,
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    console.log("Calling Gemini API...");
    console.log("Using model: gemini-1.5-flash");
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Set up a safer timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
        
        // Call Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: messages,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
              topK: 40,
              topP: 0.95
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle API errors with specific status codes
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Gemini API error:", errorData);
          
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
            throw new Error("Invalid API key. Please check your Gemini API key.");
          } else if (response.status === 404) {
            throw new Error("The requested model was not found. Please check the model name.");
          } else {
            throw new Error(errorData.error?.message || "Failed to get response from AI");
          }
        }

        const data = await response.json();
        console.log("Gemini response received successfully");
        
        // Validate response format
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
          throw new Error("Invalid response format from Gemini API");
        }
        
        const aiResponse = data.candidates[0].content.parts[0].text;
        
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
          console.error("Gemini API call timed out");
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
    console.error("Error in skill-assistant-gemini function:", error);
    
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
