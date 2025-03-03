
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Loader } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

type JournalEntry = {
  id: string;
  content: string;
  mood: "happy" | "neutral" | "sad";
  skills: string[];
  created_at: string;
};

const Journal = () => {
  const { user } = useAuth();
  const [mood, setMood] = useState<"happy" | "neutral" | "sad">();
  const [entry, setEntry] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const skills = [
    "Critical Thinking",
    "Time Management",
    "Data Analysis",
    "Communication",
    "Problem Solving",
    "Leadership"
  ];

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);

  const fetchJournalEntries = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (error: any) {
      console.error("Error fetching journal entries:", error);
      toast.error("Failed to load journal entries");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
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
            user_id: user.id,
            content: entry,
            mood: mood,
            skills: selectedSkills
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setJournalEntries(prev => [data[0], ...prev]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, MMMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-gray-900">Learning Journal</h1>
        <p className="text-gray-600 mt-2 mb-8">Reflect on your learning journey and track your progress</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">New Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
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
                <label className="block text-sm font-medium mb-2" htmlFor="entry">
                  Reflect on your learning journey
                </label>
                <Textarea
                  id="entry"
                  placeholder="What did you learn today? What challenges did you face? What are your next steps?"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  rows={6}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
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

          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Entries</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : journalEntries.length === 0 ? (
              <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                <p className="text-gray-500">No journal entries yet. Start reflecting on your learning journey!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-500">{formatDate(entry.created_at)}</span>
                      {entry.mood === "happy" && <Smile className="text-green-500" />}
                      {entry.mood === "neutral" && <Meh className="text-yellow-500" />}
                      {entry.mood === "sad" && <Frown className="text-red-500" />}
                    </div>
                    <p className="text-gray-700 mb-4">{entry.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
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

export default Journal;
