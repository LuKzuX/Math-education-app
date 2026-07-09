import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { FaStopwatch, FaMedal, FaLightbulb, FaFire, FaHeart } from "react-icons/fa6"

interface Challenge {
  challenge_id: string
  text: string
  variables: number[]
  alternatives: Record<string, (number | string)[]>[]
  title: string
  difficulty: string
  gold_time_sec: number
  silver_time_sec: number
  xp_gold: number
  xp_silver: number
  xp_bronze: number
  hint_text: string
}

interface SubmitResult {
  correct: boolean
  total_xp?: number
  streak?: number
  lives?: number
  medal?: "gold" | "silver" | "bronze"
  xp_earned?: number
}

const difficultyStyles: Record<string, { color: string; label: string }> = {
  easy: { color: "#22d3ee", label: "Easy" },
  medium: { color: "#fbbf24", label: "Medium" },
  hard: { color: "#fb7185", label: "Hard" },
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function ChallengePlay() {
  const { challengeId } = useParams()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  const [hintShown, setHintShown] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const startRef = useRef<number>(0)

  const [fetchTrigger, setFetchTrigger] = useState(0)

  const retry = () => {
    setLoading(true)
    setFetchTrigger((t) => t + 1)
  }

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem("token")
    ;(async () => {
      try {
        const { data } = await axios.get(`/mathly/challenges/${challengeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return
        setChallenge(data)
        setFetchError(null)
        setSelected(null)
        setResult(null)
        setHintShown(false)
        setElapsedSec(0)
        startRef.current = Date.now()
      } catch (error) {
        if (cancelled) return
        const message = axios.isAxiosError(error)
          ? error.response?.data?.error ?? "Failed to load challenge"
          : "Failed to load challenge"
        setFetchError(message)
        setChallenge(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [challengeId, fetchTrigger])

  useEffect(() => {
    if (loading || result) return
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [loading, result])

  const handleAnswer = async (letter: string) => {
    if (submitting || result) return
    setSelected(letter)
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.post(
        `/mathly/challenges/${challengeId}/submit`,
        { user_answer: letter, hint_used: hintShown },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setResult({
        correct: data.correct,
        total_xp: data.total_xp,
        streak: data.streak,
        lives: data.lives,
        medal: data.medal,
        xp_earned: data.xp_earned,
      })
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ?? "Failed to submit answer"
        : "Failed to submit answer"
      setFetchError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const medal = result?.correct ? result.medal ?? null : null

  const medalStyles: Record<string, { color: string; label: string }> = {
    gold: { color: "#fbbf24", label: "Gold" },
    silver: { color: "#cbd5e1", label: "Silver" },
    bronze: { color: "#fb923c", label: "Bronze" },
  }

  return (
    <div className="min-h-screen bg-scene text-slate-200 antialiased font-body">
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
        .answer-glow:hover, .answer-glow:focus-visible {
          box-shadow: 0 8px 32px -12px rgba(34,211,238,.45);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-block font-data text-[11px] tracking-[0.25em] uppercase text-slate-500 hover:text-cyan-400 transition-colors mb-6"
        >
          « Back
        </button>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <svg className="spinner w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="font-data text-[11px] tracking-[0.25em] uppercase text-slate-500">
              Loading challenge…
            </p>
          </div>
        )}

        {!loading && fetchError && !challenge && (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-6 py-8 text-center">
            <p className="font-display font-bold text-lg text-rose-300 mb-2">Can't load this challenge</p>
            <p className="text-sm text-slate-400 mb-6">{fetchError}</p>
            <button
              onClick={retry}
              className="font-data text-[11px] tracking-widest uppercase text-cyan-400 border border-cyan-400/40 rounded-lg px-4 py-2 hover:bg-cyan-400/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && challenge && (
          <>
            {(() => {
              const { color, label } = difficultyStyles[challenge.difficulty] ?? {
                color: "#22d3ee",
                label: challenge.difficulty,
              }
              return (
                <header className="mb-8" style={{ "--pc": color } as React.CSSProperties}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-data text-[11px] tracking-[0.25em] uppercase text-[color:var(--pc)]">
                      {label}
                    </p>
                    {!result && (
                      <div className="text-right">
                        <p className="font-data text-sm tabular-nums text-slate-400 inline-flex items-center gap-1.5">
                          <FaStopwatch className="w-3.5 h-3.5" /> {formatTime(elapsedSec)}
                        </p>
                        <div className="mt-1 flex items-center justify-end gap-2 font-data text-[10px] tabular-nums text-slate-500">
                          <span className="inline-flex items-center gap-1" style={{ color: medalStyles.gold.color }}>
                            <FaMedal /> {formatTime(challenge.gold_time_sec)}
                          </span>
                          <span className="inline-flex items-center gap-1" style={{ color: medalStyles.silver.color }}>
                            <FaMedal /> {formatTime(challenge.silver_time_sec)}
                          </span>
                          <span className="inline-flex items-center gap-1" style={{ color: medalStyles.bronze.color }}>
                            <FaMedal /> {formatTime(challenge.silver_time_sec)}+
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-50 tracking-tight">
                    {challenge.title}
                  </h1>
                </header>
              )
            })()}

            {/* Question */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm px-6 py-8 mb-6 text-center">
              <p className="font-display text-xl md:text-2xl text-slate-100">{challenge.text}</p>
            </div>

            {/* Answers */}
            {!result && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {challenge.alternatives.map((alt, i) => {
                  const [letter, value] = Object.entries(alt)[0]
                  const isSelected = selected === letter
                  return (
                    <button
                      key={i}
                      disabled={submitting}
                      onClick={() => handleAnswer(letter)}
                      className={`answer-glow group relative flex items-center gap-3 overflow-hidden
                                rounded-xl border px-4 py-4 text-left transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${isSelected
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-slate-800 bg-slate-900/60 hover:border-cyan-400/60"
                        }`}
                    >
                      <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/80 border border-slate-700 font-data text-xs font-bold uppercase text-cyan-400">
                        {letter}
                      </span>
                      <span className="font-data text-base text-slate-100">{value.join(", ")}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Hint */}
            {!result && challenge.hint_text && (
              <div className="mb-6">
                {hintShown ? (
                  <p className="text-sm text-amber-300/90 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-3 inline-flex items-center gap-2">
                    <FaLightbulb className="shrink-0" /> {challenge.hint_text}
                  </p>
                ) : (
                  <button
                    onClick={() => setHintShown(true)}
                    className="font-data text-[11px] tracking-widest uppercase text-slate-500 hover:text-amber-300 transition-colors"
                  >
                    Show hint
                  </button>
                )}
              </div>
            )}

            {fetchError && (
              <p className="text-sm text-rose-400 mb-4">{fetchError}</p>
            )}

            {/* Result */}
            {result && (
              <div
                className={`rounded-xl border px-6 py-8 text-center mb-6 ${result.correct
                    ? "border-emerald-800/60 bg-emerald-950/30"
                    : "border-rose-900/60 bg-rose-950/30"
                  }`}
              >
                {result.correct ? (
                  <>
                    <p className="font-display font-bold text-xl text-emerald-300 mb-1">Correct!</p>
                    {medal && (
                      <p
                        className="font-data text-[11px] tracking-[0.25em] uppercase mb-4"
                        style={{ color: medalStyles[medal].color }}
                      >
                        {medalStyles[medal].label} medal · {formatTime(elapsedSec)}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-6 font-data text-sm text-slate-300">
                      <span>+{result.xp_earned ?? 0} XP <span className="text-cyan-400 font-bold">({result.total_xp} total)</span></span>
                      <span>Streak <span className="text-orange-400 font-bold inline-flex items-center gap-1"><FaFire /> {result.streak}</span></span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-display font-bold text-xl text-rose-300 mb-1">Not quite</p>
                    <p className="text-sm text-slate-400 mb-4">That answer isn't correct.</p>
                    <p className="font-data text-sm text-slate-300">
                      Lives left <span className="text-rose-400 font-bold inline-flex items-center gap-1"><FaHeart /> {result.lives}</span>
                    </p>
                  </>
                )}
              </div>
            )}

            {result && (
              <button
                onClick={retry}
                disabled={result.lives === 0}
                className="w-full font-data text-[12px] tracking-widest uppercase text-cyan-400
                         border border-cyan-400/40 rounded-lg px-4 py-3 hover:bg-cyan-400/10
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                {result.lives === 0 ? "No lives remaining" : "Try again"}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ChallengePlay
