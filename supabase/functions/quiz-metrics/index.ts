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

// Verify admin role
async function verifyAdmin(req: Request, supabaseUrl: string, supabaseAnonKey: string): Promise<{ isAdmin: boolean; error?: string }> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return { isAdmin: false, error: "Unauthorized - No token provided" };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  
  if (claimsError || !claimsData?.claims) {
    return { isAdmin: false, error: "Unauthorized - Invalid token" };
  }

  const userId = claimsData.claims.sub;
  
  // Check admin role using the has_role function
  const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  });

  if (roleError) {
    console.error("Error checking role:", roleError);
    return { isAdmin: false, error: "Error checking permissions" };
  }

  return { isAdmin: hasRole === true };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  // Service role client for data operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // POST /track - Register page view event (public - no auth required)
    if (req.method === "POST" && path === "track") {
      const { visitor_id, page_key }: TrackEventRequest = await req.json();

      if (!visitor_id || !page_key) {
        return new Response(
          JSON.stringify({ error: "visitor_id and page_key are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if this visitor already visited this page
      const { data: existingEvent } = await supabaseAdmin
        .from("quiz_funnel_events")
        .select("id")
        .eq("visitor_id", visitor_id)
        .eq("page_key", page_key)
        .maybeSingle();

      // Only insert if not already tracked
      if (!existingEvent) {
        const { error } = await supabaseAdmin
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

    // GET /stats - Get aggregated metrics (ADMIN ONLY)
    if (req.method === "GET" && path === "stats") {
      // Verify admin authentication
      const { isAdmin, error: authError } = await verifyAdmin(req, supabaseUrl, supabaseAnonKey);
      
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: authError || "Forbidden - Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get all events
      const { data: events, error } = await supabaseAdmin
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

    // DELETE /reset - Reset all metrics (ADMIN ONLY)
    if (req.method === "DELETE" && path === "reset") {
      // Verify admin authentication
      const { isAdmin, error: authError } = await verifyAdmin(req, supabaseUrl, supabaseAnonKey);
      
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: authError || "Forbidden - Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error } = await supabaseAdmin
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
