
import { corsHeaders, getOpenAIKey, getSystemMessage } from "./config.ts";

// Process user messages and get AI response
export async function processUserMessage(message: string, userId: string, history: any[] = []) {
  try {
    // Format conversation history for API
    const recentHistory = history.slice(-5);
    
    const messages = [
      getSystemMessage(),
      ...recentHistory,
      { role: "user", content: message }
    ];

    console.log("Using model: gpt-4o");
    
    // Call OpenAI API
    const response = await callOpenAI(messages);
    
    return response;
  } catch (error) {
    console.error("Error in processUserMessage:", error);
    throw error;
  }
}

// Call the OpenAI API with retry logic
export async function callOpenAI(messages: any[], retryCount = 0) {
  try {
    // Set up a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getOpenAIKey()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.2,
        max_tokens: 300,
        presence_penalty: 0.2,
        frequency_penalty: 0.5,
        top_p: 0.95,
        timeout: 30
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
