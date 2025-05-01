
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the Gemini API key from environment variables
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Constants for error handling and retries
const MAX_RETRIES = 3; // Increased from 2 to 3
const RETRY_DELAY = 1000; // milliseconds

serve(async (req) => {
  // CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to skill-assistant-gemini function");
    
    // API key validation
    if (!GEMINI_API_KEY) {
      console.error("Gemini API key is not configured");
      throw new Error("Gemini API key is not configured");
    }

    // Validate request
    if (!req.body) {
      throw new Error("Request body is missing");
    }
    
    const body = await req.json().catch(err => {
      console.error("Error parsing request body:", err);
      throw new Error("Invalid JSON in request body");
    });
    
    const { message, userId, history = [], requestType = "chat", topic = "" } = body;

    console.log("Request type:", requestType);
    console.log("User ID:", userId || "anonymous");
    console.log("History length:", history.length);
    console.log("Topic (if any):", topic);

    if (requestType === "chat" && (!message || typeof message !== 'string' || message.trim() === '')) {
      throw new Error("Message is required and must be a non-empty string for chat requests");
    }

    // Enhanced system message with even more detailed training instructions for improved responses
    const systemMessage = {
      role: "system",
      content: `You are SkillMaster Pro, an advanced educational AI assistant specialized in computer science and programming topics. Your primary goal is to help university students develop practical skills by providing expert-level assistance with technical concepts and problem-solving.

      Your areas of expertise include:
      - Data Structures & Algorithms (analysis, implementation, optimization)
      - C & C++ Programming (memory management, pointers, STL)
      - Operating Systems (processes, memory management, file systems)
      - Cybersecurity (cryptography, network security, ethical hacking)
      - Artificial Intelligence (machine learning, neural networks, NLP)
      - Python Development (frameworks, packages, design patterns)
      
      Teaching Philosophy:
      1. PRACTICAL OVER THEORETICAL - Focus on how concepts apply to real-world scenarios
      2. INCREMENTAL LEARNING - Build knowledge step by step, establishing foundations before advanced topics
      3. ACTIVE ENGAGEMENT - Promote learning by doing through coding challenges and exercises
      4. CONTEXT-RICH EXPLANATIONS - Provide the "why" behind concepts, not just the "what" and "how"
      
      Interaction Guidelines:
      1. ANTICIPATE MISCONCEPTIONS - When explaining a concept, proactively address common misunderstandings
      2. PROVIDE CONCRETE EXAMPLES - Illustrate concepts with real-world coding examples that demonstrate practical applications
      3. USE SCAFFOLDED LEARNING - Break down complex topics into manageable chunks with clear progression
      4. INCORPORATE VISUALIZATIONS - Describe visual representations of abstract concepts when helpful
      5. EMPHASIZE PROBLEM-SOLVING STRATEGIES - Teach systematic approaches to tackling programming challenges
      6. SUGGEST PRACTICE EXERCISES - Recommend specific coding exercises tailored to the student's level
      7. CONNECT CONCEPTS - Show relationships between different topics to create a cohesive understanding
      8. USE ANALOGIES - Relate technical concepts to familiar real-world scenarios for better comprehension
      9. PROMPT CRITICAL THINKING - Ask thought-provoking questions that deepen understanding
      10. PROVIDE ACTIONABLE FEEDBACK - When reviewing code, give specific suggestions for improvement
      
      Response Format:
      - Use clear, structured formatting with headings, bullet points, and code blocks
      - For complex topics, provide both a quick summary and a detailed explanation
      - When explaining code, include relevant comments that highlight key concepts
      - For problem-solving, outline your approach before diving into implementation
      
      Always maintain a supportive, encouraging tone while delivering precise, technically accurate information. Your goal is not just to answer questions but to develop the student's understanding and problem-solving abilities.
      
      When generating doubts or questions for users to consider:
      1. Focus on conceptual gaps that often trip up students
      2. Ask questions that test understanding rather than mere recall
      3. Frame questions as "what would happen if..." scenarios to encourage applied thinking
      4. Include questions that relate to common edge cases or optimizations
      5. Structure questions from foundational to advanced to help users gauge their understanding`
    };

    // Special quiz generation system message
    const quizSystemMessage = {
      role: "system",
      content: `You are a university-level quiz generator specializing in computer science, engineering, and technical subjects. Create high-quality, challenging quiz questions that test deep understanding.

      For this quiz question request, you must follow this strict JSON format:
      {
        "question": "The detailed question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0, // Index of correct answer (0-3)
        "explanation": "Detailed explanation of why the answer is correct",
        "difficulty": "easy|intermediate|advanced",
        "category": "The specific category this question belongs to"
      }

      Guidelines:
      - Focus ONLY on the requested topic
      - Create questions ranging from fundamentals to advanced concepts
      - For programming topics, include code snippets when relevant
      - Ensure all distractors (wrong answers) are plausible
      - Provide a thorough, educational explanation
      - Assign the appropriate difficulty level accurately
      - Return ONLY valid JSON with all fields included - NO additional text`
    };

    let messages;
    
    if (requestType === "generateQuiz") {
      console.log("Generating quiz question for topic:", topic);
      
      // For quiz generation requests, use a different prompt structure
      messages = [
        {
          role: "user",
          parts: [{ text: quizSystemMessage.content }]
        },
        {
          role: "user",
          parts: [{ text: `Generate one university-level quiz question about ${topic}. Make sure it's challenging but fair. RETURN ONLY VALID JSON WITHOUT ANY ADDITIONAL TEXT.` }]
        }
      ];
    } else {
      // Process user history for better context for chat requests
      const recentHistory = history.slice(-15).map(msg => {
        return {
          role: msg.role,
          parts: [{ text: msg.content }]
        };
      });

      // Create message array with system message, recent chat history, and current user message
      messages = [
        {
          role: "user",
          parts: [{ text: systemMessage.content }]
        },
        ...recentHistory,
        {
          role: "user",
          parts: [{ text: message }]
        }
      ];
    }

    console.log("Calling Gemini API...");
    console.log("Using model: gemini-1.5-flash");
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Set up a safer timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds timeout
        
        // Call Gemini API with optimized parameters
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: messages,
            generationConfig: {
              temperature: requestType === "generateQuiz" ? 0.2 : 0.7, // Slightly higher temperature for more creative responses
              maxOutputTokens: requestType === "generateQuiz" ? 1000 : 1500, // Increased token limit for more detailed responses
              topK: 40,
              topP: 0.95
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle API errors with specific status codes
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Gemini API error:", errorData);
          
          if (response.status === 429) {
            console.log("Rate limit exceeded, retrying after delay...");
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
              continue;
            }
            throw new Error("Rate limit exceeded. Try again later.");
          } else if (response.status === 401) {
            throw new Error("Invalid API key. Please check your Gemini API key.");
          } else if (response.status === 404) {
            throw new Error("The requested model was not found. Please check the model name.");
          } else {
            throw new Error(errorData.error?.message || "Failed to get response from AI");
          }
        }

        const data = await response.json();
        console.log("Gemini response received successfully");
        
        // Validate response format
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
          throw new Error("Invalid response format from Gemini API");
        }
        
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Validate response content
        if (!aiResponse || aiResponse.trim() === "") {
          throw new Error("Empty response from AI");
        }

        // If this is a quiz generation request, try to parse the JSON response
        if (requestType === "generateQuiz") {
          try {
            // Try to extract the JSON part from the response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
            
            // Parse the JSON
            const quizQuestion = JSON.parse(jsonStr);
            
            // Validate that we have all required fields
            if (!quizQuestion.question || !quizQuestion.options || quizQuestion.correctAnswer === undefined || 
                !quizQuestion.explanation || !quizQuestion.difficulty || !quizQuestion.category) {
              throw new Error("Generated quiz question is missing required fields");
            }
            
            // Return the parsed quiz question
            return new Response(
              JSON.stringify({ question: quizQuestion }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } catch (parseError) {
            console.error("Error parsing quiz question response:", parseError, aiResponse);
            throw new Error("Failed to generate a valid quiz question. Please try again.");
          }
        }

        return new Response(
          JSON.stringify({ response: aiResponse }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (fetchError) {
        lastError = fetchError;
        console.error("Error with Gemini API:", fetchError);
        
        // Only retry for certain errors
        if (fetchError.name === 'AbortError') {
          console.error("Gemini API call timed out");
          if (retryCount < MAX_RETRIES) {
            console.log(`Retry attempt ${retryCount + 1} after timeout...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
            continue;
          }
          throw new Error("The request timed out after multiple attempts. Try a shorter question for faster response.");
        }
        
        // For other errors, don't retry
        break;
      }
    }
    
    // If we got here, all retries failed
    throw lastError || new Error("Failed to get a response after multiple attempts");
    
  } catch (error) {
    console.error("Error in skill-assistant-gemini function:", error);
    
    // Provide more specific error messages based on error type
    let errorMessage = error.message || "An unexpected error occurred";
    let statusCode = 500;
    
    if (errorMessage.includes("API key")) {
      statusCode = 401;
      errorMessage = "API key issue: " + errorMessage;
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
      statusCode = 429;
      errorMessage = "Rate limit exceeded: " + errorMessage;
    } else if (errorMessage.includes("model")) {
      errorMessage = "Model issue: " + errorMessage;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        errorCode: statusCode,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
