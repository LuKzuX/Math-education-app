import axios from 'axios'
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6'

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
    <div className="min-h-screen bg-scene text-slate-200 antialiased font-body flex items-center justify-center px-4 py-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500;700&display=swap');
        .font-body    { font-family: 'Inter', system-ui, sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-data    { font-family: 'JetBrains Mono', monospace; }
        .bg-scene {
          background:
            radial-gradient(1200px 500px at 50% 115%, rgba(18,48,85,.27) 0%, transparent 70%),
            radial-gradient(800px 300px at 85% -10%, rgba(26,18,58,.2) 0%, transparent 70%),
            #020617;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <svg className="spinner w-8 h-8 text-cyan-400 mx-auto mb-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <h1 className="font-display font-bold text-xl text-slate-100 mb-1">Verifying your email</h1>
            <p className="text-sm text-slate-500">This will just take a moment…</p>
          </>
        )}

        {status === 'success' && (
          <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 px-6 py-8">
            <FaCircleCheck className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h1 className="font-display font-bold text-xl text-emerald-300 mb-2">Email verified</h1>
            <p className="text-sm text-slate-400 mb-6">{message}</p>
            <button
              onClick={() => navigation('/signin')}
              className="font-data text-[12px] tracking-widest uppercase text-cyan-400 border border-cyan-400/40 rounded-lg px-5 py-2.5 hover:bg-cyan-400/10 transition-colors"
            >
              Go to sign in
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-6 py-8">
            <FaCircleXmark className="w-10 h-10 text-rose-400 mx-auto mb-4" />
            <h1 className="font-display font-bold text-xl text-rose-300 mb-2">Verification failed</h1>
            <p className="text-sm text-slate-400">{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
