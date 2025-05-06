
import { QuizQuestion, QuizResult, QuestionDifficulty, ResourceSuggestion } from "./types";
import { getQuestionsByDifficulty } from "./questions";
import { resourcesByTopic } from "./QuizTopics";
import { toast } from "sonner";

export const useBackupQuestionsForQuiz = (difficulty: QuestionDifficulty, count: number = 5): QuizQuestion[] => {
  // Get backup questions from our local database based on selected difficulty
  const backupQuestions = getQuestionsByDifficulty(difficulty).slice(0, count);
  
  if (backupQuestions.length === 0) {
    toast.error("No backup questions available for this difficulty level");
    return [];
  }
  
  toast.info("Using our backup question library for this quiz", {
    duration: 5000,
  });
  
  return backupQuestions;
};

export const calculateQuizResult = (
  questions: QuizQuestion[], 
  answers: (number | null)[], 
  startTime: number, 
  quizTitle: string
): QuizResult => {
  const endTime = Date.now();
  const timeSpent = Math.floor((endTime - startTime) / 1000);
  
  let correct = 0;
  const categories: Record<string, { correct: number; total: number }> = {};
  
  questions.forEach((q, index) => {
    const isCorrect = answers[index] === q.correctAnswer;
    if (isCorrect) correct++;
    
    if (!categories[q.category]) {
      categories[q.category] = { correct: 0, total: 0 };
    }
    categories[q.category].total++;
    if (isCorrect) categories[q.category].correct++;
  });
  
  return {
    title: quizTitle,
    score: correct,
    totalQuestions: questions.length,
    date: new Date().toISOString(),
    timeSpent,
    categories: categories as Record<any, { correct: number; total: number }>
  };
};

export const getResourceSuggestionsByTopic = (topicId: string): ResourceSuggestion[] => {
  return resourcesByTopic[topicId] || resourcesByTopic.dsa;
};
