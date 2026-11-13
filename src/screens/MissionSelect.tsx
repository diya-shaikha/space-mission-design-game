// ============================================================
// screens/MissionSelect.tsx — Deep Space Mission Selection
// ============================================================

import React, { useState } from 'react'
import {
  ArrowLeft,
  DollarSign,
  Target,
  ChevronRight,
  Info,
  Compass,
  Rocket,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { MISSIONS, MISSION_ORDER } from '../data/missions'

const DIFFICULTY_BADGES = {
  Beginner: 'bg-success/20 text-success border-success/40',
  Intermediate: 'bg-electric/20 text-electric border-electric/40',
  Advanced: 'bg-warning/20 text-warning border-warning/40',
  Expert: 'bg-highlight/20 text-highlight border-highlight/40',
}

export default function MissionSelect() {
  const { setScreen, selectMission } = useGameStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState<string | null>(null)

  const handleSelect = (missionId: string) => {
    setSelectedId(missionId)
  }

  const handleConfirm = () => {
    if (selectedId) {
      selectMission(selectedId as any)
    }
  }

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 overflow-y-auto selection:bg-electric selection:text-space-950 font-sans">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Top Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <button
            onClick={() => setScreen('mainMenu')}
            className="btn-secondary text-xs font-mono py-2 px-3.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>MISSION CONTROL</span>
          </button>
          <div className="flex-1">
            <div className="hud-header">
              <Compass className="w-3.5 h-3.5" /> FLIGHT PROGRAM DIRECTIVES
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Mission Selection Manifest
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Select your flight objective. Each destination imposes distinct Delta-V, power, payload, and budget boundaries.
            </p>
          </div>
        </div>

        {/* 2x2 Grid of Missions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
          {MISSION_ORDER.map((missionId) => {
            const mission = MISSIONS[missionId]
            const isSelected = selectedId === missionId
            const isInfoOpen = showInfo === missionId

            return (
              <div
                key={missionId}
                onClick={() => handleSelect(missionId)}
                className={`relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden glass-card p-6 flex flex-col justify-between ${
                  isSelected
                    ? 'border-electric bg-electric/15 shadow-glow-cyan -translate-y-0.5'
                    : 'border-white/10 hover:border-electric/40'
                }`}
              >
                {/* Accent Top Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: mission.color }}
                />

                <div>
                  {/* Card Header: Icon, Name, Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl p-2.5 rounded-2xl bg-space-900 border border-white/10 shadow-sm">
                        {mission.icon}
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          {mission.name}
                        </h2>
                        <p className="text-xs font-mono text-electric">{mission.subtitle}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold uppercase ${DIFFICULTY_BADGES[mission.difficulty]}`}>
                      {mission.difficulty}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {mission.description}
                  </p>

                  {/* Specifications Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4 text-center font-mono">
                    <div className="bg-space-950/70 rounded-xl p-2.5 border border-white/5">
                      <div className="text-[9px] text-slate-500 uppercase">DESTINATION</div>
                      <div className="text-xs font-bold text-white truncate mt-0.5">
                        {mission.destination.split('(')[0].trim()}
                      </div>
                    </div>
                    <div className="bg-space-950/70 rounded-xl p-2.5 border border-white/5">
                      <div className="text-[9px] text-slate-500 uppercase">BUDGET CAP</div>
                      <div className="text-xs font-bold text-success mt-0.5">
                        ${mission.budgetLimit}M
                      </div>
                    </div>
                    <div className="bg-space-950/70 rounded-xl p-2.5 border border-white/5">
                      <div className="text-[9px] text-slate-500 uppercase">REQ. DELTA-V</div>
                      <div className="text-xs font-bold text-violet mt-0.5">
                        {mission.deltaVRequirement} m/s
                      </div>
                    </div>
                  </div>

                  {/* Objectives Preview */}
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Target Objectives ({mission.objectives.length})
                    </div>
                    {mission.objectives.slice(0, 3).map((obj) => (
                      <div key={obj.id} className="flex items-start gap-2 text-xs">
                        <Target className="w-3.5 h-3.5 text-electric mt-0.5 shrink-0" />
                        <span className="text-slate-300 line-clamp-1">{obj.description}</span>
                        <span className="text-[10px] font-mono font-bold text-electric ml-auto shrink-0">
                          {obj.pointValue} PTS
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Background Info Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowInfo(isInfoOpen ? null : missionId)
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-electric flex items-center gap-1.5 mb-3 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{isInfoOpen ? 'Hide' : 'Read'} NASA Mission Context</span>
                  </button>

                  {isInfoOpen && (
                    <div className="bg-space-950/80 border border-electric/20 rounded-xl p-3.5 mb-4 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                      {mission.backgroundInfo}
                    </div>
                  )}
                </div>

                {/* Bottom Card Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(missionId)
                  }}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'btn-primary shadow-glow-cyan'
                      : 'bg-space-800 text-slate-300 border border-white/10 hover:border-electric/50 hover:text-white'
                  }`}
                >
                  {isSelected ? '✓ SELECTED FOR BLUEPRINT' : 'SELECT MISSION'}
                  {!isSelected && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            )
          })}
        </div>

        {/* Floating Launch Confirmation Bar */}
        {selectedId && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
            <div className="glass-panel p-3 rounded-2xl border border-electric/50 shadow-2xl flex items-center justify-between gap-3 animate-fade-in-up">
              <div className="flex items-center gap-2 pl-2">
                <span className="text-2xl">{MISSIONS[selectedId].icon}</span>
                <div className="text-left font-mono">
                  <div className="text-xs font-bold text-white">{MISSIONS[selectedId].name}</div>
                  <div className="text-[10px] text-electric">Ready to configure hardware</div>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="btn-primary text-xs font-mono px-6 py-3 shadow-glow-cyan pulse-glow"
              >
                <span>OPEN DESIGNER</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
