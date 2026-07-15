import type { ChartData } from '../types/schema.js'

const MOCK_EMR: Record<string, ChartData> = {
  'PT-001': {
    diagnoses: ['E11.9', 'E11.65'],
    labs: [
      { name: 'HbA1c', value: '8.2%', date: '2026-07-01' },
      { name: 'fasting_glucose', value: '162 mg/dL', date: '2026-07-01' },
    ],
    medications: ['metformin 1000mg BID'],
    prior_treatments: ['metformin 3 months'],
    allergies: [],
  },
  'PT-MISSING': {
    diagnoses: ['E11.9'],
    labs: [],
    medications: [],
    prior_treatments: [],
    allergies: [],
  },
}

export function getChart(patientId: string): ChartData {
  const found = MOCK_EMR[patientId]
  if (!found) throw new Error(`Patient ${patientId} not found`)
  return found
}
