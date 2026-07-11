const Parser = require('expr-eval').Parser
export type VarRange =
  { min: number; max: number; isEven?: boolean, isOdd?: boolean }

export const challenge_randomizer = (
  variables_range: VarRange[],
  alternatives_options: object[],
  evaluated_answer: string,
  question_text: string
): { variables: number[]; alternatives: object[]; evaluated_answer: (number | string)[]; question_text: string } => {
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
  const toFraction = (val: number) => {
    if (Number.isInteger(val)) {
      return val;
    }

    function gcd(a: number, b: number): number {
      let remainder: number;
      do {
        remainder = a % b;
        a = b;
        b = remainder;
      } while (remainder !== 0);
      return a;
    }

    // Continued-fraction expansion: finds the exact numerator/denominator for
    // any rational value, unlike string-matching on toString() digits, which
    // breaks whenever the repeating block doesn't start right after the
    // decimal point or floating-point rounding perturbs the trailing digits.
    const sign = val < 0 ? "-" : " "
    const absVal = Math.abs(val)

    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = absVal
    for (let i = 0; i < 30; i++) {
      const a = Math.floor(b)
      const h = a * h1 + h2
      const k = a * k1 + k2
      h2 = h1; h1 = h
      k2 = k1; k1 = k
      if (Math.abs(absVal - h1 / k1) < 1e-9 * Math.max(absVal, 1) || b - a === 0) break
      b = 1 / (b - a)
    }

    const divisor = gcd(h1, k1);
    return `${sign}${h1 / divisor}/${k1 / divisor}`
  };
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
    const parsed = resolved.map((r: string) => toFraction(parser.evaluate(r)));
    alternatives[i] = { [letters[i]]: parsed }
    alternatives_options = alternatives_options.filter((alt) => alt !== alternative)
  }

  //evaluated answer
  const resolved_answer = evaluated_answer.replace(
    /\{(\d+)\}/g,
    (_: string, i: string) => String(variables[Number(i)]) ?? `{${i}}`,
  )

  const evaluated = resolved_answer
    .split(',')
    .map((part) => toFraction(parser.evaluate(part.trim().replace(/\*\*/g, '^'))))

  //question text
  question_text = question_text.replace(
    /\{(\d+)\}/g,
    (_: string, i: string) => String(variables[Number(i)]) ?? `{${i}}`,
  )


  return { variables, alternatives, evaluated_answer: evaluated, question_text }
}

