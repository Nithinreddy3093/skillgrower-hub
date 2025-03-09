
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/components/goals/GoalItem";
import { JournalEntry } from "@/components/journal/JournalEntryItem";
import { toast } from "sonner";

export const useDashboardData = (userId: string | undefined) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [isLoadingJournal, setIsLoadingJournal] = useState(false);

  // Fetch goals when component mounts and when user changes
  useEffect(() => {
    if (userId) {
      fetchGoals(userId);
      fetchJournalEntries(userId);
    }
  }, [userId]);

  const fetchGoals = async (userId: string) => {
    setIsLoadingGoals(true);
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
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
      setIsLoadingGoals(false);
    }
  };

  const fetchJournalEntries = async (userId: string) => {
    setIsLoadingJournal(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

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
      setIsLoadingJournal(false);
    }
  };

  // Subscribe to real-time updates for goals
  useEffect(() => {
    if (!userId) return;

    const goalsChannel = supabase
      .channel('dashboard-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Dashboard goals change received:', payload);
          
          // Handle different types of changes
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

    // Subscribe to real-time updates for journal entries
    const journalChannel = supabase
      .channel('dashboard-journal-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Dashboard journal entry change received:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            const newEntry = {
              ...payload.new,
              mood: payload.new.mood as "happy" | "neutral" | "sad"
            } as JournalEntry;
            setJournalEntries(current => [newEntry, ...current.slice(0, 2)]); // Keep only latest 3
          }
          else if (payload.eventType === 'UPDATE') {
            const updatedEntry = {
              ...payload.new,
              mood: payload.new.mood as "happy" | "neutral" | "sad"
            } as JournalEntry;
            setJournalEntries(current => 
              current.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
            );
          }
          else if (payload.eventType === 'DELETE') {
            setJournalEntries(current => 
              current.filter(entry => entry.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions when component unmounts
    return () => {
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(journalChannel);
    };
  }, [userId]);

  return {
    goals,
    journalEntries,
    isLoadingGoals,
    isLoadingJournal
  };
};
