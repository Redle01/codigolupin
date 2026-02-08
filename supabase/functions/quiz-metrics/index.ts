import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackEventRequest {
  action: "track";
  visitor_id: string;
  page_key: string;
}

interface StatsRequest {
  action: "stats";
  startDate?: string;
  endDate?: string;
}

interface ResetRequest {
  action: "reset";
}

interface VisitorsRequest {
  action: "visitors";
}

type RequestBody = TrackEventRequest | StatsRequest | ResetRequest | VisitorsRequest;

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
    // Parse request body
    const body: RequestBody = await req.json();
    const action = body.action;

    // POST action: track - Register page view event (public - no auth required)
    if (action === "track") {
      const origin = req.headers.get("origin") || "";
      const referer = req.headers.get("referer") || "";
      
      // Lista de padrões de origens bloqueadas (ambiente interno)
      const BLOCKED_PATTERNS = [
        /id-preview--.*\.lovable\.app/i,
        /localhost/i,
        /127\.0\.0\.1/i,
        /\.lovable\.dev/i,
      ];
      
      // Verificar se origem é bloqueada (acesso interno)
      const isBlocked = BLOCKED_PATTERNS.some(pattern => 
        pattern.test(origin) || pattern.test(referer)
      );
      
      if (isBlocked) {
        console.log("Blocked internal tracking request from:", origin || referer);
        return new Response(
          JSON.stringify({ success: true, blocked: true, reason: "internal_access" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { visitor_id, page_key } = body as TrackEventRequest;

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

    // Action: stats - Get aggregated metrics (ADMIN ONLY)
    if (action === "stats") {
      // Verify admin authentication
      const { isAdmin, error: authError } = await verifyAdmin(req, supabaseUrl, supabaseAnonKey);
      
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: authError || "Forbidden - Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Extract date filters from request
      const { startDate, endDate } = body as StatsRequest;

      // Build query with optional date filter
      let query = supabaseAdmin
        .from("quiz_funnel_events")
        .select("visitor_id, page_key, created_at")
        .order("created_at", { ascending: true });

      // Apply date filters if provided
      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data: events, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch stats" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Process events into stats
      const pageViews: Record<string, number> = {
        link_click: 0,
        landing: 0,
        question1: 0,
        question2: 0,
        question3: 0,
        question4: 0,
        question5: 0,
        question6: 0,
        question7: 0,
        question8: 0,
        email: 0,
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

    // Action: visitors - Get detailed visitor progress (ADMIN ONLY)
    if (action === "visitors") {
      // Verify admin authentication
      const { isAdmin, error: authError } = await verifyAdmin(req, supabaseUrl, supabaseAnonKey);
      
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: authError || "Forbidden - Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get all funnel events
      const { data: events, error: eventsError } = await supabaseAdmin
        .from("quiz_funnel_events")
        .select("visitor_id, page_key, created_at")
        .order("created_at", { ascending: true });

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch visitor data" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Get all leads to associate emails and offer_flow
      const { data: leads, error: leadsError } = await supabaseAdmin
        .from("quiz_leads")
        .select("visitor_id, email, result_type, offer_flow");

      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
      }

      // Create leads lookup map
      const leadsMap = new Map<string, { email: string; result_type: string | null; offer_flow: number | null }>();
      leads?.forEach((lead) => {
        if (lead.visitor_id) {
          leadsMap.set(lead.visitor_id, { email: lead.email, result_type: lead.result_type, offer_flow: lead.offer_flow });
        }
      });

      // Define funnel step order
      const stepOrder = [
        "link_click", "landing", "question1", "question2", "question3", "question4",
        "question5", "question6", "question7", "question8", "email", "result"
      ];

      // Process events into visitor progress
      const visitorProgress: Record<string, {
        visitorId: string;
        email?: string;
        reachedStep: string;
        stepsCompleted: string[];
        abandonedAt?: string;
        startedAt: string;
        lastSeenAt: string;
        profileType?: string;
        offerFlow?: number;
      }> = {};

      events?.forEach((event) => {
        const { visitor_id, page_key, created_at } = event;
        
        if (!visitorProgress[visitor_id]) {
          visitorProgress[visitor_id] = {
            visitorId: visitor_id,
            reachedStep: page_key,
            stepsCompleted: [page_key],
            startedAt: created_at || new Date().toISOString(),
            lastSeenAt: created_at || new Date().toISOString(),
          };
        } else {
          if (!visitorProgress[visitor_id].stepsCompleted.includes(page_key)) {
            visitorProgress[visitor_id].stepsCompleted.push(page_key);
          }
          // Update reached step if this step is further in the funnel
          const currentStepIndex = stepOrder.indexOf(visitorProgress[visitor_id].reachedStep);
          const newStepIndex = stepOrder.indexOf(page_key);
          if (newStepIndex > currentStepIndex) {
            visitorProgress[visitor_id].reachedStep = page_key;
          }
          visitorProgress[visitor_id].lastSeenAt = created_at || visitorProgress[visitor_id].lastSeenAt;
        }

        // Add lead info if available
        const leadInfo = leadsMap.get(visitor_id);
        if (leadInfo) {
          visitorProgress[visitor_id].email = leadInfo.email;
          visitorProgress[visitor_id].profileType = leadInfo.result_type || undefined;
          visitorProgress[visitor_id].offerFlow = leadInfo.offer_flow || undefined;
        }
      });

      // Calculate abandoned at for each visitor
      const visitors = Object.values(visitorProgress).map((v) => {
        const reachedIndex = stepOrder.indexOf(v.reachedStep);
        const nextStep = stepOrder[reachedIndex + 1];
        if (nextStep && v.reachedStep !== "result") {
          v.abandonedAt = nextStep;
        }
        return v;
      });

      // Calculate stats
      const completedFunnel = visitors.filter(v => v.reachedStep === "result").length;
      const reachedEmail = visitors.filter(v => stepOrder.indexOf(v.reachedStep) >= stepOrder.indexOf("email")).length;
      const abandonedAtEmail = visitors.filter(v => v.reachedStep === "email" && !v.email).length;
      
      // Stats by offer flow
      const flow1Completions = visitors.filter(v => v.offerFlow === 1 && v.reachedStep === "result").length;
      const flow2Completions = visitors.filter(v => v.offerFlow === 2 && v.reachedStep === "result").length;
      const flow1Leads = visitors.filter(v => v.offerFlow === 1).length;
      const flow2Leads = visitors.filter(v => v.offerFlow === 2).length;

      return new Response(
        JSON.stringify({
          visitors,
          totalVisitors: visitors.length,
          completedFunnel,
          reachedEmail,
          abandonedAtEmail,
          flowStats: {
            flow1: { leads: flow1Leads, completions: flow1Completions },
            flow2: { leads: flow2Leads, completions: flow2Completions },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Action: reset - Reset all metrics (ADMIN ONLY)
    if (action === "reset") {
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
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
