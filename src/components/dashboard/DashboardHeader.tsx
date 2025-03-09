
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, BookOpen } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your learning progress and achievements</p>
      </div>
      <div className="mt-4 sm:mt-0 flex gap-3">
        <Button asChild>
          <Link to="/goals">
            <Target className="mr-1" />
            Manage Goals
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/journal">
            <BookOpen className="mr-1" />
            View Journal
          </Link>
        </Button>
      </div>
    </div>
  );
};
