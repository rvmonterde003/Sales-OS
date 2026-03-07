import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { DbUser } from '../types/database';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  dbUser: DbUser | null;
  allUsers: DbUser[];
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [allUsers, setAllUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the internal users row for the currently logged-in Supabase auth user
  const fetchDbUser = useCallback(async (authEmail: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', authEmail)
      .eq('is_active', true)
      .single();
    setDbUser(data ?? null);
  }, []);

  const fetchAllUsers = useCallback(async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('first_name');
    setAllUsers(data ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.email) {
        fetchDbUser(s.user.email);
        fetchAllUsers();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.email) {
        fetchDbUser(s.user.email);
        fetchAllUsers();
      } else {
        setDbUser(null);
        setAllUsers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchDbUser, fetchAllUsers]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    return error ? error.message : null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setDbUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, dbUser, allUsers, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
