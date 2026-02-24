import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface User {
  id: string;
  email: string;
}

interface Profile {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  profile: Profile | null;
  role: AppRole | null;
  influencerId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isTeam: boolean;
  isInfluencer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [influencerId, setInfluencerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Apply session data returned directly from backend (login/session endpoints)
  // Backend returns: { user: {id, email}, profile, role, influencerId }
  const applySessionData = useCallback((sessionData: any) => {
    if (!sessionData) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      setInfluencerId(null);
      return;
    }

    if (sessionData.user) setUser(sessionData.user);
    if (sessionData.profile) setProfile(sessionData.profile);
    if (sessionData.role) setRole(sessionData.role as AppRole);
    setInfluencerId(sessionData.influencerId || null);
    setSession(sessionData);
  }, []);

  useEffect(() => {
    // Listen for auth state changes (triggered by login/logout)
    const { data: { subscription } } = api.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (currentSession) {
          applySessionData(currentSession);
        } else {
          applySessionData(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session on mount (token in localStorage)
    api.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession) {
        applySessionData(existingSession);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applySessionData]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await api.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await api.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await api.auth.signOut();
    if (error) throw error;
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
    role,
    influencerId,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    isAdmin: role === 'admin',
    isTeam: role === 'admin',
    isInfluencer: role === 'influencer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
