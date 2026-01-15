import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackEventRequest {
  visitor_id: string;
  page_key: string;
}

interface FunnelStats {
  pageViews: Record<string, number>;
  uniqueVisitors: number;
  visitorProgress: Record<string, string[]>;
  lastUpdated: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // POST /track - Register page view event
    if (req.method === "POST" && path === "track") {
      const { visitor_id, page_key }: TrackEventRequest = await req.json();

      if (!visitor_id || !page_key) {
        return new Response(
          JSON.stringify({ error: "visitor_id and page_key are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if this visitor already visited this page
      const { data: existingEvent } = await supabase
        .from("quiz_funnel_events")
        .select("id")
        .eq("visitor_id", visitor_id)
        .eq("page_key", page_key)
        .maybeSingle();

      // Only insert if not already tracked
      if (!existingEvent) {
        const { error } = await supabase
          .from("quiz_funnel_events")
          .insert({ visitor_id, page_key });

        if (error) {
          console.error("Error inserting event:", error);
          return new Response(
            JSON.stringify({ error: "Failed to track event" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, alreadyTracked: !!existingEvent }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // GET /stats - Get aggregated metrics
    if (req.method === "GET" && path === "stats") {
      // Get all events
      const { data: events, error } = await supabase
        .from("quiz_funnel_events")
        .select("visitor_id, page_key, created_at")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch stats" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Process events into stats
      const pageViews: Record<string, number> = {
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

      const visitorProgress: Record<string, string[]> = {};

      events?.forEach((event) => {
        const { visitor_id, page_key } = event;
        
        // Count page views
        if (page_key in pageViews) {
          pageViews[page_key]++;
        }

        // Track visitor progress
        if (!visitorProgress[visitor_id]) {
          visitorProgress[visitor_id] = [];
        }
        if (!visitorProgress[visitor_id].includes(page_key)) {
          visitorProgress[visitor_id].push(page_key);
        }
      });

      const stats: FunnelStats = {
        pageViews,
        uniqueVisitors: Object.keys(visitorProgress).length,
        visitorProgress,
        lastUpdated: new Date().toISOString(),
      };

      return new Response(
        JSON.stringify(stats),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // DELETE /reset - Reset all metrics (admin only)
    if (req.method === "DELETE" && path === "reset") {
      const { error } = await supabase
        .from("quiz_funnel_events")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) {
        console.error("Error resetting metrics:", error);
        return new Response(
          JSON.stringify({ error: "Failed to reset metrics" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in quiz-metrics function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
