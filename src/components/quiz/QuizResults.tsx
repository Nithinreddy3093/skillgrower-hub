
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizResult, ResourceSuggestion } from "./types";
import { Badge } from "@/components/ui/badge";
import { BookOpenIcon, VideoIcon, FileTextIcon, CodeIcon, BrainCircuitIcon } from "lucide-react";

interface QuizResultsProps {
  result: QuizResult;
  resources: ResourceSuggestion[];
  onRestart: () => void;
}

export function QuizResults({ result, resources, onRestart }: QuizResultsProps) {
  const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
  const minutes = Math.floor(result.timeSpent / 60);
  const seconds = result.timeSpent % 60;
  
  const getPerformanceTier = (percentage: number) => {
    if (percentage >= 80) return "excellent";
    if (percentage >= 50) return "good";
    return "needs-practice";
  };
  
  const performanceTier = getPerformanceTier(scorePercentage);
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl md:text-3xl">Quiz Results: {result.title}</CardTitle>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-2">
            <ScoreBadge score={scorePercentage} />
            <Badge variant="outline" className="text-base py-1.5">
              Time: {minutes}m {seconds}s
            </Badge>
            <Badge 
              variant="outline" 
              className={`
                text-base py-1.5
                ${performanceTier === 'excellent' ? 'border-green-500 text-green-700 dark:text-green-400' : ''}
                ${performanceTier === 'good' ? 'border-blue-500 text-blue-700 dark:text-blue-400' : ''}
                ${performanceTier === 'needs-practice' ? 'border-amber-500 text-amber-700 dark:text-amber-400' : ''}
              `}
            >
              {scorePercentage}% Correct
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard 
              title="Performance by Category" 
              stats={Object.entries(result.categories).map(([category, data]) => ({
                label: category,
                value: `${data.correct}/${data.total}`,
                percentage: Math.round((data.correct / data.total) * 100)
              }))}
            />
            
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <h3 className="font-medium text-lg">Performance Assessment</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PerformanceFeedback score={scorePercentage} />
                </div>
              </CardContent>
            </Card>
          </div>

          <RecommendedResources resources={resources} />
        </CardContent>
        
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button onClick={onRestart} size="lg">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const stars = [];
  const fullStars = Math.floor(score / 20);
  
  for (let i = 0; i < 5; i++) {
    stars.push(i < fullStars ? "★" : "☆");
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl text-yellow-500 tracking-wider">{stars.join("")}</div>
    </div>
  );
}

function StatsCard({ title, stats }: { title: string, stats: { label: string, value: string, percentage: number }[] }) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <h3 className="font-medium text-lg">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(item.percentage)}`} 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceFeedback({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <div className="text-sm space-y-3">
        <p>
          <span className="font-medium text-green-700 dark:text-green-400">Excellent work!</span> You have a strong understanding of AI integration concepts.
        </p>
        <p>
          Your knowledge of AI APIs, integration patterns, and best practices is well-developed. You're ready to implement AI functionality in real-world applications.
        </p>
        <p className="font-medium">
          Next steps: Consider building complex AI-powered projects and exploring advanced topics.
        </p>
      </div>
    );
  } else if (score >= 50) {
    return (
      <div className="text-sm space-y-3">
        <p>
          <span className="font-medium text-blue-700 dark:text-blue-400">Good progress!</span> You have a solid foundation in AI integration concepts.
        </p>
        <p>
          You understand many of the core principles, but there are specific areas where additional practice would be beneficial.
        </p>
        <p className="font-medium">
          Next steps: Focus on practical challenges to reinforce your knowledge and fill in any gaps.
        </p>
      </div>
    );
  } else {
    return (
      <div className="text-sm space-y-3">
        <p>
          <span className="font-medium text-amber-700 dark:text-amber-400">Good start!</span> You're beginning to understand AI integration concepts.
        </p>
        <p>
          The quiz results indicate that you would benefit from strengthening your foundational knowledge of AI services, APIs, and integration patterns.
        </p>
        <p className="font-medium">
          Next steps: We recommend reviewing the basics through tutorials and introductory courses.
        </p>
      </div>
    );
  }
}

function RecommendedResources({ resources }: { resources: ResourceSuggestion[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Recommended Resources</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                {getResourceIcon(resource.type)}
                <h4 className="font-medium text-base">{resource.title}</h4>
              </div>
              <Badge variant="outline" className="mt-2">
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View Resource →
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getResourceIcon(type: string) {
  switch (type) {
    case 'video':
      return <VideoIcon className="h-4 w-4" />;
    case 'article':
      return <FileTextIcon className="h-4 w-4" />;
    case 'course':
      return <BookOpenIcon className="h-4 w-4" />;
    case 'project':
      return <CodeIcon className="h-4 w-4" />;
    case 'challenge':
      return <BrainCircuitIcon className="h-4 w-4" />;
    default:
      return <BookOpenIcon className="h-4 w-4" />;
  }
}

function getProgressColor(percentage: number) {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 50) return 'bg-blue-500';
  return 'bg-amber-500';
}
