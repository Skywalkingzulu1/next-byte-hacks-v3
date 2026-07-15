import type { ChartData, CriteriaRule } from "../types/schema.js"
import { trace } from "./trace.js"

export function buildEvidence(chart: ChartData, rule: CriteriaRule | undefined): { evidence: string[]; summary: string; traces: ReturnType<typeof trace>[] } {
  const evidence: string[] = []
  if (chart.labs.length) evidence.push(`Labs (${chart.labs.map(l => `${l.name}=${l.value}`).join(', ')})`)
  if (chart.diagnoses.length) evidence.push(`Diagnoses: ${chart.diagnoses.join(', ')}`)
  if (chart.medications.length) evidence.push(`Current meds: ${chart.medications.join(', ')}`)
  if (rule?.notes) evidence.push(`Payer notes: ${rule.notes}`)

  const summary = `${evidence.length} evidence items assembled for clinical review.`
  return {
    evidence,
    summary,
    traces: [trace("Evidence-Builder", "assemble_packet", `labs=${chart.labs.length} dx=${chart.diagnoses.length}`, `${evidence.length} items`)],
  }
}
