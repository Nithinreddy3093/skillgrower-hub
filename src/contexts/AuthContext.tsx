
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement Supabase login
      setIsAuthenticated(true);
      setUser({ email }); // This will be replaced with actual user data
      toast.success('Logged in successfully');
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to login');
    }
  };

  const logout = () => {
    // TODO: Implement Supabase logout
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // TODO: Implement Supabase registration
      setIsAuthenticated(true);
      setUser({ email, name });
      toast.success('Registration successful');
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to register');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
