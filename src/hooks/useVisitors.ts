import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Visitor {
  visitorId: string;
  email?: string;
  reachedStep: string;
  stepsCompleted: string[];
  abandonedAt?: string;
  startedAt: string;
  lastSeenAt: string;
  profileType?: string;
  offerFlow?: number;
}

export interface VisitorStats {
  totalVisitors: number;
  completedFunnel: number;
  reachedEmail: number;
  abandonedAtEmail: number;
  flowStats: {
    flow1: { leads: number; completions: number };
    flow2: { leads: number; completions: number };
  };
}

export function useVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("quiz-metrics", {
        body: { action: "visitors" },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined,
      });

      if (error) throw error;
      
      setVisitors(data.visitors || []);
      setStats({
        totalVisitors: data.totalVisitors,
        completedFunnel: data.completedFunnel,
        reachedEmail: data.reachedEmail,
        abandonedAtEmail: data.abandonedAtEmail,
        flowStats: data.flowStats || {
          flow1: { leads: 0, completions: 0 },
          flow2: { leads: 0, completions: 0 },
        },
      });
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { visitors, stats, isLoading, fetchVisitors };
}
