import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_CONTRACT_TYPES = ['sponsorship', 'content_creation', 'brand_ambassador', 'ugc', 'affiliate', 'custom'];
const VALID_STATUSES = ['draft', 'sent', 'signed', 'active', 'completed', 'cancelled'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // === AUTH VALIDATION ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    // === END AUTH VALIDATION ===

    // === INPUT VALIDATION ===
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { title, client_name, contract_type, status, client_email, start_date, end_date,
            value, currency, content, deliverables, payment_terms, exclusivity,
            exclusivity_details, usage_rights, termination_clause } = body as Record<string, unknown>;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!client_name || typeof client_name !== 'string' || client_name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'client_name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resolvedType = (typeof contract_type === 'string' && VALID_CONTRACT_TYPES.includes(contract_type))
      ? contract_type : 'custom';

    const resolvedStatus = (typeof status === 'string' && VALID_STATUSES.includes(status))
      ? status : 'draft';
    // === END INPUT VALIDATION ===

    const { data: contract, error: insertError } = await supabase
      .from('contracts')
      .insert({
        user_id: userId,
        title: (title as string).trim(),
        client_name: (client_name as string).trim(),
        contract_type: resolvedType,
        status: resolvedStatus,
        client_email: typeof client_email === 'string' ? client_email.trim() : null,
        start_date: typeof start_date === 'string' ? start_date : null,
        end_date: typeof end_date === 'string' ? end_date : null,
        value: typeof value === 'number' ? value : null,
        currency: typeof currency === 'string' ? currency : 'KES',
        content: typeof content === 'string' ? content : null,
        deliverables: Array.isArray(deliverables) ? deliverables : null,
        payment_terms: typeof payment_terms === 'string' ? payment_terms : null,
        exclusivity: typeof exclusivity === 'boolean' ? exclusivity : false,
        exclusivity_details: typeof exclusivity_details === 'string' ? exclusivity_details : null,
        usage_rights: typeof usage_rights === 'string' ? usage_rights : null,
        termination_clause: typeof termination_clause === 'string' ? termination_clause : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('contracts-create insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create contract' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ contract }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('contracts-create error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
