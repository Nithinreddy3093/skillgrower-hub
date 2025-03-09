
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Goal } from "@/components/goals/GoalItem";
import { JournalEntry } from "@/components/journal/JournalEntryItem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Target, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [isLoadingJournal, setIsLoadingJournal] = useState(false);

  // Fetch goals when component mounts and when user changes
  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchJournalEntries();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    
    setIsLoadingGoals(true);
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
      setIsLoadingGoals(false);
    }
  };

  const fetchJournalEntries = async () => {
    if (!user) return;

    setIsLoadingJournal(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
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
    if (!user) return;

    const goalsChannel = supabase
      .channel('dashboard-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`
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
          filter: `user_id=eq.${user.id}`
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
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your learning progress and achievements</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Button asChild>
              <Link to="/goals">
                <Target className="mr-1" />
                Manage Goals
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/journal">
                <BookOpen className="mr-1" />
                View Journal
              </Link>
            </Button>
          </div>
        </div>

        {/* Goals section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Goals</h2>
            <Link to="/goals" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>

          {isLoadingGoals ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white p-6 rounded-lg shadow-sm h-48"></div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500 mb-4">You don't have any goals yet</p>
                <Button asChild>
                  <Link to="/goals">Create Your First Goal</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {goals.map((goal) => (
                <Card key={goal.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        goal.category === "academic" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}>
                        {goal.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <div className="flex items-center gap-1">
                          {goal.progress === 100 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          )}
                          <span className={`${goal.progress === 100 ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                            {goal.progress}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={goal.progress} 
                        className={`h-2 ${goal.progress === 100 ? 'bg-gray-200' : 'bg-gray-200'}`}
                        indicatorClassName={goal.progress === 100 ? 'bg-green-500' : (
                          goal.category === "academic" ? "bg-blue-500" : "bg-green-500"
                        )}
                      />
                      {goal.progress === 100 && (
                        <div className="mt-2 text-green-600 text-sm font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      Due {format(new Date(goal.target_date), "PP")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recent Journal Entries section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Journal Entries</h2>
            <Link to="/journal" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>

          {isLoadingJournal ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white p-6 rounded-lg shadow-sm h-24"></div>
              ))}
            </div>
          ) : journalEntries.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500 mb-4">You don't have any journal entries yet</p>
                <Button asChild>
                  <Link to="/journal">Write Your First Entry</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-600 line-clamp-2 flex-1">{entry.content}</p>
                      <div className="flex flex-col items-end ml-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          entry.mood === "happy" ? "bg-green-100 text-green-800" : 
                          entry.mood === "neutral" ? "bg-blue-100 text-blue-800" : 
                          "bg-red-100 text-red-800"
                        }`}>
                          {entry.mood}
                        </span>
                        <span className="text-xs text-gray-500 mt-2">
                          {format(new Date(entry.created_at), "PPp")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
