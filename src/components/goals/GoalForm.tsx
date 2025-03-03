
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "./GoalItem";

interface GoalFormProps {
  userId: string;
  onGoalCreated: (goal: Goal) => void;
}

export const GoalForm = ({ userId, onGoalCreated }: GoalFormProps) => {
  const [goalName, setGoalName] = useState("");
  const [category, setCategory] = useState<"academic" | "soft">("academic");
  const [targetDate, setTargetDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetDate || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!userId) {
      toast.error("You must be logged in to create goals");
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
            user_id: userId,
            progress: 0
          },
        ])
        .select();

      if (error) throw error;

      // Add the new goal to the list with proper type assertion
      if (data && data.length > 0) {
        const newGoal = {
          ...data[0],
          category: data[0].category as "academic" | "soft"
        } as Goal;
        
        onGoalCreated(newGoal);
        toast.success("Goal created successfully!");
        
        // Reset form
        setGoalName("");
        setCategory("academic");
        setTargetDate(undefined);
        setDescription("");
      }
    } catch (error: any) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};
