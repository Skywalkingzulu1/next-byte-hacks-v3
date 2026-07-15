import { getChart } from "../lib/mock-emr.js"
import type { ChartData, Trace } from "../types/schema.js"
import { trace } from "./trace.js"

export function retrieveChart(patientId: string): { chart: ChartData; traces: Trace[] } {
  const chart = getChart(patientId)
  const traces = [
    trace("Chart-Retriever", "fetch_chart", `patient_id=${patientId}`, `diagnoses=${chart.diagnoses.length} labs=${chart.labs.length}`),
  ]
  return { chart, traces }
}
