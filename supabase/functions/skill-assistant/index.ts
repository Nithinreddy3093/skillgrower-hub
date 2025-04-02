
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

    // System message to guide the AI's responses
    const systemMessage = {
      role: "system",
      content: `You are SkillTrack Assistant, an AI designed to help users improve their skills and achieve their learning goals.
      
      You should:
      - Provide specific, actionable learning advice and resources
      - Help users track their progress and set effective learning goals
      - Offer study techniques and learning strategies tailored to the user's needs
      - Encourage consistent practice and skill development with concrete examples
      - Keep responses concise (3-4 sentences max) and friendly
      - Include gamification elements like challenges, streaks, and achievements in your responses
      - When appropriate, suggest relevant books, courses, or tools
      
      You should NOT:
      - Provide generic or vague advice
      - Go off-topic from skill development and learning
      - Write excessively long responses
      
      Focus on practical guidance that users can immediately apply to their learning journey.`
    };

    // Create message array with system message, chat history, and current user message
    const messages = [
      systemMessage,
      ...history,
      { role: "user", content: message }
    ];

    console.log("Calling OpenAI API...");
    console.log("Using model: gpt-4o-mini");
    
    // Try with a 15-second timeout for the OpenAI API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
          max_tokens: 300,
          presence_penalty: 0.6,  // Discourage repetition
          frequency_penalty: 0.5  // Encourage diverse responses
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
        console.error("OpenAI API call timed out after 15 seconds");
        throw new Error("The OpenAI API request timed out");
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
