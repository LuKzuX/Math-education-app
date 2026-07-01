import { useSearchParams } from 'react-router-dom'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div>
      <h1>Verify email</h1>
      <p>Token: {token}</p>
    </div>
  )
}

export default VerifyEmail
