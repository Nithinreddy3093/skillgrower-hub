
import { Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "./types";
import { QuestionCard } from "./QuizQuestion";
import { QuizProgress } from "./QuizProgress";

interface QuizInProgressProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  selectedAnswer: number | null;
  showFeedback: boolean;
  isLoading: boolean;
  onSelectOption: (optionIndex: number) => void;
  onNextQuestion: () => void;
}

export function QuizInProgress({
  questions,
  currentQuestionIndex,
  answers,
  selectedAnswer,
  showFeedback,
  isLoading,
  onSelectOption,
  onNextQuestion
}: QuizInProgressProps) {
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="max-w-7xl mx-auto pt-24 px-4">
      <QuizProgress 
        questions={questions} 
        currentQuestionIndex={currentQuestionIndex} 
        answers={answers} 
      />

      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <QuestionCard
          question={currentQuestion}
          selectedOption={selectedAnswer}
          onSelectOption={onSelectOption}
          onNextQuestion={onNextQuestion}
          showFeedback={showFeedback}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      )}
      
      <div className="w-full max-w-3xl mx-auto mt-4 text-right">
        {showFeedback && (
          <Button 
            onClick={onNextQuestion}
            className="group"
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
