
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalList } from "@/components/goals/GoalList";
import { Goal } from "@/components/goals/GoalItem";

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch goals on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure data matches our Goal type
      const typedData = (data || []).map(item => ({
        ...item,
        category: item.category as "academic" | "soft"
      })) as Goal[];
      
      setGoals(typedData);
    } catch (error: any) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load goals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalCreated = (newGoal: Goal) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  const deleteGoal = async (goalId: string) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;

      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      toast.success("Goal deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-gray-900">Goal Setting</h1>
        <p className="text-gray-600 mt-2 mb-8">Set SMART goals to track your progress and achieve your aspirations</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {user && (
            <GoalForm 
              userId={user.id} 
              onGoalCreated={handleGoalCreated} 
            />
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-6">Your Goals</h2>
            <GoalList 
              goals={goals} 
              isLoading={isLoading} 
              onDelete={deleteGoal} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Goals;
