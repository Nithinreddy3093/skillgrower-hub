
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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Create New Goal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="goalName">
            Goal Name
          </label>
          <Input
            id="goalName"
            placeholder="e.g., Master Python Programming"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            disabled={isSubmitting}
            className="dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={category === "academic" ? "default" : "outline"}
              onClick={() => setCategory("academic")}
              disabled={isSubmitting}
              className={category !== "academic" ? "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" : ""}
            >
              🎓 Academic
            </Button>
            <Button
              type="button"
              variant={category === "soft" ? "default" : "outline"}
              onClick={() => setCategory("soft")}
              disabled={isSubmitting}
              className={category !== "soft" ? "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" : ""}
            >
              👥 Soft Skill
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Target Date</label>
          <Calendar
            mode="single"
            selected={targetDate}
            onSelect={setTargetDate}
            className="rounded-md border dark:border-gray-700 dark:bg-gray-800"
            disabled={isSubmitting}
            classNames={{
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day: "h-9 w-9 p-0 font-normal text-gray-900 dark:text-gray-200 aria-selected:opacity-100",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
              caption: "flex justify-center pt-1 relative items-center text-gray-800 dark:text-gray-200",
              caption_label: "text-sm font-medium",
              nav_button: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded-md",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="description">
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Describe your goal and what you want to achieve..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={isSubmitting}
            className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
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
