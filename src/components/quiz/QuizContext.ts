
import { QuizQuestion, QuizResult, QuestionDifficulty } from "./types";

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

export const initialQuizState: QuizState = {
  currentQuestionIndex: 0,
  answers: [],
  startTime: Date.now(),
  endTime: null,
  difficulty: "intermediate",
  correctStreak: 0,
  showFeedback: false,
  result: null
};

export const createEmptyQuizState = (difficulty: QuestionDifficulty = "intermediate", questionCount: number = 0): QuizState => ({
  currentQuestionIndex: 0,
  answers: new Array(questionCount).fill(null),
  startTime: Date.now(),
  endTime: null,
  difficulty,
  correctStreak: 0,
  showFeedback: false,
  result: null
});
