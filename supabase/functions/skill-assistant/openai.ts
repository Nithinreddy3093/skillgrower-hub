
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
      
      processedMessage = `Create 5 diverse university-level multiple-choice questions about "${quizTopic}" with these requirements:

1. Each question must test a different aspect or concept related to ${quizTopic}
2. Questions should vary in format (theory concepts, practical applications, problem-solving, etc.)
3. Each question must have EXACTLY 4 distinct answer options labeled with indices 0-3
4. Each option MUST be detailed, meaningful, and specific (10-30 words) - NO placeholder content
5. Mark exactly one option as correct for each question (using index 0-3)
6. For each question, provide a detailed explanation (2-4 sentences) of why the correct answer is right
7. Include appropriate difficulty level ("${difficultyLevel}") for each question
8. Assign each question to one of these categories: "Computer Science", "Data Structures", "Algorithms", "Web Development", "Programming Languages", "Operating Systems", or "System Architecture"
9. Return valid JSON with this exact structure:
{
  "questions": [
    {
      "question": "First detailed question text?",
      "options": ["Detailed first option", "Detailed second option", "Detailed third option", "Detailed fourth option"],
      "correctAnswer": X,
      "category": "Category Name",
      "difficulty": "${difficultyLevel}",
      "explanation": "Detailed explanation"
    },
    ... 4 more similar question objects ...
  ]
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
    const temperature = requestType === "generateQuiz" ? 0.8 : 0.7; // Higher temperature for more variation in quiz questions
    const maxTokens = requestType === "generateQuiz" ? 2000 : MAX_TOKENS; // More tokens for quiz generation
    const model = requestType === "generateQuiz" ? "gpt-4o" : "gpt-4o-mini";
    
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
        messages: [
          requestType === "generateQuiz" ? getQuizSystemMessage() : getSystemMessage(),
          ...recentHistory,
          { role: "user", content: message }
        ],
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
        
        // Check if we have questions array
        if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
          throw new Error("Invalid response format: Missing questions array");
        }
        
        console.log(`Received ${parsedResponse.questions.length} quiz questions`);
        
        // Validate each question
        parsedResponse.questions.forEach((q: any, index: number) => {
          if (!q.question || typeof q.question !== 'string' || q.question.length < 10) {
            throw new Error(`Invalid question format for question ${index + 1}: Question text is missing or too short`);
          }
          
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`Invalid options format for question ${index + 1}: Must provide exactly 4 options`);
          }
          
          // Enhanced validation for meaningful options
          for (let i = 0; i < q.options.length; i++) {
            const option = q.options[i];
            if (!option || 
                typeof option !== 'string' ||
                option.length < 5 ||
                option.includes("Concept ") || 
                option.includes("Option ") ||
                /^[A-D]\)/.test(option) ||
                /^\([A-D]\)/.test(option)) {
              throw new Error(`Invalid option ${i+1} for question ${index + 1}: "${option?.substring(0, 20)}..." - Options must be meaningful statements`);
            }
          }
          
          if (typeof q.correctAnswer !== 'number' || 
              q.correctAnswer < 0 || 
              q.correctAnswer > 3) {
            throw new Error(`Invalid correctAnswer for question ${index + 1}: Must be a number between 0-3`);
          }
          
          if (!q.explanation || 
              typeof q.explanation !== 'string' || 
              q.explanation.length < 20) {
            throw new Error(`Invalid explanation for question ${index + 1}: Explanation is missing or too short`);
          }
        });
        
        console.log("Quiz questions validated successfully");
        
        // Return the validated JSON string
        return JSON.stringify(parsedResponse);
      } catch (parseError) {
        console.error("Failed to parse quiz JSON:", parseError, "Raw response:", aiResponse);
        throw new Error("Failed to generate valid quiz questions: " + parseError.message);
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
