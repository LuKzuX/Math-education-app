export const challenge_randomizer = (variables_range, alternative_options) => {
  const variables = []
  for (let i = 0; i < variables_range.length; i++) {
    variables.push(Math.floor(Math.random() * variables_range[i]))
    console.log(variables)
  }

  const alternatives = []
  const alternatives_static = alternative_options
  let alt = alternatives_static
  for (let i = 0; i < 4; i++) {
    let choosen = Math.floor(Math.random() * alt.length)

    if (!Number.isInteger(alt[choosen])) {
      const numerator = variables[0]
      const denominator = variables[1]
      alt[choosen] = `${numerator}/${denominator}`
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
