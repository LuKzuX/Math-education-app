import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { FaGraduationCap, FaMap, FaTrophy, FaMedal, FaBolt } from 'react-icons/fa6'

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

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
        .bg-scene {
          background:
            radial-gradient(1200px 500px at 50% 115%, rgba(18,48,85,.27) 0%, transparent 70%),
            radial-gradient(800px 300px at 85% -10%, rgba(26,18,58,.2) 0%, transparent 70%),
            #020617;
        }
      `}</style>

      <div className="bg-scene min-h-screen flex flex-col">
        {/* ---------- Nav ---------- */}
        <header className="h-14 md:h-16 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/40 backdrop-blur">
          <div className="font-display font-bold text-base md:text-lg tracking-wide">
            Math<span className="text-cyan-400">ly</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="font-data text-[11px] tracking-widest uppercase text-slate-950 bg-cyan-400
                           rounded-lg px-4 py-2 hover:bg-cyan-300 transition-colors"
              >
                Continue
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="font-data text-[11px] tracking-widest uppercase text-slate-300
                             rounded-lg px-3 py-2 hover:text-cyan-400 transition-colors"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="font-data text-[11px] tracking-widest uppercase text-slate-950 bg-cyan-400
                             rounded-lg px-4 py-2 hover:bg-cyan-300 transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </header>

        {/* ---------- Hero ---------- */}
        <main className="flex-1 flex flex-col justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-400/10 border border-cyan-400/30 mb-5">
              <FaGraduationCap className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="flex items-center justify-center gap-3 mb-3 font-data text-[11px] font-medium uppercase tracking-widest text-cyan-400">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-cyan-400" />
              Learn math by doing
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-400" />
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-slate-50">
              Turn practice into progress
            </h1>
            <p className="mt-4 text-slate-400 text-sm md:text-base">
              Work through structured paths, earn medals for speed and accuracy, and climb the
              leaderboard, one challenge at a time.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(user ? '/menu' : '/signup')}
                className="w-full sm:w-auto font-data text-[12px] tracking-widest uppercase text-slate-950 bg-cyan-400
                           rounded-lg px-6 py-3 hover:bg-cyan-300 transition-colors"
              >
                {user ? 'Continue to menu' : 'Get started'}
              </button>
              {!user && (
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="w-full sm:w-auto font-data text-[12px] tracking-widest uppercase text-slate-300
                             border border-slate-700 rounded-lg px-6 py-3 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                >
                  I already have an account
                </button>
              )}
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glow-cyan group relative p-5 pl-7 md:p-7 md:pl-9 rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400">
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-cyan-400 transition-all duration-200 group-hover:w-2" />
              <FaMap className="w-5 h-5 md:w-6 md:h-6 mb-2 text-cyan-400" />
              <h2 className="font-display font-bold text-lg tracking-tight">Guided paths</h2>
              <p className="mt-1 text-[13px] text-slate-400">
                Follow a skill tree built around topics, not random drills.
              </p>
            </div>

            <div className="glow-gold group relative p-5 pl-7 md:p-7 md:pl-9 rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-amber-300">
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-amber-300 transition-all duration-200 group-hover:w-2" />
              <FaBolt className="w-5 h-5 md:w-6 md:h-6 mb-2 text-amber-300" />
              <h2 className="font-display font-bold text-lg tracking-tight">Timed challenges</h2>
              <p className="mt-1 text-[13px] text-slate-400">
                Race the clock for gold, silver, or bronze on every problem.
              </p>
            </div>

            <div className="glow-violet group relative p-5 pl-7 md:p-7 md:pl-9 rounded bg-slate-900 border border-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400">
              <span className="absolute inset-y-0 left-0 w-1 -skew-x-12 bg-violet-400 transition-all duration-200 group-hover:w-2" />
              <FaTrophy className="w-5 h-5 md:w-6 md:h-6 mb-2 text-violet-400" />
              <h2 className="font-display font-bold text-lg tracking-tight">Leaderboard &amp; medals</h2>
              <p className="mt-1 text-[13px] text-slate-400 inline-flex items-start gap-1.5">
                <FaMedal className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-400" />
                Compete for XP and unlock achievements as you go.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Landing
