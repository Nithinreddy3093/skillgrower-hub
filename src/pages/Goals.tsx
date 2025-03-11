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

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Goals change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newGoal = {
              ...payload.new,
              category: payload.new.category as "academic" | "soft"
            } as Goal;
            setGoals(current => [newGoal, ...current]);
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedGoal = {
              ...payload.new,
              category: payload.new.category as "academic" | "soft"
            } as Goal;
            setGoals(current => 
              current.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal)
            );
          }
          else if (payload.eventType === 'DELETE') {
            setGoals(current => 
              current.filter(goal => goal.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

      toast.success("Goal deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Goal Setting</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 mb-8">Set SMART goals to track your progress and achieve your aspirations</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {user && (
            <GoalForm 
              userId={user.id} 
              onGoalCreated={handleGoalCreated} 
            />
          )}

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Your Goals</h2>
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
