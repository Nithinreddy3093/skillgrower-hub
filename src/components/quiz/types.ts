
export type QuestionDifficulty = "easy" | "intermediate" | "advanced";

export type QuestionCategory = 
  | "AI Integration Basics" 
  | "APIs & SDKs" 
  | "AI in Frontend/Backend" 
  | "Data Preprocessing" 
  | "Ethics in AI"
  | "Computer Science"
  | "Cybersecurity"
  | "Web Development"
  | "Data Science"
  | "Cloud Computing"
  | "Engineering";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  explanation: string;
}

export interface QuizResult {
  title: string;
  score: number;
  totalQuestions: number;
  date: string;
  timeSpent: number; // in seconds
  categories: Record<QuestionCategory, { correct: number; total: number }>;
}

export interface ResourceSuggestion {
  title: string;
  type: "video" | "course" | "article" | "project" | "challenge";
  description: string;
  url: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: (number | null)[];
  startTime: number;
  endTime: number | null;
  difficulty: QuestionDifficulty;
  correctStreak: number;
  showFeedback: boolean;
  result: QuizResult | null;
}
