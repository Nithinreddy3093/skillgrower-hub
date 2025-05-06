
import { Trophy, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion } from "./types";

interface QuizProgressProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: (number | null)[];
}

export function QuizProgress({ questions, currentQuestionIndex, answers }: QuizProgressProps) {
  const correctAnswersCount = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-4">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>Score: {correctAnswersCount} / {currentQuestionIndex}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Questions: {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
      </div>
      <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
    </div>
  );
}
