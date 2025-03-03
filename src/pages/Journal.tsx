
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JournalEntry } from "@/components/journal/JournalEntryItem";
import { JournalForm } from "@/components/journal/JournalForm";
import { JournalEntryList } from "@/components/journal/JournalEntryList";

const Journal = () => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Type assertion to ensure data matches our JournalEntry type
      const typedData = (data || []).map(item => ({
        ...item,
        mood: item.mood as "happy" | "neutral" | "sad"
      })) as JournalEntry[];
      
      setJournalEntries(typedData);
    } catch (error: any) {
      console.error("Error fetching journal entries:", error);
      toast.error("Failed to load journal entries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntryCreated = (newEntry: JournalEntry) => {
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-gray-900">Learning Journal</h1>
        <p className="text-gray-600 mt-2 mb-8">Reflect on your learning journey and track your progress</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {user && (
            <JournalForm 
              userId={user.id} 
              onEntryCreated={handleEntryCreated} 
            />
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Entries</h2>
            <JournalEntryList 
              entries={journalEntries} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Journal;
