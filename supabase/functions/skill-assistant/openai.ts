
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
    const maxTokens = requestType === "generateQuiz" ? 1000 : MAX_TOKENS;
    
    const openAIKey = getOpenAIKey();
    console.log("Using OpenAI key:", openAIKey.substring(0, 5) + "..." + openAIKey.substring(openAIKey.length - 5));
    
    // For quiz generation, add more specific system instruction
    if (requestType === "generateQuiz") {
      console.log("Generating quiz with enhanced instructions");
      // Add or modify the first message to be more explicit for quiz generation
      if (messages[0].role === "system") {
        messages[0].content += ` Create a single self-contained quiz question in valid JSON format with the following structure EXACTLY:
        {
          "question": "The full question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0, // Index of correct answer (0-3)
          "category": "Computer Science", // Subject category
          "difficulty": "intermediate", // easy, intermediate, or advanced
          "explanation": "Explanation of why the answer is correct"
        }
        
        IMPORTANT: Return ONLY the JSON object, nothing else. Ensure it is complete and valid JSON.`;
      }
    }
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
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
    
    // For quiz generation, attempt to parse and validate the JSON
    if (requestType === "generateQuiz") {
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
        const parsedResponse = JSON.parse(jsonStr);
        
        // Validate the quiz question structure
        if (!parsedResponse.question || !Array.isArray(parsedResponse.options) || 
            typeof parsedResponse.correctAnswer !== 'number' || !parsedResponse.explanation) {
          console.error("Invalid quiz question format:", parsedResponse);
          throw new Error("Quiz question format is invalid");
        }
        
        // Return the validated JSON string
        return JSON.stringify(parsedResponse);
      } catch (parseError) {
        console.error("Failed to parse quiz JSON:", parseError, "Raw response:", aiResponse);
        throw new Error("Failed to generate a valid quiz question: " + parseError.message);
      }
    }
    
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
