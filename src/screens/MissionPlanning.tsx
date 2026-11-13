// ============================================================
// screens/MissionPlanning.tsx — Pre-Launch Flight Readiness Review
// ============================================================

import React, { lazy, Suspense } from 'react'
import {
  ArrowLeft,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ChevronRight,
  Cpu,
  Zap,
  DollarSign,
  Weight,
  Radio,
  Compass,
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { MISSIONS } from '../data/missions'
import { COMPONENTS } from '../data/components'

const SpaceScene = lazy(() => import('../components/3d/SpaceScene'))

export default function MissionPlanning() {
  const {
    selectedMission,
    selectedComponents,
    engineeringStats,
    engineeringIssues,
    setScreen,
    startSimulation,
  } = useGameStore()

  const mission = selectedMission ? MISSIONS[selectedMission] : null

  if (!mission || !selectedMission) {
    return (
      <div className="min-h-screen bg-space-950 flex flex-col items-center justify-center text-slate-400 font-mono gap-4">
        <p>No active mission data found.</p>
        <button
          onClick={() => setScreen('missionSelect')}
          className="btn-primary"
        >
          Select a Mission
        </button>
      </div>
    )
  }

  const errors = engineeringIssues.filter(i => i.type === 'error')
  const warnings = engineeringIssues.filter(i => i.type === 'warning')
  const canLaunch = errors.length === 0 && engineeringStats.hasRequiredComponents

  // Gather installed components list
  const installedList: { category: string; id: string; name: string; mass: number; cost: number; power: number }[] = []

  const addComp = (category: string, id: string | null) => {
    if (id && COMPONENTS[id]) {
      const c = COMPONENTS[id]
      installedList.push({
        category,
        id,
        name: c.name,
        mass: c.mass,
        cost: c.cost,
        power: c.powerConsumption,
      })
    }
  }

  addComp('Launch Vehicle', selectedComponents.launchVehicle)
  addComp('Spacecraft Bus', selectedComponents.bus)
  addComp('Propulsion', selectedComponents.engine)
  addComp('Fuel Tank', selectedComponents.fuelTank)
  addComp('Communications', selectedComponents.antenna)
  addComp('Thermal Control', selectedComponents.thermal)
  addComp('Attitude Guidance', selectedComponents.attitude)
  selectedComponents.instruments.forEach(id => addComp('Scientific Instrument', id))
  selectedComponents.power.forEach(id => addComp('Power Generation', id))

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-electric selection:text-space-950">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-space-900/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('spacecraft-designer')}
            className="btn-secondary text-xs font-mono py-1.5 px-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            BACK TO BLUEPRINT
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{mission.icon}</span>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                {mission.name}
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-normal bg-electric/15 border border-electric/30 text-electric">
                  STAGE 2: FLIGHT READINESS REVIEW
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                TARGET: {mission.destination} • DURATION: {mission.duration} DAYS
              </p>
            </div>
          </div>
        </div>

        {/* Flight Readiness Badge */}
        <div className="flex items-center gap-3 font-mono">
          {canLaunch ? (
            <div className="badge-success">
              <ShieldCheck className="h-4 w-4" />
              FLIGHT STATUS: GO FOR LAUNCH
            </div>
          ) : (
            <div className="badge-danger">
              <XCircle className="h-4 w-4" />
              FLIGHT STATUS: NO-GO ({errors.length} ERRORS)
            </div>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: 3D Scene & Trajectory (5 Cols) */}
        <div className="lg:col-span-5 border-r border-white/10 flex flex-col bg-space-950 relative min-h-[350px]">
          <div className="absolute top-4 left-4 z-10 glass-panel border border-electric/30 px-3 py-1.5 rounded-xl">
            <div className="text-[10px] font-mono text-electric uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="h-3 w-3" /> Trajectory Dynamics
            </div>
            <div className="text-xs text-slate-300 font-sans mt-0.5">
              {mission.destination}
            </div>
          </div>

          <div className="flex-1 w-full h-full">
            <Suspense
              fallback={
                <div className="h-full w-full flex items-center justify-center text-electric font-mono text-xs">
                  RENDERING ORBITAL ENVIRONMENT...
                </div>
              }
            >
              <SpaceScene
                missionId={selectedMission}
                selectedComponents={selectedComponents}
              />
            </Suspense>
          </div>

          {/* Quick Metrics Bar at bottom of 3D scene */}
          <div className="p-4 bg-space-900/90 border-t border-white/10 grid grid-cols-3 gap-2.5 text-center font-mono">
            <div className="bg-space-950/80 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase">Delta-V</div>
              <div className={`text-sm font-bold ${engineeringStats.isFuelSufficient ? 'text-electric' : 'text-danger'}`}>
                {engineeringStats.deltaV.toLocaleString()} m/s
              </div>
              <div className="text-[10px] text-slate-500">Req: {mission.deltaVRequirement} m/s</div>
            </div>
            <div className="bg-space-950/80 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase">Lift Margin</div>
              <div className={`text-sm font-bold ${engineeringStats.isLaunchVehicleCompatible ? 'text-success' : 'text-danger'}`}>
                {engineeringStats.payloadCapacity > 0
                  ? `${Math.max(0, Math.round(engineeringStats.payloadCapacity - engineeringStats.payloadMass)).toLocaleString()} kg`
                  : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500">Available</div>
            </div>
            <div className="bg-space-950/80 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] text-slate-400 uppercase">Net Power</div>
              <div className={`text-sm font-bold ${engineeringStats.powerBalance >= 0 ? 'text-electric' : 'text-danger'}`}>
                {engineeringStats.powerBalance >= 0 ? `+${Math.round(engineeringStats.powerBalance)} W` : `${Math.round(engineeringStats.powerBalance)} W`}
              </div>
              <div className="text-[10px] text-slate-500">Generation Margin</div>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Briefing & Checklist (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col overflow-y-auto bg-space-900/30 p-6 space-y-6">
          {/* Engineering Verification Cards */}
          <div>
            <h2 className="hud-header mb-3">
              <Cpu className="h-4 w-4" /> Flight Authorization Matrix
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className={`p-3 rounded-xl border ${engineeringStats.isLaunchVehicleCompatible ? 'bg-space-900/80 border-success/30' : 'bg-danger/10 border-danger/40'}`}>
                <div className="text-[10px] text-slate-400 uppercase">LAUNCH CAPACITY</div>
                <div className="text-sm font-bold text-white mt-1">
                  {Math.round(engineeringStats.payloadMass).toLocaleString()} kg
                </div>
                <div className={`text-[10px] mt-1 ${engineeringStats.isLaunchVehicleCompatible ? 'text-success' : 'text-danger'}`}>
                  {engineeringStats.isLaunchVehicleCompatible ? '✓ Within Limit' : '✗ Over Capacity'}
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${engineeringStats.isPowerSufficient ? 'bg-space-900/80 border-electric/30' : 'bg-danger/10 border-danger/40'}`}>
                <div className="text-[10px] text-slate-400 uppercase">POWER MARGIN</div>
                <div className="text-sm font-bold text-white mt-1">
                  {Math.round(engineeringStats.powerGeneration)}W / {Math.round(engineeringStats.powerConsumption)}W
                </div>
                <div className={`text-[10px] mt-1 ${engineeringStats.isPowerSufficient ? 'text-electric' : 'text-danger'}`}>
                  {engineeringStats.isPowerSufficient ? '✓ Positive' : '✗ Brownout Risk'}
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${engineeringStats.isFuelSufficient ? 'bg-space-900/80 border-violet/30' : 'bg-danger/10 border-danger/40'}`}>
                <div className="text-[10px] text-slate-400 uppercase">DELTA-V BUDGET</div>
                <div className="text-sm font-bold text-white mt-1">
                  {engineeringStats.deltaV.toLocaleString()} m/s
                </div>
                <div className={`text-[10px] mt-1 ${engineeringStats.isFuelSufficient ? 'text-violet' : 'text-danger'}`}>
                  {engineeringStats.isFuelSufficient ? '✓ Maneuver Ready' : '✗ Shortfall'}
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${engineeringStats.isBudgetOk ? 'bg-space-900/80 border-success/30' : 'bg-danger/10 border-danger/40'}`}>
                <div className="text-[10px] text-slate-400 uppercase">FISCAL BUDGET</div>
                <div className="text-sm font-bold text-white mt-1">
                  ${engineeringStats.totalCost.toFixed(1)}M
                </div>
                <div className={`text-[10px] mt-1 ${engineeringStats.isBudgetOk ? 'text-success' : 'text-danger'}`}>
                  {engineeringStats.isBudgetOk ? `✓ < $${mission.budgetLimit}M` : '✗ Over Budget'}
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Objective Feasibility Analysis */}
          <div>
            <h2 className="hud-header mb-3">
              <Compass className="h-4 w-4" /> Science Objectives Payload Alignment
            </h2>
            <div className="space-y-2">
              {mission.objectives.map(obj => {
                const required = obj.requiredInstruments ?? []
                const isInstrumentEquipped = (id: string) => {
                  if (selectedComponents.instruments.includes(id)) return true
                  if (id === 'inst-spectrometer' && selectedComponents.instruments.includes('inst-imaging-spectrometer')) return true
                  if (id === 'inst-imaging-spectrometer' && selectedComponents.instruments.includes('inst-spectrometer')) return true
                  return false
                }
                const missing = required.filter(id => !isInstrumentEquipped(id))
                const isReady = missing.length === 0

                return (
                  <div
                    key={obj.id}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                      isReady ? 'glass-card border-success/30 bg-space-900/40' : 'border-warning/30 bg-warning/5'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isReady ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs sm:text-sm text-slate-200">{obj.description}</div>
                        {required.length > 0 && (
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1 font-mono">
                            <span>Requires:</span>
                            {required.map(id => {
                              const name = COMPONENTS[id]?.name ?? id
                              const has = isInstrumentEquipped(id)
                              return (
                                <span
                                  key={id}
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    has ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'
                                  }`}
                                >
                                  {name}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-electric shrink-0">
                      {obj.pointValue} PTS
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Spacecraft Hardware Manifest */}
          <div>
            <h2 className="hud-header mb-3">
              <Radio className="h-4 w-4" /> Certified Hardware Inventory
            </h2>
            <div className="glass-panel rounded-xl border border-white/10 divide-y divide-white/5 max-h-48 overflow-y-auto">
              {installedList.map(item => (
                <div key={item.id} className="p-2.5 px-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase w-28 truncate">{item.category}</span>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-slate-400 text-[11px]">
                    <span>{item.mass.toLocaleString()} kg</span>
                    <span className="text-success">${item.cost}M</span>
                    <span>{item.power < 0 ? `+${Math.abs(item.power)}W` : `${item.power}W`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engineering Issues / Warnings */}
          {engineeringIssues.length > 0 && (
            <div>
              <h2 className="hud-header mb-3 text-warning">
                <AlertTriangle className="h-4 w-4" /> Flight Discrepancies ({engineeringIssues.length})
              </h2>
              <div className="space-y-2 font-mono">
                {engineeringIssues.map((issue, idx) => {
                  const isErr = issue.type === 'error'
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs ${
                        isErr
                          ? 'bg-danger/10 border-danger/40 text-danger'
                          : 'bg-warning/10 border-warning/40 text-warning'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {isErr ? <XCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                        <span>{issue.title}</span>
                      </div>
                      <div className="mt-1 text-slate-300 font-sans text-xs">{issue.description}</div>
                      <div className="mt-1 text-[11px] text-cyan-300">💡 Suggested: {issue.suggestion}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setScreen('spacecraft-designer')}
              className="btn-secondary w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Adjust Hardware Design
            </button>

            <button
              disabled={!canLaunch}
              onClick={() => startSimulation()}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all ${
                canLaunch
                  ? 'btn-primary shadow-glow-cyan pulse-glow'
                  : 'bg-space-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Rocket className="h-4 w-4" />
              INITIATE LAUNCH SEQUENCE
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
