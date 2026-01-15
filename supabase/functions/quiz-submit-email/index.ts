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
    const { email, visitor_id, result_type, answers }: SubmitEmailRequest = await req.json();

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

    // Insert lead
    const { data, error } = await supabase
      .from("quiz_leads")
      .insert({
        email,
        visitor_id: visitor_id || null,
        result_type: result_type || null,
        answers: answers || null,
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
