export interface SubmitResult { decision: 'approved' | 'denied' | 'pending'; reason: string }

export function submitToPayer(packet: { payer: string; cpt_code: string; clinical_summary: string; supporting_evidence: string[] }): SubmitResult {
  if (packet.supporting_evidence.length === 0) return { decision: 'denied', reason: 'Insufficient documentation' }
  if (packet.supporting_evidence.length >= 2) return { decision: 'approved', reason: 'Criteria met with supporting evidence' }
  return { decision: 'pending', reason: 'Manual review required' }
}
