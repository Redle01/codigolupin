import { useState, useEffect, useCallback } from "react";

const METRICS_STORAGE_KEY = "quiz_funnel_metrics";

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
  lastUpdated: new Date().toISOString(),
};

export function useFunnelMetrics() {
  const [metrics, setMetrics] = useState<FunnelMetrics>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(METRICS_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultMetrics;
        }
      }
    }
    return defaultMetrics;
  });

  // Persist metrics to localStorage
  useEffect(() => {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
  }, [metrics]);

  const trackVisit = useCallback(() => {
    setMetrics((prev) => ({
      ...prev,
      totalVisits: prev.totalVisits + 1,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const trackPageView = useCallback((page: keyof FunnelMetrics["pageViews"]) => {
    setMetrics((prev) => ({
      ...prev,
      pageViews: {
        ...prev.pageViews,
        [page]: prev.pageViews[page] + 1,
      },
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      ...defaultMetrics,
      lastUpdated: new Date().toISOString(),
    });
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
    trackVisit,
    trackPageView,
    resetMetrics,
    getDropoffRate,
    getConversionRate,
  };
}
