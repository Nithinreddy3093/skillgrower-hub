
import { corsHeaders, getOpenAIKey, getSystemMessage, getQuizSystemMessage, REQUEST_TIMEOUT, MAX_TOKENS } from "./config.ts";

// Process user messages and get AI response
export async function processUserMessage(message: string, userId: string, history: any[] = [], requestType = "chat") {
  try {
    // Format conversation history for API
    const recentHistory = history.slice(-5);
    
    const messages = [
      requestType === "generateQuiz" ? getQuizSystemMessage() : getSystemMessage(),
      ...recentHistory,
      { role: "user", content: message }
    ];

    // Use appropriate model based on request type
    const model = requestType === "generateQuiz" ? "gpt-4o-mini" : "gpt-4o";
    console.log(`Using model: ${model} for ${requestType} request`);
    
    // Call OpenAI API
    const response = await callOpenAI(messages, model, requestType);
    
    return response;
  } catch (error) {
    console.error("Error in processUserMessage:", error);
    throw error;
  }
}

// Call the OpenAI API with retry logic and optimized parameters
export async function callOpenAI(messages: any[], model = "gpt-4o", requestType = "chat") {
  try {
    // Set up a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    // Optimize parameters based on request type
    const temperature = requestType === "generateQuiz" ? 0.2 : 0.7;
    const maxTokens = requestType === "generateQuiz" ? 300 : MAX_TOKENS;
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getOpenAIKey()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        presence_penalty: 0.2,
        frequency_penalty: 0.5,
        top_p: 0.95,
        timeout: REQUEST_TIMEOUT
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle API error responses
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error?.message || "Failed to get response from AI");
    }

    const data = await response.json();
    
    // Validate response format
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const aiResponse = data.choices[0].message.content;
    
    // Validate response content
    if (!aiResponse || aiResponse.trim() === "") {
      throw new Error("Empty response from AI");
    }

    return aiResponse;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("The request timed out. Try a shorter question for faster response.");
    }
    throw error;
  }
}
