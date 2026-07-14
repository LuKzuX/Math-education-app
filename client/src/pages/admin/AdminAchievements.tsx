import axios from 'axios'
import { useEffect, useState } from 'react'

interface Achievement {
  achievement_id: string
  title: string
  description: string
  xp_earned: number
  icon_url?: string | null
}

function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [xpEarned, setXpEarned] = useState<number | "">("")
  const [icon, setIcon] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = async () => {
    try {
      const { data } = await axios.get("/mathly/achievements")
      setAchievements(data ?? [])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  const handleSubmit = async () => {
    if (!title || !description || xpEarned === "" || !icon) {
      setError("Please fill all fields and select an icon image")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('xp_earned', String(xpEarned))
      formData.append('achievement_icon', icon)

      const token = localStorage.getItem('token')
      await axios.post("/mathly/achievements", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setTitle("")
      setDescription("")
      setXpEarned("")
      setIcon(null)
      await fetchAchievements()
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? "Failed to create achievement"
        : "Failed to create achievement"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 sm:px-6 md:px-8 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header with skewed cyan blade */}
        <div className="relative pl-5 mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400 -skew-x-12" />
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Manage achievements
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create a new achievement medal</p>
        </div>

        {/* Form card */}
        <div className="bg-[#0f1629] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Gold Rush"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder="What does the user need to do to earn this?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              XP reward
            </label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={xpEarned}
              onChange={(e) => setXpEarned(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Icon image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIcon(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-400 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-cyan-400/10 file:text-cyan-300 file:text-xs file:font-medium file:uppercase file:tracking-wider hover:file:bg-cyan-400/20"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto mt-2 px-6 py-2.5 rounded-lg bg-cyan-400 text-[#0a0f1e] text-sm font-semibold font-['Space_Grotesk'] tracking-wide hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-[#0f1629] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating…" : "Create achievement"}
          </button>
        </div>

        {/* Existing achievements list */}
        <div className="mt-8">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-100 mb-3">
            Existing achievements
          </h2>
          {achievements.length === 0 ? (
            <p className="text-sm text-slate-500">No achievements created yet.</p>
          ) : (
            <div className="space-y-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.achievement_id}
                  className="flex items-center gap-4 bg-[#0f1629] border border-slate-800 rounded-lg px-4 py-3"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800/60 border border-slate-700 overflow-hidden">
                    {achievement.icon_url && (
                      <img src={achievement.icon_url} alt="" className="w-6 h-6 object-contain" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-100 truncate">{achievement.title}</p>
                    <p className="text-xs text-slate-500 truncate">{achievement.description}</p>
                  </div>
                  <span className="shrink-0 font-['JetBrains_Mono'] text-[11px] tracking-widest uppercase text-amber-300">
                    +{achievement.xp_earned} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAchievements
