import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeAdminProps {
  onLeadInserted?: () => void;
  onFunnelEventInserted?: () => void;
  enabled?: boolean;
}

interface UseRealtimeAdminReturn {
  isConnected: boolean;
  lastUpdate: Date | null;
}

export function useRealtimeAdmin({
  onLeadInserted,
  onFunnelEventInserted,
  enabled = true,
}: UseRealtimeAdminProps): UseRealtimeAdminReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Store callbacks in refs to avoid recreating channel on callback changes
  const onLeadInsertedRef = useRef(onLeadInserted);
  const onFunnelEventInsertedRef = useRef(onFunnelEventInserted);
  
  useEffect(() => {
    onLeadInsertedRef.current = onLeadInserted;
  }, [onLeadInserted]);
  
  useEffect(() => {
    onFunnelEventInsertedRef.current = onFunnelEventInserted;
  }, [onFunnelEventInserted]);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    // Create realtime channel
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_leads",
        },
        () => {
          setLastUpdate(new Date());
          onLeadInsertedRef.current?.();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_funnel_events",
        },
        () => {
          setLastUpdate(new Date());
          onFunnelEventInsertedRef.current?.();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled]);

  return {
    isConnected,
    lastUpdate,
  };
}
