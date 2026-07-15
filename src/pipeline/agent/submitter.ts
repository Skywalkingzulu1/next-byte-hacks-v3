import { submitToPayer } from "../lib/mock-payer.js"
import type { Trace } from "../types/schema.js"
import { trace } from "./trace.js"

export function submit(evidence: string[], payer: string, cpt: string, clinical_summary: string): { decision: string; reason: string; traces: Trace[] } {
  const result = submitToPayer({ payer, cpt_code: cpt, clinical_summary, supporting_evidence: evidence })
  const traces = [trace("Submitter", "ePA_submit", `evidence=${evidence.length}`, `${result.decision}: ${result.reason}`)]
  return { decision: result.decision, reason: result.reason, traces }
}
