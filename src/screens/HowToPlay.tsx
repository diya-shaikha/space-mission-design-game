// ============================================================
// screens/HowToPlay.tsx — Tutorial and instructions screen
// ============================================================

import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Rocket,
  Zap,
  Scale,
  Radio,
  Globe,
} from 'lucide-react'

// ─── Tab definitions ──────────────────────────────────────────
const TABS = [
  { id: 'start',    label: 'Getting Started',       icon: <Rocket className="w-4 h-4" />    },
  { id: 'concepts', label: 'Engineering Concepts',   icon: <Cpu className="w-4 h-4" />       },
  { id: 'tips',     label: 'Mission Tips',           icon: <Lightbulb className="w-4 h-4" /> },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── Getting Started content ──────────────────────────────────
const STEPS = [
  {
    n: 1,
    title: 'Choose Your Mission',
    body: 'From the Mission Select screen, pick one of four mission types — each with unique destinations, budgets, and engineering challenges. Start with Earth Observation (Beginner) if this is your first time.',
    icon: <Globe className="w-5 h-5 text-cyan-400" />,
  },
  {
    n: 2,
    title: 'Design Your Spacecraft',
    body: 'In the Spacecraft Designer, select a launch vehicle, engine, fuel tank, power system, instruments, and subsystems. Watch your Engineering Stats panel — it updates in real time as you add components.',
    icon: <Cpu className="w-5 h-5 text-violet-400" />,
  },
  {
    n: 3,
    title: 'Check Your Budget & Mass',
    body: 'Every component costs money and adds mass. Stay within your mission budget and ensure your ΔV meets the mission requirement. The status bar turns red if you exceed limits.',
    icon: <Scale className="w-5 h-5 text-amber-400" />,
  },
  {
    n: 4,
    title: 'Balance Power',
    body: 'Your solar panels / RTG must produce more power than your instruments and subsystems consume. A negative power balance will cause mission failure.',
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
  },
  {
    n: 5,
    title: 'Pick the Right Antenna',
    body: 'Deeper-space missions need high-gain antennas (HGA). Earth-orbit missions can use omni antennas. The wrong antenna = science data never reaches Earth.',
    icon: <Radio className="w-5 h-5 text-emerald-400" />,
  },
  {
    n: 6,
    title: 'Launch & Simulate',
    body: 'Once your design is complete, press Launch. The simulation runs through mission phases — cruise, orbit insertion, and science operations. Respond to anomaly events to keep your mission on track!',
    icon: <Rocket className="w-5 h-5 text-rose-400" />,
  },
]

// ─── Engineering Concepts content ────────────────────────────
interface Concept {
  id: string
  title: string
  icon: React.ReactNode
  formula?: string
  body: string
  diagramNote?: string
}

const CONCEPTS: Concept[] = [
  {
    id: 'deltav',
    title: 'Delta-V (ΔV)',
    icon: <Rocket className="w-4 h-4 text-cyan-400" />,
    formula: 'ΔV = Isp × g₀ × ln(m₀ / m_f)',
    body: 'Delta-V is the total change in velocity your spacecraft can achieve. It determines which orbits you can reach. Higher ΔV missions require more efficient engines and larger fuel tanks. The Tsiolkovsky Rocket Equation governs this.',
    diagramNote: 'Earth Orbit ≈ 9,400 m/s • Moon ≈ 3,900 m/s extra • Mars ≈ 5,600 m/s extra',
  },
  {
    id: 'isp',
    title: 'Specific Impulse (Isp)',
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    formula: 'Isp = F / (ṁ × g₀)  [units: seconds]',
    body: 'Isp measures engine fuel efficiency — how much thrust you get per unit of propellant. Higher Isp = less fuel needed for the same ΔV. Ion drives have Isp > 3,000 s; chemical rockets ~300–460 s.',
    diagramNote: 'Chemical: ~300–460 s • Hall thruster: ~1,600 s • Ion drive: ~3,000+ s',
  },
  {
    id: 'mass',
    title: 'Mass Budget',
    icon: <Scale className="w-4 h-4 text-amber-400" />,
    formula: 'Total Mass = Dry Mass + Fuel Mass',
    body: 'Every kilogram of spacecraft must be launched from Earth, which is expensive. Your mass budget tracks dry mass (structure + components) separately from propellant mass. The mass ratio (m₀/m_f) directly drives ΔV.',
    diagramNote: 'Typical ratio: ~60–70% of launch mass is propellant for deep-space missions',
  },
  {
    id: 'power',
    title: 'Power Budget',
    icon: <Zap className="w-4 h-4 text-emerald-400" />,
    formula: 'Power Balance = Generation − Consumption',
    body: 'Spacecraft power comes from solar panels (distance-limited) or RTGs (plutonium-powered, expensive). All instruments and subsystems consume power. A negative balance means your mission will fail due to power loss.',
    diagramNote: 'Solar panels lose power with distance² from Sun — at Mars, ~43% of Earth value',
  },
  {
    id: 'orbital',
    title: 'Orbital Mechanics',
    icon: <Globe className="w-4 h-4 text-violet-400" />,
    formula: 'v_orbit = √(GM / r)',
    body: 'Objects in orbit are in free-fall around a body. Hohmann transfers are the most fuel-efficient way to move between circular orbits. Gravity assists (flybys) can dramatically reduce ΔV requirements for outer planet missions.',
    diagramNote: 'LEO ≈ 7,800 m/s • GEO ≈ 3,070 m/s • Escape ≈ 11,200 m/s',
  },
]

// ─── Tips content ─────────────────────────────────────────────
const TIPS_BY_DIFFICULTY: {
  difficulty: string
  color: string
  badge: string
  tips: string[]
}[] = [
  {
    difficulty: 'Beginner (Earth Observation)',
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/20 border-emerald-600/40 text-emerald-300',
    tips: [
      'The Falcon 9 launch vehicle is a great all-rounder — reliable and affordable.',
      'Optical and SAR instruments are your main science tools for Earth-obs.',
      'Solar panels work well in LEO — you won\'t need an RTG.',
      'Keep your total mass under 2,500 kg to stay within budget.',
      'Watch the power balance — instruments drain fast.',
    ],
  },
  {
    difficulty: 'Intermediate (Lunar Exploration)',
    color: 'text-yellow-400',
    badge: 'bg-yellow-500/20 border-yellow-600/40 text-yellow-300',
    tips: [
      'You need ≥ 900 m/s ΔV just for Trans-Lunar Injection + Lunar Orbit Insertion.',
      'A high-gain antenna (HGA) is essential — the Moon is 384,000 km away.',
      'The Apollo CSM used ~2,600 m/s total — plan accordingly.',
      'Thermal control is critical; the Moon swings from +127°C to −173°C.',
      'Seismometers are high-value science — include one if budget allows.',
    ],
  },
  {
    difficulty: 'Advanced (Lunar Landing)',
    color: 'text-orange-400',
    badge: 'bg-orange-500/20 border-orange-600/40 text-orange-300',
    tips: [
      '2,100 m/s ΔV needed: LOI (~900 m/s) + powered descent (~1,200 m/s).',
      'Active thermal control (heaters) is mandatory for polar night survival.',
      'The drill + spectrometer combo unlocks the most valuable science objectives.',
      'Keep dry mass low — descent propellant is the majority of your total mass.',
      'Laser altimeter helps with precision landing and objective completion.',
    ],
  },
  {
    difficulty: 'Expert (Mars Orbiter)',
    color: 'text-red-400',
    badge: 'bg-red-500/20 border-red-600/40 text-red-300',
    tips: [
      '2,800 m/s needed for Mars Transfer Orbit + Mars Orbit Insertion (MOI).',
      'Solar power drops to ~43% at Mars — consider supplementing with RTG.',
      'HGA is non-negotiable: light takes up to 24 min to travel Earth-Mars.',
      'Ground-penetrating radar (SAR) is the key instrument for subsurface water.',
      'Budget for 4-year mission lifetime — component reliability matters enormously.',
      'Communications blackouts during solar conjunction are unavoidable — plan autonomous ops.',
    ],
  },
]

// ─── Concept Card (collapsible) ───────────────────────────────
function ConceptCard({ concept }: { concept: Concept }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 ${open ? 'border-cyan-700/40' : ''}`}
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{concept.icon}</span>
        <span className="flex-1 text-white font-semibold text-sm">{concept.title}</span>
        {concept.formula && (
          <span className="hidden sm:block font-mono text-cyan-400 text-xs bg-cyan-950/60 px-2 py-1 rounded mr-2 border border-cyan-800/40">
            {concept.formula}
          </span>
        )}
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {concept.formula && (
            <div className="sm:hidden p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 font-mono text-cyan-400 text-xs text-center">
              {concept.formula}
            </div>
          )}
          <p className="text-slate-300 text-sm leading-relaxed">{concept.body}</p>
          {concept.diagramNote && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-900/60 border border-slate-700/40">
              <span className="text-slate-500 text-xs font-mono leading-relaxed">{concept.diagramNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────
export default function HowToPlay() {
  const setScreen = useGameStore((s) => s.setScreen)
  const [activeTab, setActiveTab] = useState<TabId>('start')

  return (
    <div
      className="relative min-h-screen w-full overflow-y-auto"
      style={{ background: '#030711' }}
    >
      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(6,182,212,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button
          onClick={() => setScreen('mainMenu')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Main Menu
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h1 className="text-white font-black text-2xl">How to Play</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold
                transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Getting Started ── */}
        {activeTab === 'start' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-6">
              Follow these six steps to complete your first mission successfully.
            </p>
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                {/* Step number */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-cyan-900/40 border border-cyan-700/40 flex items-center justify-center font-black text-cyan-400 text-sm">
                  {step.n}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <span className="text-white font-bold text-sm">{step.title}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}

            {/* Key formula callout */}
            <div className="mt-6 p-4 rounded-xl bg-cyan-900/20 border border-cyan-700/30">
              <p className="text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-2">
                Key Formula to Remember
              </p>
              <p className="font-mono text-cyan-400 text-base text-center py-2">
                ΔV = Isp × g₀ × ln(m₀ / m_f)
              </p>
              <p className="text-slate-400 text-xs text-center mt-1">
                Tsiolkovsky Rocket Equation — the foundation of all spaceflight
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Engineering Concepts ── */}
        {activeTab === 'concepts' && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm mb-4">
              Tap any concept to expand its explanation and key formula. These are the real
              engineering principles behind every space mission.
            </p>
            {CONCEPTS.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        )}

        {/* ── Tab: Mission Tips ── */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            <p className="text-slate-400 text-sm">
              Difficulty-specific tips from mission engineers. Read these before you design!
            </p>
            {TIPS_BY_DIFFICULTY.map((group) => (
              <div key={group.difficulty}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${group.badge}`}>
                    {group.difficulty}
                  </span>
                </div>
                <ul className="space-y-2">
                  {group.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/8 text-slate-300 text-sm"
                    >
                      <span className="flex-shrink-0 text-base">
                        {['🚀', '⚡', '🔭', '💰', '📡', '🧊'][i % 6]}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
