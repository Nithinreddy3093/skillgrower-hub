
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId,
            full_name: user?.user_metadata?.full_name || '',
          }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(profile);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await fetchProfile(session.user.id);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message);
      }

      if (!data?.user) {
        throw new Error('No user data returned');
      }

      setUser(data.user);
      setIsAuthenticated(true);
      await fetchProfile(data.user.id);
      toast.success('Logged in successfully');
      navigate('/profile');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid login credentials');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAuthenticated(false);
      setProfile(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Error during logout');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      if (!data?.user) {
        throw new Error('Registration failed');
      }

      toast.success('Registration successful! Please check your email to confirm your account.');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, profile, login, logout, register }}>
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
