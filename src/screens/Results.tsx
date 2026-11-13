// ============================================================
// screens/Results.tsx — Deep Space Mission Control Results Debrief
// ============================================================

import React from 'react'
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Compass,
  DollarSign,
  Zap,
  Fuel,
  Award,
  ChevronRight,
  Home,
  Clock,
  Sparkles,
  Weight,
  Gauge,
  Radio,
  Rocket,
  Shield,
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { MISSIONS } from '../data/missions'

function getGrade(score: number): { grade: string; color: string; badge: string } {
  if (score >= 95) return { grade: 'A+', color: 'text-electric', badge: 'bg-electric/20 border-electric/40 text-electric' }
  if (score >= 85) return { grade: 'A', color: 'text-success', badge: 'bg-success/20 border-success/40 text-success' }
  if (score >= 75) return { grade: 'B', color: 'text-cyan-300', badge: 'bg-cyan-900/30 border-cyan-500/40 text-cyan-300' }
  if (score >= 60) return { grade: 'C', color: 'text-warning', badge: 'bg-warning/20 border-warning/40 text-warning' }
  if (score >= 40) return { grade: 'D', color: 'text-highlight', badge: 'bg-highlight/20 border-highlight/40 text-highlight' }
  return { grade: 'F', color: 'text-danger', badge: 'bg-danger/20 border-danger/40 text-danger' }
}

function formatDuration(hours: number): string {
  const d = Math.floor(hours / 24)
  const h = Math.floor(hours % 24)
  return `${d}d ${h}h`
}

function formatMass(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`
  return `${kg.toFixed(0)} kg`
}

export default function Results() {
  const {
    missionResult,
    selectedMission,
    engineeringStats,
    setScreen,
    resetSimulation,
  } = useGameStore()

  const mission = selectedMission ? MISSIONS[selectedMission] : null

  if (!missionResult || !mission) {
    return (
      <div className="min-h-screen bg-space-950 flex flex-col items-center justify-center text-slate-400 font-mono gap-4">
        <p>No mission results available.</p>
        <button
          onClick={() => setScreen('missionSelect')}
          className="btn-primary"
        >
          Select a Mission
        </button>
      </div>
    )
  }

  const { score, scoreBreakdown, success, partialSuccess } = missionResult
  const gradeInfo = getGrade(score)

  const bannerColor = success
    ? 'from-emerald-950/80 via-space-900 to-cyan-950/80 border-success/40'
    : partialSuccess
    ? 'from-amber-950/80 via-space-900 to-blue-950/80 border-warning/40'
    : 'from-red-950/80 via-space-900 to-slate-950/80 border-danger/40'

  const statusTitle = success
    ? 'MISSION ACCOMPLISHED'
    : partialSuccess
    ? 'PARTIAL MISSION SUCCESS'
    : 'FLIGHT COMPROMISED'

  const statusSub = success
    ? 'All flight milestones and primary scientific telemetry payloads achieved with high efficiency.'
    : partialSuccess
    ? 'Spacecraft reached its destination, but certain payload objectives or endurance limits were cut short.'
    : 'Spacecraft encountered critical flight bottlenecks that prevented nominal mission completion.'

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 py-10 px-4 md:px-8 overflow-y-auto selection:bg-electric selection:text-space-950 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Top Header Banner ── */}
        <div className={`p-6 md:p-8 rounded-3xl border bg-gradient-to-r ${bannerColor} glass-panel relative overflow-hidden shadow-2xl`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{mission.icon}</span>
                <span className="text-xs font-mono uppercase tracking-widest text-electric">
                  {mission.name} • FLIGHT DIRECTOR REPORT
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                {statusTitle}
                {success && <Sparkles className="h-6 w-6 text-highlight animate-pulse" />}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {statusSub}
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="bg-space-950/80 border border-white/10 rounded-2xl p-5 text-center min-w-[170px] shadow-glass">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                Mission Score
              </div>
              <div className="text-4xl font-extrabold font-mono text-white mt-1">
                {score}<span className="text-lg text-slate-500 font-normal">/100</span>
              </div>
              <div className={`mt-1.5 inline-block text-xs font-mono font-bold px-3 py-1 rounded-full border ${gradeInfo.badge}`}>
                GRADE: {gradeInfo.grade}
              </div>
            </div>
          </div>
        </div>

        {/* ── Score Category Breakdown ── */}
        <div>
          <h2 className="hud-header mb-3">
            <Award className="h-4 w-4" /> Comprehensive Performance Evaluation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-4">
              <div className="text-[11px] text-slate-400 font-mono">SCIENTIFIC RETURN</div>
              <div className="text-2xl font-bold font-mono text-electric mt-1">
                {scoreBreakdown.scientific} <span className="text-xs text-slate-500">/ 40</span>
              </div>
              <div className="h-1.5 bg-space-950 rounded-full mt-2 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-electric rounded-full"
                  style={{ width: `${(scoreBreakdown.scientific / 40) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 font-mono">Payload objectives</div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <div className="text-[11px] text-slate-400 font-mono">ENGINEERING VIABILITY</div>
              <div className="text-2xl font-bold font-mono text-violet mt-1">
                {scoreBreakdown.engineering} <span className="text-xs text-slate-500">/ 20</span>
              </div>
              <div className="h-1.5 bg-space-950 rounded-full mt-2 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-violet rounded-full"
                  style={{ width: `${(scoreBreakdown.engineering / 20) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 font-mono">Systems integration</div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <div className="text-[11px] text-slate-400 font-mono">FISCAL EFFICIENCY</div>
              <div className="text-2xl font-bold font-mono text-success mt-1">
                {scoreBreakdown.budget} <span className="text-xs text-slate-500">/ 20</span>
              </div>
              <div className="h-1.5 bg-space-950 rounded-full mt-2 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-success rounded-full"
                  style={{ width: `${(scoreBreakdown.budget / 20) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 font-mono">Budget preservation</div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <div className="text-[11px] text-slate-400 font-mono">RESOURCE EFFICIENCY</div>
              <div className="text-2xl font-bold font-mono text-highlight mt-1">
                {scoreBreakdown.efficiency} <span className="text-xs text-slate-500">/ 20</span>
              </div>
              <div className="h-1.5 bg-space-950 rounded-full mt-2 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-highlight rounded-full"
                  style={{ width: `${(scoreBreakdown.efficiency / 20) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 font-mono">Fuel & power reserve</div>
            </div>
          </div>
        </div>

        {/* ── Key Hardware & Telemetry Matrix (Mass, Power, Budget, Delta-V) ── */}
        <div>
          <h2 className="hud-header mb-3">
            <Gauge className="h-4 w-4" /> Spacecraft Hardware &amp; Flight Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="stat-card">
              <div className="stat-label flex items-center justify-between">
                <span>Total Mass</span>
                <Weight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="stat-value text-white">
                {formatMass(engineeringStats.totalMass)}
              </div>
              <div className="text-[10px] text-slate-400">
                Payload: {formatMass(engineeringStats.payloadMass)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label flex items-center justify-between">
                <span>Power Generation</span>
                <Zap className="w-3.5 h-3.5 text-highlight" />
              </div>
              <div className="stat-value text-electric">
                {Math.round(engineeringStats.powerGeneration)} W
              </div>
              <div className="text-[10px] text-slate-400">
                Use: {Math.round(engineeringStats.powerConsumption)} W
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label flex items-center justify-between">
                <span>Delta-V Performance</span>
                <Gauge className="w-3.5 h-3.5 text-violet" />
              </div>
              <div className="stat-value text-violet">
                {engineeringStats.deltaV.toLocaleString()} m/s
              </div>
              <div className="text-[10px] text-slate-400">
                Req: {mission.deltaVRequirement} m/s
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label flex items-center justify-between">
                <span>Mission Budget</span>
                <DollarSign className="w-3.5 h-3.5 text-success" />
              </div>
              <div className="stat-value text-success">
                ${missionResult.budgetUsed.toFixed(1)}M
              </div>
              <div className="text-[10px] text-slate-400">
                Limit: ${missionResult.budgetLimit}M
              </div>
            </div>
          </div>
        </div>

        {/* ── Scientific Objectives Assessment ── */}
        <div>
          <h2 className="hud-header mb-3">
            <Compass className="h-4 w-4" /> Scientific Deliverables Checklist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mission.objectives.map(obj => {
              const achieved = missionResult.objectivesAchieved.includes(obj.id)
              return (
                <div
                  key={obj.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                    achieved
                      ? 'glass-card border-success/40 bg-success/10'
                      : 'glass-card border-danger/40 bg-danger/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {achieved ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{obj.description}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        Status: {achieved ? 'Telemetry Received & Verified' : 'Incomplete / Missing Instrument'}
                      </div>
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-bold shrink-0 ${achieved ? 'text-success' : 'text-slate-600'}`}>
                    +{achieved ? obj.pointValue : 0} PTS
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Engineering Recommendations & Debrief ── */}
        {missionResult.recommendations.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 border border-electric/30 space-y-3">
            <h3 className="hud-header text-electric">
              <Award className="h-4 w-4" /> Flight Director Engineering Recommendations
            </h3>
            <div className="space-y-2">
              {missionResult.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <span className="font-mono text-electric font-bold">{idx + 1}.</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Navigation ── */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setScreen('mainMenu')}
            className="btn-secondary w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            <span>Return to Mission Control</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setScreen('missionSelect')}
              className="btn-secondary w-full sm:w-auto"
            >
              Select New Mission
            </button>

            <button
              onClick={() => resetSimulation()}
              className="btn-primary w-full sm:w-auto shadow-glow-cyan"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Redesign Spacecraft &amp; Retry</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
