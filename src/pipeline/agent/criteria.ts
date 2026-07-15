import { criteriaFor } from "../types/payer-rules.js"
import type { CriteriaRule, ChartData, Trace, CriteriaCheck } from "../types/schema.js"
import { trace } from "./trace.js"

export function matchCriteria(payer: string, cpt: string, chart: ChartData): { rule: CriteriaRule | undefined; missing: string[]; checklist: CriteriaCheck[]; traces: Trace[] } {
  const rule = criteriaFor(payer, cpt)
  const requiredLabs = rule?.required_labs ?? []
  const requiredDx = rule?.required_diagnoses ?? []
  const requiredTx = rule?.required_prior_treatments ?? []

  const labChecks: CriteriaCheck[] = requiredLabs.map(l => ({
    label: l,
    category: 'lab',
    required: true,
    satisfied: chart.labs.some(lb => lb.name.toLowerCase() === l.toLowerCase()),
  }))
  const dxChecks: CriteriaCheck[] = requiredDx.map(d => ({
    label: d,
    category: 'diagnosis',
    required: true,
    satisfied: chart.diagnoses.some(x => x.toLowerCase() === d.toLowerCase()),
  }))
  const txChecks: CriteriaCheck[] = requiredTx.map(t => ({
    label: t,
    category: 'prior_treatment',
    required: true,
    satisfied: chart.prior_treatments.some(x => x.toLowerCase().includes(t.toLowerCase())),
  }))

  const checklist = [...labChecks, ...dxChecks, ...txChecks]

  const missing = checklist
    .filter(c => !c.satisfied)
    .map(c => `${c.category === 'lab' ? 'lab' : c.category === 'diagnosis' ? 'dx' : 'tx'}:${c.label}`)

  const traces = [
    trace("Criteria-Matcher", "evaluate_payer_rules", `payer=${payer} cpt=${cpt}`, `missing=${missing.length} items`),
  ]
  return { rule, missing, checklist, traces }
}
