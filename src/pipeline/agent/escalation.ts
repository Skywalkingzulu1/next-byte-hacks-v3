import type { Trace } from "../types/schema.js"
import { trace } from "./trace.js"

export function escalate(missing: string[], rule: { notes?: string } | undefined): { brief: { reason: string; missing_fields: string[]; recommended_action: string } | null; traces: Trace[] } {
  if (missing.length === 0) return { brief: null, traces: [trace("Escalation", "no_escalation", "missing=0", "continue")] }
  const brief = {
    reason: `Missing required data will likely cause denial. ${missing.length} gap(s) detected.`,
    missing_fields: missing,
    recommended_action: `Request missing items from care team before submission. ${rule?.notes ?? 'Review payer criteria.'}`,
  }
  return { brief, traces: [trace("Escalation", "flag_for_review", `missing=${missing.length}`, `escalate=${JSON.stringify(brief).slice(0, 120)}`)] }
}
