
import { ChatMessage } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "@/components/quiz/types";

// Cache to prevent repetitive questions from the server
const responseCache = new Map<string, string>();
const quizCache = new Map<string, QuizQuestion>();

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
 * @param difficulty The difficulty level for the question (easy, intermediate, advanced)
 * @returns A promise resolving to a QuizQuestion object
 */
export const generateQuizQuestion = async (
  topic: string, 
  difficulty: "easy" | "intermediate" | "advanced" = "intermediate"
): Promise<QuizQuestion> => {
  try {
    console.log(`Generating ${difficulty} quiz question for topic:`, topic);
    
    // Check cache first for similar topics
    const cacheKey = `${topic.toLowerCase()}-${difficulty}`;
    if (quizCache.has(cacheKey) && Math.random() > 0.7) {
      console.log("Using cached quiz question");
      return quizCache.get(cacheKey) as QuizQuestion;
    }
    
    // Show a loading toast for longer operations
    const loadingToast = toast.loading(`Generating ${difficulty} question about ${topic}...`);
    
    try {
      // Call the edge function
      const response = await Promise.race([
        supabase.functions.invoke('skill-assistant', {
          body: {
            message: topic,
            requestType: "generateQuiz",
            difficulty: difficulty
          }
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 15000);
        })
      ]);
      
      toast.dismiss(loadingToast);
      
      if (!response || !response.data || !response.data.question) {
        console.error("Invalid response for quiz question:", response);
        throw new Error("Received invalid quiz question data");
      }
      
      console.log("Quiz API response:", response.data);
      
      // Enhanced validation to ensure meaningful options
      const question = response.data.question;
      
      if (!Array.isArray(question.options) || 
          question.options.length !== 4 ||
          question.options.some(opt => 
            !opt || 
            opt.includes("Concept") || 
            opt.includes("Option ") ||
            opt.length < 5
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
        difficulty: question.difficulty || difficulty,
        explanation: question.explanation || "No explanation provided."
      };
      
      // Cache the question for future use
      quizCache.set(cacheKey, validatedQuestion);
      if (quizCache.size > 50) {
        const firstKey = quizCache.keys().next().value;
        quizCache.delete(firstKey);
      }
      
      console.log("Quiz question generated:", validatedQuestion.question);
      toast.success("Question generated successfully!");
      return validatedQuestion;
    } finally {
      toast.dismiss(loadingToast);
    }
  } catch (error) {
    console.error("Error in generateQuizQuestion:", error);
    
    // Show user-friendly error toast
    toast.error("Could not generate quiz question. Using backup question instead.");
    
    // Return a fallback question with meaningful options relevant to the topic
    const topicLower = topic.toLowerCase();
    let fallbackQuestion: QuizQuestion;
    
    if (topicLower.includes("python") || topicLower.includes("programming")) {
      fallbackQuestion = {
        id: crypto.randomUUID(),
        question: "Which of the following is a key feature of Python that contributes to its readability?",
        options: [
          "Mandatory indentation to denote code blocks",
          "Required type declarations for all variables",
          "Semicolons at the end of each statement",
          "Explicit memory management functions"
        ],
        correctAnswer: 0,
        category: "Programming Languages",
        difficulty: difficulty,
        explanation: "Python uses indentation to denote code blocks instead of curly braces or keywords, which contributes significantly to its readability and clean syntax. This enforced indentation makes Python code consistent across different developers."
      };
    } else if (topicLower.includes("data structure") || topicLower.includes("algorithm")) {
      fallbackQuestion = {
        id: crypto.randomUUID(),
        question: "What is the worst-case time complexity of quicksort?",
        options: [
          "O(n²) when the pivot selection repeatedly results in highly unbalanced partitions",
          "O(n log n) regardless of the input array and pivot selection",
          "O(n) when the array is already sorted in ascending order",
          "O(log n) when using a randomized pivot selection strategy"
        ],
        correctAnswer: 0,
        category: "Algorithms",
        difficulty: difficulty,
        explanation: "Although quicksort has an average time complexity of O(n log n), its worst-case time complexity is O(n²) when the pivot selection consistently results in highly unbalanced partitions, such as when the array is already sorted and the first or last element is chosen as pivot."
      };
    } else {
      fallbackQuestion = {
        id: crypto.randomUUID(),
        question: `What is a fundamental concept in ${topic}?`,
        options: [
          "Abstraction: hiding implementation details while exposing functionality",
          "Synchronous execution: guaranteeing sequential processing of all operations",
          "Static typing: requiring explicit type declarations for all variables",
          "Single-threaded execution: processing one instruction at a time"
        ],
        correctAnswer: 0,
        category: "Computer Science",
        difficulty: difficulty,
        explanation: "Abstraction is a fundamental concept in computer science that allows us to hide implementation details while exposing only necessary interfaces, making systems easier to understand and use."
      };
    }
    
    return fallbackQuestion;
  }
};
