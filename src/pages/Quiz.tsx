
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { QuestionCard } from "@/components/quiz/QuizQuestion";
import { QuizResults } from "@/components/quiz/QuizResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuizQuestion, QuizState, QuestionDifficulty } from "@/components/quiz/types";
import { Loader2, BrainCircuit } from "lucide-react";
import { generateQuizQuestion } from "@/hooks/ai-assistant/api";
import { toast } from "sonner";

const topicOptions = [
  { id: "dsa", name: "Data Structures & Algorithms" },
  { id: "c", name: "C Programming" },
  { id: "cpp", name: "C++ Programming" },
  { id: "os", name: "Operating Systems" },
  { id: "cyber", name: "Cybersecurity" },
  { id: "ai", name: "Artificial Intelligence" },
  { id: "python", name: "Python" }
];

export default function Quiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    startTime: Date.now(),
    endTime: null,
    difficulty: "intermediate",
    correctStreak: 0,
    showFeedback: false,
    result: null
  });
  const [selectedTopic, setSelectedTopic] = useState("dsa");
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const currentQuestion = questions[state.currentQuestionIndex];
  const selectedAnswer = state.answers[state.currentQuestionIndex];

  // Function to load a question using the AI
  const loadQuestion = async (topic: string) => {
    try {
      const question = await generateQuizQuestion(topic);
      return question;
    } catch (error) {
      console.error("Error loading question:", error);
      throw error;
    }
  };

  // Function to start the quiz by generating questions
  const startQuiz = async () => {
    if (!selectedTopic) {
      toast.error("Please select a topic first");
      return;
    }

    setIsGeneratingQuestions(true);
    const numQuestions = 5; // Start with 5 questions per quiz
    const newQuestions: QuizQuestion[] = [];
    
    try {
      // Generate questions in sequence
      for (let i = 0; i < numQuestions; i++) {
        const question = await loadQuestion(topicOptions.find(t => t.id === selectedTopic)?.name || selectedTopic);
        newQuestions.push({
          ...question,
          id: crypto.randomUUID()
        });
        toast.success(`Generated question ${i+1} of ${numQuestions}`);
      }
      
      setQuestions(newQuestions);
      setState({
        currentQuestionIndex: 0,
        answers: new Array(newQuestions.length).fill(null),
        startTime: Date.now(),
        endTime: null,
        difficulty: state.difficulty,
        correctStreak: 0,
        showFeedback: false,
        result: null
      });
      setQuizStarted(true);
    } catch (error) {
      toast.error("Failed to generate quiz questions. Please try again.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (state.showFeedback) return; // Don't allow changing answer after seeing feedback
    
    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestionIndex] = optionIndex;
    
    setState({
      ...state,
      answers: newAnswers,
      showFeedback: optionIndex !== null
    });
    
    // Update streak count
    if (optionIndex === currentQuestion.correctAnswer) {
      setState(prev => ({
        ...prev,
        correctStreak: prev.correctStreak + 1
      }));
    } else {
      setState(prev => ({
        ...prev,
        correctStreak: 0
      }));
    }
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
    // Calculate score and other statistics
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - state.startTime) / 1000); // in seconds
    
    let correct = 0;
    const categories: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach((q, index) => {
      const isCorrect = state.answers[index] === q.correctAnswer;
      if (isCorrect) correct++;
      
      // Track category stats
      if (!categories[q.category]) {
        categories[q.category] = { correct: 0, total: 0 };
      }
      categories[q.category].total++;
      if (isCorrect) categories[q.category].correct++;
    });
    
    const result = {
      title: `${topicOptions.find(t => t.id === selectedTopic)?.name || selectedTopic} Quiz`,
      score: correct,
      totalQuestions: questions.length,
      date: new Date().toISOString(),
      timeSpent,
      categories: categories as Record<any, { correct: number; total: number }>
    };
    
    setState({
      ...state,
      endTime,
      result
    });
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setState({
      currentQuestionIndex: 0,
      answers: [],
      startTime: Date.now(),
      endTime: null,
      difficulty: "intermediate",
      correctStreak: 0,
      showFeedback: false,
      result: null
    });
  };

  const changeDifficulty = (difficulty: QuestionDifficulty) => {
    setState({
      ...state,
      difficulty
    });
  };

  // Show the quiz setup screen if not started
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <Navigation />
        <div className="max-w-7xl mx-auto pt-24 px-4">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <BrainCircuit className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
              </div>
              <CardTitle className="text-2xl md:text-3xl">AI-Generated Quiz</CardTitle>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Test your knowledge with personalized questions generated by our AI assistant
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Topic</label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topicOptions.map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                <div className="flex gap-2 flex-wrap">
                  {["easy", "intermediate", "advanced"].map((diff) => (
                    <Button
                      key={diff}
                      variant={state.difficulty === diff ? "default" : "outline"}
                      onClick={() => changeDifficulty(diff as QuestionDifficulty)}
                      className="flex-1"
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={startQuiz}
                  disabled={isGeneratingQuestions}
                  className="w-full"
                  size="lg"
                >
                  {isGeneratingQuestions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    "Start Quiz"
                  )}
                </Button>
                <p className="text-xs text-center mt-3 text-gray-500 dark:text-gray-400">
                  Our AI will generate 5 questions based on your selected topic
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show the results screen if the quiz is complete
  if (state.result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <Navigation />
        <div className="max-w-7xl mx-auto pt-24 px-4">
          <QuizResults 
            result={state.result} 
            onRestart={restartQuiz} 
          />
        </div>
      </div>
    );
  }

  // Show the question screen
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navigation />
      <div className="max-w-7xl mx-auto pt-24 px-4">
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <QuestionCard
            question={currentQuestion}
            selectedOption={selectedAnswer}
            onSelectOption={handleSelectOption}
            onNextQuestion={handleNextQuestion}
            showFeedback={state.showFeedback}
            questionNumber={state.currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        )}
      </div>
    </div>
  );
}
