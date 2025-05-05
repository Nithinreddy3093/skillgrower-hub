
import { ChatMessage } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "@/components/quiz/types";

// Cache to prevent repetitive questions from the server
const responseCache = new Map<string, string>();

/**
 * Send a message to the AI assistant and get a response
 * @param message User message
 * @param userId User identifier
 * @param history Previous conversation history
 * @returns Promise with AI response text
 */
export const sendMessageToAssistant = async (
  message: string,
  userId: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    console.log("Sending message to assistant:", message);
    
    // Check cache for similar questions to prevent repetition
    const cacheKey = `${message.toLowerCase().trim()}-${history.length}`;
    if (responseCache.has(cacheKey)) {
      console.log("Using cached response");
      return responseCache.get(cacheKey) as string;
    }
    
    // Convert history to format expected by API
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Set up a timeout promise for handling timeouts
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error("Request timeout: The assistant is taking too long to respond"));
      }, 12000); // 12 second timeout
    });
    
    try {
      // Call the edge function - using Promise.race to handle timeouts
      const response = await Promise.race([
        supabase.functions.invoke('skill-assistant', {
          body: {
            message,
            userId,
            history: formattedHistory
          }
        }),
        timeoutPromise
      ]);
      
      // Clear timeout if we got here
      if (timeoutId) clearTimeout(timeoutId);
      
      if (!response || !response.data || !response.data.response) {
        console.error("Invalid response from AI assistant:", response);
        throw new Error("Received invalid response from AI assistant");
      }
      
      console.log("AI assistant response received:", response.data.response.slice(0, 50) + "...");
      
      // Cache the response for future similar questions
      if (message.length > 5) {
        responseCache.set(cacheKey, response.data.response);
        // Limit cache size
        if (responseCache.size > 100) {
          const firstKey = responseCache.keys().next().value;
          responseCache.delete(firstKey);
        }
      }
      
      return response.data.response;
    } finally {
      // Always clear the timeout
      if (timeoutId) clearTimeout(timeoutId);
    }
  } catch (error: any) {
    console.error("Error in sendMessageToAssistant:", error);
    
    // Show user-friendly error toast
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      toast.error("Response is taking too long. Please try again with a simpler question.");
    } else {
      toast.error("Could not connect to AI assistant. Please try again.");
    }
    
    // Re-throw for further handling
    throw error;
  }
};

/**
 * Generate a quiz question using AI
 * @param topic The topic for the quiz question
 * @returns A promise resolving to a QuizQuestion object
 */
export const generateQuizQuestion = async (topic: string): Promise<QuizQuestion> => {
  try {
    console.log("Generating quiz question for topic:", topic);
    
    // Create a specific prompt that forces proper question generation
    const detailedPrompt = `Generate a detailed university-level quiz question about ${topic}. 
    The question must have 4 distinct and specific answer options (not just placeholders like 'Concept A'). 
    Each option should be a complete, meaningful phrase. 
    Include the correct answer index (0-3) and a detailed explanation.`;
    
    // Call the edge function optimized for quiz generation (faster response)
    const response = await supabase.functions.invoke('skill-assistant', {
      body: {
        message: detailedPrompt,
        requestType: "generateQuiz",
        topic
      }
    });
    
    if (!response || !response.data || !response.data.question) {
      console.error("Invalid response for quiz question:", response);
      throw new Error("Received invalid quiz question data");
    }
    
    console.log("Quiz API response:", response.data);
    
    // Make sure the question has all required fields
    const question = response.data.question;
    
    // Additional validation to ensure meaningful options
    if (!Array.isArray(question.options) || 
        question.options.length !== 4 ||
        question.options.some(opt => 
          !opt || 
          opt.includes("Concept") || 
          opt.length < 3
        )) {
      console.error("Generated question has invalid options:", question.options);
      throw new Error("Generated question has placeholder or invalid options");
    }
    
    const validatedQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: question.question,
      options: question.options,
      correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
      category: question.category || "Computer Science",
      difficulty: question.difficulty || "intermediate",
      explanation: question.explanation || "No explanation provided."
    };
    
    console.log("Quiz question generated:", validatedQuestion.question);
    return validatedQuestion;
  } catch (error) {
    console.error("Error in generateQuizQuestion:", error);
    
    // Show user-friendly error toast
    toast.error("Could not generate quiz question. Using backup question.");
    
    // Return a fallback question with more meaningful options
    const fallbackQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: `What is a fundamental concept in ${topic}?`,
      options: [
        "Data abstraction and encapsulation", 
        "Runtime polymorphism in object-oriented programming",
        "Memory management through reference counting", 
        "Declarative programming paradigms across languages"
      ],
      correctAnswer: 0,
      category: "Computer Science",
      difficulty: "intermediate",
      explanation: "Data abstraction and encapsulation are fundamental concepts in computer science that allow us to hide implementation details while exposing only necessary interfaces."
    };
    
    return fallbackQuestion;
  }
};
