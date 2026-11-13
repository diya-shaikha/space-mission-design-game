// ============================================================
// screens/Simulation.tsx — Deep Space Mission Control Simulation
// ============================================================

import React, { useEffect, useRef, useState, lazy, Suspense } from 'react'
import {
  Rocket,
  Compass,
  Zap,
  Radio,
  Gauge,
  DollarSign,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ShieldAlert,
  Flame,
  ArrowRight,
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { MISSIONS } from '../data/missions'
import { COMPONENTS } from '../data/components'
import type { SimulationEvent, MissionPhase } from '../types'

const SpaceScene = lazy(() => import('../components/3d/SpaceScene'))

// ── Helpers ────────────────────────────────────────────────────

function formatMET(hours: number): string {
  const totalMinutes = Math.floor(hours * 60)
  const days = Math.floor(totalMinutes / 1440)
  const rem = totalMinutes % 1440
  const h = Math.floor(rem / 60)
  const m = rem % 60
  return `${days}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

const PHASE_LABELS: Record<MissionPhase, string> = {
  'pre-launch': 'PRE-LAUNCH',
  launch: '🚀 LAUNCH & ASCENT',
  deployment: '🛸 DEPLOYMENT & SEPARATION',
  transit: '🌌 TRANSIT & CRUISE',
  'orbital-insertion': '🔴 ORBITAL INSERTION',
  operations: '📡 SCIENCE OPERATIONS',
  completed: '✅ MISSION ACCOMPLISHED',
  failed: '❌ FLIGHT TERMINATED',
}

const PHASE_COLOR: Record<MissionPhase, string> = {
  'pre-launch': 'text-slate-400',
  launch: 'text-highlight',
  deployment: 'text-electric',
  transit: 'text-violet',
  'orbital-insertion': 'text-highlight',
  operations: 'text-success',
  completed: 'text-success',
  failed: 'text-danger',
}

function eventTypeColor(type: SimulationEvent['type']): string {
  switch (type) {
    case 'success': return 'text-success border-success/40 bg-success/5'
    case 'warning': return 'text-warning border-warning/40 bg-warning/5'
    case 'critical': return 'text-danger border-danger/40 bg-danger/10'
    case 'info':
    default: return 'text-electric border-electric/40 bg-electric/5'
  }
}

function eventDot(type: SimulationEvent['type']): string {
  switch (type) {
    case 'success': return 'bg-success'
    case 'warning': return 'bg-warning'
    case 'critical': return 'bg-danger animate-ping'
    default: return 'bg-electric'
  }
}

// ── Telemetry Gauge Bar ────────────────────────────────────────

interface GaugeBarProps {
  label: string
  value: number
  max: number
  unit: string
  extraLabel?: string
  color?: string
  warn?: boolean
  crit?: boolean
  icon?: React.ReactNode
}

function GaugeBar({ label, value, max, unit, extraLabel, color = 'bg-electric', warn, crit, icon }: GaugeBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const barColor = crit ? 'bg-danger' : warn ? 'bg-warning' : color

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
          {icon}
          {label}
        </span>
        <span className={`font-bold ${crit ? 'text-danger' : warn ? 'text-warning' : 'text-slate-200'}`}>
          {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value} {unit}
          {extraLabel && <span className="text-slate-500 ml-1 text-[10px]">{extraLabel}</span>}
        </span>
      </div>
      <div className="h-1.5 bg-space-950 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Phase Timeline ─────────────────────────────────────────────

function PhaseTimeline({ current, missionId }: { current: MissionPhase; missionId: string }) {
  const phases: MissionPhase[] = missionId === 'earth-observation'
    ? ['launch', 'deployment', 'orbital-insertion', 'operations', 'completed']
    : ['launch', 'deployment', 'transit', 'orbital-insertion', 'operations', 'completed']

  const currentIdx = phases.indexOf(current)

  return (
    <div className="space-y-1.5 font-mono text-xs">
      {phases.map((ph, idx) => {
        const isPast = currentIdx > idx
        const isCurrent = ph === current
        const isFuture = currentIdx < idx

        return (
          <div
            key={ph}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all ${
              isCurrent
                ? 'bg-space-800 border-electric shadow-glow-cyan text-white font-bold'
                : isPast
                ? 'bg-space-950/40 border-white/5 text-slate-500'
                : 'border-transparent text-slate-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isCurrent
                  ? 'bg-electric animate-pulse'
                  : isPast
                  ? 'bg-success'
                  : 'bg-slate-700'
              }`}
            />
            <span className="truncate text-[11px] uppercase tracking-wide">
              {PHASE_LABELS[ph].replace(/[^\w\s&]/gi, '').trim()}
            </span>
            {isPast && <CheckCircle2 className="w-3 h-3 text-success ml-auto" />}
            {isCurrent && <span className="text-[10px] text-electric ml-auto animate-pulse">ACTIVE</span>}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────

export default function Simulation() {
  const {
    selectedMission,
    selectedComponents,
    engineeringStats,
    simulationState,
    tickSimulation,
    pauseSimulation,
    resumeSimulation,
    setSimulationSpeed,
    resolveEvent,
    setScreen,
  } = useGameStore()

  const logRef = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)

  const mission = selectedMission ? MISSIONS[selectedMission] : null

  // Simulation tick loop: 1 real second = 10 simulation hours at 1x
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameStore.getState().simulationState
      if (!state.isRunning || state.pendingEvent) return
      if (state.phase === 'completed' || state.phase === 'failed') return
      const dtHours = 1.0 * state.speed
      tickSimulation(dtHours)
      setTick(t => t + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [tickSimulation])

  // Auto-scroll event log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [simulationState.events.length])

  if (!mission || !selectedMission) {
    return (
      <div className="min-h-screen bg-space-950 flex flex-col items-center justify-center text-slate-400 font-mono gap-4">
        <p>No active mission data found.</p>
        <button onClick={() => setScreen('missionSelect')} className="btn-primary">
          Choose a Mission
        </button>
      </div>
    )
  }

  const sim = simulationState
  const fuelMax = engineeringStats.fuelCapacity || 1
  const powerGen = engineeringStats.powerGeneration
  const powerCons = engineeringStats.powerConsumption
  const powerWarn = sim.powerBalance < 0
  const powerCrit = sim.powerBalance < -100
  const fuelWarn = sim.fuelRemaining / fuelMax < 0.2
  const fuelCrit = sim.fuelRemaining / fuelMax < 0.05
  const budgetMax = mission.budgetLimit
  const dataMax = 500

  const isTerminal = sim.phase === 'completed' || sim.phase === 'failed'

  return (
    <div className="h-screen bg-space-950 text-slate-100 flex flex-col font-sans overflow-hidden">

      {/* ── TOP TELEMETRY BAR ───────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-white/10 bg-space-900/90 px-5 py-2.5 flex items-center justify-between gap-4 backdrop-blur-md z-20">
        {/* Left: Mission & Phase */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{mission.icon}</span>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{mission.name}</div>
              <div className="text-[11px] text-slate-400 font-mono">{mission.destination}</div>
            </div>
          </div>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          {/* Phase Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase">PHASE:</span>
            <span className={`text-xs font-mono font-bold tracking-wide ${PHASE_COLOR[sim.phase]}`}>
              {PHASE_LABELS[sim.phase]}
            </span>
          </div>

          <div className="h-5 w-px bg-white/10" />

          {/* MET Clock */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase">MET:</span>
            <span className="text-xs font-mono font-bold text-highlight tracking-widest tabular-nums bg-space-950 px-2 py-0.5 rounded border border-highlight/30">
              {formatMET(sim.elapsedHours)}
            </span>
          </div>
        </div>

        {/* Right: Controls & Speeds */}
        <div className="flex items-center gap-3">
          {!isTerminal ? (
            <div className="flex items-center gap-2">
              {/* Speed Buttons */}
              <div className="flex items-center gap-1 font-mono">
                {[1, 5, 10, 50].map(s => (
                  <button
                    key={s}
                    onClick={() => setSimulationSpeed(s)}
                    className={`px-2 py-1 text-xs rounded-lg border transition-all ${
                      sim.speed === s
                        ? 'bg-electric text-space-950 font-bold border-electric shadow-sm'
                        : 'bg-space-900 border-white/10 text-slate-400 hover:border-white/30'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <div className="h-5 w-px bg-white/10" />

              {/* Pause / Resume */}
              {sim.isRunning && !sim.pendingEvent ? (
                <button
                  onClick={pauseSimulation}
                  className="px-3 py-1 text-xs font-mono rounded-lg border border-warning/50 bg-warning/15 text-warning hover:bg-warning/25 transition-colors flex items-center gap-1.5"
                >
                  <Pause className="w-3 h-3" /> PAUSE
                </button>
              ) : (
                <button
                  onClick={resumeSimulation}
                  disabled={!!sim.pendingEvent}
                  className="px-3 py-1 text-xs font-mono rounded-lg border border-success/50 bg-success/15 text-success hover:bg-success/25 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play className="w-3 h-3" /> RESUME
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setScreen('results')}
              className="btn-primary text-xs font-mono py-2 px-5 shadow-glow-cyan animate-pulse"
            >
              <span>MISSION REPORT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN FLIGHT DASHBOARD LAYOUT ────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL (25%): Real-Time Telemetry Gauges */}
        <aside className="w-72 shrink-0 border-r border-white/10 bg-space-900/40 p-4 overflow-y-auto space-y-4">
          <div className="hud-header border-b border-white/10 pb-2">
            <Gauge className="w-3.5 h-3.5" /> Flight Telemetry
          </div>

          <GaugeBar
            label="Propellant Store"
            value={sim.fuelRemaining}
            max={fuelMax}
            unit="kg"
            extraLabel={`(${fuelMax > 0 ? ((sim.fuelRemaining / fuelMax) * 100).toFixed(0) : 0}%)`}
            color="bg-electric"
            warn={fuelWarn}
            crit={fuelCrit}
            icon={<Fuel className="w-3 h-3 text-cyan-400" />}
          />

          <div className="space-y-1">
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-highlight" /> Power Balance
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-success">+{powerGen.toFixed(0)}W</span>
              <span className={powerWarn ? 'text-danger font-bold' : 'text-slate-200'}>
                {sim.powerBalance >= 0 ? `+${sim.powerBalance.toFixed(0)}W` : `${sim.powerBalance.toFixed(0)}W`}
              </span>
              <span className="text-danger">-{powerCons.toFixed(0)}W</span>
            </div>
            <div className="h-1.5 bg-space-950 rounded-full overflow-hidden border border-white/5 relative">
              <div
                className="h-full bg-success rounded-full absolute left-0"
                style={{ width: `${Math.min(100, (powerGen / Math.max(powerGen, powerCons, 1)) * 100)}%` }}
              />
              <div
                className="h-full w-1 bg-danger absolute"
                style={{ left: `${Math.min(100, (powerCons / Math.max(powerGen, powerCons, 1)) * 100)}%` }}
              />
            </div>
          </div>

          <GaugeBar
            label="Altitude"
            value={sim.altitude}
            max={600}
            unit="km"
            color="bg-violet"
            icon={<Compass className="w-3 h-3 text-violet" />}
          />

          <GaugeBar
            label="Velocity"
            value={sim.velocity}
            max={8000}
            unit="m/s"
            color="bg-cyan-400"
            icon={<Rocket className="w-3 h-3 text-cyan-400" />}
          />

          <GaugeBar
            label="Budget Used"
            value={sim.budgetSpent}
            max={budgetMax}
            unit="$M"
            extraLabel={`/ $${budgetMax}M`}
            color="bg-highlight"
            warn={sim.budgetSpent / budgetMax > 0.85}
            crit={sim.budgetSpent / budgetMax > 1}
            icon={<DollarSign className="w-3 h-3 text-highlight" />}
          />

          <GaugeBar
            label="Scientific Data"
            value={sim.scientificDataCollected}
            max={dataMax}
            unit="GB"
            color="bg-success"
            icon={<Radio className="w-3 h-3 text-success" />}
          />

          {/* Subsystems Health Check Matrix */}
          <div className="rounded-xl border border-white/5 bg-space-950/60 p-3 space-y-1.5 font-mono text-[11px]">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">
              Subsystems Health
            </div>
            {[
              { label: 'Power Arrays', ok: !powerWarn },
              { label: 'Propellant Line', ok: !fuelWarn },
              { label: 'Communications', ok: !!selectedComponents.antenna },
              { label: 'Thermal Envelope', ok: !!selectedComponents.thermal },
              { label: 'Attitude Guidance', ok: !!selectedComponents.attitude },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-slate-400">{s.label}</span>
                <span className={s.ok ? 'text-success' : 'text-danger'}>
                  {s.ok ? '● NOMINAL' : '● ALERT'}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL (50%): 3D Viewport + Event Log + Decision Dialog */}
        <main className="flex-1 flex flex-col overflow-hidden bg-space-950">

          {/* Upper: 3D Visualization Viewport */}
          <div className="relative h-60 sm:h-72 shrink-0 border-b border-white/10 bg-space-950 overflow-hidden">
            <div className="absolute top-3 left-4 z-10 rounded-lg bg-space-900/80 border border-white/10 px-3 py-1 backdrop-blur-sm">
              <span className="text-[10px] font-mono tracking-widest text-electric uppercase flex items-center gap-1.5">
                <Rocket className="h-3 w-3" /> Live Orbital Tracking Viewport
              </span>
            </div>

            <div className="h-full w-full">
              <Suspense
                fallback={
                  <div className="h-full w-full flex items-center justify-center font-mono text-xs text-electric">
                    SYNCHRONIZING ORBITAL CAMERA...
                  </div>
                }
              >
                <SpaceScene
                  missionId={selectedMission}
                  phase={sim.phase}
                  selectedComponents={selectedComponents}
                />
              </Suspense>
            </div>
          </div>

          {/* Pending Event Decision Dialog (if any active) */}
          {sim.pendingEvent && (
            <div className="shrink-0 border-b border-highlight/40 bg-highlight/10 p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 mb-2 font-mono text-xs text-highlight font-bold tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-highlight animate-pulse" />
                  <span>FLIGHT DIRECTOR INTERVENTION REQUIRED — FLIGHT PAUSED</span>
                </div>
                <div className="glass-panel rounded-xl p-4 border border-highlight/40 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {sim.pendingEvent.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {sim.pendingEvent.description}
                  </p>

                  {/* Decision Choices */}
                  {sim.pendingEvent.choices && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {sim.pendingEvent.choices.map(choice => (
                        <button
                          key={choice.id}
                          onClick={() => resolveEvent(choice.id)}
                          className="text-left p-3 rounded-xl border border-white/10 bg-space-800/80 hover:border-electric hover:bg-space-700/80 transition-all group"
                        >
                          <div className="text-xs font-bold text-white group-hover:text-electric mb-1 font-mono">
                            {choice.label}
                          </div>
                          <div className="text-[11px] text-slate-400 mb-2">{choice.description}</div>
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {choice.consequences.fuelDelta !== undefined && (
                              <span className={`px-1.5 py-0.5 rounded ${choice.consequences.fuelDelta < 0 ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                                ⛽ {choice.consequences.fuelDelta > 0 ? '+' : ''}{choice.consequences.fuelDelta?.toFixed(0)} kg
                              </span>
                            )}
                            {choice.consequences.powerDelta !== undefined && (
                              <span className={`px-1.5 py-0.5 rounded ${choice.consequences.powerDelta < 0 ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                                ⚡ {choice.consequences.powerDelta > 0 ? '+' : ''}{choice.consequences.powerDelta} W
                              </span>
                            )}
                            {choice.consequences.riskLevel !== undefined && (
                              <span className="px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                                ⚠ {(choice.consequences.riskLevel * 100).toFixed(0)}% risk
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lower: Mission Event Log */}
          <div className="flex-1 overflow-hidden flex flex-col bg-space-950">
            <div className="flex-shrink-0 px-4 py-2 border-b border-white/10 bg-space-900/50 flex items-center justify-between">
              <span className="hud-header text-[11px]">
                <Radio className="w-3 h-3" /> Downlink Event Telemetry Log
              </span>
              <span className="text-[10px] font-mono text-slate-500">{sim.events.length} Telemetry Packets</span>
            </div>

            <div
              ref={logRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs"
            >
              {sim.events.length === 0 && (
                <div className="text-slate-500 text-xs text-center pt-8">
                  Awaiting initial stage separation and ground telemetry...
                </div>
              )}
              {sim.events.map(evt => (
                <div
                  key={evt.id}
                  className={`rounded-xl border p-2.5 flex items-start gap-3 ${eventTypeColor(evt.type)}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${eventDot(evt.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200">{evt.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">MET {formatMET(evt.time)}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT PANEL (25%): Objectives & Mission Phases */}
        <aside className="w-72 shrink-0 border-l border-white/10 bg-space-900/40 p-4 overflow-y-auto space-y-5">
          {/* Objectives */}
          <div>
            <div className="hud-header border-b border-white/10 pb-2 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mission Objectives
            </div>
            <div className="space-y-2.5">
              {mission.objectives.map(obj => {
                const done = sim.objectivesCompleted.includes(obj.id)
                return (
                  <div
                    key={obj.id}
                    className={`rounded-xl p-3 border transition-all ${
                      done
                        ? 'border-success/40 bg-success/10'
                        : 'border-white/5 bg-space-950/60'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${done ? 'text-success' : 'text-slate-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs leading-snug font-medium ${done ? 'text-slate-100' : 'text-slate-400'}`}>
                          {obj.description}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 text-slate-500">
                          <span>{done ? 'Telemetred' : 'Collecting'}</span>
                          <span className="font-bold text-electric">+{obj.pointValue} PTS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Phase Track */}
          <div>
            <div className="hud-header border-b border-white/10 pb-2 mb-3">
              <Compass className="w-3.5 h-3.5" /> Mission Phases
            </div>
            <PhaseTimeline current={sim.phase} missionId={selectedMission} />
          </div>

          {/* Terminal Banner */}
          {isTerminal && (
            <div className="pt-2">
              <button
                onClick={() => setScreen('results')}
                className="w-full btn-primary text-xs font-mono py-3 shadow-glow-cyan"
              >
                VIEW MISSION RESULTS →
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
