
import { useState, useEffect } from "react";
import { ChatMessage } from "./types";
import { getWelcomeMessage } from "./utils";

export interface AIAssistantMessageState {
  prompt: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  retryCount: number;
  selectedTopic?: string;
  userProficiencyLevel?: "beginner" | "intermediate" | "advanced";
  correctAnswersStreak: number;
}

export const useAIAssistantState = () => {
  const [messageState, setMessageState] = useState<AIAssistantMessageState>({
    prompt: "",
    messages: [],
    isLoading: false,
    isStreaming: false,
    retryCount: 0,
    selectedTopic: undefined,
    userProficiencyLevel: undefined,
    correctAnswersStreak: 0
  });
  
  // Auto-detect user proficiency based on language and question complexity
  useEffect(() => {
    const analyzeUserProficiency = () => {
      const userMessages = messageState.messages.filter(msg => msg.role === "user");
      
      // Need at least 3 messages to analyze
      if (userMessages.length < 3) return;
      
      // Count technical terms, code snippets, and advanced concepts
      let technicalTermCount = 0;
      let codeSnippetCount = 0;
      let complexQuestionCount = 0;
      
      const technicalTerms = [
        "algorithm", "recursion", "runtime complexity", "big o", "memory allocation",
        "inheritance", "polymorphism", "data structure", "database normalization",
        "concurrency", "asynchronous", "middleware", "framework", "design pattern"
      ];
      
      userMessages.forEach(msg => {
        const content = msg.content.toLowerCase();
        
        // Check for technical terms
        technicalTerms.forEach(term => {
          if (content.includes(term)) technicalTermCount++;
        });
        
        // Check for code snippets
        if (content.includes("```") || content.includes("function") || content.includes("class ") || 
            content.includes("def ") || content.includes("import ")) {
          codeSnippetCount++;
        }
        
        // Check for complex questions
        if (content.includes("why") && content.includes("how") || 
            content.includes("explain") || content.includes("difference between") ||
            content.length > 100) {
          complexQuestionCount++;
        }
      });
      
      // Determine proficiency level
      const totalScore = technicalTermCount + (codeSnippetCount * 2) + complexQuestionCount;
      const messageCount = userMessages.length;
      const scorePerMessage = totalScore / messageCount;
      
      let proficiencyLevel: "beginner" | "intermediate" | "advanced";
      
      if (scorePerMessage < 1) {
        proficiencyLevel = "beginner";
      } else if (scorePerMessage < 2) {
        proficiencyLevel = "intermediate";
      } else {
        proficiencyLevel = "advanced";
      }
      
      // Only update if different from current level
      if (proficiencyLevel !== messageState.userProficiencyLevel) {
        setMessageState(prev => ({
          ...prev,
          userProficiencyLevel: proficiencyLevel
        }));
      }
    };
    
    analyzeUserProficiency();
  }, [messageState.messages]);
  
  const setPrompt = (value: string) => {
    setMessageState(prev => ({
      ...prev,
      prompt: value
    }));
  };
  
  const setMessages = (messages: AIAssistantMessageState["messages"]) => {
    setMessageState(prev => ({
      ...prev,
      messages
    }));
  };

  const setIsLoading = (isLoading: boolean) => {
    setMessageState(prev => ({
      ...prev,
      isLoading
    }));
  };

  const setIsStreaming = (isStreaming: boolean) => {
    setMessageState(prev => ({
      ...prev,
      isStreaming
    }));
  };

  const setRetryCount = (retryCount: number) => {
    setMessageState(prev => ({
      ...prev,
      retryCount
    }));
  };
  
  const setSelectedTopic = (selectedTopic?: string) => {
    setMessageState(prev => ({
      ...prev,
      selectedTopic
    }));
  };
  
  const incrementCorrectAnswersStreak = () => {
    setMessageState(prev => ({
      ...prev,
      correctAnswersStreak: prev.correctAnswersStreak + 1
    }));
  };
  
  const resetCorrectAnswersStreak = () => {
    setMessageState(prev => ({
      ...prev,
      correctAnswersStreak: 0
    }));
  };
  
  const clearConversation = () => {
    setMessageState(prev => ({
      ...prev,
      prompt: "",
      messages: [],
      retryCount: 0
    }));
  };

  return {
    messageState,
    setPrompt,
    setMessages,
    setIsLoading,
    setIsStreaming,
    setRetryCount,
    setSelectedTopic,
    incrementCorrectAnswersStreak,
    resetCorrectAnswersStreak,
    clearConversation
  };
};
