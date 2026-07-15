import { intake } from "./intake.js"
import { retrieveChart } from "./chart.js"
import { matchCriteria } from "./criteria.js"
import { buildEvidence } from "./evidence.js"
import { escalate } from "./escalation.js"
import { submit } from "./submitter.js"
import type { Deliverable, AuthorizationRequest, PAPacket, EscalationBrief, Trace, SubmitDecision } from "../types/schema.js"

function uid() { return Math.random().toString(36).slice(2, 10) }

export function runPipeline(req: AuthorizationRequest): Deliverable {
  const allTraces: Trace[] = []

  const { request, traces: t1 } = intake(req)
  allTraces.push(...t1)

  const { chart, traces: t2 } = retrieveChart(request.patient_id)
  allTraces.push(...t2)

  const { rule, missing, checklist, traces: t3 } = matchCriteria(request.payer, request.cpt_code, chart)
  allTraces.push(...t3)

  const { evidence, summary: evidenceSummary, traces: t4 } = buildEvidence(chart, rule)
  allTraces.push(...t4)

  const { brief: escalation, traces: t5 } = escalate(missing, rule)
  allTraces.push(...t5)

  let status: Deliverable['pa_packet']['predicted_outcome'] = 'likely_approved'
  if (escalation) status = 'needs_review'

  const packet: PAPacket = {
    patient_id: request.patient_id,
    payer: request.payer,
    cpt_code: request.cpt_code,
    clinical_summary: evidenceSummary,
    supporting_evidence: evidence,
    missing_items: missing,
    criteria_checklist: checklist,
    rule_notes: rule?.notes,
    predicted_outcome: status,
  }

  let decision: { decision: string; reason: string; traces: Trace[] } | undefined
  if (!escalation && missing.length === 0) {
    decision = submit(evidence, request.payer, request.cpt_code, evidenceSummary)
    allTraces.push(...decision.traces)
  }

  const submitDecision: SubmitDecision | undefined = decision
    ? { decision: decision.decision as SubmitDecision['decision'], reason: decision.reason }
    : undefined

  return {
    order_id: `PA-${uid()}`,
    status: escalation ? 'needs_review' : 'submitted',
    pa_packet: packet,
    escalation: escalation ?? undefined,
    decision: submitDecision,
    traces: allTraces,
  }
}
