const Parser = require('expr-eval').Parser
export type VarRange =
  | { min: number; max: number; even?: boolean }
  | { values: (boolean | number)[] }

export const challenge_randomizer = (
  variables_range: VarRange[],
  alternatives_options: string[],
  evaluated_answer: string | number | boolean,
  question_text: string
): { variables: number[]; alternatives: object[]; evaluated_answer: string | number | boolean; question_text: string } => {
  const parser = new Parser()
  const variables: number[] = []
  const alternatives: object[] = []



  return { variables, alternatives, evaluated_answer, question_text }
}

