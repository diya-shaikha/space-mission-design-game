// ============================================================
// store/gameStore.ts — Global game state (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  GameScreen,
  MissionType,
  SelectedComponents,
  SimulationState,
  MissionResult,
  MissionPhase,
} from '../types';
import {
  calculateEngineeringStats,
  detectEngineeringIssues,
  calculateTotalCost,
  calculateDryMass,
  calculateFuelMass,
  calculatePowerGeneration,
  calculatePowerConsumption,
  calculateDeltaV,
} from '../engine/engineeringCalculations';
import {
  createInitialSimulationState,
  simulationStep,
  resolveEventChoice,
  generatePhaseEvents,
} from '../engine/simulationEngine';
import { MISSIONS } from '../data/missions';

const DEFAULT_COMPONENTS: SelectedComponents = {
  launchVehicle: null,
  engine: null,
  fuelTank: null,
  bus: null,
  instruments: [],
  power: [],
  antenna: null,
  thermal: null,
  attitude: null,
};

interface GameStore extends GameState {
  // Navigation
  setScreen: (screen: GameScreen) => void;
  selectMission: (missionId: MissionType) => void;

  // Component selection
  selectComponent: (category: string, componentId: string) => void;
  toggleInstrument: (instrumentId: string) => void;
  togglePower: (powerId: string) => void;
  resetDesign: () => void;

  // Simulation
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  tickSimulation: (dtHours: number) => void;
  resolveEvent: (choiceId: string) => void;
  resetSimulation: () => void;

  // Results
  computeResults: () => void;

  // Tutorial
  advanceTutorial: () => void;
  closeTutorial: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ─── Initial State ──────────────────────────────────────
      screen: 'mainMenu',
      selectedMission: null,
      selectedComponents: DEFAULT_COMPONENTS,
      engineeringStats: calculateEngineeringStats(DEFAULT_COMPONENTS, null),
      engineeringIssues: [],
      simulationState: {
        phase: 'pre-launch',
        elapsedHours: 0,
        phaseElapsedHours: 0,
        fuelRemaining: 0,
        powerBalance: 0,
        altitude: 0,
        velocity: 0,
        objectivesCompleted: [],
        events: [],
        pendingEvent: null,
        isRunning: false,
        speed: 1,
        failures: [],
        warnings: [],
        scientificDataCollected: 0,
        budgetSpent: 0,
      },
      missionResult: null,
      savedDesigns: [],
      tutorialStep: 0,
      showTutorial: true,

      // ─── Navigation ─────────────────────────────────────────
      setScreen: (screen) => set({ screen }),

      selectMission: (missionId) => {
        set({
          selectedMission: missionId,
          selectedComponents: DEFAULT_COMPONENTS,
          engineeringStats: calculateEngineeringStats(DEFAULT_COMPONENTS, missionId),
          engineeringIssues: detectEngineeringIssues(DEFAULT_COMPONENTS, calculateEngineeringStats(DEFAULT_COMPONENTS, missionId), missionId),
          simulationState: {
            phase: 'pre-launch',
            elapsedHours: 0,
            phaseElapsedHours: 0,
            fuelRemaining: 0,
            powerBalance: 0,
            altitude: 0,
            velocity: 0,
            objectivesCompleted: [],
            events: [],
            pendingEvent: null,
            isRunning: false,
            speed: 1,
            failures: [],
            warnings: [],
            scientificDataCollected: 0,
            budgetSpent: 0,
          },
          missionResult: null,
          screen: 'spacecraft-designer',
        });
      },

      // ─── Component Selection ─────────────────────────────────
      selectComponent: (category, componentId) => {
        const state = get();
        const newComponents = { ...state.selectedComponents };

        switch (category) {
          case 'launch-vehicle':
            newComponents.launchVehicle = componentId;
            break;
          case 'engine':
            newComponents.engine = componentId;
            break;
          case 'fuel-tank':
            newComponents.fuelTank = componentId;
            break;
          case 'bus':
            newComponents.bus = componentId;
            break;
          case 'antenna':
            newComponents.antenna = componentId;
            break;
          case 'thermal':
            newComponents.thermal = componentId;
            break;
          case 'attitude':
            newComponents.attitude = componentId;
            break;
        }

        const stats = calculateEngineeringStats(newComponents, state.selectedMission);
        const issues = detectEngineeringIssues(newComponents, stats, state.selectedMission);

        set({
          selectedComponents: newComponents,
          engineeringStats: stats,
          engineeringIssues: issues,
        });
      },

      toggleInstrument: (instrumentId) => {
        const state = get();
        const isSpec = instrumentId === 'inst-spectrometer' || instrumentId === 'inst-imaging-spectrometer';
        const isCurrentlySelected = state.selectedComponents.instruments.includes(instrumentId) ||
          (isSpec && (state.selectedComponents.instruments.includes('inst-spectrometer') || state.selectedComponents.instruments.includes('inst-imaging-spectrometer')));

        let instruments: string[];
        if (isCurrentlySelected) {
          instruments = state.selectedComponents.instruments.filter(id =>
            id !== instrumentId && !(isSpec && (id === 'inst-spectrometer' || id === 'inst-imaging-spectrometer'))
          );
        } else {
          instruments = [...state.selectedComponents.instruments, instrumentId];
        }

        const newComponents = { ...state.selectedComponents, instruments };
        const stats = calculateEngineeringStats(newComponents, state.selectedMission);
        const issues = detectEngineeringIssues(newComponents, stats, state.selectedMission);

        set({
          selectedComponents: newComponents,
          engineeringStats: stats,
          engineeringIssues: issues,
        });
      },

      togglePower: (powerId) => {
        const state = get();
        const power = state.selectedComponents.power.includes(powerId)
          ? state.selectedComponents.power.filter(id => id !== powerId)
          : [...state.selectedComponents.power, powerId];

        const newComponents = { ...state.selectedComponents, power };
        const stats = calculateEngineeringStats(newComponents, state.selectedMission);
        const issues = detectEngineeringIssues(newComponents, stats, state.selectedMission);

        set({
          selectedComponents: newComponents,
          engineeringStats: stats,
          engineeringIssues: issues,
        });
      },

      resetDesign: () => {
        const state = get();
        const stats = calculateEngineeringStats(DEFAULT_COMPONENTS, state.selectedMission);
        const issues = detectEngineeringIssues(DEFAULT_COMPONENTS, stats, state.selectedMission);
        set({
          selectedComponents: DEFAULT_COMPONENTS,
          engineeringStats: stats,
          engineeringIssues: issues,
        });
      },

      // ─── Simulation ─────────────────────────────────────────
      startSimulation: () => {
        const state = get();
        if (!state.selectedMission) return;
        const simState = createInitialSimulationState(
          state.selectedComponents,
          state.selectedMission
        );
        const launchEvents = generatePhaseEvents(
          'launch',
          state.selectedMission,
          state.selectedComponents,
          simState,
          0
        );
        set({
          simulationState: {
            ...simState,
            isRunning: true,
            phase: 'launch',
            events: launchEvents.filter(e => e.resolved),
            pendingEvent: launchEvents.find(e => !e.resolved) ?? null,
          },
          screen: 'simulation',
        });
      },

      pauseSimulation: () => {
        set(s => ({
          simulationState: { ...s.simulationState, isRunning: false },
        }));
      },

      resumeSimulation: () => {
        set(s => ({
          simulationState: { ...s.simulationState, isRunning: true },
        }));
      },

      setSimulationSpeed: (speed) => {
        set(s => ({
          simulationState: { ...s.simulationState, speed },
        }));
      },

      tickSimulation: (dtHours) => {
        const state = get();
        if (!state.selectedMission) return;
        const updates = simulationStep(
          state.simulationState,
          state.selectedComponents,
          state.selectedMission,
          dtHours
        );
        if (Object.keys(updates).length === 0) return;

        const newSimState = { ...state.simulationState, ...updates };

        // Auto-navigate to results on completion/failure
        if (newSimState.phase === 'completed' || newSimState.phase === 'failed') {
          set({ simulationState: { ...newSimState, isRunning: false } });
          get().computeResults();
          setTimeout(() => set({ screen: 'results' }), 1500);
        } else {
          set({ simulationState: newSimState });
        }
      },

      resolveEvent: (choiceId) => {
        const state = get();
        const updates = resolveEventChoice(state.simulationState, choiceId);
        set(s => ({
          simulationState: { ...s.simulationState, ...updates },
        }));
      },

      resetSimulation: () => {
        const state = get();
        set({
          screen: 'spacecraft-designer',
          simulationState: state.selectedMission
            ? createInitialSimulationState(state.selectedComponents, state.selectedMission)
            : get().simulationState,
          missionResult: null,
        });
      },

      // ─── Results ─────────────────────────────────────────────
      computeResults: () => {
        const state = get();
        if (!state.selectedMission) return;
        const mission = MISSIONS[state.selectedMission];
        const sim = state.simulationState;
        const selected = state.selectedComponents;

        const objectivesAchieved = sim.objectivesCompleted;
        const objectivesFailed = mission.objectives
          .filter(o => !objectivesAchieved.includes(o.id))
          .map(o => o.id);

        // Score calculation
        const maxScientificPoints = mission.objectives.reduce((sum, o) => sum + o.pointValue, 0);
        const achievedPoints = mission.objectives
          .filter(o => objectivesAchieved.includes(o.id))
          .reduce((sum, o) => sum + o.pointValue, 0);
        const scientificScore = maxScientificPoints > 0 ? (achievedPoints / maxScientificPoints) * 40 : 0;

        const stats = state.engineeringStats;
        const engineeringScore = stats.hasRequiredComponents ? 20 : 0;

        const budgetScore = stats.isBudgetOk
          ? Math.max(0, 20 - (stats.totalCost / mission.budgetLimit - 0.5) * 20)
          : 0;

        const fuelEfficiency = sim.fuelRemaining / Math.max(1, state.engineeringStats.fuelCapacity);
        const efficiencyScore = fuelEfficiency * 20;

        const totalScore = Math.round(
          scientificScore + engineeringScore + budgetScore + efficiencyScore
        );

        const success = sim.phase === 'completed' && objectivesAchieved.length > 0;
        const partialSuccess = !success && objectivesAchieved.length > 0;

        const recommendations: string[] = [];
        if (objectivesFailed.length > 0) {
          recommendations.push('Add missing scientific instruments to achieve all objectives');
        }
        if (!stats.isBudgetOk) {
          recommendations.push('Reduce mission cost by choosing a smaller launch vehicle or fewer instruments');
        }
        if (!stats.isPowerSufficient) {
          recommendations.push('Increase solar panel capacity to meet power demands');
        }
        if (sim.failures.length > 0) {
          recommendations.push('Review engineering feasibility — address all critical warnings before launch');
        }

        const result: MissionResult = {
          missionId: state.selectedMission,
          success,
          partialSuccess,
          score: totalScore,
          scoreBreakdown: {
            scientific: Math.round(scientificScore),
            engineering: Math.round(engineeringScore),
            budget: Math.round(budgetScore),
            efficiency: Math.round(efficiencyScore),
          },
          objectivesAchieved,
          objectivesFailed,
          budgetUsed: stats.totalCost,
          budgetLimit: mission.budgetLimit,
          fuelEfficiency,
          powerEfficiency: Math.min(1, stats.powerGeneration / Math.max(1, stats.powerConsumption)),
          massEfficiency: Math.min(1, stats.payloadMass / Math.max(1, stats.payloadCapacity)),
          issues: sim.failures,
          recommendations,
          elapsedTime: sim.elapsedHours,
        };

        set({ missionResult: result });
      },

      // ─── Tutorial ────────────────────────────────────────────
      advanceTutorial: () => set(s => ({ tutorialStep: s.tutorialStep + 1 })),
      closeTutorial: () => set({ showTutorial: false }),
    }),
    {
      name: 'missioncraft-save',
      partialize: (state) => ({
        savedDesigns: state.savedDesigns,
        showTutorial: state.showTutorial,
      }),
    }
  )
);

