import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    isLoading: true,
  });

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        let isAdmin = false;
        
        if (user) {
          // Use setTimeout to avoid potential race conditions with Supabase
          setTimeout(async () => {
            isAdmin = await checkAdminRole(user.id);
            setState({
              user,
              session,
              isAdmin,
              isLoading: false,
            });
          }, 0);
        } else {
          setState({
            user: null,
            session: null,
            isAdmin: false,
            isLoading: false,
          });
        }
      }
    );

    // THEN check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      let isAdmin = false;
      
      if (user) {
        isAdmin = await checkAdminRole(user.id);
      }
      
      setState({
        user,
        session,
        isAdmin,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
    
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setState({
      user: null,
      session: null,
      isAdmin: false,
      isLoading: false,
    });
  };

  return {
    user: state.user,
    session: state.session,
    isAdmin: state.isAdmin,
    isLoading: state.isLoading,
    signIn,
    signOut,
  };
}
