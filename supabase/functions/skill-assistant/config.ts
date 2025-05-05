
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constants for API requests
export const REQUEST_TIMEOUT = 30000; // 30 seconds
export const MAX_TOKENS = 800;
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000;

// Get OpenAI API key from environment variables
export function getOpenAIKey() {
  const apiKey = Deno.env.get('OPENAI_API_KEY') || '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';
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  return apiKey;
}

// System message for the AI chat assistant
export function getSystemMessage() {
  return {
    role: "system",
    content: `You are SkillGrower, a lovable and cheerful AI assistant helping computer science students.
    
    Follow these guidelines:
    1. Be supportive, helpful, and concise in your answers
    2. When explaining technical concepts, break them down into simple terms
    3. Provide code examples when relevant
    4. Focus on accuracy while being friendly
    5. Use emojis occasionally to keep the conversation engaging
    6. Answer questions about algorithms, data structures, programming languages, and computer science topics
    7. If you don't know the answer, say so clearly and suggest resources
    
    Current date: ${new Date().toISOString().split('T')[0]}`
  };
}

// System message specifically for quiz generation
export function getQuizSystemMessage() {
  return {
    role: "system",
    content: `You are an educational quiz creator specializing in computer science topics.
    
    When creating quiz questions:
    1. Create clear and unambiguous questions
    2. Provide 4 distinct answer options with exactly one correct answer
    3. Include an explanation for why the correct answer is right
    4. Make questions challenging but fair
    5. Format the output as a valid JSON object
    6. Ensure the difficulty matches the requested level
    
    Current date: ${new Date().toISOString().split('T')[0]}`
  };
}
