import axios from 'axios'
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigation = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.post(
          '/mathly/verify-email',
          {},
          { params: { token } }
        )
        setStatus('success')
        setMessage(res.data.message)
      } catch (error) {
        setStatus('error')
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message ?? 'Something went wrong'
          : 'Something went wrong'
        setMessage(message)
      }
    }

    verify()
  }, [token])

  return (
    <div>
      <h1>Verify email</h1>

      {status === 'loading' && <p>Verifying your email...</p>}
      {status !== 'loading' && <p>{message}</p>}

      {status === 'success' && (
        <button className="border" onClick={() => navigation('/signin')}>
          Go to sign in
        </button>
      )}
    </div>
  )
}

export default VerifyEmail
