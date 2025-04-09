
import { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, QuizState, QuizResult, QuestionCategory, QuestionDifficulty } from '../components/quiz/types';
import { quizQuestions, getResourceSuggestions } from '../components/quiz/questions';
import { QuestionCard } from '../components/quiz/QuizQuestion';
import { QuizResults } from '../components/quiz/QuizResults';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuitIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";

export default function Quiz() {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    startTime: 0,
    endTime: null,
    difficulty: "easy",
    correctStreak: 0,
    showFeedback: false,
    result: null
  });
  
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [started, setStarted] = useState(false);

  // Initialize questions when component mounts
  useEffect(() => {
    // Select initial set of questions
    const initialQuestions = shuffleArray(
      quizQuestions.filter(q => q.difficulty === "easy")
    ).slice(0, 5);
    
    setQuestions(initialQuestions);
  }, []);
  
  // Function to adapt difficulty based on performance
  const adaptDifficulty = useCallback(() => {
    const { correctStreak, difficulty } = quizState;
    
    if (correctStreak >= 3 && difficulty === "easy") {
      return "intermediate";
    } else if (correctStreak >= 3 && difficulty === "intermediate") {
      return "advanced";
    } else if (correctStreak <= -2 && difficulty === "advanced") {
      return "intermediate";
    } else if (correctStreak <= -2 && difficulty === "intermediate") {
      return "easy";
    }
    return difficulty;
  }, [quizState.correctStreak, quizState.difficulty]);
  
  // Function to handle answer selection
  const handleSelectOption = (optionIndex: number) => {
    if (quizState.showFeedback) return;
    
    const currentQuestion = questions[quizState.currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    // Update answers
    const newAnswers = [...quizState.answers];
    newAnswers[quizState.currentQuestionIndex] = optionIndex;
    
    // Update streak
    const newStreak = isCorrect 
      ? quizState.correctStreak + 1 
      : quizState.correctStreak - 1;
      
    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      correctStreak: newStreak,
      showFeedback: true
    }));
  };
  
  // Function to move to the next question or finish quiz
  const handleNextQuestion = () => {
    const currentIndex = quizState.currentQuestionIndex;
    
    // If we're at the last question, finish quiz
    if (currentIndex === questions.length - 1) {
      finishQuiz();
      return;
    }
    
    // Adapt difficulty if needed
    const newDifficulty = adaptDifficulty();
    
    // If difficulty has changed, add appropriate questions
    if (newDifficulty !== quizState.difficulty) {
      // Get questions of the new difficulty that aren't already in the quiz
      const existingIds = new Set(questions.map(q => q.id));
      const difficultyQuestions = quizQuestions
        .filter(q => q.difficulty === newDifficulty && !existingIds.has(q.id));
      
      // If we have new questions of this difficulty, add some
      if (difficultyQuestions.length > 0) {
        const newQuestions = shuffleArray(difficultyQuestions).slice(0, 2);
        setQuestions([...questions, ...newQuestions]);
      }
    }
    
    // Move to next question
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      difficulty: newDifficulty,
      showFeedback: false
    }));
  };
  
  // Function to start the quiz
  const startQuiz = () => {
    setStarted(true);
    setLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setQuizState({
        ...quizState,
        startTime: Date.now(),
        answers: Array(questions.length).fill(null)
      });
      setLoading(false);
    }, 1000);
  };
  
  // Function to finish quiz and calculate results
  const finishQuiz = () => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - quizState.startTime) / 1000);
    const score = quizState.answers.reduce((count, answer, index) => {
      return answer === questions[index].correctAnswer ? count + 1 : count;
    }, 0);
    
    // Calculate category stats
    const categories = questions.reduce((acc, question, index) => {
      const category = question.category;
      const isCorrect = quizState.answers[index] === question.correctAnswer;
      
      if (!acc[category]) {
        acc[category] = { correct: 0, total: 0 };
      }
      
      acc[category].total += 1;
      if (isCorrect) {
        acc[category].correct += 1;
      }
      
      return acc;
    }, {} as Record<QuestionCategory, { correct: number, total: number }>);
    
    // Create result object
    const result: QuizResult = {
      title: "AI Integration Concepts Quiz",
      score,
      totalQuestions: questions.length,
      date: new Date().toISOString(),
      timeSpent,
      categories
    };
    
    // Update state with results
    setQuizState(prev => ({
      ...prev,
      endTime,
      result
    }));
    
    // Simulate saving to backend (would be an API call in a real app)
    simulateSaveToBackend(result);
  };
  
  // Function to simulate saving results to backend
  const simulateSaveToBackend = (result: QuizResult) => {
    // In a real app, this would be an API call
    setTimeout(() => {
      console.log("Quiz results saved:", result);
      toast.success("Quiz results saved to your profile!");
    }, 1000);
  };
  
  // Function to restart the quiz
  const restartQuiz = () => {
    // Reset state and shuffle questions
    const initialQuestions = shuffleArray(
      quizQuestions.filter(q => q.difficulty === "easy")
    ).slice(0, 5);
    
    setQuestions(initialQuestions);
    setQuizState({
      currentQuestionIndex: 0,
      answers: Array(initialQuestions.length).fill(null),
      startTime: Date.now(),
      endTime: null,
      difficulty: "easy",
      correctStreak: 0,
      showFeedback: false,
      result: null
    });
  };
  
  // Helper function to shuffle array
  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  // Render different states of the quiz
  if (!started) {
    return <QuizIntro onStart={startQuiz} />;
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoaderIcon className="animate-spin h-10 w-10 text-primary mb-4" />
        <p className="text-xl">Loading quiz questions...</p>
      </div>
    );
  }
  
  if (quizState.result) {
    return (
      <QuizResults 
        result={quizState.result} 
        resources={getResourceSuggestions(quizState.result.score, quizState.result.totalQuestions)}
        onRestart={restartQuiz}
      />
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-center mb-8">
        <QuestionCard 
          question={questions[quizState.currentQuestionIndex]}
          selectedOption={quizState.answers[quizState.currentQuestionIndex]}
          onSelectOption={handleSelectOption}
          onNextQuestion={handleNextQuestion}
          showFeedback={quizState.showFeedback}
          questionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      </div>
    </div>
  );
}

function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="shadow-lg animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center">
            <BrainCircuitIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">AI Integration Concepts Quiz</CardTitle>
          <p className="text-muted-foreground mt-2">
            Test your knowledge of AI integration concepts, APIs, and best practices
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Quiz Features</h3>
            <ul className="space-y-2 text-sm text-left max-w-md mx-auto">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>Adaptive difficulty based on your performance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>Detailed explanations for each question</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>Performance analytics by category</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>Personalized resource recommendations</span>
              </li>
            </ul>
          </div>
          
          <div className="px-4">
            <p className="text-sm text-muted-foreground">
              Start with basic questions and work your way up to advanced topics as you demonstrate mastery.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button onClick={onStart} size="lg">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
