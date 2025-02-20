
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Goal {
  id: string;
  title: string;
  category: "academic" | "soft";
  target_date: string;
  description: string;
  progress: number;
}

const Goals = () => {
  const { user } = useAuth();
  const [goalName, setGoalName] = useState("");
  const [category, setCategory] = useState<"academic" | "soft">("academic");
  const [targetDate, setTargetDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load goals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetDate || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([
          {
            title: goalName,
            category,
            target_date: targetDate.toISOString().split("T")[0],
            description,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setGoals((prev) => [data, ...prev]);
      toast.success("Goal created successfully!");
      
      // Reset form
      setGoalName("");
      setCategory("academic");
      setTargetDate(undefined);
      setDescription("");
    } catch (error: any) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ progress: newProgress })
        .eq("id", goalId);

      if (error) throw error;

      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId ? { ...goal, progress: newProgress } : goal
        )
      );
      toast.success("Progress updated successfully!");
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
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
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Create New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="goalName">
                  Goal Name
                </label>
                <Input
                  id="goalName"
                  placeholder="e.g., Master Python Programming"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={category === "academic" ? "default" : "outline"}
                    onClick={() => setCategory("academic")}
                    disabled={isSubmitting}
                  >
                    🎓 Academic
                  </Button>
                  <Button
                    type="button"
                    variant={category === "soft" ? "default" : "outline"}
                    onClick={() => setCategory("soft")}
                    disabled={isSubmitting}
                  >
                    👥 Soft Skill
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Date</label>
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  className="rounded-md border"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal and what you want to achieve..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Goal"
                )}
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Your Goals</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">You haven't created any goals yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
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
                        onClick={() => deleteGoal(goal.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <p className="text-gray-600 mt-2">{goal.description}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              goal.category === "academic" ? "bg-blue-500" : "bg-green-500"
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
                          >
                            -
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
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
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Goals;
