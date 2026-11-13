// ============================================================
// screens/MissionLibrary.tsx — Space Mission Catalog & Archives
// ============================================================

import React, { useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Target,
  Compass,
  Rocket,
  Info,
  Clock,
  DollarSign,
  CheckCircle,
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { MISSIONS, MISSION_ORDER } from '../data/missions'
import type { MissionType } from '../types'

export default function MissionLibrary() {
  const { setScreen, selectMission } = useGameStore()
  const [selectedMissionId, setSelectedMissionId] = useState<MissionType>('earth-observation')

  const currentMission = MISSIONS[selectedMissionId]

  const handleStartMission = (missionId: MissionType) => {
    selectMission(missionId)
  }

  return (
    <div className="min-h-screen bg-[#030711] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-space-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen('mainMenu')}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-mono text-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            BACK TO MAIN MENU
          </button>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-wide">
              NASA MISSION ARCHIVE & CATALOG
            </h1>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
        {/* Left List of Missions (4 Cols) */}
        <div className="md:col-span-4 flex flex-col gap-3 overflow-y-auto">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest px-1">
            Available Flight Programs
          </div>
          {MISSION_ORDER.map(id => {
            const m = MISSIONS[id]
            const isSelected = selectedMissionId === id
            return (
              <button
                key={id}
                onClick={() => setSelectedMissionId(id as MissionType)}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-900/20'
                    : 'border-white/10 bg-space-900/40 hover:border-white/20 hover:bg-space-800/40'
                }`}
              >
                <span className="text-3xl">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{m.name}</div>
                  <div className="text-xs text-cyan-400 truncate">{m.subtitle}</div>
                  <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-slate-400">
                    <span>{m.difficulty}</span>
                    <span>•</span>
                    <span>${m.budgetLimit}M</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right Detail Dossier (8 Cols) */}
        <div className="md:col-span-8 bg-space-900/40 border border-cyan-500/20 rounded-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            {/* Mission Hero Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{currentMission.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentMission.name}</h2>
                    <p className="text-sm text-cyan-400 font-mono">{currentMission.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mt-2">
                  {currentMission.description}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-space-800 border border-cyan-500/30 text-cyan-400 shrink-0">
                {currentMission.difficulty.toUpperCase()}
              </span>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-space-950/60 p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">DESTINATION</div>
                <div className="text-sm font-bold text-white mt-1 truncate">{currentMission.destination}</div>
              </div>
              <div className="bg-space-950/60 p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">BUDGET CAP</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">${currentMission.budgetLimit}M</div>
              </div>
              <div className="bg-space-950/60 p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">REQ. DELTA-V</div>
                <div className="text-sm font-bold text-blue-400 mt-1">{currentMission.deltaVRequirement} m/s</div>
              </div>
              <div className="bg-space-950/60 p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase">MISSION DURATION</div>
                <div className="text-sm font-bold text-white mt-1">{currentMission.duration} Days</div>
              </div>
            </div>

            {/* Scientific Objectives */}
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" /> Primary Mission Objectives
              </div>
              <div className="space-y-2">
                {currentMission.objectives.map((obj, i) => (
                  <div key={obj.id} className="p-3 rounded-lg bg-space-950/40 border border-white/5 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-cyan-400">{i + 1}.</span>
                      <span className="text-slate-200">{obj.description}</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold shrink-0">{obj.pointValue} PTS</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific & Engineering Background */}
            <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" /> Real-World Scientific Context & Engineering Notes
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {currentMission.backgroundInfo}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => setScreen('mainMenu')}
              className="btn-secondary"
            >
              Back to Main Menu
            </button>

            <button
              onClick={() => handleStartMission(selectedMissionId)}
              className="btn-primary"
            >
              <Rocket className="h-4 w-4" />
              Configure Spacecraft For This Mission
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

