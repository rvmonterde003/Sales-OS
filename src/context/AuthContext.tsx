import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { DbUser, DbInvitation } from '../types/database';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  dbUser: DbUser | null;
  allUsers: DbUser[];
  invitations: DbInvitation[];
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, firstName: string, lastName: string, token: string) => Promise<string | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  changePassword: (newPassword: string) => Promise<string | null>;
  inviteUser: (email: string, role: 'admin' | 'rep') => Promise<string | null>;
  updateUserRole: (userId: number, role: 'admin' | 'rep') => Promise<string | null>;
  removeUser: (userId: number) => Promise<string | null>;
  refreshUsers: () => Promise<void>;
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
  const [invitations, setInvitations] = useState<DbInvitation[]>([]);
  const [loading, setLoading] = useState(true);

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
      .order('first_name');
    setAllUsers(data ?? []);
  }, []);

  const fetchInvitations = useCallback(async () => {
    const { data } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });
    setInvitations(data ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.email) {
        fetchDbUser(s.user.email);
        fetchAllUsers();
        fetchInvitations();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.email) {
        fetchDbUser(s.user.email);
        fetchAllUsers();
        fetchInvitations();
      } else {
        setDbUser(null);
        setAllUsers([]);
        setInvitations([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchDbUser, fetchAllUsers, fetchInvitations]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    token: string,
  ): Promise<string | null> => {
    // Validate invite token — first check token exists, then check email matches
    const { data: tokenRow } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (!tokenRow) return 'Invalid or expired invitation token.';
    if (tokenRow.email !== email) return `This invitation was sent to a different email address. Please use the email that received the invite.`;
    const invite = tokenRow;

    // Create auth user
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    if (error) return error.message;

    // Create db user with invited role
    await supabase.from('users').insert({
      email,
      password_hash: '',
      first_name: firstName,
      last_name: lastName,
      role: invite.role,
      is_active: true,
    });

    // Mark invite as accepted
    await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    return null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setDbUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    return error ? error.message : null;
  }, []);

  const changePassword = useCallback(async (newPassword: string): Promise<string | null> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error ? error.message : null;
  }, []);

  const inviteUser = useCallback(async (email: string, role: 'admin' | 'rep'): Promise<string | null> => {
    if (!dbUser) return 'Not authenticated';
    // Check if already invited or already a user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (existing) return 'This email is already registered.';

    const { data: pendingInvite } = await supabase
      .from('invitations')
      .select('id')
      .eq('email', email)
      .is('accepted_at', null)
      .single();
    if (pendingInvite) return 'This email already has a pending invitation.';

    const token = crypto.randomUUID();
    const { error } = await supabase.from('invitations').insert({
      email,
      role,
      token,
      invited_by: dbUser.id,
    });
    if (error) return error.message;

    await fetchInvitations();
    return null;
  }, [dbUser, fetchInvitations]);

  const updateUserRole = useCallback(async (userId: number, role: 'admin' | 'rep'): Promise<string | null> => {
    // Protect exec from role changes
    const target = allUsers.find(u => u.id === userId);
    if (target?.role === 'exec') return 'Cannot change the exec role.';
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);
    if (error) return error.message;
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    return null;
  }, [allUsers]);

  const removeUser = useCallback(async (userId: number): Promise<string | null> => {
    // Protect exec from removal
    const target = allUsers.find(u => u.id === userId);
    if (target?.role === 'exec') return 'Cannot remove the exec account.';
    // Hard delete from both app users table and Supabase auth.users
    const { error } = await supabase.rpc('delete_app_user', { target_user_id: userId });
    if (error) return error.message;
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    return null;
  }, [allUsers]);

  const refreshUsers = useCallback(async () => {
    await fetchAllUsers();
    await fetchInvitations();
  }, [fetchAllUsers, fetchInvitations]);

  return (
    <AuthContext.Provider value={{
      session, dbUser, allUsers, invitations, loading,
      login, signup, logout, resetPassword, changePassword,
      inviteUser, updateUserRole, removeUser, refreshUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
