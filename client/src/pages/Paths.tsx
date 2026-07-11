import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/authContext"
import * as FaIcons from "react-icons/fa"
import * as MdIcons from "react-icons/md"
import * as HiIcons from "react-icons/hi"
import * as BiIcons from "react-icons/bi"

const iconLibraries: Record<string, Record<string, React.ComponentType<{ size?: number; className?: string }>>> = {
    fa: FaIcons,
    md: MdIcons,
    hi: HiIcons,
    bi: BiIcons,
}

function PathIcon({ name, className }: { name: string; className?: string }) {
    const IconComponent = iconLibraries[name.slice(0, 2).toLowerCase()]?.[name]
    if (!IconComponent) return null
    return <IconComponent className={className} />
}

interface Path {
    id: string
    path_url: string
    title: string
    description: string
    path_icon: string
    order: number
}

function Paths() {
    const [paths, setPaths] = useState<Path[]>([])
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        const getPaths = async () => {
            try {
                const { data } = await axios.get("/mathly/paths")
                setPaths(data)
            } catch (error) {
                console.log(error)
            }
        }
        getPaths()
    }, [])
    const accents = ["#22d3ee", "#a78bfa", "#fbbf24", "#fb7185"]; // cycles if more paths
    return (
        <div className="min-h-screen bg-scene text-slate-200 antialiased font-body">
            {/*
        Same helpers as the main page — if this file lives alongside it,
        delete this block and keep the definitions in one place
        (or move fonts into tailwind.config theme.fontFamily).
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
        .path-glow:hover, .path-glow:focus-visible {
        box-shadow: 0 8px 32px -12px color-mix(in srgb, var(--pc) 55%, transparent);
        }
    `}</style>

            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
                {/* Back link */}
                <a
                    href="/menu"
                    className="inline-block font-data text-[11px] tracking-[0.25em] uppercase text-slate-500 hover:text-cyan-400 transition-colors mb-6"
                >
                    « Main menu
                </a>

                {/* Header */}
                <header className="mb-8 md:mb-12">
                    <p className="font-data text-[11px] tracking-[0.25em] uppercase text-cyan-400/70 mb-2">
                        Select
                    </p>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-50 tracking-tight">
                        Paths
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 max-w-md">
                        Pick a path to open its skill tree. Faster solves earn better medals.
                    </p>
                </header>

                {/* Path cards */}
                <div className="flex flex-col gap-3 md:gap-4">
                    {user?.is_admin && (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate("/admin/paths")}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/admin/paths")}
                            className="path-glow group relative flex items-center gap-4 md:gap-6 overflow-hidden
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
                                    Create new path
                                </h2>
                                <p className="mt-0.5 text-xs md:text-sm text-slate-500">
                                    Admin — manage paths
                                </p>
                            </div>
                            <span className="shrink-0 font-data text-[11px] tracking-widest uppercase text-slate-400">
                                Manage »
                            </span>
                        </div>
                    )}
                    {paths.map((path, i) => (
                        <div
                            key={path.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/paths/${path.id}`)}
                            onKeyDown={(e) => e.key === "Enter" && navigate(`/paths/${path.id}`)}
                            style={{ "--pc": accents[i % accents.length] } as React.CSSProperties}
                            className="path-glow group relative flex items-center gap-4 md:gap-6 overflow-hidden
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

                            {/* Icon */}
                            <div
                                className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center
                           bg-[color-mix(in_srgb,var(--pc)_12%,transparent)]
                           border border-[color-mix(in_srgb,var(--pc)_25%,transparent)]"
                            >
                                <PathIcon name={path.path_icon} className="w-7 h-7 md:w-8 md:h-8" />
                            </div>

                            {/* Body */}
                            <div className="flex-1 min-w-0">
                                <h2 className="font-display font-bold text-base md:text-lg text-slate-100 group-hover:text-[color:var(--pc)] transition-colors">
                                    {path.title}
                                </h2>
                                <p className="mt-0.5 text-xs md:text-sm text-slate-500 line-clamp-2">
                                    {path.description}
                                </p>
                            </div>

                            {/* CTA */}
                            <span
                                className="shrink-0 font-data text-[11px] tracking-widest uppercase text-[color:var(--pc)]
                           opacity-100 translate-x-0
                           md:opacity-0 md:-translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0
                           md:group-focus-visible:opacity-100 md:group-focus-visible:translate-x-0
                           transition-all duration-200"
                            >
                                Enter path »
                            </span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Paths
