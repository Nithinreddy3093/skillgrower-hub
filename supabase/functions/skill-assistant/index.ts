
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, history = [] } = await req.json();

    // System message to guide the AI's responses
    const systemMessage = {
      role: "system",
      content: `You are SkillTrack Assistant, an AI designed to help users improve their skills and achieve their learning goals.
      
      You should:
      - Provide specific, actionable learning advice and resources
      - Help users track their progress and set effective learning goals
      - Offer study techniques and learning strategies
      - Encourage consistent practice and skill development
      - Keep responses concise (3-4 sentences max) and friendly
      
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
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from AI");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // TODO: In a real application, we would store the conversation history in the database
    // associated with the userId for continuity

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in skill-assistant function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
