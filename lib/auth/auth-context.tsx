"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppUser } from "@/types";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_LOAD_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Authentication request timed out.")), timeoutMs)
    ),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });
  const supabase = useRef(createClient()).current;

  const fetchProfile = useCallback(
    async (userId: string): Promise<AppUser | null> => {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data as AppUser | null;
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await withTimeout(supabase.auth.getSession(), AUTH_LOAD_TIMEOUT_MS);
      if (session?.user) {
        const profile = await withTimeout(fetchProfile(session.user.id), AUTH_LOAD_TIMEOUT_MS);
        setState({ user: profile, session, isLoading: false });
      } else {
        setState({ user: null, session: null, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to refresh auth profile", error);
      setState({ user: null, session: null, isLoading: false });
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    withTimeout(supabase.auth.getSession(), AUTH_LOAD_TIMEOUT_MS)
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await withTimeout(fetchProfile(session.user.id), AUTH_LOAD_TIMEOUT_MS);
          setState({ user: profile, session, isLoading: false });
        } else {
          setState({ user: null, session: null, isLoading: false });
        }
      })
      .catch((error) => {
        console.error("Failed to load auth session", error);
        setState({ user: null, session: null, isLoading: false });
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const profile = await withTimeout(fetchProfile(session.user.id), AUTH_LOAD_TIMEOUT_MS);
          setState({ user: profile, session, isLoading: false });
        } else {
          setState({ user: null, session: null, isLoading: false });
        }
      } catch (error) {
        console.error("Failed to update auth state", error);
        setState({ user: null, session: null, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, isLoading: false });
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useRole() {
  const { user } = useAuth();
  return user?.role ?? null;
}
