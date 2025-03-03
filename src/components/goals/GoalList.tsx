
import { Loader2 } from "lucide-react";
import { GoalItem, Goal } from "./GoalItem";

interface GoalListProps {
  goals: Goal[];
  isLoading: boolean;
  onDelete: (goalId: string) => void;
}

export const GoalList = ({ goals, isLoading, onDelete }: GoalListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">You haven't created any goals yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalItem 
          key={goal.id} 
          goal={goal} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
