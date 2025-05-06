
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { QuizQuestion, QuizState, QuestionDifficulty } from "@/components/quiz/types";
import { generateQuizQuestions } from "@/hooks/ai-assistant/api";
import { toast } from "sonner";
import { QuizResults } from "@/components/quiz/QuizResults";
import { QuizStart } from "@/components/quiz/QuizStart";
import { QuizInProgress } from "@/components/quiz/QuizInProgress";
import { topicOptions } from "@/components/quiz/QuizTopics";
import { 
  useBackupQuestionsForQuiz, 
  calculateQuizResult, 
  getResourceSuggestionsByTopic 
} from "@/components/quiz/QuizUtils";
import { createEmptyQuizState } from "@/components/quiz/QuizContext";

export default function Quiz() {
  // State for questions and quiz management
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [state, setState] = useState<QuizState>(createEmptyQuizState());
  const [selectedTopic, setSelectedTopic] = useState("dsa");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [useBackupQuestions, setUseBackupQuestions] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Current quiz state
  const currentQuestion = questions[state.currentQuestionIndex];
  const selectedAnswer = state.answers[state.currentQuestionIndex];

  const startQuiz = async () => {
    if (!selectedTopic) {
      toast.error("Please select a topic first");
      return;
    }

    setIsGeneratingQuestions(true);
    setGenerationProgress(0);
    setGenerationError(null);
    
    try {
      // If we've already tried online generation and failed, use backup questions immediately
      if (useBackupQuestions) {
        useBackupQuestionsAndStart();
        return;
      }

      // Show a longer toast for the user to understand what's happening
      toast.info("Generating personalized questions. This may take a moment...", {
        duration: 5000,
      });
      
      // Set initial progress to show activity
      setGenerationProgress(10);
      
      try {
        // Generate all questions at once with our new endpoint
        const topicName = topicOptions.find(t => t.id === selectedTopic)?.name || selectedTopic;
        const generatedQuestions = await generateQuizQuestions(topicName, state.difficulty);
        
        // Update progress to completion
        setGenerationProgress(100);
        
        if (generatedQuestions.length >= 3) {
          finishQuizGeneration(generatedQuestions);
          toast.success(`Generated ${generatedQuestions.length} questions successfully!`);
        } else {
          throw new Error("Not enough questions were generated. Using backup questions.");
        }
      } catch (error: any) {
        console.error("Failed to generate quiz questions:", error);
        
        // If this is our first attempt, try once more
        if (retryAttempt === 0) {
          setRetryAttempt(1);
          toast.info("First attempt failed. Trying one more time...");
          setTimeout(() => startQuiz(), 1000);
          return;
        }
        
        setGenerationError(error.message || "Failed to generate questions");
        useBackupQuestionsAndStart();
      }
    } finally {
      setIsGeneratingQuestions(false);
      setGenerationProgress(0);
      setRetryAttempt(0);
    }
  };
  
  // Function to use backup questions when AI generation fails
  const useBackupQuestionsAndStart = () => {
    const backupQuestions = useBackupQuestionsForQuiz(state.difficulty);
    if (backupQuestions.length > 0) {
      finishQuizGeneration(backupQuestions);
      setUseBackupQuestions(true);
    }
  };
  
  // Common function to finalize quiz setup with questions
  const finishQuizGeneration = (questions: QuizQuestion[]) => {
    setState({
      currentQuestionIndex: 0,
      answers: new Array(questions.length).fill(null),
      startTime: Date.now(),
      endTime: null,
      difficulty: state.difficulty,
      correctStreak: 0,
      showFeedback: false,
      result: null
    });
    setQuestions(questions);
    setQuizStarted(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (state.showFeedback) return;
    
    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestionIndex] = optionIndex;
    
    setState({
      ...state,
      answers: newAnswers,
      showFeedback: true,
      // Update streak counter
      correctStreak: optionIndex === currentQuestion.correctAnswer 
        ? state.correctStreak + 1 
        : 0
    });
  };

  const handleNextQuestion = () => {
    const isLastQuestion = state.currentQuestionIndex === questions.length - 1;
    
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setState({
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        showFeedback: false
      });
    }
  };

  const finishQuiz = () => {
    const topicName = topicOptions.find(t => t.id === selectedTopic)?.name || selectedTopic;
    const result = calculateQuizResult(
      questions, 
      state.answers, 
      state.startTime, 
      `${topicName} Quiz`
    );
    
    setState({
      ...state,
      endTime: Date.now(),
      result
    });
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setState(createEmptyQuizState());
    // Reset useBackupQuestions to allow trying AI generation again
    setUseBackupQuestions(false);
  };

  const changeDifficulty = (difficulty: QuestionDifficulty) => {
    setState({
      ...state,
      difficulty
    });
  };

  const handleRetry = () => {
    setUseBackupQuestions(false);
    setGenerationError(null);
    startQuiz();
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <Navigation />
        <QuizStart
          topicOptions={topicOptions}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          difficulty={state.difficulty}
          changeDifficulty={changeDifficulty}
          startQuiz={startQuiz}
          isGeneratingQuestions={isGeneratingQuestions}
          generationProgress={generationProgress}
          generationError={generationError}
          setGenerationError={setGenerationError}
          useBackupQuestions={useBackupQuestions}
          handleRetry={handleRetry}
        />
      </div>
    );
  }

  if (state.result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <Navigation />
        <div className="max-w-7xl mx-auto pt-24 px-4">
          <QuizResults 
            result={state.result} 
            onRestart={restartQuiz} 
            resources={getResourceSuggestionsByTopic(selectedTopic)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navigation />
      <QuizInProgress
        questions={questions}
        currentQuestionIndex={state.currentQuestionIndex}
        answers={state.answers}
        selectedAnswer={selectedAnswer}
        showFeedback={state.showFeedback}
        isLoading={isLoading}
        onSelectOption={handleSelectOption}
        onNextQuestion={handleNextQuestion}
      />
    </div>
  );
}
