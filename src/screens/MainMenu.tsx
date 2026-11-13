// ============================================================
// screens/MainMenu.tsx — Deep Space Mission Control Homepage
// ============================================================

import React, { useState } from 'react'
import {
  Rocket,
  Compass,
  Cpu,
  Zap,
  Scale,
  Flame,
  Radio,
  Target,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Globe,
  Award,
  Sparkles,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { MISSIONS, MISSION_ORDER } from '../data/missions'
import type { MissionType } from '../types'

// ─── Stars for Background ──────────────────────────────────────
const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  top: (i * 1.13) % 100,
  left: (i * 2.37) % 100,
  size: (i % 3) * 0.7 + 0.8,
  opacity: (i % 5) * 0.15 + 0.25,
  duration: (i % 4) + 3,
  delay: (i % 3) * 1.2,
}))

// ─── 9 How to Play Steps ───────────────────────────────────────
interface TutorialStep {
  step: number
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  description: string
  keyTakeaway: string
  diagram?: {
    label: string
    formula?: string
    visual: React.ReactNode
  }
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: 'Choose a Mission',
    subtitle: 'Define destination & scientific goals',
    icon: <Globe className="w-5 h-5 text-electric" />,
    color: 'from-cyan-500/20 to-blue-500/10 border-electric/30',
    description:
      'Select between Earth Observation, Lunar Orbit, Lunar Landing, or Mars Exploration. Each mission sets unique operational environments, timeframes, and budget ceilings.',
    keyTakeaway: 'Your mission objective determines the hardware, Delta-V, and power required.',
    diagram: {
      label: 'Destination Flight Envelopes',
      visual: (
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="bg-space-900/80 p-2 rounded border border-electric/20">
            <span className="text-electric font-bold">Earth LEO</span>
            <div className="text-[10px] text-slate-400 mt-1">ΔV ~200 m/s</div>
          </div>
          <div className="bg-space-900/80 p-2 rounded border border-violet/30">
            <span className="text-violet font-bold">Moon Orbit</span>
            <div className="text-[10px] text-slate-400 mt-1">ΔV ~900 m/s</div>
          </div>
          <div className="bg-space-900/80 p-2 rounded border border-highlight/30">
            <span className="text-highlight font-bold">Mars Orbit</span>
            <div className="text-[10px] text-slate-400 mt-1">ΔV ~2,800 m/s</div>
          </div>
        </div>
      ),
    },
  },
  {
    step: 2,
    title: 'Understand Mission Objectives',
    subtitle: 'Target scientific deliverables',
    icon: <Target className="w-5 h-5 text-highlight" />,
    color: 'from-orange-500/20 to-amber-500/10 border-highlight/30',
    description:
      'Review target scientific criteria: surface multispectral imaging, radar subsurface probing, seismic anomaly detection, or magnetic surveys. Matching instruments will be required to earn points.',
    keyTakeaway: 'Installing the correct instruments earns up to 40% of your total mission score.',
    diagram: {
      label: 'Objective Scoring Model',
      visual: (
        <div className="bg-space-900/80 p-2.5 rounded border border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300">Surface Mapping</span>
          <span className="text-success font-bold">+30 PTS</span>
        </div>
      ),
    },
  },
  {
    step: 3,
    title: 'Design Your Spacecraft',
    subtitle: 'Configure the structural bus',
    icon: <Cpu className="w-5 h-5 text-violet" />,
    color: 'from-purple-500/20 to-violet-500/10 border-violet/30',
    description:
      'Choose the spacecraft core bus: from lightweight CubeSat (6U) to heavy flagship scientific buses. The bus provides the chassis, internal data computers, and mounting racks for your payload.',
    keyTakeaway: 'Larger buses carry more instruments and withstand deeper space environments.',
    diagram: {
      label: 'Spacecraft Bus Classes',
      visual: (
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex-1 bg-space-900/80 p-2 rounded border border-white/5 text-center">
            <div className="text-slate-400 text-[10px]">SmallSat</div>
            <div className="font-bold text-white">150 kg</div>
          </div>
          <div className="flex-1 bg-space-900/80 p-2 rounded border border-electric/30 text-center">
            <div className="text-electric text-[10px]">Standard</div>
            <div className="font-bold text-white">480 kg</div>
          </div>
          <div className="flex-1 bg-space-900/80 p-2 rounded border border-white/5 text-center">
            <div className="text-slate-400 text-[10px]">Heavy Bus</div>
            <div className="font-bold text-white">850 kg</div>
          </div>
        </div>
      ),
    },
  },
  {
    step: 4,
    title: 'Select Engines, Tanks & Instruments',
    subtitle: 'Hardware integration & payloads',
    icon: <Flame className="w-5 h-5 text-highlight" />,
    color: 'from-amber-500/20 to-red-500/10 border-highlight/30',
    description:
      'Pair high-efficiency upper-stage rocket engines (like the vacuum RL-10 or Hall-effect ion thruster) with propellant tanks. Then equip cameras, spectrometers, altimeters, and radar.',
    keyTakeaway: 'High specific impulse (Isp) engines require less propellant for the same maneuvers.',
  },
  {
    step: 5,
    title: 'Balance Mass, Power, Fuel & Budget',
    subtitle: 'The fundamental engineering trade-offs',
    icon: <Scale className="w-5 h-5 text-electric" />,
    color: 'from-cyan-500/20 to-teal-500/10 border-electric/30',
    description:
      'Every instrument adds mass and draws electrical watts. Solar arrays generate power, but their output decreases dramatically at Mars (down to 43%). Maintain a positive power margin and stay within budget.',
    keyTakeaway: 'Power Balance = Generation - Consumption. Must remain >= 0 W to avoid system brownouts.',
    diagram: {
      label: 'Solar Flux Attenuation',
      formula: 'P_actual = P_1AU * (1 / d_AU)^2',
      visual: (
        <div className="flex items-center justify-between text-xs font-mono bg-space-900/80 p-2 rounded border border-white/5">
          <span>Earth (1.0 AU): 100%</span>
          <span className="text-highlight">Mars (1.52 AU): 43%</span>
        </div>
      ),
    },
  },
  {
    step: 6,
    title: 'Satisfy Delta-V Requirements',
    subtitle: 'Tsiolkovsky Rocket Equation',
    icon: <Rocket className="w-5 h-5 text-violet" />,
    color: 'from-purple-500/20 to-indigo-500/10 border-violet/30',
    description:
      'Delta-V (ΔV) is the velocity change capacity of your spacecraft. Without sufficient ΔV, your spacecraft cannot decelerate into orbit or reach its destination.',
    keyTakeaway: 'Higher propellant mass ratio (m0 / mf) and higher engine Isp yield higher Delta-V.',
    diagram: {
      label: 'Rocket Equation',
      formula: 'ΔV = Isp * g0 * ln(m_initial / m_final)',
      visual: (
        <div className="text-[11px] font-mono text-cyan-300 bg-space-900/90 p-2 rounded border border-electric/20 text-center">
          ΔV = Isp · 9.80665 · ln((DryMass + Fuel) / DryMass)
        </div>
      ),
    },
  },
  {
    step: 7,
    title: 'Resolve Errors & Warnings',
    subtitle: 'Engineering verification panel',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    color: 'from-yellow-500/20 to-orange-500/10 border-amber-400/30',
    description:
      'The automated Flight Readiness Review checks your build. Red errors (e.g. over budget, payload exceeding rocket lift limit, negative power) must be resolved before ignition. Yellow warnings indicate mission risk.',
    keyTakeaway: 'Fixing all errors guarantees flight authorization; addressing warnings maximizes mission survival.',
  },
  {
    step: 8,
    title: 'Launch & Simulate the Mission',
    subtitle: 'Telemetry & dynamic in-flight events',
    icon: <Radio className="w-5 h-5 text-success" />,
    color: 'from-emerald-500/20 to-cyan-500/10 border-success/30',
    description:
      'Experience liftoff, separation, cruise, and orbit insertion. Make real-time decisions during unexpected challenges such as solar flares, propellant leaks, or sensor anomalies.',
    keyTakeaway: 'Control flight speed (1x to 50x) and monitor fuel reserves, telemetry, and subsystem health.',
  },
  {
    step: 9,
    title: 'Analyse Final Results & Score',
    subtitle: 'Flight debriefing & recommendations',
    icon: <Award className="w-5 h-5 text-highlight" />,
    color: 'from-amber-500/20 to-purple-500/10 border-highlight/30',
    description:
      'Receive a formal NASA-style debrief with your overall flight score (0–100), letter grade (A+ to F), cost efficiency, and specific engineering recommendations to iterate and improve.',
    keyTakeaway: 'Learn from telemetry bottlenecks and iterate to achieve a 100-point flagship mission.',
  },
]

export default function MainMenu() {
  const { setScreen, selectMission } = useGameStore()
  const [activeTutorialStep, setActiveTutorialStep] = useState(0)
  const [showAboutModal, setShowAboutModal] = useState(false)

  const currentStep = TUTORIAL_STEPS[activeTutorialStep]

  const handleStartDirectMission = (missionId: MissionType) => {
    selectMission(missionId)
  }

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-electric selection:text-space-950">
      {/* ── Dynamic Starfield Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}
        {/* Subtle Cosmic Ambient Glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-radial-hero pointer-events-none" />
        <div className="absolute top-[45%] -right-40 w-[600px] h-[600px] bg-violet/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[75%] -left-40 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* ── Global Header Navigation Bar ── */}
      <nav className="relative z-20 border-b border-white/10 bg-space-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric via-blue-500 to-violet flex items-center justify-center shadow-glow-cyan">
              <Rocket className="w-5 h-5 text-space-950 transform rotate-45" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-white flex items-center gap-2">
                MISSIONCRAFT
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-electric/15 text-electric border border-electric/30">
                  MISSION CONTROL
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                From Blueprint to Orbit • Space Apps 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#challenges"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-electric transition-colors px-3 py-1.5 rounded-lg hover:bg-space-800"
            >
              <Compass className="w-3.5 h-3.5" />
              CHALLENGES
            </a>
            <a
              href="#how-to-play"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-electric transition-colors px-3 py-1.5 rounded-lg hover:bg-space-800"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              HOW TO PLAY
            </a>
            <button
              onClick={() => setScreen('missionSelect')}
              className="btn-primary text-xs font-mono py-2 px-4 shadow-sm"
            >
              <Rocket className="w-3.5 h-3.5" />
              LAUNCH
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT: THREE SECTIONS ONLY ── */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-24">

        {/* ══════════════════════════════════════════════════════════
            SECTION A: START NEW MISSION (Hero Section)
        ══════════════════════════════════════════════════════════ */}
        <section className="pt-6 sm:pt-12 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-electric/30 bg-electric/10 text-electric text-xs font-mono font-semibold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-electric animate-pulse" />
                NASA Space Apps Challenge 2026
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Design, Engineer &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-cyan-300 to-violet text-glow-cyan">
                  Simulate Space Missions
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Take command of mission architecture. Balance mass budgets, propulsion physics, solar irradiance,
                and telemetry constraints to guide scientific spacecraft from blueprint to orbit.
              </p>

              {/* Call-to-action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => setScreen('missionSelect')}
                  className="btn-primary w-full sm:w-auto text-base px-8 py-4 shadow-glow-cyan pulse-glow group"
                >
                  <Rocket className="w-5 h-5 text-space-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Start New Mission</span>
                  <ArrowRight className="w-5 h-5 text-space-950 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#how-to-play"
                  className="btn-secondary w-full sm:w-auto text-sm px-6 py-4 font-mono"
                >
                  <span>Interactive Tutorial</span>
                  <ChevronRight className="w-4 h-4 text-electric" />
                </a>
              </div>

              {/* Live Telemetry Highlights Strip */}
              <div className="pt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 font-mono text-xs">
                <div className="stat-card">
                  <div className="stat-label">Destinations</div>
                  <div className="stat-value text-electric">LEO, Moon, Mars</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Physics Model</div>
                  <div className="stat-value text-violet">Tsiolkovsky ΔV</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Flight Authority</div>
                  <div className="stat-value text-success">Autonomous</div>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Spacecraft & Planet Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl glass-panel p-6 border border-electric/30 flex flex-col items-center justify-center overflow-hidden group shadow-2xl">
                {/* Background Orbit Ring Visual */}
                <div className="absolute inset-6 rounded-full border border-dashed border-electric/25 animate-spin-slow pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-violet/20 pointer-events-none" />

                {/* Central Celestial Body Illustration */}
                <div className="relative z-10 w-36 h-36 rounded-full bg-gradient-to-tr from-blue-900 via-cyan-600 to-electric shadow-glow-cyan flex items-center justify-center p-1.5 animate-float">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0c2447] to-[#041122] flex items-center justify-center relative overflow-hidden">
                    <Globe className="w-24 h-24 text-electric/40 absolute -bottom-2 -right-2" />
                    <div className="text-center">
                      <span className="text-3xl">🛰️</span>
                      <div className="text-[10px] font-mono font-bold text-cyan-300 mt-1 uppercase">Orbit Station</div>
                    </div>
                  </div>
                </div>

                {/* Orbiting Moon / Mars Satellite Node */}
                <div className="absolute top-10 right-10 bg-space-900/90 border border-highlight/40 px-3 py-1.5 rounded-xl text-[11px] font-mono text-highlight shadow-lg flex items-center gap-1.5">
                  <span className="text-xs">🔴</span> Mars ~1.52 AU
                </div>

                <div className="absolute bottom-10 left-10 bg-space-900/90 border border-electric/40 px-3 py-1.5 rounded-xl text-[11px] font-mono text-electric shadow-lg flex items-center gap-1.5">
                  <span className="text-xs">🌕</span> Moon ~384k km
                </div>

                {/* Hero HUD Overlay at Bottom */}
                <div className="mt-8 text-center z-10">
                  <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    Mission Operations Center
                  </div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    Ready for Blueprint Authorization
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════
            SECTION B: MISSION CHALLENGES
        ══════════════════════════════════════════════════════════ */}
        <section id="challenges" className="scroll-mt-24 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="hud-header mb-1">
                <Compass className="w-4 h-4 text-electric" /> FLIGHT PROGRAM DIRECTIVES
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Mission Challenges
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select your assignment to deploy scientific payloads across the solar system.
              </p>
            </div>
            <button
              onClick={() => setScreen('missionSelect')}
              className="text-xs font-mono text-electric hover:text-cyan-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              VIEW ALL MISSIONS <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {MISSION_ORDER.map((id) => {
              const mission = MISSIONS[id]

              const difficultyColor =
                mission.difficulty === 'Beginner'
                  ? 'text-success bg-success/15 border-success/30'
                  : mission.difficulty === 'Intermediate'
                  ? 'text-cyan-300 bg-cyan-900/30 border-cyan-500/30'
                  : mission.difficulty === 'Advanced'
                  ? 'text-warning bg-warning/15 border-warning/30'
                  : 'text-highlight bg-highlight/15 border-highlight/30'

              return (
                <div
                  key={id}
                  onClick={() => handleStartDirectMission(id as MissionType)}
                  className="glass-card rounded-2xl p-5 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Top Color Accent Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                    style={{ background: mission.color }}
                  />

                  <div>
                    {/* Header: Icon + Difficulty */}
                    <div className="flex items-start justify-between gap-2 mb-3 pt-1">
                      <span className="text-3xl p-2 rounded-xl bg-space-900/80 border border-white/10 group-hover:scale-110 transition-transform">
                        {mission.icon}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${difficultyColor}`}>
                        {mission.difficulty}
                      </span>
                    </div>

                    {/* Mission Name & Subtitle */}
                    <h3 className="text-base font-bold text-white group-hover:text-electric transition-colors">
                      {mission.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mb-3">
                      {mission.subtitle}
                    </p>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {mission.description}
                    </p>

                    {/* Mission Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-space-950/60 p-2.5 rounded-xl border border-white/5 mb-4">
                      <div>
                        <span className="text-slate-500 uppercase text-[9px] block">Budget Limit</span>
                        <span className="font-bold text-success">${mission.budgetLimit}M</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[9px] block">Required ΔV</span>
                        <span className="font-bold text-electric">{mission.deltaVRequirement} m/s</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-white/5">
                        <span className="text-slate-500 uppercase text-[9px] block">Destination</span>
                        <span className="text-slate-200 truncate block">{mission.destination}</span>
                      </div>
                    </div>

                    {/* Objectives Preview */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                        Primary Objectives ({mission.objectives.length})
                      </div>
                      {mission.objectives.slice(0, 2).map((obj) => (
                        <div key={obj.id} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-electric mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{obj.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartDirectMission(id as MissionType)
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-mono font-bold bg-space-800 text-electric border border-electric/30 group-hover:bg-electric group-hover:text-space-950 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>CONFIGURE SPACECRAFT</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════
            SECTION C: HOW TO PLAY (Interactive 9-Step Guide)
        ══════════════════════════════════════════════════════════ */}
        <section id="how-to-play" className="scroll-mt-24 space-y-8">
          <div className="border-b border-white/10 pb-4">
            <div className="hud-header mb-1">
              <Cpu className="w-4 h-4 text-violet" /> INTERACTIVE ENGINEERING GUIDE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              How to Play MissionCraft
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Master space mission engineering across 9 essential design and simulation phases.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Step Selector List (5 Columns) */}
            <div className="lg:col-span-5 space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {TUTORIAL_STEPS.map((s, idx) => {
                const isActive = activeTutorialStep === idx
                return (
                  <button
                    key={s.step}
                    onClick={() => setActiveTutorialStep(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-space-800 border-electric shadow-glow-cyan text-white'
                        : 'bg-space-900/40 border-white/5 hover:border-white/20 hover:bg-space-900/80 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isActive
                          ? 'bg-electric text-space-950'
                          : 'bg-space-800 text-slate-400 border border-white/10'
                      }`}
                    >
                      {s.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {s.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {s.subtitle}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-electric translate-x-0.5' : 'text-slate-600'}`} />
                  </button>
                )
              })}
            </div>

            {/* Active Step Detailed Card (7 Columns) */}
            <div className="lg:col-span-7 glass-panel rounded-2xl p-6 md:p-8 border border-electric/30 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-space-900 border border-electric/30">
                      {currentStep.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-electric uppercase tracking-wider">
                        STEP {currentStep.step} OF 9
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {currentStep.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    {currentStep.subtitle}
                  </span>
                </div>

                {/* Explanation Body */}
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Formula / Visual Example (if present) */}
                {currentStep.diagram && (
                  <div className="bg-space-950/70 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>{currentStep.diagram.label}</span>
                      {currentStep.diagram.formula && (
                        <span className="text-electric font-semibold">{currentStep.diagram.formula}</span>
                      )}
                    </div>
                    {currentStep.diagram.visual}
                  </div>
                )}

                {/* Engineering Insight Box */}
                <div className="bg-electric/10 border border-electric/30 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-electric shrink-0 mt-0.5" />
                  <div className="text-xs text-cyan-200">
                    <span className="font-bold uppercase font-mono text-electric block mb-0.5">
                      Flight Rule Tip
                    </span>
                    {currentStep.keyTakeaway}
                  </div>
                </div>
              </div>

              {/* Step Navigation Controls & Launch CTA */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    disabled={activeTutorialStep === 0}
                    onClick={() => setActiveTutorialStep((prev) => Math.max(0, prev - 1))}
                    className="p-2.5 rounded-xl border border-white/10 bg-space-900 text-slate-300 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={activeTutorialStep === TUTORIAL_STEPS.length - 1}
                    onClick={() => setActiveTutorialStep((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
                    className="p-2.5 rounded-xl border border-white/10 bg-space-900 text-slate-300 hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    {activeTutorialStep + 1} / 9
                  </span>
                </div>

                {/* End-of-Tutorial Start Mission CTA */}
                <button
                  onClick={() => setScreen('missionSelect')}
                  className="btn-primary text-xs font-mono py-3 px-6 w-full sm:w-auto shadow-glow-cyan"
                >
                  <Rocket className="w-4 h-4" />
                  <span>START MISSION NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4: FOOTER DESIGN
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/10 bg-space-950 mt-16 py-8 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="font-bold text-sm tracking-widest text-slate-300 uppercase">
            MISSIONCRAFT
          </div>
          <div className="text-slate-400">
            An Interactive Space Mission Design and Simulation Game
          </div>
          <div className="text-slate-500 text-[11px]">
            Developed for NASA Space Apps Challenge 2026 • Challenge: Space Mission Design Game
          </div>

          <div className="pt-3">
            <button
              onClick={() => setShowAboutModal(true)}
              className="text-electric hover:underline text-[11px] inline-flex items-center gap-1 transition-colors"
            >
              <Info className="w-3 h-3" /> About &amp; Team Credits
            </button>
          </div>
        </div>
      </footer>

      {/* ── About & Credits Modal ── */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-electric/40 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-electric" /> MissionCraft Architecture &amp; Credits
              </h3>
              <button
                onClick={() => setShowAboutModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                <strong>MissionCraft: From Blueprint to Orbit</strong> is an educational browser-based simulation designed
                for students, engineers, and space enthusiasts participating in the NASA Space Apps Challenge 2026.
              </p>
              <div className="bg-space-900/80 p-3 rounded-xl border border-white/5 space-y-1 font-mono text-[11px]">
                <div className="text-electric font-semibold">Core Technologies:</div>
                <div>• React 18, TypeScript, Tailwind CSS, Vite</div>
                <div>• Three.js &amp; React Three Fiber (R3F 3D Engine)</div>
                <div>• Zustand State Management &amp; Persistence</div>
                <div>• Tsiolkovsky Rocket Physics &amp; Solar Irradiance Models</div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Note: This educational game is inspired by real missions (Landsat, LRO, Artemis, MRO). It is an independent challenge submission and is not officially endorsed or certified by NASA.
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowAboutModal(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
