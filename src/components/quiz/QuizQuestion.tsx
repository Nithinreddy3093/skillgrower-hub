
import { useState } from 'react';
import { QuizQuestion } from './types';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionProps {
  question: QuizQuestion;
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
  onNextQuestion: () => void;
  showFeedback: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  selectedOption,
  onSelectOption,
  onNextQuestion,
  showFeedback,
  questionNumber,
  totalQuestions
}: QuestionProps) {
  const isAnswered = selectedOption !== null;
  const isCorrect = isAnswered && selectedOption === question.correctAnswer;
  
  return (
    <Card className="w-full max-w-3xl animate-fade-in">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant={getDifficultyVariant(question.difficulty)} className="mb-2">
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        <CardTitle className="text-xl md:text-2xl">{question.question}</CardTitle>
        <Badge variant="outline">{question.category}</Badge>
      </CardHeader>
      
      <CardContent>
        <RadioGroup 
          value={selectedOption?.toString()} 
          onValueChange={(value) => !showFeedback && onSelectOption(parseInt(value))}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center space-x-2 rounded-lg border p-3 transition-colors",
                showFeedback && index === question.correctAnswer && "border-green-500 bg-green-50 dark:bg-green-900/20",
                showFeedback && selectedOption === index && index !== question.correctAnswer && "border-red-500 bg-red-50 dark:bg-red-900/20",
                !showFeedback && "hover:bg-muted/50 cursor-pointer"
              )}
              onClick={() => !showFeedback && onSelectOption(index)}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showFeedback} />
              <Label 
                htmlFor={`option-${index}`} 
                className={cn(
                  "flex-grow cursor-pointer text-base",
                  showFeedback && index === question.correctAnswer && "font-medium text-green-700 dark:text-green-400",
                  showFeedback && selectedOption === index && index !== question.correctAnswer && "font-medium text-red-700 dark:text-red-400"
                )}
              >
                {option}
              </Label>
              {showFeedback && index === question.correctAnswer && (
                <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
              {showFeedback && selectedOption === index && index !== question.correctAnswer && (
                <XIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
          ))}
        </RadioGroup>
        
        {showFeedback && (
          <div className={cn(
            "mt-4 p-3 rounded-lg",
            isCorrect ? "bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-900/20" 
                     : "bg-amber-50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/20"
          )}>
            <p className="text-sm font-medium mb-1">
              {isCorrect ? "Correct!" : "Not quite right"}
            </p>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <div className="flex justify-end w-full">
          {!showFeedback ? (
            <Button 
              onClick={() => onSelectOption(selectedOption || 0)} 
              disabled={selectedOption === null}
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={onNextQuestion}>
              Next Question
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function getDifficultyVariant(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return "secondary";
    case "intermediate":
      return "default";
    case "advanced":
      return "destructive";
    default:
      return "outline";
  }
}
