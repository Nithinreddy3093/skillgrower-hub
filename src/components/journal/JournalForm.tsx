
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Loader } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { JournalEntry } from "./JournalEntryItem";

interface JournalFormProps {
  userId: string;
  onEntryCreated: (entry: JournalEntry) => void;
}

export const JournalForm = ({ userId, onEntryCreated }: JournalFormProps) => {
  const [mood, setMood] = useState<"happy" | "neutral" | "sad">();
  const [entry, setEntry] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skills = [
    "Critical Thinking",
    "Time Management",
    "Data Analysis",
    "Communication",
    "Problem Solving",
    "Leadership"
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must be logged in to save journal entries");
      return;
    }

    if (!mood || !entry || selectedSkills.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert([
          {
            user_id: userId,
            content: entry,
            mood: mood,
            skills: selectedSkills
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Type assertion to ensure new entry matches our JournalEntry type
        const newEntry = {
          ...data[0],
          mood: data[0].mood as "happy" | "neutral" | "sad"
        } as JournalEntry;
        
        onEntryCreated(newEntry);
        toast.success("Journal entry saved successfully!");

        // Reset form
        setMood(undefined);
        setEntry("");
        setSelectedSkills([]);
      }
    } catch (error: any) {
      console.error("Error saving journal entry:", error);
      toast.error("Failed to save journal entry: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">New Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            How are you feeling about your progress today?
          </label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={mood === "happy" ? "default" : "outline"}
              onClick={() => setMood("happy")}
              className="flex-1"
              disabled={isSubmitting}
            >
              <Smile className="mr-2" /> Good
            </Button>
            <Button
              type="button"
              variant={mood === "neutral" ? "default" : "outline"}
              onClick={() => setMood("neutral")}
              className="flex-1"
              disabled={isSubmitting}
            >
              <Meh className="mr-2" /> Okay
            </Button>
            <Button
              type="button"
              variant={mood === "sad" ? "default" : "outline"}
              onClick={() => setMood("sad")}
              className="flex-1"
              disabled={isSubmitting}
            >
              <Frown className="mr-2" /> Challenging
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300" htmlFor="entry">
            Reflect on your learning journey
          </label>
          <Textarea
            id="entry"
            placeholder="What did you learn today? What challenges did you face? What are your next steps?"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows={6}
            disabled={isSubmitting}
            className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Related Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Button
                key={skill}
                type="button"
                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                onClick={() => toggleSkill(skill)}
                size="sm"
                disabled={isSubmitting}
                className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Journal Entry"
          )}
        </Button>
      </form>
    </div>
  );
};
