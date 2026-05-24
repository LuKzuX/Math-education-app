const Parser = require('expr-eval').Parser

export const challenge_randomizer = (variables_range, alternatives_options) => {
  const parser = new Parser()
  const variables = []
  for (let i = 0; i < variables_range.length; i++) {
    variables.push(Math.floor(Math.random() * variables_range[i] + 1))
  }

  const resolved_alternatives: string[] = []
  for (let i = 0; i < alternatives_options.length; i++) {
    const resolved = alternatives_options[i].replace(
      /\{(\d+)\}/g,
      (_, i) => variables[Number(i)] ?? `{${i}}`,
    )
    resolved_alternatives.push(resolved)
  }

  const evaluated_alternatives = resolved_alternatives.map((expr) =>
    expr.split(',').map((part) => parser.evaluate(part.trim())),
  )

  const alternatives = []
  let alt = [...evaluated_alternatives]

  for (let i = 0; i < 4; i++) {
    let choosen = Math.floor(Math.random() * alt.length)

    for (let j = 0; j < alt[choosen].length; j++) {
      if (!Number.isInteger(alt[choosen][j])) {
        const numerator = variables[0]
        const denominator = variables[1]
        if ((numerator % denominator) === 0) {
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
