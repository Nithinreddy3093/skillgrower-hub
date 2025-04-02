
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to skill-assistant function");
    
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

    // Enhanced system message for faster, more effective responses
    const systemMessage = {
      role: "system",
      content: `You are SkillTrack Assistant, an AI designed to help users improve their skills and learning.
      
      Response Guidelines:
      - Keep responses SHORT and DIRECT (1-3 sentences whenever possible)
      - Respond QUICKLY with the most relevant information first
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
      
      Remember: Users value SPEED and EFFECTIVENESS above all. Be their efficient learning partner.`
    };

    // Limit history to last 4 exchanges for faster context loading
    const recentHistory = history.slice(-4);

    // Create message array with system message, recent chat history, and current user message
    const messages = [
      systemMessage,
      ...recentHistory,
      { role: "user", content: message }
    ];

    console.log("Calling OpenAI API...");
    console.log("Using model: gpt-4o-mini");
    
    // Try with a reduced timeout for faster perceived performance
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced from 15s to 10s

    try {
      // Call OpenAI API with optimized parameters
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Fast model
          messages,
          temperature: 0.5,     // Lower temperature for more direct responses
          max_tokens: 200,      // Reduced from 300 for faster responses
          presence_penalty: 0.4, // Adjusted for better focus
          frequency_penalty: 0.5,
          top_p: 0.9            // Added for more focused responses
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        throw new Error(error.error?.message || "Failed to get response from AI");
      }

      const data = await response.json();
      console.log("OpenAI response received successfully");
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from OpenAI API");
      }
      
      const aiResponse = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("OpenAI API call timed out after 10 seconds");
        throw new Error("The request timed out. Try a shorter question for faster response.");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in skill-assistant function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        errorCode: error.code || 500,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
