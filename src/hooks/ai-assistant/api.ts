
import { ChatMessage } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "@/components/quiz/types";

// Cache to prevent repetitive questions from the server
const responseCache = new Map<string, string>();
const quizCache = new Map<string, QuizQuestion[]>();

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
 * Generate a set of quiz questions using AI
 * @param topic The topic for the quiz questions
 * @param difficulty The difficulty level for the questions (easy, intermediate, advanced)
 * @returns A promise resolving to an array of QuizQuestion objects
 */
export const generateQuizQuestions = async (
  topic: string, 
  difficulty: "easy" | "intermediate" | "advanced" = "intermediate"
): Promise<QuizQuestion[]> => {
  try {
    console.log(`Generating ${difficulty} quiz questions for topic:`, topic);
    
    // Check cache first for similar topics, but with a lower reuse chance
    const cacheKey = `${topic.toLowerCase()}-${difficulty}`;
    if (quizCache.has(cacheKey) && Math.random() > 0.9) { // Only 10% chance to reuse cached questions
      console.log("Using cached quiz questions");
      return quizCache.get(cacheKey) as QuizQuestion[];
    }
    
    // Show a loading toast for longer operations
    const loadingToast = toast.loading(`Generating ${difficulty} questions about ${topic}...`);
    
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
          setTimeout(() => reject(new Error("Request timeout")), 25000); // Longer timeout for multiple questions
        })
      ]);
      
      toast.dismiss(loadingToast);
      
      if (!response || !response.data || !response.data.questions) {
        console.error("Invalid response for quiz questions:", response);
        throw new Error("Received invalid quiz question data");
      }
      
      console.log("Quiz API response received with questions:", response.data.questions.length);
      
      // Process and validate the questions
      const questions = response.data.questions.map((q: any) => ({
        id: crypto.randomUUID(),
        question: q.question,
        options: q.options,
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        category: q.category || "Computer Science",
        difficulty: q.difficulty || difficulty,
        explanation: q.explanation || "No explanation provided."
      }));
      
      // Cache the questions for future use
      quizCache.set(cacheKey, questions);
      if (quizCache.size > 20) { // Limit cache size
        const firstKey = quizCache.keys().next().value;
        quizCache.delete(firstKey);
      }
      
      console.log(`Generated ${questions.length} quiz questions successfully`);
      toast.success(`Generated ${questions.length} questions successfully!`);
      return questions;
    } finally {
      toast.dismiss(loadingToast);
    }
  } catch (error: any) {
    console.error("Error in generateQuizQuestions:", error);
    
    // Show user-friendly error toast
    toast.error("Could not generate quiz questions. Using backup questions instead.");
    
    // Generate fallback questions with meaningful options relevant to the topic
    const topicLower = topic.toLowerCase();
    const fallbackQuestions: QuizQuestion[] = [];
    
    // First fallback question
    if (topicLower.includes("python") || topicLower.includes("programming")) {
      fallbackQuestions.push({
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
        explanation: "Python uses indentation to denote code blocks instead of curly braces or keywords, which contributes significantly to its readability and clean syntax."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "What is the primary purpose of the 'self' parameter in Python class methods?",
        options: [
          "It provides access to the instance calling the method",
          "It makes the method thread-safe by isolating instance variables",
          "It is a required keyword that has no functional purpose",
          "It provides access to parent class methods and attributes"
        ],
        correctAnswer: 0,
        category: "Programming Languages",
        difficulty: difficulty,
        explanation: "In Python, 'self' is the conventional name for the first parameter of a method, which refers to the instance of the class calling the method, allowing access to the instance's attributes and methods."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "Which of the following statements about Python lists is FALSE?",
        options: [
          "Lists maintain insertion order and can be indexed from both ends",
          "Lists can contain elements of different data types",
          "List slicing creates a shallow copy of the original list",
          "Lists are immutable once created and cannot be modified"
        ],
        correctAnswer: 3,
        category: "Programming Languages",
        difficulty: difficulty,
        explanation: "Python lists are mutable, meaning they can be modified after creation. You can add, remove, or change elements in a list. Immutability is a characteristic of tuples, not lists."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "What is the output of the following Python code?\n\n```python\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)```",
        options: [
          "[1, 2, 3, 4]",
          "[1, 2, 3]",
          "Error: 'x' is not defined",
          "[1, 2, 3, [4]]"
        ],
        correctAnswer: 0,
        category: "Programming Languages",
        difficulty: difficulty,
        explanation: "In Python, variables hold references to objects. When y = x is executed, both x and y point to the same list object. Therefore, modifying y also modifies x, resulting in [1, 2, 3, 4]."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "Which Python feature allows you to generate a sequence of values without storing the entire sequence in memory?",
        options: [
          "Generators using yield statements",
          "Dictionary comprehensions",
          "Lambda functions",
          "The map() function"
        ],
        correctAnswer: 0,
        category: "Programming Languages",
        difficulty: difficulty,
        explanation: "Generators in Python create iterators using yield statements. They generate values on-the-fly rather than storing the entire sequence in memory, making them memory-efficient for large sequences."
      });
    } else if (topicLower.includes("data structure") || topicLower.includes("algorithm")) {
      fallbackQuestions.push({
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
        explanation: "Although quicksort has an average time complexity of O(n log n), its worst-case time complexity is O(n²) when the pivot selection consistently results in highly unbalanced partitions."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "Which data structure would be most efficient for implementing a priority queue?",
        options: [
          "Heap (binary, Fibonacci, etc.)",
          "Linked List",
          "Hash Table",
          "Circular Array"
        ],
        correctAnswer: 0,
        category: "Data Structures",
        difficulty: difficulty,
        explanation: "Heaps are the most efficient data structure for implementing priority queues as they provide O(1) access to the maximum/minimum element and O(log n) insertion and deletion operations."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "What distinguishes a stable sorting algorithm from an unstable one?",
        options: [
          "Stable algorithms preserve the relative order of equal elements",
          "Stable algorithms always have O(n log n) worst-case complexity",
          "Stable algorithms require less memory than unstable algorithms",
          "Stable algorithms can only sort numeric values correctly"
        ],
        correctAnswer: 0,
        category: "Algorithms",
        difficulty: difficulty,
        explanation: "A stable sorting algorithm maintains the relative order of records with equal keys, meaning that if two items had the same value and one appeared before the other in the original array, it would still appear before the other in the sorted array."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "In a binary search tree, where is the node with the smallest value located?",
        options: [
          "The leftmost node in the tree",
          "The rightmost node in the tree",
          "The root node",
          "It depends on the balancing state of the tree"
        ],
        correctAnswer: 0,
        category: "Data Structures",
        difficulty: difficulty,
        explanation: "In a binary search tree, smaller values are stored in the left subtree of a node. The node with the smallest value will be found by following left children until reaching a leaf, making it the leftmost node in the tree."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "Which of the following operations has a different time complexity in arrays versus linked lists?",
        options: [
          "Insertion at the beginning",
          "Random access by index",
          "Finding the length",
          "All of the above"
        ],
        correctAnswer: 3,
        category: "Data Structures",
        difficulty: difficulty,
        explanation: "All these operations have different time complexities between arrays and linked lists. Arrays have O(n) insertion at the beginning, O(1) random access, and O(1) length finding. Linked lists have O(1) insertion at the beginning, O(n) random access, and O(n) length finding unless a counter is maintained."
      });
    } else {
      fallbackQuestions.push({
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
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "Which software development methodology emphasizes adaptive planning and evolutionary development?",
        options: [
          "Agile methodology with iterative development cycles",
          "Waterfall methodology with sequential phases",
          "Big Bang methodology with minimal planning",
          "V-Model methodology with testing parallelism"
        ],
        correctAnswer: 0,
        category: "Computer Science",
        difficulty: difficulty,
        explanation: "Agile methodology emphasizes adaptive planning, evolutionary development, early delivery, and continual improvement, encouraging rapid and flexible response to change."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "What is the primary purpose of version control systems like Git?",
        options: [
          "To track changes to files and coordinate work among multiple people",
          "To automatically optimize code for better performance",
          "To enforce coding standards and prevent code smells",
          "To simulate different runtime environments for testing"
        ],
        correctAnswer: 0,
        category: "Computer Science",
        difficulty: difficulty,
        explanation: "Version control systems like Git primarily track changes to files over time, allowing developers to revert to previous versions, compare changes, and coordinate work among multiple people on the same project."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "In web development, what is the main purpose of HTTPS?",
        options: [
          "To encrypt data transmitted between client and server",
          "To compress web content for faster loading",
          "To cache static content on the client side",
          "To validate HTML code against W3C standards"
        ],
        correctAnswer: 0,
        category: "Computer Science",
        difficulty: difficulty,
        explanation: "HTTPS (Hypertext Transfer Protocol Secure) encrypts the data transmitted between a client (browser) and server using TLS/SSL, protecting sensitive information from eavesdropping and tampering."
      });
      
      fallbackQuestions.push({
        id: crypto.randomUUID(),
        question: "What is the difference between compilation and interpretation in programming languages?",
        options: [
          "Compilation translates code to machine code before execution; interpretation executes code line-by-line",
          "Compilation is used only for statically typed languages; interpretation for dynamically typed ones",
          "Compilation requires more memory; interpretation requires more CPU",
          "Compilation works on object-oriented languages; interpretation on procedural languages"
        ],
        correctAnswer: 0,
        category: "Computer Science",
        difficulty: difficulty,
        explanation: "Compilation translates the entire source code into machine code before execution, while interpretation executes the source code line by line without prior translation to machine code."
      });
    }
    
    return fallbackQuestions;
  }
};
