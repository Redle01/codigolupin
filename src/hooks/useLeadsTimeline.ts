import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TimelineData {
  date: string;
  leads: number;
  visitors: number;
  conversionRate: number;
}

interface UseLeadsTimelineReturn {
  timeline: TimelineData[];
  isLoading: boolean;
  fetchTimeline: (days?: number) => Promise<void>;
}

export function useLeadsTimeline(): UseLeadsTimelineReturn {
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Not authenticated");
    }
    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchTimeline = useCallback(async (days: number = 30) => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        action: "timeline",
        days: String(days),
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quiz-leads?${params}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch timeline");
      }

      const data = await response.json();
      setTimeline(data.timeline || []);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setTimeline([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    timeline,
    isLoading,
    fetchTimeline,
  };
}
