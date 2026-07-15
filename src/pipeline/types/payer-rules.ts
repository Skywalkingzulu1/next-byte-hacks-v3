import type { CriteriaRule } from './schema.js'

export const PAYER_RULES: CriteriaRule[] = [
  {
    payer: 'AETNA',
    cpt_code: 'J3490',
    required_labs: ['HbA1c', 'fasting_glucose'],
    required_diagnoses: ['E11.9'],
    required_prior_treatments: ['metformin'],
    notes: 'Preferred: GLP-1 agonists require trial of metformin unless contraindicated.',
  },
  {
    payer: 'UHC',
    cpt_code: 'J3490',
    required_labs: ['HbA1c'],
    required_diagnoses: ['E11.9', 'E11.65'],
    required_prior_treatments: [],
    notes: 'UHC covers GLP-1 for BMI>=30 or BMI>=27 with comorbidity.',
  },
]

export function criteriaFor(payer: string, cpt: string): CriteriaRule | undefined {
  return PAYER_RULES.find(r => r.payer.toLowerCase() === payer.toLowerCase() && r.cpt_code === cpt)
}
