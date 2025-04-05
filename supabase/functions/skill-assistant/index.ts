
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
    
    // Try with a safe timeout for reliable performance
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
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
          top_p: 0.95          // High focus on top tokens
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
        console.error("OpenAI API call timed out");
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
