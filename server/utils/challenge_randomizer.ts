const Parser = require('expr-eval').Parser
export type VarRange =
  { min: number; max: number; isEven?: boolean, isOdd?: boolean }

export const challenge_randomizer = (
  variables_range: VarRange[],
  alternatives_options: object[],
  evaluated_answer: string,
  question_text: string
): { variables: number[]; alternatives: object[]; evaluated_answer: number[]; question_text: string } => {
  const parser = new Parser()
  const variables: number[] = []
  const alternatives: object[] = []

  //generate variables
  for (let i = 0; i < variables_range.length; i++) {
    const min = variables_range[i].min
    const max = variables_range[i].max
    let variable = Math.floor(Math.random() * (max - min + 1)) + min
    if (variables_range[i].isEven) {
      variable = variable % 2 === 0 ? variable : variable + 1
      variable = variable > max ? variable - 2 : variable
    } else if (variables_range[i].isOdd) {
      variable = variable % 2 === 1 ? variable : variable + 1
      variable = variable > max ? variable - 2 : variable
    }
    variables.push(variable)
  }

  //alternatives
  for (let i = 0; i < 4; i++) {
    let choosenAlternative = Math.floor(Math.random() * alternatives_options.length)
    const alternative = alternatives_options[choosenAlternative]
    const expression = Object.values(alternative)[0]
    const parts = expression.split(',').map((part: string) => part.trim())
    const letters = ['a', 'b', 'c', 'd']
    const resolved = parts.map((part: string) =>
      part.replace(/\{(\d+)\}/g, (_: string, index: string) =>
        String(variables[Number(index)] ?? `{${index}}`)
      ).replace(/\*\*/g, '^')
    )

    const parsed = resolved.map((r: string) => parser.evaluate(r))

    for (let i = 0; i < alternatives_options.length; i++) {
      alternatives[i] = { [letters[i]]: parsed }
    }

    alternatives_options = alternatives_options.filter((alt) => alt !== alternative)
  }

  //evaluated answer
  const resolved_answer = evaluated_answer.replace(
    /\{(\d+)\}/g,
    (_: string, i: string) => String(variables[Number(i)]) ?? `{${i}}`,
  )

  const evaluated = resolved_answer
    .split(',')
    .map((part) => parser.evaluate(part.trim().replace(/\*\*/g, '^')))

  return { variables, alternatives, evaluated_answer: evaluated, question_text }
}

