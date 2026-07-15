// src/pipeline/agent/trace.ts
function trace(agent, action, input_summary, output_summary) {
  return { agent, action, input_summary, output_summary, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
}

// src/pipeline/agent/intake.ts
function intake(raw) {
  const traces = [
    trace("Intake", "parse_request", JSON.stringify(raw).slice(0, 120), `patient=${raw.patient_id} payer=${raw.payer} cpt=${raw.cpt_code}`)
  ];
  return { request: raw, traces };
}

// src/pipeline/lib/mock-emr.ts
var MOCK_EMR = {
  "PT-001": {
    diagnoses: ["E11.9", "E11.65"],
    labs: [
      { name: "HbA1c", value: "8.2%", date: "2026-07-01" },
      { name: "fasting_glucose", value: "162 mg/dL", date: "2026-07-01" }
    ],
    medications: ["metformin 1000mg BID"],
    prior_treatments: ["metformin 3 months"],
    allergies: []
  },
  "PT-MISSING": {
    diagnoses: ["E11.9"],
    labs: [],
    medications: [],
    prior_treatments: [],
    allergies: []
  }
};
function getChart(patientId) {
  const found = MOCK_EMR[patientId];
  if (!found) throw new Error(`Patient ${patientId} not found`);
  return found;
}

// src/pipeline/agent/chart.ts
function retrieveChart(patientId) {
  const chart = getChart(patientId);
  const traces = [
    trace("Chart-Retriever", "fetch_chart", `patient_id=${patientId}`, `diagnoses=${chart.diagnoses.length} labs=${chart.labs.length}`)
  ];
  return { chart, traces };
}

// src/pipeline/types/payer-rules.ts
var PAYER_RULES = [
  {
    payer: "AETNA",
    cpt_code: "J3490",
    required_labs: ["HbA1c", "fasting_glucose"],
    required_diagnoses: ["E11.9"],
    required_prior_treatments: ["metformin"],
    notes: "Preferred: GLP-1 agonists require trial of metformin unless contraindicated."
  },
  {
    payer: "UHC",
    cpt_code: "J3490",
    required_labs: ["HbA1c"],
    required_diagnoses: ["E11.9", "E11.65"],
    required_prior_treatments: [],
    notes: "UHC covers GLP-1 for BMI>=30 or BMI>=27 with comorbidity."
  }
];
function criteriaFor(payer, cpt) {
  return PAYER_RULES.find((r) => r.payer.toLowerCase() === payer.toLowerCase() && r.cpt_code === cpt);
}

// src/pipeline/agent/criteria.ts
function matchCriteria(payer, cpt, chart) {
  const rule = criteriaFor(payer, cpt);
  const requiredLabs = rule?.required_labs ?? [];
  const requiredDx = rule?.required_diagnoses ?? [];
  const requiredTx = rule?.required_prior_treatments ?? [];
  const missingLabs = requiredLabs.filter((l) => !chart.labs.some((lb) => lb.name.toLowerCase() === l.toLowerCase()));
  const missingDx = requiredDx.filter((d) => !chart.diagnoses.some((x) => x.toLowerCase() === d.toLowerCase()));
  const missingTx = requiredTx.filter((t) => !chart.prior_treatments.some((x) => x.toLowerCase().includes(t.toLowerCase())));
  const missing = [...missingLabs.map((l) => `lab:${l}`), ...missingDx.map((d) => `dx:${d}`), ...missingTx.map((t) => `tx:${t}`)];
  const traces = [
    trace("Criteria-Matcher", "evaluate_payer_rules", `payer=${payer} cpt=${cpt}`, `missing=${missing.length} items`)
  ];
  return { rule, missing, traces };
}

// src/pipeline/agent/evidence.ts
function buildEvidence(chart, rule) {
  const evidence = [];
  if (chart.labs.length) evidence.push(`Labs (${chart.labs.map((l) => `${l.name}=${l.value}`).join(", ")})`);
  if (chart.diagnoses.length) evidence.push(`Diagnoses: ${chart.diagnoses.join(", ")}`);
  if (chart.medications.length) evidence.push(`Current meds: ${chart.medications.join(", ")}`);
  if (rule?.notes) evidence.push(`Payer notes: ${rule.notes}`);
  const summary = `${evidence.length} evidence items assembled for clinical review.`;
  return {
    evidence,
    summary,
    traces: [trace("Evidence-Builder", "assemble_packet", `labs=${chart.labs.length} dx=${chart.diagnoses.length}`, `${evidence.length} items`)]
  };
}

// src/pipeline/agent/escalation.ts
function escalate(missing, rule) {
  if (missing.length === 0) return { brief: null, traces: [trace("Escalation", "no_escalation", "missing=0", "continue")] };
  const brief = {
    reason: `Missing required data will likely cause denial. ${missing.length} gap(s) detected.`,
    missing_fields: missing,
    recommended_action: `Request missing items from care team before submission. ${rule?.notes ?? "Review payer criteria."}`
  };
  return { brief, traces: [trace("Escalation", "flag_for_review", `missing=${missing.length}`, `escalate=${JSON.stringify(brief).slice(0, 120)}`)] };
}

// src/pipeline/lib/mock-payer.ts
function submitToPayer(packet) {
  if (packet.supporting_evidence.length === 0) return { decision: "denied", reason: "Insufficient documentation" };
  if (packet.supporting_evidence.length >= 2) return { decision: "approved", reason: "Criteria met with supporting evidence" };
  return { decision: "pending", reason: "Manual review required" };
}

// src/pipeline/agent/submitter.ts
function submit(evidence, payer, cpt, clinical_summary) {
  const result = submitToPayer({ payer, cpt_code: cpt, clinical_summary, supporting_evidence: evidence });
  const traces = [trace("Submitter", "ePA_submit", `evidence=${evidence.length}`, `${result.decision}: ${result.reason}`)];
  return { decision: result.decision, reason: result.reason, traces };
}

// src/pipeline/agent/orchestrator.ts
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function runPipeline(req) {
  const allTraces = [];
  const { request, traces: t1 } = intake(req);
  allTraces.push(...t1);
  const { chart, traces: t2 } = retrieveChart(request.patient_id);
  allTraces.push(...t2);
  const { rule, missing, traces: t3 } = matchCriteria(request.payer, request.cpt_code, chart);
  allTraces.push(...t3);
  const { evidence, summary: evidenceSummary, traces: t4 } = buildEvidence(chart, rule);
  allTraces.push(...t4);
  const { brief: escalation, traces: t5 } = escalate(missing, rule);
  allTraces.push(...t5);
  let status = "likely_approved";
  if (escalation) status = "needs_review";
  const packet = {
    patient_id: request.patient_id,
    payer: request.payer,
    cpt_code: request.cpt_code,
    clinical_summary: evidenceSummary,
    supporting_evidence: evidence,
    missing_items: missing,
    predicted_outcome: status
  };
  let decision;
  if (!escalation && missing.length === 0) {
    decision = submit(evidence, request.payer, request.cpt_code, evidenceSummary);
    allTraces.push(...decision.traces);
  }
  return {
    order_id: `PA-${uid()}`,
    status: escalation ? "needs_review" : "submitted",
    pa_packet: packet,
    escalation: escalation ?? void 0,
    traces: allTraces
  };
}
export {
  runPipeline
};
