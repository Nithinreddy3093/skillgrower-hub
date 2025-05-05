
import { corsHeaders, getOpenAIKey, getSystemMessage, getQuizSystemMessage, REQUEST_TIMEOUT, MAX_TOKENS } from "./config.ts";

// Process user messages and get AI response
export async function processUserMessage(message: string, userId: string, history: any[] = [], requestType = "chat") {
  try {
    // Format conversation history for API
    const recentHistory = history.slice(-5);
    
    // For quiz generation, construct a more specific prompt
    let processedMessage = message;
    if (requestType === "generateQuiz") {
      const quizTopic = message;
      const difficultyLevel = message.toLowerCase().includes("advanced") ? "advanced" : 
                             message.toLowerCase().includes("easy") ? "easy" : "intermediate";
      
      processedMessage = `Create a detailed, university-level quiz question about "${quizTopic}" with these requirements:

1. The question must be specific, challenging, and test deep understanding
2. Provide EXACTLY 4 distinct answer options labeled as array items
3. CRITICAL: Each option MUST be a specific, detailed statement (15-30 words) with technical content
4. DO NOT use placeholders or generic answers like "Concept A" or "First option"
5. Each answer choice should be complete, meaningful, and technically accurate
6. Mark exactly one option as correct (using index 0-3)
7. Provide a detailed explanation (3-5 sentences) of why the correct answer is right
8. Indicate the difficulty level as "${difficultyLevel}"
9. Choose an appropriate category from: Data Structures, Algorithms, Web Development, Programming Languages, Operating Systems, Computer Science, or System Architecture
10. Return ONLY valid, properly formatted JSON with this exact structure:
{
  "question": "Your specific, detailed question here?",
  "options": ["Detailed first option", "Detailed second option", "Detailed third option", "Detailed fourth option"],
  "correctAnswer": X,
  "category": "Category Name",
  "difficulty": "${difficultyLevel}",
  "explanation": "Detailed explanation of why the correct answer is right and others are wrong."
}`;
    }
    
    // Process the message and get AI response based on request type
    const aiResponse = await callOpenAI(
      processedMessage, 
      userId, 
      history,
      requestType
    );
    
    console.log("OpenAI response received successfully");
    
    return aiResponse;
  } catch (error) {
    console.error("Error in processUserMessage:", error);
    throw error;
  }
}

// Call the OpenAI API with retry logic and optimized parameters
export async function callOpenAI(message: string, userId: string, history: any[] = [], requestType = "chat") {
  try {
    // Set up a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    // Format conversations for API
    const recentHistory = history.slice(-5);
    
    // Optimize parameters based on request type
    const temperature = requestType === "generateQuiz" ? 0.1 : 0.7;
    const maxTokens = requestType === "generateQuiz" ? 1200 : MAX_TOKENS;
    const model = requestType === "generateQuiz" ? "gpt-4o" : "gpt-4o-mini";
    
    const messages = [
      requestType === "generateQuiz" ? getQuizSystemMessage() : getSystemMessage(),
      ...recentHistory,
      { role: "user", content: message }
    ];
    
    console.log(`Using model: ${model} for ${requestType} request with temperature ${temperature}`);
    console.log(`Prompt for ${requestType}:`, message.substring(0, 100) + "...");
    
    const openAIKey = getOpenAIKey();
    console.log("Using OpenAI key:", openAIKey.substring(0, 5) + "..." + openAIKey.substring(openAIKey.length - 5));
    
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
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        top_p: 0.9
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
        console.log("Raw quiz response:", aiResponse.substring(0, 100) + "...");
        
        // Search for JSON pattern in the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
        const parsedResponse = JSON.parse(jsonStr);
        
        console.log("Parsed quiz question:", parsedResponse.question?.substring(0, 50) + "...");
        
        // Perform enhanced validation on the question format
        if (!parsedResponse.question || typeof parsedResponse.question !== 'string' || 
            parsedResponse.question.length < 10) {
          throw new Error("Invalid question format: Question is missing or too short");
        }
        
        if (!Array.isArray(parsedResponse.options) || parsedResponse.options.length !== 4) {
          throw new Error("Invalid options format: Must provide exactly 4 options");
        }
        
        // Enhanced validation for meaningful options
        for (let i = 0; i < parsedResponse.options.length; i++) {
          const option = parsedResponse.options[i];
          if (!option || 
              typeof option !== 'string' ||
              option.length < 5 ||
              option.includes("Concept ") || 
              option.includes("Option ") ||
              /^[A-D]\)/.test(option) ||
              /^\([A-D]\)/.test(option)) {
            throw new Error(`Invalid option ${i+1}: "${option.substring(0, 20)}..." - Options must be meaningful statements`);
          }
        }
        
        if (typeof parsedResponse.correctAnswer !== 'number' || 
            parsedResponse.correctAnswer < 0 || 
            parsedResponse.correctAnswer > 3) {
          throw new Error("Invalid correctAnswer: Must be a number between 0-3");
        }
        
        if (!parsedResponse.explanation || 
            typeof parsedResponse.explanation !== 'string' || 
            parsedResponse.explanation.length < 20) {
          throw new Error("Invalid explanation: Explanation is missing or too short");
        }
        
        if (!parsedResponse.category || 
            typeof parsedResponse.category !== 'string') {
          parsedResponse.category = "Computer Science";
        }
        
        if (!parsedResponse.difficulty || 
            !["easy", "intermediate", "advanced"].includes(parsedResponse.difficulty)) {
          parsedResponse.difficulty = "intermediate";
        }
        
        console.log("Quiz question validated successfully");
        
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
      throw new Error("Request timed out after " + (REQUEST_TIMEOUT/1000) + " seconds");
    }
    throw error;
  }
}
