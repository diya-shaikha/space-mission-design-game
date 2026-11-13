// ============================================================
// screens/SpacecraftDesigner.tsx — Deep Space Mission Control Designer
// ============================================================

import React, { useState, lazy, Suspense } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  RotateCcw,
  Play,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Zap,
  DollarSign,
  Weight,
  Gauge,
  Radio,
  Package,
  Layers,
  ShieldCheck,
  Flame,
  Fuel,
  Cpu,
  Compass,
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { COMPONENTS, COMPONENT_CATEGORIES, getComponentsByCategory } from '../data/components'
import type { ComponentCategory } from '../types'
import { MISSIONS } from '../data/missions'

const SpaceScene = lazy(() => import('../components/3d/SpaceScene'))

// ─── Helpers ─────────────────────────────────────────────────

function formatMass(kg: number): string {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(2)} Mt`
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`
  return `${kg.toFixed(0)} kg`
}
function formatCost(m: number): string {
  return `$${m.toFixed(1)}M`
}
function formatPower(w: number): string {
  const abs = Math.abs(w)
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)} kW`
  return `${abs.toFixed(0)} W`
}
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

// ─── StatBar ─────────────────────────────────────────────────

function StatBar({
  value,
  max,
  colorClass,
  danger,
}: {
  value: number
  max: number
  colorClass: string
  danger?: boolean
}) {
  const pct = max > 0 ? clamp01(value / max) * 100 : 0
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-space-950/80 border border-white/5">
      <div
        className={`h-full rounded-full transition-all duration-500 ${danger ? 'bg-danger' : colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── ComponentCard ────────────────────────────────────────────

function ComponentCard({
  id,
  selected,
  isMulti,
  onToggle,
}: {
  id: string
  selected: boolean
  isMulti: boolean
  onToggle: () => void
}) {
  const comp = COMPONENTS[id]
  if (!comp) return null

  const isGen = comp.powerConsumption < 0

  return (
    <button
      onClick={onToggle}
      data-id={comp.id}
      data-testid={comp.id}
      data-name={comp.name}
      data-category={comp.category}
      aria-label={`${comp.name} - ${comp.description}`}
      className={`group relative w-full rounded-xl border p-3.5 text-left transition-all duration-200
        ${
          selected
            ? 'border-electric bg-electric/15 shadow-glow-cyan'
            : 'border-white/10 bg-space-800/60 hover:border-electric/40 hover:bg-space-800/90'
        }`}
    >
      {/* Selection indicator */}
      <span
        className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-lg transition-colors
          ${
            selected
              ? 'bg-electric text-space-950 shadow-sm'
              : 'border border-white/20 bg-space-900/60'
          }`}
      >
        {selected && <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />}
      </span>

      {/* Name */}
      <p
        className={`pr-7 text-sm font-bold leading-tight font-sans ${
          selected ? 'text-electric text-glow-cyan' : 'text-slate-100'
        }`}
      >
        {comp.name}
      </p>

      {/* Description */}
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">
        {comp.description}
      </p>

      {/* Stat chips */}
      <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px]">
        <span className="inline-flex items-center gap-1 rounded-md bg-space-900 px-2 py-0.5 text-slate-300 border border-white/5">
          <Weight className="h-2.5 w-2.5 text-slate-400" />
          {formatMass(comp.mass)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-space-900 px-2 py-0.5 text-slate-300 border border-white/5">
          <DollarSign className="h-2.5 w-2.5 text-success" />
          {formatCost(comp.cost)}
        </span>
        {comp.powerConsumption !== 0 && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 border ${
              isGen
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                : 'bg-blue-950/40 text-blue-300 border-blue-500/30'
            }`}
          >
            <Zap className="h-2.5 w-2.5" />
            {isGen ? '+' : '-'}
            {formatPower(comp.powerConsumption)}
          </span>
        )}
        {comp.specificImpulse !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-950/40 px-2 py-0.5 text-highlight border border-orange-500/30">
            <Gauge className="h-2.5 w-2.5" />
            Isp {comp.specificImpulse}s
          </span>
        )}
        {comp.payloadCapacity !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-950/40 px-2 py-0.5 text-violet border border-purple-500/30">
            <Package className="h-2.5 w-2.5" />
            {formatMass(comp.payloadCapacity)} lift
          </span>
        )}
      </div>

      {/* Category multi-indicator */}
      {isMulti && (
        <span className="mt-2 block text-[9px] font-mono uppercase tracking-wider text-slate-500">
          [Multi-select capable]
        </span>
      )}
    </button>
  )
}

// ─── EngineeringIssuesPanel ──────────────────────────────────

function EngineeringIssuesPanel() {
  const { engineeringIssues, engineeringStats } = useGameStore()
  const [open, setOpen] = useState(true)

  const errors = engineeringIssues.filter(i => i.type === 'error')
  const warnings = engineeringIssues.filter(i => i.type === 'warning')
  const infos = engineeringIssues.filter(i => i.type === 'info')
  const isAllNominal = errors.length === 0 && warnings.length === 0

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 glass-panel">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-space-800/50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-electric" /> Flight Validation Status
          </span>
          {errors.length > 0 && (
            <span className="rounded-full bg-danger/20 border border-danger/40 px-2 py-0.5 text-[10px] font-mono font-bold text-danger">
              {errors.length} ERROR{errors.length !== 1 ? 'S' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="rounded-full bg-warning/20 border border-warning/40 px-2 py-0.5 text-[10px] font-mono font-bold text-warning">
              {warnings.length} WARNING{warnings.length !== 1 ? 'S' : ''}
            </span>
          )}
          {isAllNominal && (
            <span className="rounded-full bg-success/20 border border-success/40 px-2 py-0.5 text-[10px] font-mono font-bold text-success">
              ALL SYSTEMS GO
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-2 px-4 pb-4 max-h-56 overflow-y-auto">
          {isAllNominal && (
            <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success flex items-center gap-2 font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Spacecraft configuration satisfies all mission constraints and payload safety limits.</span>
            </div>
          )}

          {[...errors, ...warnings, ...infos].map(issue => {
            const isErr = issue.type === 'error'
            const isWrn = issue.type === 'warning'
            return (
              <div
                key={issue.code}
                className={`rounded-lg border p-3 ${
                  isErr
                    ? 'border-danger/40 bg-danger/10'
                    : isWrn
                    ? 'border-warning/40 bg-warning/10'
                    : 'border-blue-500/30 bg-blue-950/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isErr ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  ) : isWrn ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  ) : (
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold font-mono ${
                        isErr
                          ? 'text-danger'
                          : isWrn
                          ? 'text-warning'
                          : 'text-cyan-300'
                      }`}
                    >
                      {issue.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-300">{issue.description}</p>
                    <p
                      className={`mt-1 text-[11px] font-mono ${
                        isErr
                          ? 'text-danger/90'
                          : isWrn
                          ? 'text-warning/90'
                          : 'text-cyan-300'
                      }`}
                    >
                      💡 Suggested action: {issue.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── EngineeringStatsPanel ────────────────────────────────────

function EngineeringStatsPanel() {
  const { engineeringStats, selectedMission } = useGameStore()
  const mission = selectedMission ? MISSIONS[selectedMission] : null
  const s = engineeringStats

  return (
    <div className="rounded-xl border border-white/10 glass-panel p-4">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-electric font-mono flex items-center justify-between">
        <span>Live Engineering Telemetry</span>
        <span className="text-[10px] text-slate-500 font-normal">Real-Time Calculus</span>
      </h3>
      <div className="grid grid-cols-2 gap-2.5">

        {/* Total Mass */}
        <div className="rounded-xl bg-space-900/80 border border-white/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Mass</p>
            <Weight className="h-3 w-3 text-slate-500" />
          </div>
          <p className="mt-1 text-base font-bold font-mono text-white">{formatMass(s.totalMass)}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Dry {formatMass(s.dryMass)} • Fuel {formatMass(s.fuelMass)}
          </p>
          {s.payloadCapacity > 0 && (
            <StatBar
              value={s.payloadMass}
              max={s.payloadCapacity}
              colorClass="bg-electric"
              danger={!s.isLaunchVehicleCompatible}
            />
          )}
          {s.payloadCapacity > 0 && (
            <div className="text-[9px] text-slate-500 font-mono mt-1 text-right">
              Lift: {formatMass(s.payloadCapacity)}
            </div>
          )}
        </div>

        {/* Mission Cost */}
        <div className="rounded-xl bg-space-900/80 border border-white/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Mission Cost</p>
            <DollarSign className="h-3 w-3 text-success" />
          </div>
          <p className={`mt-1 text-base font-bold font-mono ${s.isBudgetOk ? 'text-white' : 'text-danger'}`}>
            {formatCost(s.totalCost)}
          </p>
          {mission && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Cap: {formatCost(mission.budgetLimit)}</p>
          )}
          {mission && (
            <StatBar
              value={s.totalCost}
              max={mission.budgetLimit}
              colorClass="bg-success"
              danger={!s.isBudgetOk}
            />
          )}
          {mission && (
            <div className="text-[9px] text-slate-500 font-mono mt-1 text-right">
              Margin: ${(mission.budgetLimit - s.totalCost).toFixed(1)}M
            </div>
          )}
        </div>

        {/* Power Balance */}
        <div className="rounded-xl bg-space-900/80 border border-white/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Power Margin</p>
            <Zap className="h-3 w-3 text-highlight" />
          </div>
          <p className={`mt-1 text-base font-bold font-mono ${s.isPowerSufficient ? 'text-electric' : 'text-danger'}`}>
            {s.powerBalance >= 0 ? `+${formatPower(s.powerBalance)}` : `-${formatPower(Math.abs(s.powerBalance))}`}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Gen {formatPower(s.powerGeneration)} / Use {formatPower(s.powerConsumption)}
          </p>
          {s.powerGeneration > 0 && (
            <StatBar
              value={s.powerConsumption}
              max={s.powerGeneration}
              colorClass="bg-electric"
              danger={!s.isPowerSufficient}
            />
          )}
        </div>

        {/* Delta-V */}
        <div className="rounded-xl bg-space-900/80 border border-white/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Delta-V</p>
            <Gauge className="h-3 w-3 text-violet" />
          </div>
          <p className={`mt-1 text-base font-bold font-mono ${s.isFuelSufficient ? 'text-white' : 'text-danger'}`}>
            {s.deltaV.toLocaleString()} m/s
          </p>
          {mission && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Req: {mission.deltaVRequirement} m/s</p>
          )}
          {mission && (
            <StatBar
              value={s.deltaV}
              max={mission.deltaVRequirement}
              colorClass="bg-violet"
              danger={!s.isFuelSufficient}
            />
          )}
        </div>

      </div>

      {/* Comms & Subsystems Strip */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-white/5 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Radio className="h-3 w-3 text-cyan-400" />
          <span>Downlink: <strong className="text-white">{s.communicationRate} kbps</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Fuel className="h-3 w-3 text-amber-400" />
          <span>Fuel Store: <strong className="text-white">{s.fuelCapacity} kg</strong></span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────

export default function SpacecraftDesigner() {
  const {
    selectedMission,
    selectedComponents,
    engineeringIssues,
    selectComponent,
    toggleInstrument,
    togglePower,
    resetDesign,
    setScreen,
  } = useGameStore()

  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('launch-vehicle')

  const mission = selectedMission ? MISSIONS[selectedMission] : null
  const componentsForCategory = getComponentsByCategory(activeCategory)

  const isMulti = activeCategory === 'instrument' || activeCategory === 'power'
  const errors = engineeringIssues.filter(i => i.type === 'error')
  const warnings = engineeringIssues.filter(i => i.type === 'warning')

  function isSelected(cat: ComponentCategory, id: string): boolean {
    switch (cat) {
      case 'launch-vehicle': return selectedComponents.launchVehicle === id
      case 'bus':            return selectedComponents.bus === id
      case 'engine':         return selectedComponents.engine === id
      case 'fuel-tank':      return selectedComponents.fuelTank === id
      case 'antenna':        return selectedComponents.antenna === id
      case 'thermal':        return selectedComponents.thermal === id
      case 'attitude':       return selectedComponents.attitude === id
      case 'instrument':     return selectedComponents.instruments.includes(id) ||
        (id === 'inst-spectrometer' && selectedComponents.instruments.includes('inst-imaging-spectrometer')) ||
        (id === 'inst-imaging-spectrometer' && selectedComponents.instruments.includes('inst-spectrometer'))
      case 'power':          return selectedComponents.power.includes(id)
    }
  }

  function handleToggle(cat: ComponentCategory, id: string) {
    if (cat === 'instrument') toggleInstrument(id)
    else if (cat === 'power') togglePower(id)
    else selectComponent(cat, id)
  }

  function countSelected(cat: ComponentCategory): number {
    switch (cat) {
      case 'launch-vehicle': return selectedComponents.launchVehicle ? 1 : 0
      case 'bus':            return selectedComponents.bus ? 1 : 0
      case 'engine':         return selectedComponents.engine ? 1 : 0
      case 'fuel-tank':      return selectedComponents.fuelTank ? 1 : 0
      case 'antenna':        return selectedComponents.antenna ? 1 : 0
      case 'thermal':        return selectedComponents.thermal ? 1 : 0
      case 'attitude':       return selectedComponents.attitude ? 1 : 0
      case 'instrument': {
        const unique = new Set(selectedComponents.instruments.map(i => i === 'inst-imaging-spectrometer' ? 'inst-spectrometer' : i))
        return unique.size
      }
      case 'power':          return selectedComponents.power.length
    }
  }

  const canProceed = errors.length === 0

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-space-950 text-slate-100 font-sans">

      {/* ── Top Bar ────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-space-900/90 px-5 backdrop-blur-md z-20">
        {/* Left: back + mission info */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('missionSelect')}
            className="btn-secondary text-xs font-mono py-1.5 px-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Missions
          </button>

          {mission && (
            <>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-2xl">{mission.icon}</span>
              <div>
                <p className="text-sm font-bold leading-tight text-white flex items-center gap-2">
                  {mission.name}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-electric/15 text-electric border border-electric/30">
                    STAGE 1: HARDWARE BLUEPRINT
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {mission.destination} • Budget {formatCost(mission.budgetLimit)} • {mission.difficulty}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right: status badges */}
        <div className="flex items-center gap-2 font-mono">
          {errors.length > 0 ? (
            <span className="badge-danger">
              <AlertTriangle className="h-3.5 w-3.5" />
              {errors.length} ERROR{errors.length !== 1 ? 'S' : ''}
            </span>
          ) : warnings.length > 0 ? (
            <span className="badge-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              {warnings.length} WARNING{warnings.length !== 1 ? 'S' : ''}
            </span>
          ) : (
            <span className="badge-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              BLUEPRINT CERTIFIED
            </span>
          )}
        </div>
      </header>

      {/* ── Main Split Workspace ───────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL (45%): Component Categories & Picker ── */}
        <div className="flex w-[46%] shrink-0 border-r border-white/10 bg-space-900/40">

          {/* Category Vertical Tab Strip */}
          <nav className="flex w-36 shrink-0 flex-col gap-1 border-r border-white/10 bg-space-950/70 p-2 overflow-y-auto">
            <span className="px-2 py-1 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              Subsystems
            </span>
            {COMPONENT_CATEGORIES.map(cat => {
              const active = activeCategory === cat.key
              const count = countSelected(cat.key)
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2.5 text-left text-xs transition-all
                    ${
                      active
                        ? 'bg-space-800 text-electric font-semibold border border-electric/40 shadow-glow-cyan'
                        : 'text-slate-400 hover:bg-space-800/40 hover:text-white border border-transparent'
                    }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate text-[11px]">{cat.label}</span>
                  </span>
                  {count > 0 && (
                    <span
                      className={`ml-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-mono font-bold
                        ${
                          active
                            ? 'bg-electric text-space-950'
                            : 'bg-space-800 text-slate-300 border border-white/10'
                        }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Component Selection Cards List */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Category header */}
            <div className="border-b border-white/10 px-4 py-3 bg-space-900/80">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  {COMPONENT_CATEGORIES.find(c => c.key === activeCategory)?.label}
                </h2>
                <span className="text-[10px] text-slate-500 font-mono">
                  {componentsForCategory.length} Hardware Options
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {COMPONENT_CATEGORIES.find(c => c.key === activeCategory)?.description}
              </p>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {componentsForCategory.map(comp => (
                <ComponentCard
                  key={comp.id}
                  id={comp.id}
                  selected={isSelected(activeCategory, comp.id)}
                  isMulti={isMulti}
                  onToggle={() => handleToggle(activeCategory, comp.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (54%): Telemetry, Issues & 3D Scene ── */}
        <div className="flex flex-1 flex-col overflow-hidden bg-space-950">

          {/* Upper: Telemetry Matrix + Issues Panel */}
          <div className="flex shrink-0 flex-col gap-3 p-4 border-b border-white/10 bg-space-900/30 overflow-y-auto max-h-[50%]">
            <EngineeringStatsPanel />
            <EngineeringIssuesPanel />
          </div>

          {/* Lower: 3D Visualization */}
          <div className="relative flex-1 bg-space-950 overflow-hidden">
            <div className="absolute left-4 top-3 z-10 rounded-lg bg-space-900/80 border border-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-[10px] font-mono tracking-widest text-electric uppercase flex items-center gap-1.5">
                <Compass className="h-3 w-3" /> Live CAD Spacecraft Preview
              </span>
            </div>

            <div className="h-full w-full">
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center font-mono">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-electric border-t-transparent" />
                      <span className="text-xs tracking-widest text-electric">INITIALIZING VIEWPORT…</span>
                    </div>
                  </div>
                }
              >
                <SpaceScene
                  missionId={selectedMission ?? undefined}
                  selectedComponents={selectedComponents}
                />
              </Suspense>
            </div>
          </div>

          {/* ── Action Footer ─────────────────────────────────── */}
          <footer className="shrink-0 flex items-center justify-between gap-3 border-t border-white/10 bg-space-900/90 px-5 py-3 backdrop-blur-md">
            {/* Reset */}
            <button
              onClick={() => {
                if (window.confirm('Reset all selected components to factory baseline?')) resetDesign()
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-mono text-slate-400 transition-all hover:border-white/20 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Design
            </button>

            {/* Launch Review CTA */}
            <div className="flex items-center gap-3">
              {errors.length > 0 && (
                <p className="text-xs text-danger font-mono">
                  Resolve {errors.length} error{errors.length !== 1 ? 's' : ''} to authorize flight
                </p>
              )}
              {errors.length === 0 && warnings.length > 0 && (
                <p className="text-xs text-warning font-mono">
                  {warnings.length} warning{warnings.length !== 1 ? 's' : ''} detected
                </p>
              )}
              <button
                disabled={!canProceed}
                onClick={() => setScreen('missionPlanning')}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-mono font-bold transition-all
                  ${
                    canProceed
                      ? 'btn-primary shadow-glow-cyan'
                      : 'cursor-not-allowed bg-space-800 text-slate-500 border border-slate-700'
                  }`}
              >
                <Play className="h-3.5 w-3.5" />
                Proceed to Flight Review
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
