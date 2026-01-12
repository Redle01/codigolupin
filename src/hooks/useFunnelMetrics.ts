import { useState, useEffect, useCallback } from "react";

const METRICS_STORAGE_KEY = "quiz_funnel_metrics";
const VISITORS_STORAGE_KEY = "quiz_funnel_visitors";
const VISITOR_ID_KEY = "quiz_visitor_id";
const VISITOR_PAGES_KEY = "quiz_visitor_pages";

export interface VisitorData {
  id: string;
  firstSeen: string;
  lastSeen: string;
  maxPageReached: string;
  pagesVisited: string[];
}

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
  visitors: Record<string, VisitorData>;
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
  visitors: {},
  lastUpdated: new Date().toISOString(),
};

const pageOrder: (keyof FunnelMetrics["pageViews"])[] = [
  "landing",
  "question1",
  "question2",
  "question3",
  "question4",
  "question5",
  "question6",
  "email",
  "question7",
  "question8",
  "result",
];

// Generate unique visitor ID
function generateVisitorId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create visitor ID for current session
function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  
  let visitorId = sessionStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateVisitorId();
    sessionStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

// Get pages already tracked for this visitor in this session
function getTrackedPages(): Set<string> {
  if (typeof window === "undefined") return new Set();
  
  const stored = sessionStorage.getItem(VISITOR_PAGES_KEY);
  if (stored) {
    try {
      return new Set(JSON.parse(stored));
    } catch {
      return new Set();
    }
  }
  return new Set();
}

// Save tracked pages for this visitor session
function saveTrackedPages(pages: Set<string>): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(VISITOR_PAGES_KEY, JSON.stringify([...pages]));
}

export function useFunnelMetrics() {
  const [metrics, setMetrics] = useState<FunnelMetrics>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(METRICS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Ensure visitors object exists (migration)
          if (!parsed.visitors) {
            parsed.visitors = {};
          }
          return parsed;
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
    const visitorId = getOrCreateVisitorId();
    const trackedPages = getTrackedPages();
    
    // Check if this page was already tracked for this visitor in this session
    if (trackedPages.has(page)) {
      return; // Already tracked, don't count again
    }
    
    // Mark page as tracked for this session
    trackedPages.add(page);
    saveTrackedPages(trackedPages);
    
    setMetrics((prev) => {
      const now = new Date().toISOString();
      const existingVisitor = prev.visitors[visitorId];
      
      // Calculate max page reached
      const allVisitedPages = existingVisitor 
        ? [...existingVisitor.pagesVisited, page]
        : [page];
      
      let maxPageIndex = -1;
      let maxPageReached: keyof FunnelMetrics["pageViews"] = page;
      
      allVisitedPages.forEach((p) => {
        const typedPage = p as keyof FunnelMetrics["pageViews"];
        const idx = pageOrder.indexOf(typedPage);
        if (idx > maxPageIndex) {
          maxPageIndex = idx;
          maxPageReached = typedPage;
        }
      });
      
      const updatedVisitor: VisitorData = {
        id: visitorId,
        firstSeen: existingVisitor?.firstSeen || now,
        lastSeen: now,
        maxPageReached,
        pagesVisited: [...new Set(allVisitedPages)],
      };
      
      return {
        ...prev,
        pageViews: {
          ...prev.pageViews,
          [page]: prev.pageViews[page] + 1,
        },
        visitors: {
          ...prev.visitors,
          [visitorId]: updatedVisitor,
        },
        lastUpdated: now,
      };
    });
  }, []);

  const resetMetrics = useCallback(() => {
    // Clear session storage as well
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(VISITOR_ID_KEY);
      sessionStorage.removeItem(VISITOR_PAGES_KEY);
    }
    
    setMetrics({
      ...defaultMetrics,
      lastUpdated: new Date().toISOString(),
    });
  }, []);

  const refreshMetrics = useCallback(() => {
    // Force re-read from localStorage to sync with other tabs
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(METRICS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!parsed.visitors) {
            parsed.visitors = {};
          }
          setMetrics(parsed);
        } catch {
          // Keep current state on error
        }
      }
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

  // Get stats about visitors
  const getVisitorStats = useCallback(() => {
    const visitors = Object.values(metrics.visitors);
    const totalVisitors = visitors.length;
    
    // Count how many visitors reached each stage
    const reachedStages: Record<keyof FunnelMetrics["pageViews"], number> = {
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
    };
    
    visitors.forEach((visitor) => {
      visitor.pagesVisited.forEach((page) => {
        const typedPage = page as keyof FunnelMetrics["pageViews"];
        if (typedPage in reachedStages) {
          reachedStages[typedPage]++;
        }
      });
    });
    
    return {
      totalVisitors,
      reachedStages,
    };
  }, [metrics.visitors]);

  return {
    metrics,
    trackVisit,
    trackPageView,
    resetMetrics,
    refreshMetrics,
    getDropoffRate,
    getConversionRate,
    getVisitorStats,
  };
}
