import { useEffect, useState } from 'react'
import axios from 'axios'

interface UserStats {
  username: string
  total_xp: number
  streak: number
  lives: number
}

function Home() {
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get('/mathly/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStats(data)
      } catch (error) {
        console.log(error)
      }
    }
    getUser()
  }, [])

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
      `}</style>

      <div className="bg-scene min-h-screen flex flex-col">
        {/* ---------- HUD ---------- */}
        <header className="h-14 md:h-16 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/40 backdrop-blur">
          <div className="font-display font-bold text-base md:text-lg tracking-wide">
            Math<span className="text-cyan-400">ly</span>
          </div>

          <div className="flex gap-4 sm:gap-7">
            <div className="flex items-baseline gap-2">
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-widest text-slate-600">XP</span>
              <span className="font-data font-bold text-sm tabular-nums text-cyan-400">{(stats?.total_xp ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-widest text-slate-600">Streak</span>
              <span className="font-data font-bold text-sm tabular-nums text-orange-400">🔥 {stats?.streak ?? 0}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-widest text-slate-600">Lives</span>
              <span className="font-data font-bold text-sm tabular-nums text-rose-400">♥ {stats?.lives ?? 0}</span>
            </div>
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
              Welcome back{stats?.username ? `, ${stats.username}` : ''}
            </h1>
            <p className="mt-2 md:mt-3 text-slate-400 text-sm md:text-[15px]">
              Pick up where you left off, or check your standings.
            </p>
          </div>

          {/* Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Paths — primary tile */}
            <button
              type="button"
              className="glow-cyan group relative md:col-span-3 min-h-36 md:min-h-56 flex flex-col justify-end gap-1 md:gap-1.5 p-5 pl-7 md:p-7 md:pl-9 text-left overflow-hidden rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 focus-visible:outline-none focus-visible:-translate-y-0.5 focus-visible:border-cyan-400 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-cyan-400 transition-all duration-200 group-hover:w-2 group-focus-visible:w-2 motion-reduce:transition-none" />

              <span className="text-xl md:text-2xl mb-1 md:mb-2">🗺️</span>
              <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">Paths</h2>
              <p className="text-[13px] text-slate-400">Choose a track and climb its skill tree.</p>
              <span className="font-data text-[11px] font-bold uppercase tracking-widest text-cyan-400 mt-2 md:mt-3 md:opacity-0 md:-translate-x-1.5 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none">
                Enter {">"} 
              </span>
            </button>

            {/* Leaderboard */}
            <button
              type="button"
              className="glow-gold group relative min-h-28 md:min-h-40 flex flex-col justify-end gap-1 md:gap-1.5 p-5 pl-7 md:p-7 md:pl-9 text-left overflow-hidden rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 focus-visible:outline-none focus-visible:-translate-y-0.5 focus-visible:border-amber-300 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-amber-300 transition-all duration-200 group-hover:w-2 group-focus-visible:w-2 motion-reduce:transition-none" />
              <span className="text-xl md:text-2xl mb-1 md:mb-2">🏆</span>
              <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">Leaderboard</h2>
              <p className="text-[13px] text-slate-400">View top users.</p>
              <span className="font-data text-[11px] font-bold uppercase tracking-widest text-amber-300 mt-2 md:mt-3 md:opacity-0 md:-translate-x-1.5 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none">
                Enter {">"} 
              </span>
            </button>

            {/* Achievements */}
            <button
              type="button"
              className="glow-violet group relative min-h-28 md:min-h-40 flex flex-col justify-end gap-1 md:gap-1.5 p-5 pl-7 md:p-7 md:pl-9 text-left overflow-hidden rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400 focus-visible:outline-none focus-visible:-translate-y-0.5 focus-visible:border-violet-400 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-violet-400 transition-all duration-200 group-hover:w-2 group-focus-visible:w-2 motion-reduce:transition-none" />
              <span className="text-xl md:text-2xl mb-1 md:mb-2">🎖️</span>
              <h2 className="font-display font-bold text-lg md:text-xl tracking-tight">Achievements</h2>
              <p className="text-[13px] text-slate-400">Medals and milestones.</p>
              <span className="font-data text-[11px] font-bold uppercase tracking-widest text-violet-400 mt-2 md:mt-3 md:opacity-0 md:-translate-x-1.5 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 motion-reduce:transition-none">
                Enter {">"} 
              </span>
            </button>

            {/* Profile */}
            <button
              type="button"
              className="glow-rose group relative min-h-28 md:min-h-40 flex flex-col justify-end gap-1 md:gap-1.5 p-5 pl-7 md:p-7 md:pl-9 text-left overflow-hidden rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-rose-400 focus-visible:outline-none focus-visible:-translate-y-0.5 focus-visible:border-rose-400 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-rose-400 transition-all duration-200 group-hover:w-2 group-focus-visible:w-2 motion-reduce:transition-none" />
              <span className="text-xl md:text-2xl mb-1 md:mb-2">👤</span>
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
