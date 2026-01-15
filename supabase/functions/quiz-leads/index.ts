import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create client with user's token to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check admin role using service client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasRole, error: roleError } = await serviceClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !hasRole) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const resultType = url.searchParams.get("result_type") || "";

    if (action === "list") {
      let query = serviceClient
        .from("quiz_leads")
        .select("id, email, result_type, created_at, answers, visitor_id", { count: "exact" });

      if (search) {
        query = query.ilike("email", `%${search}%`);
      }
      if (resultType) {
        query = query.eq("result_type", resultType);
      }

      const { data: leads, error: leadsError, count } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (leadsError) {
        throw leadsError;
      }

      return new Response(JSON.stringify({ leads, total: count, page, limit }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action === "export") {
      let query = serviceClient
        .from("quiz_leads")
        .select("email, result_type, created_at, answers, visitor_id");

      if (search) {
        query = query.ilike("email", `%${search}%`);
      }
      if (resultType) {
        query = query.eq("result_type", resultType);
      }

      const { data: leads, error: leadsError } = await query.order("created_at", { ascending: false });

      if (leadsError) {
        throw leadsError;
      }

      // Generate CSV
      const headers = ["Email", "Perfil", "Data", "Visitor ID", "Respostas"];
      const rows = (leads || []).map((lead) => [
        lead.email,
        lead.result_type || "",
        new Date(lead.created_at).toLocaleString("pt-BR"),
        lead.visitor_id || "",
        JSON.stringify(lead.answers || {}),
      ]);

      const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
          ...corsHeaders,
        },
      });
    }

    if (action === "stats") {
      // Get lead stats
      const { data: leads, error: leadsError } = await serviceClient
        .from("quiz_leads")
        .select("result_type");

      if (leadsError) {
        throw leadsError;
      }

      // Get unique visitors
      const { data: events, error: eventsError } = await serviceClient
        .from("quiz_funnel_events")
        .select("visitor_id");

      if (eventsError) {
        throw eventsError;
      }

      const totalLeads = leads?.length || 0;
      const uniqueVisitors = new Set(events?.map((e) => e.visitor_id)).size;
      const conversionRate = uniqueVisitors > 0 ? ((totalLeads / uniqueVisitors) * 100).toFixed(1) : "0";

      // Count by result type
      const resultCounts: Record<string, number> = {};
      leads?.forEach((lead) => {
        const type = lead.result_type || "unknown";
        resultCounts[type] = (resultCounts[type] || 0) + 1;
      });

      const mostCommon = Object.entries(resultCounts).sort((a, b) => b[1] - a[1])[0];

      return new Response(
        JSON.stringify({
          totalLeads,
          uniqueVisitors,
          conversionRate: parseFloat(conversionRate),
          mostCommonProfile: mostCommon ? { type: mostCommon[0], count: mostCommon[1] } : null,
          resultCounts,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in quiz-leads function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
