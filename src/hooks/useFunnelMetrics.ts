import { useState, useCallback } from "react";
import { isInternalAccess } from "@/lib/environment";

// Lazy load Supabase only when needed (saves ~30KB from initial bundle)
const getSupabase = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
};

const VISITOR_ID_KEY = "quiz_visitor_id";

export interface FunnelMetrics {
  totalVisits: number;
  pageViews: {
    landing: number;
    question1: number;
    question2: number;
    question3: number;
    question4: number;
    question5: number;
    question6: number;
    email: number;
    question7: number;
    question8: number;
    result: number;
  };
  uniqueVisitors: number;
  lastUpdated: string;
}

const defaultMetrics: FunnelMetrics = {
  totalVisits: 0,
  pageViews: {
    landing: 0,
    question1: 0,
    question2: 0,
    question3: 0,
    question4: 0,
    question5: 0,
    question6: 0,
    email: 0,
    question7: 0,
    question8: 0,
    result: 0,
  },
  uniqueVisitors: 0,
  lastUpdated: new Date().toISOString(),
};

// Generate unique visitor ID
function generateVisitorId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create visitor ID - persists in localStorage to survive refreshes
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

// Helper to schedule work during idle time
function scheduleIdleWork(callback: () => void, timeout = 2000) {
  if ("requestIdleCallback" in window) {
    (window as Window).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 100);
  }
}

// Async tracking function - fire and forget with lazy Supabase
async function sendTrackingEvent(visitorId: string, page: string) {
  try {
    const supabase = await getSupabase();
    await supabase.functions.invoke("quiz-metrics", {
      body: {
        action: "track",
        visitor_id: visitorId,
        page_key: page,
      },
    });
  } catch (error) {
    // Silently fail - tracking should never block UI
    console.debug("Tracking error:", error);
  }
}

export function useFunnelMetrics() {
  const [metrics, setMetrics] = useState<FunnelMetrics>(defaultMetrics);
  const [isLoading, setIsLoading] = useState(false);

  // Track page view via Edge Function - deferred to idle time
  const trackPageView = useCallback((page: keyof FunnelMetrics["pageViews"]) => {
    // Não rastrear acessos internos (Lovable preview/admin)
    if (isInternalAccess()) {
      console.debug("[Metrics] Skipping internal access tracking");
      return;
    }
    
    const visitorId = getOrCreateVisitorId();
    
    // Defer tracking to idle time - never blocks UI
    scheduleIdleWork(() => {
      sendTrackingEvent(visitorId, page);
    });
  }, []);

  // Fetch metrics from server (requires admin auth)
  const refreshMetrics = useCallback(async (options?: { startDate?: Date; endDate?: Date }) => {
    setIsLoading(true);
    
    try {
      const supabase = await getSupabase();
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      // Build request body with optional date filters
      const requestBody: Record<string, unknown> = { action: "stats" };
      
      if (options?.startDate) {
        requestBody.startDate = options.startDate.toISOString();
      }
      if (options?.endDate) {
        // Adjust to end of day
        const endOfDay = new Date(options.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        requestBody.endDate = endOfDay.toISOString();
      }
      
      const { data, error } = await supabase.functions.invoke("quiz-metrics", {
        body: requestBody,
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined,
      });

      if (error) {
        console.error("Error fetching metrics:", error);
        return;
      }

      if (data) {
        setMetrics({
          totalVisits: data.pageViews?.landing || 0,
          pageViews: data.pageViews || defaultMetrics.pageViews,
          uniqueVisitors: data.uniqueVisitors || 0,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset all metrics (requires admin auth)
  const resetMetrics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const supabase = await getSupabase();
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("quiz-metrics", {
        body: { action: "reset" },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined,
      });

      if (error) {
        console.error("Error resetting metrics:", error);
        return;
      }

      // Clear local visitor ID to start fresh
      if (typeof window !== "undefined") {
        localStorage.removeItem(VISITOR_ID_KEY);
      }

      setMetrics({
        ...defaultMetrics,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error resetting metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDropoffRate = useCallback((fromPage: keyof FunnelMetrics["pageViews"], toPage: keyof FunnelMetrics["pageViews"]) => {
    const fromViews = metrics.pageViews[fromPage];
    const toViews = metrics.pageViews[toPage];
    if (fromViews === 0) return 0;
    return Math.round(((fromViews - toViews) / fromViews) * 100);
  }, [metrics.pageViews]);

  const getConversionRate = useCallback((fromPage: keyof FunnelMetrics["pageViews"], toPage: keyof FunnelMetrics["pageViews"]) => {
    const fromViews = metrics.pageViews[fromPage];
    const toViews = metrics.pageViews[toPage];
    if (fromViews === 0) return 0;
    return Math.round((toViews / fromViews) * 100);
  }, [metrics.pageViews]);

  return {
    metrics,
    isLoading,
    trackPageView,
    resetMetrics,
    refreshMetrics,
    getDropoffRate,
    getConversionRate,
  };
}
