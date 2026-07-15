export interface AuthorizationRequest {
  chart_text: string
  payer: string
  cpt_code: string
  patient_id: string
}

export interface ChartData {
  diagnoses: string[]
  labs: { name: string; value: string; date: string }[]
  medications: string[]
  prior_treatments: string[]
  allergies: string[]
}

export interface CriteriaRule {
  payer: string
  cpt_code: string
  required_labs: string[]
  required_diagnoses: string[]
  required_prior_treatments: string[]
  notes: string
}

export type CriteriaCategory = 'lab' | 'diagnosis' | 'prior_treatment'

export interface CriteriaCheck {
  label: string
  category: CriteriaCategory
  required: boolean
  satisfied: boolean
}

export interface SubmitDecision {
  decision: 'approved' | 'denied' | 'pending'
  reason: string
}

export type OrderStatus = 'pending' | 'processing' | 'needs_review' | 'submitted'

export interface Deliverable {
  order_id: string
  status: OrderStatus
  pa_packet: PAPacket
  escalation?: EscalationBrief
  decision?: SubmitDecision
  traces: Trace[]
}

export interface PAPacket {
  patient_id: string
  payer: string
  cpt_code: string
  clinical_summary: string
  supporting_evidence: string[]
  missing_items: string[]
  criteria_checklist: CriteriaCheck[]
  rule_notes?: string
  predicted_outcome: 'likely_approved' | 'likely_denied' | 'needs_review'
}

export interface EscalationBrief {
  reason: string
  missing_fields: string[]
  recommended_action: string
}

export interface Trace {
  agent: string
  action: string
  input_summary: string
  output_summary: string
  timestamp: string
}
