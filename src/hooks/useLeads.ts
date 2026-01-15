import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Lead {
  id: string;
  email: string;
  result_type: string | null;
  created_at: string;
  answers: Record<string, any> | null;
  visitor_id: string | null;
}

export interface LeadStats {
  totalLeads: number;
  uniqueVisitors: number;
  conversionRate: number;
  mostCommonProfile: { type: string; count: number } | null;
  resultCounts: Record<string, number>;
}

interface UseLeadsReturn {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  stats: LeadStats | null;
  fetchLeads: (options?: { page?: number; search?: string; resultType?: string }) => Promise<void>;
  fetchStats: () => Promise<void>;
  exportCSV: (options?: { search?: string; resultType?: string }) => Promise<void>;
  setPage: (page: number) => void;
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<LeadStats | null>(null);

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

  const fetchLeads = useCallback(async (options?: { page?: number; search?: string; resultType?: string }) => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        action: "list",
        page: String(options?.page || page),
        limit: String(limit),
      });
      if (options?.search) params.set("search", options.search);
      if (options?.resultType) params.set("result_type", options.resultType);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quiz-leads?${params}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
      if (options?.page) setPage(options.page);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  const fetchStats = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quiz-leads?action=stats`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const exportCSV = useCallback(async (options?: { search?: string; resultType?: string }) => {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ action: "export" });
      if (options?.search) params.set("search", options.search);
      if (options?.resultType) params.set("result_type", options.resultType);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quiz-leads?${params}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      throw error;
    }
  }, []);

  return {
    leads,
    total,
    page,
    limit,
    isLoading,
    stats,
    fetchLeads,
    fetchStats,
    exportCSV,
    setPage,
  };
}
