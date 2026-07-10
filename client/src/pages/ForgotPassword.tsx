import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaKey } from "react-icons/fa6"

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      const res = await axios.post('/mathly/forgot-password', { email })
      setMessage(res.data.message)
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Something went wrong'
        : 'Something went wrong'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

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
      `}</style>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 mb-4">
            <FaKey className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-50 tracking-tight">
            Forgot password
          </h1>
          <p className="mt-1 text-sm text-slate-500">We'll email you a reset link.</p>
        </div>

        {message ? (
          <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 px-6 py-8 text-center">
            <p className="text-sm text-slate-300">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm px-6 py-6 space-y-4">
            <div>
              <label className="block font-data text-[10px] tracking-widest uppercase text-slate-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              type="submit"
              disabled={!email || submitting}
              className="w-full font-data text-[12px] tracking-widest uppercase text-slate-950 bg-cyan-400
                         rounded-lg px-4 py-3 hover:bg-cyan-300 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
