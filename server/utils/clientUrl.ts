export const getClientUrl = () => {
  const primary = (process.env.CLIENT_URL ?? '').split(',')[0].trim()
  return primary.endsWith('/') ? primary : `${primary}/`
}
