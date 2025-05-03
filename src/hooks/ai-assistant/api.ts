
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
    
    // Call the edge function with timeout to ensure fast responses
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 sec timeout
    
    const { data, error } = await supabase.functions.invoke('skill-assistant', {
      body: {
        message,
        userId,
        history: formattedHistory
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (error) {
      console.error("Error from skill-assistant edge function:", error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
    
    if (!data || !data.response) {
      console.error("Invalid response from AI assistant:", data);
      throw new Error("Received invalid response from AI assistant");
    }
    
    console.log("AI assistant response received:", data.response.slice(0, 50) + "...");
    
    // Cache the response for future similar questions
    if (message.length > 5) {
      responseCache.set(cacheKey, data.response);
      // Limit cache size
      if (responseCache.size > 100) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
      }
    }
    
    return data.response;
  } catch (error) {
    console.error("Error in sendMessageToAssistant:", error);
    
    // Show user-friendly error toast
    if (error.name === 'AbortError') {
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
    
    // Call the edge function optimized for quiz generation (faster response)
    const { data, error } = await supabase.functions.invoke('skill-assistant', {
      body: {
        message: `Generate a single quiz question about ${topic}. Make it challenging but fair.`,
        requestType: "generateQuiz",
        topic
      },
    });
    
    if (error) {
      console.error("Error generating quiz question:", error);
      throw new Error(`Failed to generate quiz question: ${error.message}`);
    }
    
    if (!data || !data.question) {
      console.error("Invalid response for quiz question:", data);
      throw new Error("Received invalid quiz question data");
    }
    
    // Providing a default structure in case the response isn't properly formatted
    const defaultQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: data.question?.question || "What is the capital of France?",
      options: data.question?.options || ["Paris", "London", "Berlin", "Madrid"],
      correctAnswer: data.question?.correctAnswer || 0,
      category: data.question?.category || "Computer Science",
      difficulty: data.question?.difficulty || "intermediate",
      explanation: data.question?.explanation || "Paris is the capital of France."
    };
    
    console.log("Quiz question generated:", defaultQuestion.question);
    return defaultQuestion;
  } catch (error) {
    console.error("Error in generateQuizQuestion:", error);
    
    // Show user-friendly error toast
    toast.error("Could not generate quiz question. Using backup question.");
    
    // Return a fallback question
    const fallbackQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question: `What is a key concept in ${topic}?`,
      options: ["Concept A", "Concept B", "Concept C", "Concept D"],
      correctAnswer: 0,
      category: "Computer Science",
      difficulty: "intermediate",
      explanation: "Concept A is fundamental to understanding this topic."
    };
    
    return fallbackQuestion;
  }
};
