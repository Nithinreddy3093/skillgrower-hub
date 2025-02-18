
import { Home, Target, BookOpen, Library, Users, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-indigo-600 text-white p-4 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 text-xl font-semibold">
            <div className="w-8 h-8 bg-white rounded p-1.5">
              <svg viewBox="0 0 24 24" fill="none" className="text-indigo-600">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>SkillTrack</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/goals" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <Target size={20} />
              <span>Goals</span>
            </Link>
            <Link to="/journal" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <BookOpen size={20} />
              <span>Journal</span>
            </Link>
            <Link to="/resources" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <Library size={20} />
              <span>Resources</span>
            </Link>
            <Link to="/collaborate" className="flex items-center space-x-1 hover:text-indigo-100 transition">
              <Users size={20} />
              <span>Collaborate</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center space-x-2 hover:text-indigo-100 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <User size={20} />
            </div>
            <span className="text-sm">Account</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-indigo-100 transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
