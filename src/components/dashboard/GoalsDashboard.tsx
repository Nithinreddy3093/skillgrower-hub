
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { CheckCircle, TrendingUp } from "lucide-react";
import { Goal } from "@/components/goals/GoalItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GoalsDashboardProps {
  goals: Goal[];
  isLoading: boolean;
}

export const GoalsDashboard = ({ goals, isLoading }: GoalsDashboardProps) => {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Your Goals</h2>
        <Link to="/goals" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white p-6 rounded-lg shadow-sm h-48"></div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">You don't have any goals yet</p>
            <Button asChild>
              <Link to="/goals">Create Your First Goal</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <Card key={goal.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    goal.category === "academic" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}>
                    {goal.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <div className="flex items-center gap-1">
                      {goal.progress === 100 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      )}
                      <span className={`${goal.progress === 100 ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                        {goal.progress}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={goal.progress} 
                    className={`h-2 ${goal.progress === 100 ? 'bg-gray-200' : 'bg-gray-200'}`}
                    indicatorClassName={goal.progress === 100 ? 'bg-green-500' : (
                      goal.category === "academic" ? "bg-blue-500" : "bg-green-500"
                    )}
                  />
                  {goal.progress === 100 && (
                    <div className="mt-2 text-green-600 text-sm font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </div>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  Due {format(new Date(goal.target_date), "PP")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
