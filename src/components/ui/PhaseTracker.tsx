// ============================================================
// PhaseTracker.tsx – Horizontal mission-phase progress track
// ============================================================

import { CheckCircle2, Circle, Zap } from 'lucide-react'
import { MissionPhase } from '../../types'

interface PhaseTrackerProps {
  currentPhase: string
  missionId: string
}

// ─────────────────────────────────────────────
// Phase ordering
// ─────────────────────────────────────────────
const ALL_PHASES: MissionPhase[] = [
  'pre-launch',
  'launch',
  'deployment',
  'transit',
  'orbital-insertion',
  'operations',
  'completed',
]

const PHASE_LABELS: Record<MissionPhase, string> = {
  'pre-launch':        'Pre-Launch',
  'launch':            'Launch',
  'deployment':        'Deploy',
  'transit':           'Transit',
  'orbital-insertion': 'Insertion',
  'operations':        'Operations',
  'completed':         'Complete',
  'failed':            'Failed',
}

// Phases shown for various mission types (subset of ALL_PHASES)
const MISSION_PHASES: Record<string, MissionPhase[]> = {
  'earth-observation': ['pre-launch', 'launch', 'deployment', 'operations', 'completed'],
  'lunar-exploration': ['pre-launch', 'launch', 'transit', 'orbital-insertion', 'operations', 'completed'],
  'lunar-landing':     ['pre-launch', 'launch', 'transit', 'orbital-insertion', 'deployment', 'operations', 'completed'],
  'planetary-science': ALL_PHASES,
}

function getPhases(missionId: string): MissionPhase[] {
  return MISSION_PHASES[missionId] ?? ALL_PHASES
}

function getPhaseIndex(phases: MissionPhase[], phase: string): number {
  return phases.indexOf(phase as MissionPhase)
}

// ─────────────────────────────────────────────
// Single phase node
// ─────────────────────────────────────────────
interface PhaseNodeProps {
  phase: MissionPhase
  state: 'completed' | 'current' | 'future'
  isLast: boolean
}

function PhaseNode({ phase, state, isLast }: PhaseNodeProps) {
  const label = PHASE_LABELS[phase] ?? phase

  const nodeClasses = {
    completed:
      'text-green-400 border-green-500 bg-green-900/40',
    current:
      'text-cyan-300 border-cyan-400 bg-cyan-900/40 shadow-md shadow-cyan-500/50 ring-1 ring-cyan-400/40',
    future:
      'text-slate-500 border-slate-600 bg-slate-800/30',
  }[state]

  const labelClasses = {
    completed: 'text-green-400',
    current:   'text-cyan-300 font-semibold',
    future:    'text-slate-500',
  }[state]

  const connectorClass =
    state === 'completed' ? 'bg-green-500/60' : 'bg-slate-700/60'

  return (
    <div className="flex items-center">
      {/* Node */}
      <div className="flex flex-col items-center gap-1">
        {/* Icon */}
        <div
          className={`
            flex h-7 w-7 items-center justify-center rounded-full border
            transition-all duration-300 ${nodeClasses}
          `}
        >
          {state === 'completed' ? (
            <CheckCircle2 size={14} />
          ) : state === 'current' ? (
            <Zap size={13} className="animate-pulse" />
          ) : (
            <Circle size={12} />
          )}
        </div>

        {/* Label */}
        <span
          className={`
            text-center text-[9px] uppercase tracking-wider
            leading-tight transition-colors duration-200 ${labelClasses}
          `}
          style={{ maxWidth: '52px' }}
        >
          {label}
        </span>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className={`h-0.5 w-6 flex-shrink-0 rounded-full ${connectorClass} mx-0.5`} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// PhaseTracker
// ─────────────────────────────────────────────
export default function PhaseTracker({
  currentPhase,
  missionId,
}: PhaseTrackerProps) {
  const phases = getPhases(missionId)
  const currentIdx = getPhaseIndex(phases, currentPhase)

  // If currentPhase is 'failed' we still render but mark the last active as failed
  const isFailed = currentPhase === 'failed'

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Mission Phase
        </span>
        <span
          className={`
            rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest
            ${isFailed
              ? 'bg-red-900/40 text-red-400 border border-red-600/40'
              : 'bg-slate-800/60 text-cyan-400 border border-cyan-700/30'
            }
          `}
        >
          {isFailed ? 'MISSION FAILED' : (PHASE_LABELS[currentPhase as MissionPhase] ?? currentPhase)}
        </span>
      </div>

      {/* Phase track */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-start min-w-max">
          {phases.map((phase, idx) => {
            let state: 'completed' | 'current' | 'future'

            if (isFailed) {
              // All phases before current are completed, current and beyond are future
              state = idx < currentIdx ? 'completed' : 'future'
            } else if (idx < currentIdx) {
              state = 'completed'
            } else if (idx === currentIdx) {
              state = 'current'
            } else {
              state = 'future'
            }

            return (
              <PhaseNode
                key={phase}
                phase={phase}
                state={state}
                isLast={idx === phases.length - 1}
              />
            )
          })}
        </div>
      </div>

      {/* Progress bar underlay */}
      <div className="relative h-0.5 w-full rounded-full bg-slate-700/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-400 transition-all duration-700"
          style={{
            width:
              currentIdx >= 0
                ? `${((currentIdx) / Math.max(phases.length - 1, 1)) * 100}%`
                : '0%',
          }}
        />
      </div>
    </div>
  )
}
