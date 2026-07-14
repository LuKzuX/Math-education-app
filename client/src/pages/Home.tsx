import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/authContext'
import { FaFire, FaHeart, FaMap, FaTrophy, FaMedal, FaUser, FaStar, FaTriangleExclamation } from 'react-icons/fa6'

interface UserStats {
  username: string
  total_xp: number
  streak: number
  lives: number
  user_level?: number
  avatar_url?: string | null
}

// Mirrors server/utils/calculateUserLevel.ts so we can show progress toward the next level.
const XP_THRESHOLDS = [
  30, 50, 70, 100, 150, 210, 280, 360, 450, 550,
  700, 880, 1090, 1330, 1600, 1900, 2230, 2590, 2980, 3400,
  3850, 4330, 4840, 5380, 5950, 6550, 7180, 7840, 8530, 9250, 10000,
]

function getLevelProgress(totalXp: number) {
  const prevThreshold = [0, ...XP_THRESHOLDS][
    XP_THRESHOLDS.filter((t) => totalXp >= t).length
  ] ?? 0
  const nextThreshold = XP_THRESHOLDS.find((t) => totalXp < t)
  if (nextThreshold === undefined) return { pct: 100, xpIntoLevel: totalXp - prevThreshold, xpForLevel: 0, maxed: true }
  const xpForLevel = nextThreshold - prevThreshold
  const xpIntoLevel = totalXp - prevThreshold
  return { pct: Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)), xpIntoLevel, xpForLevel, maxed: false }
}

function Home() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get('/mathly/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStats(data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const progress = getLevelProgress(stats?.total_xp ?? 0)
  const outOfLives = !loading && (stats?.lives ?? 0) <= 0

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 antialiased font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500;700&display=swap');
        .font-body    { font-family: 'Inter', system-ui, sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-data    { font-family: 'JetBrains Mono', monospace; }
        .glow-cyan:hover,   .glow-cyan:focus-visible   { box-shadow: 0 8px 32px -12px rgba(34,211,238,.55); }
        .glow-gold:hover,   .glow-gold:focus-visible   { box-shadow: 0 8px 32px -12px rgba(252,211,77,.55); }
        .glow-violet:hover, .glow-violet:focus-visible { box-shadow: 0 8px 32px -12px rgba(167,139,250,.55); }
        .glow-rose:hover,   .glow-rose:focus-visible   { box-shadow: 0 8px 32px -12px rgba(251,113,133,.55); }
        .bg-scene {
          background:
            radial-gradient(1200px 500px at 50% 115%, rgba(18,48,85,.27) 0%, transparent 70%),
            radial-gradient(800px 300px at 85% -10%, rgba(26,18,58,.2) 0%, transparent 70%),
            #020617;
        }
        @keyframes pulse-bg { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .skeleton { animation: pulse-bg 1.4s ease-in-out infinite; }
      `}</style>

      <div className="bg-scene min-h-screen flex flex-col">
        {/* ---------- HUD ---------- */}
        <header className="h-14 md:h-16 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/40 backdrop-blur">
          <div className="font-display font-bold text-base md:text-lg tracking-wide">
            Math<span className="text-cyan-400">ly</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-7">
            <div className="flex items-baseline gap-2">
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-widest text-slate-600">Level</span>
              <span className="font-data font-bold text-sm tabular-nums text-violet-400 inline-flex items-center gap-1.5">
                <FaStar className="w-3.5 h-3.5" /> {loading ? '—' : stats?.user_level ?? 0}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-widest text-slate-600">XP</span>
              <span className="font-data font-bold text-sm tabular-nums text-cyan-400">
                {loading ? '—' : (stats?.total_xp ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-widest text-slate-600">Streak</span>
              <span className="font-data font-bold text-sm tabular-nums text-orange-400 inline-flex items-center gap-1.5">
                <FaFire className="w-3.5 h-3.5" /> {loading ? '—' : stats?.streak ?? 0}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-widest text-slate-600">Lives</span>
              <span className={`font-data font-bold text-sm tabular-nums inline-flex items-center gap-1.5 ${outOfLives ? 'text-rose-500' : 'text-rose-400'}`}>
                <FaHeart className="w-3.5 h-3.5" /> {loading ? '—' : stats?.lives ?? 0}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center bg-rose-400/10 border border-rose-400/30 overflow-hidden hover:border-rose-400 transition-colors"
              title="Go to profile"
            >
              {stats?.avatar_url ? (
                <img src={stats.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-400" />
              )}
            </button>
          </div>
        </header>

        {/* ---------- Hub ---------- */}
        <main className="flex-1 flex flex-col justify-start md:justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
          {/* Welcome */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2 md:mb-3 font-data text-[11px] font-medium uppercase tracking-widest text-cyan-400">
              Main menu
              <span className="h-px w-16 bg-gradient-to-r from-cyan-400 to-transparent" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-5xl tracking-tight">
              Welcome back{user?.username ? `, ${user.username}` : ''}
            </h1>
            <p className="mt-2 md:mt-3 text-slate-400 text-sm md:text-[15px]">
              Pick up where you left off, or check your standings.
            </p>

            {/* Level progress */}
            {!loading && stats && (
              <div className="mt-5 md:mt-6 max-w-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-data text-[11px] font-bold uppercase tracking-widest text-violet-400">
                    Level {stats.user_level ?? 0}
                  </span>
                  <span className="font-data text-[11px] text-slate-500 tabular-nums">
                    {progress.maxed ? 'Max level' : `${progress.xpIntoLevel} / ${progress.xpForLevel} XP`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-300 transition-all duration-500"
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Out of lives warning */}
            {outOfLives && (
              <div className="mt-5 md:mt-6 max-w-lg flex items-start gap-2.5 rounded-lg border border-rose-900/60 bg-rose-950/30 px-4 py-3">
                <FaTriangleExclamation className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                <p className="text-[13px] text-rose-300">
                  You're out of lives. Wait for them to refill, or keep practicing to earn more.
                </p>
              </div>
            )}
          </div>

          {/* Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Paths — primary tile */}
            <button
              type="button"
              onClick={() => navigate('/paths')}
              className="glow-cyan group relative md:col-span-3 min-h-36 md:min-h-56 flex flex-col justify-end gap-1 md:gap-1.5 p-5 pl-7 md:p-7 md:pl-9 text-left overflow-hidden rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 focus-visible:outline-none focus-visible:-translate-y-0.5 focus-visible:border-cyan-400 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-cyan-400 transition-all duration-200 group-hover:w-2 group-focus-visible:w-2 motion-reduce:transition-none" />

              <FaMap className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2 text-cyan-400" />
              <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">Paths</h2>
              <p className="text-[13px] text-slate-400">Choose a track and climb its skill tree.</p>
              <span className="font-data text-[11px] font-bold uppercase tracking-widest text-cyan-400 mt-2 md:mt-3 md:opacity-0 md:-translate-x-1.5 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none">
                Enter {">"}
              </span>
            </button>

            {/* Leaderboard */}
            <button
              type="button"
              onClick={() => navigate('/leaderboard')}
              className="glow-gold group relative min-h-28 md:min-h-40 flex flex-col justify-end gap-1 md:gap-1.5 p-5 pl-7 md:p-7 md:pl-9 text-left overflow-hidden rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 focus-visible:outline-none focus-visible:-translate-y-0.5 focus-visible:border-amber-300 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-amber-300 transition-all duration-200 group-hover:w-2 group-focus-visible:w-2 motion-reduce:transition-none" />
              <FaTrophy className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2 text-amber-300" />
              <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">Leaderboard</h2>
              <p className="text-[13px] text-slate-400">View top users.</p>
              <span className="font-data text-[11px] font-bold uppercase tracking-widest text-amber-300 mt-2 md:mt-3 md:opacity-0 md:-translate-x-1.5 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none">
                Enter {">"}
              </span>
            </button>

            {/* Achievements */}
            <button
              type="button"
              onClick={() => navigate('/achievements')}
              className="glow-violet group relative min-h-28 md:min-h-40 flex flex-col justify-end gap-1 md:gap-1.5 p-5 pl-7 md:p-7 md:pl-9 text-left overflow-hidden rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400 focus-visible:outline-none focus-visible:-translate-y-0.5 focus-visible:border-violet-400 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-violet-400 transition-all duration-200 group-hover:w-2 group-focus-visible:w-2 motion-reduce:transition-none" />
              <FaMedal className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2 text-violet-400" />
              <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">Achievements</h2>
              <p className="text-[13px] text-slate-400">Medals and milestones.</p>
              <span className="font-data text-[11px] font-bold uppercase tracking-widest text-violet-400 mt-2 md:mt-3 md:opacity-0 md:-translate-x-1.5 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none">
                Enter {">"}
              </span>
            </button>

            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="glow-rose group relative min-h-28 md:min-h-40 flex flex-col justify-end gap-1 md:gap-1.5 p-5 pl-7 md:p-7 md:pl-9 text-left overflow-hidden rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-rose-400 focus-visible:outline-none focus-visible:-translate-y-0.5 focus-visible:border-rose-400 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-rose-400 transition-all duration-200 group-hover:w-2 group-focus-visible:w-2 motion-reduce:transition-none" />
              <FaUser className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-2 text-rose-400" />
              <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">Profile</h2>
              <p className="text-[13px] text-slate-400">Your stats and settings.</p>
              <span className="font-data text-[11px] font-bold uppercase tracking-widest text-rose-400 mt-2 md:mt-3 md:opacity-0 md:-translate-x-1.5 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none">
                Enter {">"}
              </span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home
