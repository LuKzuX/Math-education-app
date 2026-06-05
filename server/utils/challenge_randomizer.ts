const Parser = require('expr-eval').Parser

export const challenge_randomizer = (
  variables_range: { min: number; max: number; even?: boolean }[],
  alternatives_options: string[],
): { variables: number[]; alternatives: object[] } => {
  const parser = new Parser()
  const variables: number[] = []
  const alternatives: object[] = []
  for (let i = 0; i < variables_range.length; i++) {
    const { min, max, even } = variables_range[i]
    let random: number = Math.floor(Math.random() * (max - min)) + min

    if (even) {
      if (random % 2 !== 0) {
        random = random + 1 <= max ? random + 1 : random - 1
      }
    }

    variables.push(random)
  }

  const resolved_alternatives: string[] = []
  for (let i = 0; i < alternatives_options.length; i++) {
    const resolved = alternatives_options[i].replace(/\{(\d+)\}/g, (_, index) =>
      String(variables[Number(index)] ?? `{${index}}`),
    )
    resolved_alternatives.push(resolved)
  }

  if (variables_range.length === 0) {
    const evaluated_alternatives = resolved_alternatives.map((expr) =>
      expr.split(',').map((part) => part.trim()),
    )
    let alt = [...evaluated_alternatives]
    for (let i = 0; i < 4; i++) {
      let choosen = Math.floor(Math.random() * alt.length)
      alternatives.push(alt[choosen])
      alt = alt.filter((x) => x !== alt[choosen])
    }
    const letters = ['a', 'b', 'c', 'd']
    for (let i = 0; i < alternatives.length; i++) {
      alternatives[i] = { [letters[i]]: alternatives[i] }
    }
    return { variables, alternatives }
  } else {
    const evaluated_alternatives = resolved_alternatives.map((expr) =>
      expr.split(',').map((part) => parser.evaluate(part.trim())),
    )

    let alt = [...evaluated_alternatives]

    for (let i = 0; i < 4; i++) {
      let choosen = Math.floor(Math.random() * alt.length)

      for (let j = 0; j < alt[choosen].length; j++) {
        if (!Number.isInteger(alt[choosen][j])) {
          const numerator = variables[0]
          const denominator = variables[1]
          if (numerator % denominator === 0) {
            alt[choosen][j] = numerator / denominator
          } else {
            alt[choosen][j] = `${numerator}/${denominator}`
          }
        }
      }
      alternatives.push(alt[choosen])

      alt = alt.filter((x) => x !== alt[choosen])
    }
    const letters = ['a', 'b', 'c', 'd']
    for (let i = 0; i < alternatives.length; i++) {
      alternatives[i] = { [letters[i]]: alternatives[i] }
    }
    return { variables, alternatives }
  }
}
