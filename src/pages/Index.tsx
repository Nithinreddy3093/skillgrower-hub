
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GoalsDashboard } from "@/components/dashboard/GoalsDashboard";
import { JournalDashboard } from "@/components/dashboard/JournalDashboard";
import { useDashboardData } from "@/hooks/useDashboardData";

const Index = () => {
  const { user } = useAuth();
  const { 
    goals, 
    journalEntries, 
    isLoadingGoals, 
    isLoadingJournal 
  } = useDashboardData(user?.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 theme-transition">
      <Navigation />
      
      <main className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 pb-12">
        <DashboardHeader />
        
        {/* Goals section */}
        <GoalsDashboard goals={goals} isLoading={isLoadingGoals} />

        {/* Recent Journal Entries section */}
        <JournalDashboard journalEntries={journalEntries} isLoading={isLoadingJournal} />
      </main>
    </div>
  );
};

export default Index;
