import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/authContext"
import { FaMedal, FaLock } from "react-icons/fa6"

interface Achievement {
  achievement_id: string
  title: string
  description: string
  xp_earned: number
  icon_url?: string | null
}

interface UserAchievement {
  achievement_id: string
  earned_at: string
  achievements: Achievement
}

function Achievements() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [earned, setEarned] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const getData = async () => {
      try {
        const token = localStorage.getItem("token")
        const [allRes, userRes] = await Promise.all([
          axios.get("/mathly/achievements"),
          axios.get("/mathly/user/achievements", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setAchievements(allRes.data ?? [])
        setEarned(userRes.data ?? [])
        setFetchError(null)
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.error ?? "Failed to load achievements"
          : "Failed to load achievements"
        setFetchError(message)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  const earnedIds = new Set(earned.map((e) => e.achievement_id))
  const earnedAt = new Map(earned.map((e) => [e.achievement_id, e.earned_at]))

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
        .badge-glow:hover, .badge-glow:focus-visible {
          box-shadow: 0 8px 32px -12px rgba(167,139,250,.45);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
      `}</style>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* Back link */}
        <button
          onClick={() => navigate("/menu")}
          className="inline-block font-data text-[11px] tracking-[0.25em] uppercase text-slate-500 hover:text-cyan-400 transition-colors mb-6"
        >
          « Main menu
        </button>

        {/* Header */}
        <header className="mb-8 md:mb-12">
          <p className="font-data text-[11px] tracking-[0.25em] uppercase text-violet-400/70 mb-2">
            Medals &amp; milestones
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-50 tracking-tight inline-flex items-center gap-3">
            <FaMedal className="w-7 h-7 md:w-8 md:h-8 text-violet-400" /> Achievements
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md">
            {user?.username ? `${earned.length} of ${achievements.length} unlocked.` : "Track your progress."}
          </p>
        </header>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <svg className="spinner w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="font-data text-[11px] tracking-[0.25em] uppercase text-slate-500">
              Loading achievements…
            </p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-6 py-8 text-center">
            <p className="font-display font-bold text-lg text-rose-300 mb-2">Can't load achievements</p>
            <p className="text-sm text-slate-400">{fetchError}</p>
          </div>
        )}

        {!loading && !fetchError && achievements.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-10 text-center">
            <p className="text-sm text-slate-500">No achievements have been created yet.</p>
          </div>
        )}

        {!loading && !fetchError && achievements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {achievements.map((achievement) => {
              const isEarned = earnedIds.has(achievement.achievement_id)
              const date = earnedAt.get(achievement.achievement_id)
              return (
                <div
                  key={achievement.achievement_id}
                  className={`badge-glow relative flex flex-col gap-3 overflow-hidden rounded-xl border px-5 py-5 transition-all duration-200
                             ${isEarned
                      ? "border-violet-400/40 bg-violet-400/5"
                      : "border-slate-800 bg-slate-900/40"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border overflow-hidden
                                 ${isEarned
                          ? "bg-violet-400/10 border-violet-400/30"
                          : "bg-slate-800/60 border-slate-700"
                        }`}
                    >
                      {achievement.icon_url ? (
                        <img
                          src={achievement.icon_url}
                          alt=""
                          className={`w-7 h-7 object-contain ${isEarned ? "" : "grayscale opacity-40"}`}
                        />
                      ) : isEarned ? (
                        <FaMedal className="w-6 h-6 text-violet-300" />
                      ) : (
                        <FaLock className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className={`font-display font-bold text-base truncate ${isEarned ? "text-slate-100" : "text-slate-400"}`}>
                        {achievement.title}
                      </h2>
                      <p className="font-data text-[11px] tracking-widest uppercase text-amber-300/80">
                        +{achievement.xp_earned} XP
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{achievement.description}</p>
                  {isEarned && date && (
                    <p className="font-data text-[10px] tracking-widest uppercase text-violet-400/70 mt-auto">
                      Unlocked {new Date(date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Achievements
