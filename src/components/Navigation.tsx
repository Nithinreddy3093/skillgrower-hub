
import { Home, Target, BookOpen, Library, Users, LogOut, User, BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export const Navigation = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled inside the logout function
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <nav className="bg-indigo-600 dark:bg-indigo-900 text-white p-4 fixed w-full top-0 z-50 transition-colors duration-200 shadow-md dark:shadow-indigo-950/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 text-xl font-semibold">
            <div className="w-8 h-8 bg-white dark:bg-indigo-800 rounded p-1.5 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="text-indigo-600 dark:text-indigo-200 transition-colors">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>SkillTrack</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <Home size={20} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link to="/goals" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <Target size={20} />
              <span className="hidden sm:inline">Goals</span>
            </Link>
            <Link to="/journal" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <BookOpen size={20} />
              <span className="hidden sm:inline">Journal</span>
            </Link>
            <Link to="/resources" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <Library size={20} />
              <span className="hidden sm:inline">Resources</span>
            </Link>
            <Link to="/collaborate" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <Users size={20} />
              <span className="hidden sm:inline">Collaborate</span>
            </Link>
            <Link 
              to="/quiz" 
              className="flex items-center space-x-1 hover:text-indigo-100 transition bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
            >
              <BrainCircuit size={20} />
              <span className="hidden sm:inline">Quiz</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link 
            to="/profile" 
            className="flex items-center space-x-2 hover:text-indigo-100 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500 dark:bg-indigo-700 flex items-center justify-center transition-colors">
              <User size={20} />
            </div>
            <span className="text-sm hidden sm:inline">{user?.user_metadata?.full_name || 'Account'}</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 hover:text-indigo-100 transition"
            aria-label="Logout"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
