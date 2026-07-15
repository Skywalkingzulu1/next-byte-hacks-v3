import type { Trace } from "../types/schema.js"

export function trace(agent: string, action: string, input_summary: string, output_summary: string): Trace {
  return { agent, action, input_summary, output_summary, timestamp: new Date().toISOString() }
}
