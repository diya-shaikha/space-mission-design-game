// ============================================================
// screens/Credits.tsx — Credits screen
// ============================================================

import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { ArrowLeft, Rocket, Star, Globe, Code2, Database, AlertCircle } from 'lucide-react'

// ─── Starfield ───────────────────────────────────────────────
const STARS = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 2,
}))

// ─── Data ─────────────────────────────────────────────────────
const TEAM = [
  { role: 'Lead Developer', name: 'Space Apps Team', icon: '👨‍💻' },
  { role: '3D Design & Visualization', name: 'Three.js / R3F Team', icon: '🎨' },
  { role: 'Engineering Simulation', name: 'Physics Engine Team', icon: '⚙️' },
  { role: 'Educational Content', name: 'Aerospace Educators', icon: '📚' },
]

const TECH = [
  { name: 'React', desc: 'UI Framework', color: 'text-cyan-400' },
  { name: 'TypeScript', desc: 'Type Safety', color: 'text-blue-400' },
  { name: 'Three.js', desc: '3D Rendering', color: 'text-emerald-400' },
  { name: 'React Three Fiber', desc: '3D in React', color: 'text-green-400' },
  { name: 'Tailwind CSS', desc: 'Styling', color: 'text-violet-400' },
  { name: 'Zustand', desc: 'State Management', color: 'text-amber-400' },
]

const DATA_SOURCES = [
  { name: 'NASA JPL', detail: 'Mission parameters & trajectory data', icon: <Globe className="w-4 h-4" /> },
  { name: 'NASA Open APIs', detail: 'api.nasa.gov — public data', icon: <Database className="w-4 h-4" /> },
  {
    name: 'Tsiolkovsky Rocket Equation',
    detail: 'ΔV = Isp × g₀ × ln(m₀/m_f)',
    icon: <Rocket className="w-4 h-4" />,
    mono: true,
  },
]

// ─── Component ────────────────────────────────────────────────
export default function Credits() {
  const setScreen = useGameStore((s) => s.setScreen)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="relative min-h-screen w-full overflow-y-auto flex flex-col items-center"
      style={{ background: '#030711' }}
    >
      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: 0.7,
              animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 700,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden
      />

      <div
        className={`relative z-10 w-full max-w-2xl px-6 py-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Back */}
        <button
          onClick={() => setScreen('mainMenu')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Main Menu
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Rocket className="w-8 h-8 text-violet-400" />
            <h1
              className="text-4xl font-black"
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              MissionCraft
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-mono tracking-widest uppercase">Version 1.0.0</p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-900/30 border border-violet-700/40 text-violet-300 text-xs font-semibold tracking-wide">
            <Star className="w-3 h-3" />
            Built for NASA Space Apps Challenge 2026
          </div>
        </div>

        {/* Team */}
        <Section title="The Team" icon={<Code2 className="w-4 h-4 text-cyan-400" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEAM.map((member) => (
              <div
                key={member.role}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                <span className="text-2xl">{member.icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{member.name}</div>
                  <div className="text-slate-400 text-xs">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Technologies */}
        <Section title="Technologies Used" icon={<Code2 className="w-4 h-4 text-emerald-400" />}>
          <div className="flex flex-wrap gap-2">
            {TECH.map((t) => (
              <div
                key={t.name}
                className="flex flex-col items-center px-4 py-3 rounded-xl bg-white/5 border border-white/10 min-w-[90px] hover:bg-white/8 transition-colors"
              >
                <span className={`font-bold text-sm ${t.color}`}>{t.name}</span>
                <span className="text-slate-500 text-xs mt-0.5">{t.desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Data Sources */}
        <Section title="Data Sources" icon={<Database className="w-4 h-4 text-amber-400" />}>
          <div className="space-y-3">
            {DATA_SOURCES.map((src) => (
              <div
                key={src.name}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-slate-400 mt-0.5">{src.icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{src.name}</div>
                  <div className={`text-slate-400 text-xs mt-0.5 ${src.mono ? 'font-mono' : ''}`}>
                    {src.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* NASA APIs Note */}
        <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-700/30 flex items-start gap-3 mb-6">
          <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-200 text-sm">
            <span className="font-bold">NASA Open APIs</span> — This game uses publicly available
            data from{' '}
            <span className="font-mono text-blue-300">api.nasa.gov</span>. All data is freely
            accessible to the public.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/30 flex items-start gap-3 mb-8">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-200 text-sm">
            <span className="font-bold">Disclaimer:</span> This is an educational simulation. Not
            affiliated with or endorsed by NASA. Mission parameters are simplified for gameplay
            purposes.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs tracking-wide">
          Made with ❤️ for the advancement of space science education •{' '}
          <span className="text-slate-500">NASA Space Apps Challenge 2026</span>
        </p>
      </div>

      <style>{`
        @keyframes twinkle {
          0%   { opacity: 0.15; transform: scale(0.8); }
          100% { opacity: 0.85; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// ─── Helper: section wrapper ──────────────────────────────────
function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-white font-bold text-lg">{title}</h2>
      </div>
      {children}
    </div>
  )
}
