import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/authContext"
import { FaUser, FaFire, FaHeart, FaStar, FaRightFromBracket, FaCamera } from "react-icons/fa6"

const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]

interface UserProfile {
  id: string
  username: string
  email: string
  total_xp: number
  streak: number
  lives: number
  user_level?: number
  avatar_url?: string | null
  is_admin?: boolean
  created_at?: string
}

function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const { data } = await axios.get("/mathly/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProfile(data)
        setUsername(data.username ?? "")
        setEmail(data.email ?? "")
        setFetchError(null)
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Failed to load profile"
          : "Failed to load profile"
        setFetchError(message)
      } finally {
        setLoading(false)
      }
    }
    getProfile()
  }, [])

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setSaveError(null)
    setSaveMessage(null)

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setSaveError("Please choose a PNG, JPEG, WEBP, or SVG image")
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setSaveError("Image must be smaller than 5MB")
      return
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setSaveMessage(null)
    setSaveError(null)
    try {
      const token = localStorage.getItem("token")
      const textUpdates: Record<string, string> = {}
      if (username && username !== profile.username) textUpdates.username = username
      if (email && email !== profile.email) textUpdates.email = email

      if (Object.keys(textUpdates).length === 0 && !avatarFile) {
        setSaveMessage("Nothing to update")
        return
      }

      const formData = new FormData()
      Object.entries(textUpdates).forEach(([key, value]) => formData.append(key, value))
      if (avatarFile) formData.append("profile_picture", avatarFile)

      const { data } = await axios.patch("/mathly/user/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile((prev) =>
        prev ? { ...prev, ...textUpdates, ...(data.avatar_url ? { avatar_url: data.avatar_url } : {}) } : prev
      )
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      setAvatarFile(null)
      setAvatarPreview(null)
      setSaveMessage(data.message ?? "Profile updated")
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? "Failed to update profile"
        : "Failed to update profile"
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/signin")
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
      `}</style>

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* Back link */}
        <button
          onClick={() => navigate("/menu")}
          className="inline-block font-data text-[11px] tracking-[0.25em] uppercase text-slate-500 hover:text-cyan-400 transition-colors mb-6"
        >
          « Main menu
        </button>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <svg className="spinner w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="font-data text-[11px] tracking-[0.25em] uppercase text-slate-500">
              Loading profile…
            </p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-6 py-8 text-center">
            <p className="font-display font-bold text-lg text-rose-300 mb-2">Can't load your profile</p>
            <p className="text-sm text-slate-400">{fetchError}</p>
          </div>
        )}

        {!loading && profile && (
          <>
            {/* Header */}
            <header className="mb-8 flex items-center gap-4">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="group relative shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-rose-400/10 border border-rose-400/30 overflow-hidden focus:outline-none focus:ring-1 focus:ring-rose-400/50"
                title="Change profile picture"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="w-6 h-6 text-rose-400" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaCamera className="w-4 h-4 text-slate-100" />
                </span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="min-w-0">
                <p className="font-data text-[11px] tracking-[0.25em] uppercase text-rose-400/70 mb-1">
                  Profile
                </p>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-50 tracking-tight truncate">
                  {profile.username}
                </h1>
                {avatarFile && (
                  <p className="mt-1 text-[11px] text-cyan-400">New picture selected — save to apply</p>
                )}
              </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-center">
                <p className="font-data font-bold text-lg text-cyan-400 tabular-nums">
                  {(profile.total_xp ?? 0).toLocaleString()}
                </p>
                <p className="mt-1 font-data text-[10px] tracking-widest uppercase text-slate-500">XP</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-center">
                <p className="font-data font-bold text-lg text-orange-400 tabular-nums inline-flex items-center justify-center gap-1.5">
                  <FaFire className="w-4 h-4" /> {profile.streak ?? 0}
                </p>
                <p className="mt-1 font-data text-[10px] tracking-widest uppercase text-slate-500">Streak</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-center">
                <p className="font-data font-bold text-lg text-rose-400 tabular-nums inline-flex items-center justify-center gap-1.5">
                  <FaHeart className="w-4 h-4" /> {profile.lives ?? 0}
                </p>
                <p className="mt-1 font-data text-[10px] tracking-widest uppercase text-slate-500">Lives</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-center">
                <p className="font-data font-bold text-lg text-violet-400 tabular-nums inline-flex items-center justify-center gap-1.5">
                  <FaStar className="w-4 h-4" /> {profile.user_level ?? 0}
                </p>
                <p className="mt-1 font-data text-[10px] tracking-widest uppercase text-slate-500">Level</p>
              </div>
            </div>

            {/* Edit form */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm px-5 sm:px-6 py-5 sm:py-6 mb-6">
              <h2 className="font-display font-bold text-base text-slate-100 mb-4">Account settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-data text-[10px] tracking-widest uppercase text-slate-500 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-data text-[10px] tracking-widest uppercase text-slate-500 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 transition-colors"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Changing your email sends a new verification link.
                  </p>
                </div>

                {saveMessage && <p className="text-sm text-emerald-400">{saveMessage}</p>}
                {saveError && <p className="text-sm text-rose-400">{saveError}</p>}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto font-data text-[12px] tracking-widest uppercase text-rose-400
                             border border-rose-400/40 rounded-lg px-5 py-2.5 hover:bg-rose-400/10
                             transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full font-data text-[12px] tracking-widest uppercase text-slate-400
                         border border-slate-700 rounded-lg px-4 py-3 hover:text-rose-300 hover:border-rose-400/40
                         transition-colors inline-flex items-center justify-center gap-2"
            >
              <FaRightFromBracket className="w-3.5 h-3.5" /> Log out
            </button>
          </>
        )}
      </main>
    </div>
  )
}

export default Profile
