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

    const strVal = val.toString();
    const sign = strVal[0] !== "-" ? " " : "-" 
    const afterDot = strVal.split(".")[1];
    const beforeDot = strVal.split(".")[0];
    const numerator = parseInt(afterDot);
    const denominator = 10 ** afterDot.length;
    const wholeNumber = parseInt(beforeDot);
    let defNumerator = (wholeNumber * denominator) + numerator;
    let defDenominator = denominator;
    let result = ""
    const divisor = gcd(defNumerator, defDenominator);

    if (afterDot.length < 4) {
      result = `${sign}${defNumerator / divisor}/${defDenominator / divisor}`
    } else {
      let den = 0
      for (let i = 1; i < afterDot.length / 2; i++) {
        let first = afterDot.slice(0, i)
        let second = afterDot.slice(i, i * 2)
        if (first == second) {
          den = 10 ** i - 1
          const numerator = parseInt(first)
          const divisor = gcd(numerator, den);
          result = `${sign}${numerator / divisor}/${den / divisor}`
          break
        }
      }

      return result
    }

    return result
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
    .map((part) => parser.evaluate(part.trim().replace(/\*\*/g, '^')))

  //question text
  question_text = question_text.replace(
    /\{(\d+)\}/g,
    (_: string, i: string) => String(variables[Number(i)]) ?? `{${i}}`,
  )


  return { variables, alternatives, evaluated_answer: evaluated, question_text }
}

