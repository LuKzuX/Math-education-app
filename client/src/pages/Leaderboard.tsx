import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/authContext"
import { FaTrophy, FaFire, FaCrown } from "react-icons/fa6"

interface LeaderboardUser {
  id: string
  username: string
  total_xp: number
  streak: number
  avatar_url?: string | null
}

const rankStyles: Record<number, { color: string; label: string }> = {
  0: { color: "#fbbf24", label: "1st" },
  1: { color: "#cbd5e1", label: "2nd" },
  2: { color: "#fb923c", label: "3rd" },
}

function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        const { data } = await axios.get("/mathly/leaderboard")
        setUsers(data ?? [])
        setFetchError(null)
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.error ?? "Failed to load leaderboard"
          : "Failed to load leaderboard"
        setFetchError(message)
      } finally {
        setLoading(false)
      }
    }
    getLeaderboard()
  }, [])

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
        .rank-glow:hover, .rank-glow:focus-visible {
          box-shadow: 0 8px 32px -12px rgba(252,211,77,.35);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
      `}</style>

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* Back link */}
        <button
          onClick={() => navigate("/")}
          className="inline-block font-data text-[11px] tracking-[0.25em] uppercase text-slate-500 hover:text-cyan-400 transition-colors mb-6"
        >
          « Main menu
        </button>

        {/* Header */}
        <header className="mb-8 md:mb-12">
          <p className="font-data text-[11px] tracking-[0.25em] uppercase text-amber-300/70 mb-2">
            Standings
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-50 tracking-tight inline-flex items-center gap-3">
            <FaTrophy className="w-7 h-7 md:w-8 md:h-8 text-amber-300" /> Leaderboard
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md">
            Ranked by total XP across every path.
          </p>
        </header>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <svg className="spinner w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="font-data text-[11px] tracking-[0.25em] uppercase text-slate-500">
              Loading standings…
            </p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-6 py-8 text-center">
            <p className="font-display font-bold text-lg text-rose-300 mb-2">Can't load the leaderboard</p>
            <p className="text-sm text-slate-400">{fetchError}</p>
          </div>
        )}

        {!loading && !fetchError && users.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-center">
            <p className="text-sm text-slate-500">No ranked users yet.</p>
          </div>
        )}

        {!loading && !fetchError && users.length > 0 && (
          <div className="flex flex-col gap-2.5 md:gap-3">
            {users.map((entry, i) => {
              const isSelf = user?.id === entry.id
              const rank = rankStyles[i]
              return (
                <div
                  key={entry.id}
                  style={rank ? ({ "--pc": rank.color } as React.CSSProperties) : undefined}
                  className={`rank-glow relative flex items-center gap-4 md:gap-6 overflow-hidden
                             rounded-xl border px-4 sm:px-6 py-3.5 sm:py-4 transition-all duration-200
                             ${isSelf
                      ? "border-cyan-400/70 bg-cyan-400/5"
                      : "border-slate-800 bg-slate-900/60 backdrop-blur-sm"
                    }`}
                >
                  {rank && (
                    <span
                      className="absolute left-0 top-0 h-full w-1 -skew-x-12 origin-top"
                      style={{ background: rank.color }}
                    />
                  )}

                  {/* Rank */}
                  <span
                    className="shrink-0 w-10 md:w-12 text-right font-data text-lg md:text-xl font-bold select-none inline-flex items-center justify-end gap-1"
                    style={{ color: rank?.color ?? "#475569" }}
                  >
                    {i === 0 && <FaCrown className="w-4 h-4" />}
                    {i + 1}
                  </span>

                  {/* Avatar */}
                  <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                                  bg-slate-800/80 border border-slate-700 overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display font-bold text-sm text-slate-300">
                        {entry.username?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-bold text-base md:text-lg text-slate-100 truncate">
                      {entry.username}
                      {isSelf && (
                        <span className="ml-2 font-data text-[10px] tracking-widest uppercase text-cyan-400">
                          You
                        </span>
                      )}
                    </h2>
                    <p className="mt-0.5 font-data text-xs text-orange-400 inline-flex items-center gap-1.5">
                      <FaFire className="w-3 h-3" /> {entry.streak ?? 0} streak
                    </p>
                  </div>

                  {/* XP */}
                  <div className="shrink-0 text-right">
                    <p className="font-data font-bold text-base md:text-lg tabular-nums text-cyan-400">
                      {(entry.total_xp ?? 0).toLocaleString()}
                    </p>
                    <p className="font-data text-[10px] tracking-widest uppercase text-slate-600">XP</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Leaderboard
