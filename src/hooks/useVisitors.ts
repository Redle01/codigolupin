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
}

export interface VisitorStats {
  totalVisitors: number;
  completedFunnel: number;
  reachedEmail: number;
  abandonedAtEmail: number;
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
      });
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { visitors, stats, isLoading, fetchVisitors };
}
