import { describe, it, expect } from "vitest"
import { runPipeline } from "../pipeline/agent/orchestrator.js"

describe("PriorAuthFlow pipeline", () => {
  it("happy path: strong chart -> approved packet", () => {
    const req = {
      chart_text: "58M T2DM, on metformin 3 months, HbA1c 8.2%, fasting 162, E11.9 + E11.65",
      payer: "AETNA",
      cpt_code: "J3490",
      patient_id: "PT-001",
    }
    const out = runPipeline(req)
    expect(out.status).toBe("submitted")
    expect(out.pa_packet.missing_items).toHaveLength(0)
    expect(out.pa_packet.predicted_outcome).toBe("likely_approved")
    expect(out.traces.length).toBeGreaterThan(0)
    expect(out.escalation).toBeUndefined()
  })

  it("escalation path: missing lab -> needs_review with escalation brief", () => {
    const req = {
      chart_text: "45F T2DM, labs pending - no HbA1c in chart",
      payer: "AETNA",
      cpt_code: "J3490",
      patient_id: "PT-MISSING",
    }
    const out = runPipeline(req)
    expect(out.status).toBe("needs_review")
    expect(out.escalation).toBeDefined()
    expect(out.escalation!.missing_fields.length).toBeGreaterThan(0)
    expect(out.escalation!.recommended_action).toContain("Request missing")
    expect(out.pa_packet.predicted_outcome).toBe("needs_review")
  })

  it("observable traces for every agent", () => {
    const req = {
      chart_text: "58M T2DM",
      payer: "UHC",
      cpt_code: "J3490",
      patient_id: "PT-001",
    }
    const out = runPipeline(req)
    const agents = Array.from(new Set(out.traces.map(t => t.agent)))
    expect(agents).toContain("Intake")
    expect(agents).toContain("Chart-Retriever")
    expect(agents).toContain("Criteria-Matcher")
    expect(agents).toContain("Evidence-Builder")
    expect(agents.some(a => a === "Submitter" || a === "Escalation")).toBe(true)
  })
})
