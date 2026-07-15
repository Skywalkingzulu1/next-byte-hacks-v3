import type { AuthorizationRequest, Trace } from "../types/schema.js"
import { trace } from "./trace.js"

export function intake(raw: AuthorizationRequest): { request: AuthorizationRequest; traces: Trace[] } {
  const traces = [
    trace("Intake", "parse_request", JSON.stringify(raw).slice(0, 120), `patient=${raw.patient_id} payer=${raw.payer} cpt=${raw.cpt_code}`),
  ]
  return { request: raw, traces }
}
