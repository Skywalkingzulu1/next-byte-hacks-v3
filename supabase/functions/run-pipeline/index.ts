import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { runPipeline } from './pipeline.bundle.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })

  let body: any
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const { chart_text, payer, cpt_code, patient_id } = body || {}
  if (!chart_text || !payer || !cpt_code || !patient_id) {
    return new Response(
      JSON.stringify({ error: 'chart_text, payer, cpt_code, patient_id are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const result = runPipeline({ chart_text, payer, cpt_code, patient_id })

  // Persist using the service-role key (server-side only).
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    await sb.from('pa_requests').insert({
      patient_id,
      payer,
      cpt_code,
      chart_text,
      status: result.status,
      pa_packet: result.pa_packet,
      escalation: result.escalation ?? null,
      traces: result.traces,
    })
  } catch (e) {
    console.error('persist failed', e)
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
})
