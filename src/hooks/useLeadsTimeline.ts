import { useState, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface TimelineData {
  date: string;
  leads: number;
  visitors: number;
  conversionRate: number;
}

export interface TimelineOptions {
  days?: number;
  startDate?: Date;
  endDate?: Date;
}

interface UseLeadsTimelineReturn {
  timeline: TimelineData[];
  isLoading: boolean;
  fetchTimeline: (options?: TimelineOptions) => Promise<void>;
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

  const fetchTimeline = useCallback(async (options?: TimelineOptions) => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        action: "timeline",
      });

      // Usar datas específicas ou fallback para dias
      if (options?.startDate && options?.endDate) {
        params.set("startDate", format(options.startDate, "yyyy-MM-dd"));
        params.set("endDate", format(options.endDate, "yyyy-MM-dd"));
      } else {
        params.set("days", String(options?.days || 30));
      }

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

