import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitEmailRequest {
  email: string;
  visitor_id: string;
  result_type?: string;
  answers?: Record<string, string>;
  offer_flow?: number;
}

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const MAX_SUBMISSIONS_PER_VISITOR = 3;
const MAX_SUBMISSIONS_PER_IP = 10;

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Verificar se é acesso interno (ambiente Lovable preview/dev)
    const origin = req.headers.get("origin") || "";
    const referer = req.headers.get("referer") || "";
    
    const BLOCKED_PATTERNS = [
      /id-preview--.*\.lovable\.app/i,
      /localhost/i,
      /127\.0\.0\.1/i,
      /\.lovable\.dev/i,
    ];
    
    const isInternalRequest = BLOCKED_PATTERNS.some(pattern => 
      pattern.test(origin) || pattern.test(referer)
    );
    
    if (isInternalRequest) {
      console.log("Blocked internal lead submission from:", origin || referer);
      return new Response(
        JSON.stringify({ success: true, blocked: true, reason: "internal_access" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, visitor_id, result_type, answers, offer_flow }: SubmitEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format and length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate visitor_id length to prevent abuse
    if (visitor_id && visitor_id.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid visitor ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting by visitor_id
    if (visitor_id) {
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
      const { count: visitorCount } = await supabase
        .from("quiz_leads")
        .select("id", { count: "exact", head: true })
        .eq("visitor_id", visitor_id)
        .gte("created_at", windowStart);

      if (visitorCount && visitorCount >= MAX_SUBMISSIONS_PER_VISITOR) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Rate limiting by IP address
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    if (clientIp !== "unknown") {
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
      const { count: ipCount } = await supabase
        .from("quiz_leads")
        .select("id", { count: "exact", head: true })
        .eq("visitor_id", `ip:${clientIp}`)
        .gte("created_at", windowStart);

      if (ipCount && ipCount >= MAX_SUBMISSIONS_PER_IP) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Check for existing lead with same visitor_id (UPSERT logic)
    let existingLeadId: string | null = null;
    if (visitor_id) {
      const { data: existingLead } = await supabase
        .from("quiz_leads")
        .select("id")
        .eq("visitor_id", visitor_id)
        .maybeSingle();
      
      if (existingLead) {
        existingLeadId = existingLead.id;
      }
    }

    if (existingLeadId) {
      // UPDATE existing lead - merge data (only update fields that have values)
      const updateData: Record<string, unknown> = {};
      if (result_type) updateData.result_type = result_type;
      if (offer_flow) updateData.offer_flow = offer_flow;
      if (answers && Object.keys(answers).length > 0) updateData.answers = answers;
      
      const { data, error } = await supabase
        .from("quiz_leads")
        .update(updateData)
        .eq("id", existingLeadId)
        .select()
        .single();

      if (error) {
        console.error("Error updating lead:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update lead" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Lead updated successfully:", data.id);
      return new Response(
        JSON.stringify({ success: true, id: data.id, updated: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // INSERT new lead
    const { data, error } = await supabase
      .from("quiz_leads")
      .insert({
        email,
        visitor_id: visitor_id || null,
        result_type: result_type || null,
        answers: answers || null,
        offer_flow: offer_flow || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting lead:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Lead saved successfully:", data.id);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in quiz-submit-email function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
