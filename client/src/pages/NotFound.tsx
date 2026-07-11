import { useNavigate } from "react-router-dom"
import { FaCompass } from "react-icons/fa6"

function NotFound() {
  const navigate = useNavigate()

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

      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-400/10 border border-cyan-400/30 mb-5">
          <FaCompass className="w-7 h-7 text-cyan-400" />
        </div>
        <p className="font-data text-[11px] tracking-[0.25em] uppercase text-cyan-400/70 mb-2">
          Error 404
        </p>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-50 tracking-tight mb-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          This path doesn't exist, or you've taken a wrong turn.
        </p>
        <button
          onClick={() => navigate("/menu")}
          className="font-data text-[12px] tracking-widest uppercase text-slate-950 bg-cyan-400
                     rounded-lg px-5 py-2.5 hover:bg-cyan-300 transition-colors"
        >
          Back to main menu
        </button>
      </div>
    </div>
  )
}

export default NotFound
