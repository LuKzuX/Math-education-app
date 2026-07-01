import { useSearchParams } from 'react-router-dom'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div>
      <h1>Reset password</h1>
      <p>Token: {token}</p>
    </div>
  )
}

export default ResetPassword
