
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface Goal {
  id: string;
  title: string;
  category: "academic" | "soft";
  target_date: string;
  description: string;
  progress: number;
  user_id: string;
  created_at: string;
}

interface GoalItemProps {
  goal: Goal;
  onDelete: (goalId: string) => void;
}

export const GoalItem = ({ goal, onDelete }: GoalItemProps) => {
  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ progress: newProgress })
        .eq("id", goalId);

      if (error) throw error;

      // Update the progress locally
      setGoalProgress(newProgress);
      toast.success("Progress updated successfully!");
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const [goalProgress, setGoalProgress] = useState(goal.progress);

  return (
    <div key={goal.id} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{goal.title}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
            goal.category === "academic" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
          }`}>
            {goal.category}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(goal.id)}
        >
          Delete
        </Button>
      </div>
      <p className="text-gray-600 mt-2">{goal.description}</p>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{goalProgress}%</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                goal.category === "academic" ? "bg-blue-500" : "bg-green-500"
              }`}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateGoalProgress(goal.id, Math.max(0, goalProgress - 10))}
            >
              -
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateGoalProgress(goal.id, Math.min(100, goalProgress + 10))}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Due {format(new Date(goal.target_date), "PP")}
      </div>
    </div>
  );
};
