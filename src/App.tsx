import React, { Suspense } from 'react'
import { useGameStore } from './store/gameStore'

// Lazy load heavy screens
const MainMenu = React.lazy(() => import('./screens/MainMenu'))
const MissionSelect = React.lazy(() => import('./screens/MissionSelect'))
const SpacecraftDesigner = React.lazy(() => import('./screens/SpacecraftDesigner'))
const MissionPlanning = React.lazy(() => import('./screens/MissionPlanning'))
const Simulation = React.lazy(() => import('./screens/Simulation'))
const Results = React.lazy(() => import('./screens/Results'))
const HowToPlay = React.lazy(() => import('./screens/HowToPlay'))
const Credits = React.lazy(() => import('./screens/Credits'))
const MissionLibrary = React.lazy(() => import('./screens/MissionLibrary'))

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">🛰️</div>
        <div className="text-electric font-mono text-xs tracking-widest uppercase animate-pulse">
          INITIALIZING MISSION CONTROL SYSTEMS...
        </div>
        <div className="w-48 h-1.5 bg-space-900 rounded-full mx-auto overflow-hidden border border-white/10">
          <div className="h-full bg-gradient-to-r from-electric to-violet rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { screen } = useGameStore()

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 font-sans selection:bg-electric selection:text-space-950">
      <Suspense fallback={<LoadingScreen />}>
        {screen === 'mainMenu' && <MainMenu />}
        {screen === 'missionSelect' && <MissionSelect />}
        {screen === 'spacecraft-designer' && <SpacecraftDesigner />}
        {screen === 'missionPlanning' && <MissionPlanning />}
        {screen === 'simulation' && <Simulation />}
        {screen === 'results' && <Results />}
        {screen === 'howToPlay' && <HowToPlay />}
        {screen === 'credits' && <Credits />}
        {screen === 'missionLibrary' && <MissionLibrary />}
      </Suspense>
    </div>
  )
}
