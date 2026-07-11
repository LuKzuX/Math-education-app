import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/authContext"

interface Challenge {
  challenge_id: string
  topic_id: string
  title: string
  challenge_text: string
  difficulty: string
  order: number
  gold_time_sec: number
  silver_time_sec: number
  xp_gold: number
  xp_silver: number
  xp_bronze: number
}

const difficultyStyles: Record<string, { color: string; label: string }> = {
  easy: { color: "#22d3ee", label: "Easy" },
  medium: { color: "#fbbf24", label: "Medium" },
  hard: { color: "#fb7185", label: "Hard" },
}

const medalStyles: Record<string, { color: string; label: string; icon: string }> = {
  gold: { color: "#fbbf24", label: "Gold", icon: "🥇" },
  silver: { color: "#cbd5e1", label: "Silver", icon: "🥈" },
  bronze: { color: "#fb923c", label: "Bronze", icon: "🥉" },
}

interface Attempt {
  challenge_id: string
  medal_earned: "gold" | "silver" | "bronze"
}

function TopicChallenges() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [medalsByChallenge, setMedalsByChallenge] = useState<Record<string, Attempt["medal_earned"]>>({})

  useEffect(() => {
    const getChallenges = async () => {
      try {
        const { data } = await axios.get(`/mathly/topics/${topicId}/challenges`)
        setChallenges(data)
      } catch (error) {
        console.log(error)
      }
    }
    getChallenges()
  }, [topicId])

  useEffect(() => {
    if (!user) return
    const getUserAttempts = async () => {
      try {
        const token = localStorage.getItem("token")
        const { data } = await axios.get<Attempt[]>("/mathly/user-attempts", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const medals = data.reduce((acc, attempt) => {
          acc[attempt.challenge_id] = attempt.medal_earned
          return acc
        }, {} as Record<string, Attempt["medal_earned"]>)
        setMedalsByChallenge(medals)
      } catch (error) {
        console.log(error)
      }
    }
    getUserAttempts()
  }, [user])

  return (
    <div className="min-h-screen bg-scene text-slate-200 antialiased font-body">
      {/*
        Same helpers as PathTopics — if a shared layout already defines these,
        delete this block.
      */}
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
        .challenge-glow:hover, .challenge-glow:focus-visible {
          box-shadow: 0 8px 32px -12px rgba(34,211,238,.45);
        }
      `}</style>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-block font-data text-[11px] tracking-[0.25em] uppercase text-slate-500 hover:text-cyan-400 transition-colors mb-6"
        >
          « Topics
        </button>

        {/* Header */}
        <header className="mb-8 md:mb-12">
          <p className="font-data text-[11px] tracking-[0.25em] uppercase text-cyan-400/70 mb-2">
            Challenges
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-50 tracking-tight">
            Challenges
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md">
            Solve challenges in order. Faster solves earn better medals.
          </p>
        </header>

        {/* Challenge list */}
        <div className="flex flex-col gap-3">
          {user?.is_admin && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/admin/topics/${topicId}/challenges`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/admin/topics/${topicId}/challenges`)}
              className="challenge-glow group relative flex items-center gap-4 md:gap-6 overflow-hidden
                        rounded-xl border border-dashed border-slate-700 bg-slate-900/40 backdrop-blur-sm
                        px-4 sm:px-6 py-4 sm:py-5 cursor-pointer transition-all duration-200
                        hover:border-slate-400 focus-visible:border-slate-400
                        focus-visible:outline-none"
            >
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center
                              bg-slate-800/60 border border-slate-700 text-2xl">
                +
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold text-base md:text-lg text-slate-100">
                  Manage challenges
                </h2>
                <p className="mt-0.5 text-xs md:text-sm text-slate-500">
                  Admin — manage challenges
                </p>
              </div>
              <span className="shrink-0 font-data text-[11px] tracking-widest uppercase text-slate-400">
                Manage »
              </span>
            </div>
          )}
          {challenges.map((challenge, i) => {
            const { color, label } = difficultyStyles[challenge.difficulty] ?? {
              color: "#22d3ee",
              label: challenge.difficulty,
            }
            const medal = medalsByChallenge[challenge.challenge_id]
            const medalStyle = medal ? medalStyles[medal] : undefined
            return (
              <div
                key={challenge.challenge_id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/challenges/${challenge.challenge_id}`)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/challenges/${challenge.challenge_id}`)}
                style={{ "--pc": color } as React.CSSProperties}
                className="challenge-glow group relative flex items-center gap-4 md:gap-6 overflow-hidden
                         rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm
                         px-4 sm:px-6 py-4 sm:py-5 cursor-pointer transition-all duration-200
                         hover:border-[color:var(--pc)] focus-visible:border-[color:var(--pc)]
                         focus-visible:outline-none"
              >
                {/* Skewed accent blade */}
                <span
                  className="absolute left-0 top-0 h-full w-1 -skew-x-12 origin-top
                           bg-[color:var(--pc)] transition-all duration-200
                           group-hover:w-2 group-focus-visible:w-2"
                />

                {/* Ghost index */}
                <span className="hidden sm:block font-data text-4xl md:text-5xl font-bold text-slate-800 select-none w-14 md:w-16 text-right shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Difficulty badge */}
                <div
                  className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center
                           bg-[color-mix(in_srgb,var(--pc)_12%,transparent)]
                           border border-[color-mix(in_srgb,var(--pc)_25%,transparent)]"
                >
                  <span className="font-data text-[10px] font-bold uppercase text-[color:var(--pc)]">
                    {label.slice(0, 3)}
                  </span>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <h2
                    className={`font-display font-bold text-base md:text-lg transition-colors flex items-center gap-2 ${
                      medalStyle ? "" : "text-slate-100 group-hover:text-[color:var(--pc)]"
                    }`}
                    style={medalStyle ? { color: medalStyle.color } : undefined}
                  >
                    {challenge.title}
                    {medalStyle && (
                      <span
                        title={`${medalStyle.label} medal earned`}
                        className="inline-flex items-center gap-1 font-data text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: medalStyle.color }}
                      >
                        <span aria-hidden="true">{medalStyle.icon}</span>
                        {medalStyle.label}
                      </span>
                    )}
                  </h2>
                  <p className="mt-0.5 text-xs md:text-sm text-slate-500 line-clamp-2">
                    {label} · Gold ≤{challenge.gold_time_sec}s · Silver ≤{challenge.silver_time_sec}s
                  </p>
                </div>

                {/* Admin edit button */}
                {user?.is_admin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin/topics/${topicId}/challenges/${challenge.challenge_id}/edit`)
                    }}
                    className="shrink-0 font-data text-[11px] tracking-widest uppercase text-slate-400
                             border border-slate-700 rounded-md px-2.5 py-1
                             hover:text-cyan-300 hover:border-cyan-400/60 transition-colors"
                  >
                    Edit
                  </button>
                )}

                {/* CTA */}
                <span
                  className="shrink-0 font-data text-[11px] tracking-widest uppercase text-[color:var(--pc)]
                           opacity-100 translate-x-0
                           md:opacity-0 md:-translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0
                           md:group-focus-visible:opacity-100 md:group-focus-visible:translate-x-0
                           transition-all duration-200"
                >
                  Start »
                </span>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  );
}

export default TopicChallenges
