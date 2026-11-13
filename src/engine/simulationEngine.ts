// ============================================================
// engine/simulationEngine.ts — Mission simulation logic
// ============================================================

import type {
  SelectedComponents,
  SimulationState,
  SimulationEvent,
  MissionType,
  MissionPhase,
  EventChoice,
} from '../types';
import { MISSIONS } from '../data/missions';
import { COMPONENTS } from '../data/components';
import {
  calculateFuelMass,
  calculatePowerGeneration,
  calculatePowerConsumption,
  calculateDeltaV,
  getSolarPowerFactor,
} from './engineeringCalculations';

// Mission phase durations in hours (calibrated for active game loop)
const PHASE_DURATIONS: Record<MissionPhase, number> = {
  'pre-launch': 0,
  launch: 10,
  deployment: 15,
  transit: 50,
  'orbital-insertion': 20,
  operations: 150,
  completed: 0,
  failed: 0,
};

const MISSION_TRANSIT_HOURS: Record<MissionType, number> = {
  'earth-observation': 15,     // LEO, orbital climb
  'lunar-exploration': 45,     // ~3 days to Moon
  'lunar-landing': 50,
  'planetary-science': 75,     // Mars cruise
};

// ─── Initial State ─────────────────────────────────────────────

export function createInitialSimulationState(
  selected: SelectedComponents,
  missionId: MissionType
): SimulationState {
  return {
    phase: 'pre-launch',
    elapsedHours: 0,
    phaseElapsedHours: 0,
    fuelRemaining: calculateFuelMass(selected),
    powerBalance: calculatePowerGeneration(selected) - calculatePowerConsumption(selected),
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
  };
}

// ─── Phase Transitions ─────────────────────────────────────────

export function getNextPhase(
  current: MissionPhase,
  missionId: MissionType
): MissionPhase {
  const sequence: MissionPhase[] =
    missionId === 'earth-observation'
      ? ['pre-launch', 'launch', 'deployment', 'orbital-insertion', 'operations', 'completed']
      : ['pre-launch', 'launch', 'deployment', 'transit', 'orbital-insertion', 'operations', 'completed'];

  const idx = sequence.indexOf(current);
  if (idx === -1 || idx === sequence.length - 1) return 'completed';
  return sequence[idx + 1];
}

// ─── Event Generator ───────────────────────────────────────────

export function generatePhaseEvents(
  phase: MissionPhase,
  missionId: MissionType,
  selected: SelectedComponents,
  simState: SimulationState,
  elapsed: number
): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  const fuelCapacity = calculateFuelMass(selected);
  const powerGen = calculatePowerGeneration(selected);
  const powerCons = calculatePowerConsumption(selected);
  const deltaV = calculateDeltaV(selected);
  const solarFactor = getSolarPowerFactor(missionId);
  const actualPowerGen = powerGen * solarFactor;
  const hasBattery = selected.power.includes('pwr-battery');
  const hasActiveThm = selected.thermal === 'thm-active';
  const hasHGA = selected.antenna === 'ant-hga' || selected.antenna === 'ant-dsn';
  const mission = MISSIONS[missionId];

  switch (phase) {
    case 'launch':
      events.push({
        id: `evt-launch-${Date.now()}`,
        time: elapsed,
        phase,
        type: 'info',
        title: '🚀 Launch Sequence Initiated',
        description: 'Main engines ignite. The spacecraft accelerates through the atmosphere at 3G. Max-Q — maximum aerodynamic pressure — occurs at T+60 seconds.',
        choices: undefined,
        resolved: true,
      });
      break;

    case 'deployment':
      events.push({
        id: `evt-deploy-${Date.now()}`,
        time: elapsed,
        phase,
        type: 'success',
        title: '🛸 Spacecraft Separation Confirmed',
        description: 'Second stage separation successful. Solar arrays deploying. Communications establishing...',
        resolved: true,
      });

      // Check solar array deployment
      if (selected.power.length === 0 || actualPowerGen < powerCons) {
        events.push({
          id: `evt-power-deploy-${Date.now()}`,
          time: elapsed + 0.5,
          phase,
          type: 'critical',
          title: '⚡ POWER ALERT: Solar Array Underperforming',
          description: `At ${(solarFactor * 100).toFixed(0)}% solar efficiency, your arrays generate only ${actualPowerGen.toFixed(0)} W but systems need ${powerCons} W.`,
          choices: [
            {
              id: 'shutdown-instruments',
              label: 'Shut Down Non-Essential Instruments',
              description: 'Power down science instruments to save power. Sacrifices some scientific objectives.',
              consequences: { powerDelta: -200, objectiveProgress: [] },
            },
            {
              id: 'continue-nominal',
              label: 'Continue and Monitor Closely',
              description: 'Keep all systems running but risk power failures. High risk strategy.',
              consequences: { fuelDelta: -20, riskLevel: 0.4 },
            },
          ],
          resolved: false,
        });
      }
      break;

    case 'transit':
      events.push({
        id: `evt-transit-${Date.now()}`,
        time: elapsed,
        phase,
        type: 'info',
        title: '🌌 Trans-Mission Cruise Phase',
        description: `Spacecraft is en route to ${mission.destination}. All systems nominal. Estimated arrival in ${MISSION_TRANSIT_HOURS[missionId]} hours.`,
        resolved: true,
      });

      // Communication distance event for deep space
      if (missionId === 'planetary-science' && !hasHGA) {
        events.push({
          id: `evt-comm-dist-${Date.now()}`,
          time: elapsed + 24,
          phase,
          type: 'warning',
          title: '📡 Communication Signal Degrading',
          description: 'As distance from Earth increases, signal strength is dropping below threshold. Low-gain antenna cannot maintain reliable link.',
          choices: [
            {
              id: 'increase-power',
              label: 'Increase Transmitter Power',
              description: 'Use more power to boost signal. Risks power shortfall.',
              consequences: { powerDelta: 50, fuelDelta: -10 },
            },
            {
              id: 'reduce-data',
              label: 'Reduce Data Rate',
              description: 'Continue at lower data rate. Science data collection slows significantly.',
              consequences: { objectiveProgress: [{ id: 'obj-climate', delta: -0.2 }] },
            },
          ],
          resolved: false,
        });
      }

      // Random fuel leak event (10% chance, only if fuel level okay)
      if (Math.random() < 0.15 && simState.fuelRemaining > fuelCapacity * 0.5) {
        events.push({
          id: `evt-fuel-leak-${Date.now()}`,
          time: elapsed + 12,
          phase,
          type: 'warning',
          title: '⚠️ Minor Propellant Leak Detected',
          description: 'Pressure sensors indicate a micro-leak in the propellant system. Estimated loss: 5–8% of remaining fuel if untreated.',
          choices: [
            {
              id: 'isolate-valve',
              label: 'Isolate Affected Tank Section',
              description: 'Close isolation valve to stop leak. Reduces usable fuel by 15% but prevents further loss.',
              consequences: { fuelDelta: -(simState.fuelRemaining * 0.15), riskLevel: 0.05 },
            },
            {
              id: 'continue-monitor',
              label: 'Monitor and Continue Mission',
              description: 'Risk the leak staying small. 50% chance it stabilizes, 50% chance it worsens.',
              consequences: { fuelDelta: -(simState.fuelRemaining * 0.08), riskLevel: 0.3 },
            },
          ],
          resolved: false,
        });
      }
      break;

    case 'orbital-insertion':
      events.push({
        id: `evt-insertion-${Date.now()}`,
        time: elapsed,
        phase,
        type: deltaV > 0 ? 'info' : 'critical',
        title: '🔴 Orbital Insertion Burn',
        description: `Firing main engine for orbit insertion. Required delta-V: ${MISSIONS[missionId].deltaVRequirement} m/s. Available: ${deltaV} m/s.`,
        resolved: true,
      });

      if (deltaV < MISSIONS[missionId].deltaVRequirement) {
        events.push({
          id: `evt-deltav-short-${Date.now()}`,
          time: elapsed + 0.1,
          phase,
          type: 'critical',
          title: '🚨 CRITICAL: Insufficient Delta-V',
          description: `Engine burn complete but orbit not achieved. Spacecraft is on escape trajectory. Mission may be unrecoverable.`,
          choices: [
            {
              id: 'emergency-burn',
              label: 'Emergency Extended Burn (High Risk)',
              description: 'Use ALL remaining fuel in an attempt to circularize. May succeed partially.',
              consequences: { fuelDelta: -simState.fuelRemaining * 0.9, riskLevel: 0.6 },
            },
            {
              id: 'abort-mission',
              label: 'Abort and Re-enter',
              description: 'Mission failure — spacecraft enters re-entry trajectory.',
              consequences: { fuelDelta: 0, riskLevel: 1.0 },
            },
          ],
          resolved: false,
        });
      }
      break;

    case 'operations':
      events.push({
        id: `evt-ops-${Date.now()}`,
        time: elapsed,
        phase,
        type: 'success',
        title: '✅ Science Operations Commenced',
        description: 'Spacecraft is in stable orbit. Scientific instruments are now collecting data. Mission control confirms all systems nominal.',
        resolved: true,
      });

      // Instrument malfunction (10% chance)
      if (Math.random() < 0.12 && selected.instruments.length > 0) {
        const affectedInstrument = selected.instruments[
          Math.floor(Math.random() * selected.instruments.length)
        ];
        const instName = COMPONENTS[affectedInstrument]?.name ?? 'Unknown';
        events.push({
          id: `evt-instrument-fail-${Date.now()}`,
          time: elapsed + 48,
          phase,
          type: 'warning',
          title: `⚠️ Instrument Anomaly: ${instName}`,
          description: `${instName} has reported an anomaly and gone into safe mode. Science data collection for this instrument is suspended.`,
          choices: [
            {
              id: 'reboot-instrument',
              label: 'Attempt Software Reboot',
              description: 'Send reboot commands. 70% success rate. Data collection resumes if successful.',
              consequences: { riskLevel: 0.1 },
            },
            {
              id: 'safe-mode-continue',
              label: 'Keep in Safe Mode, Continue Mission',
              description: 'Sacrifice this instrument\'s objectives but protect other systems.',
              consequences: { objectiveProgress: [{ id: `obj-${affectedInstrument.replace('inst-', '')}`, delta: -0.5 }] },
            },
          ],
          resolved: false,
        });
      }

      // Lunar night survival challenge
      if ((missionId === 'lunar-landing' || missionId === 'lunar-exploration') && !hasActiveThm) {
        events.push({
          id: `evt-lunar-night-${Date.now()}`,
          time: elapsed + 168, // ~7 days into ops
          phase,
          type: 'critical',
          title: '❄️ Lunar Night Approaching',
          description: 'Temperature will drop to -173°C for 14 Earth days. Without active thermal control, electronics may freeze and fail.',
          choices: [
            {
              id: 'emergency-heaters',
              label: 'Activate Emergency Heaters',
              description: 'Use battery power to run emergency heaters. Drains battery reserve.',
              consequences: { powerDelta: -80, riskLevel: 0.25 },
            },
            {
              id: 'safe-mode-night',
              label: 'Enter Deep Safe Mode',
              description: 'Hibernate spacecraft through lunar night. 50% chance of successful restart.',
              consequences: { riskLevel: 0.5, timeDelayHours: 336 },
            },
          ],
          resolved: false,
        });
      }

      // Communication blackout for deep space
      if (missionId === 'planetary-science') {
        events.push({
          id: `evt-blackout-${Date.now()}`,
          time: elapsed + 24,
          phase,
          type: 'warning',
          title: '📡 Solar Conjunction Blackout',
          description: 'Mars is passing behind the Sun from Earth\'s perspective. Communication will be impossible for 2 weeks. Spacecraft must operate autonomously.',
          choices: [
            {
              id: 'pre-program',
              label: 'Upload Autonomous Science Plan',
              description: 'Pre-program observations. 80% of normal science achieved autonomously.',
              consequences: { objectiveProgress: [{ id: 'obj-climate', delta: 0.2 }] },
            },
            {
              id: 'safe-mode-blackout',
              label: 'Enter Safe Mode During Blackout',
              description: 'Minimal risk but no science collected during blackout period.',
              consequences: { objectiveProgress: [] },
            },
          ],
          resolved: false,
        });
      }
      break;

    default:
      break;
  }

  return events;
}

// ─── Simulation Step Function ──────────────────────────────────

export function simulationStep(
  state: SimulationState,
  selected: SelectedComponents,
  missionId: MissionType,
  dtHours: number
): Partial<SimulationState> {
  if (!state.isRunning || state.pendingEvent) return {};
  if (state.phase === 'completed' || state.phase === 'failed') return {};

  const mission = MISSIONS[missionId];
  const solarFactor = getSolarPowerFactor(missionId);
  const powerGen = calculatePowerGeneration(selected) * solarFactor;
  const powerCons = calculatePowerConsumption(selected);
  const actualPower = powerGen - powerCons;

  // Fuel consumption during propulsion phases
  const fuelBurnPhases: MissionPhase[] = ['launch', 'deployment', 'transit', 'orbital-insertion'];
  let fuelDelta = 0;
  if (fuelBurnPhases.includes(state.phase)) {
    const burnRateKgPerHour = state.fuelRemaining * 0.02; // 2% per hour during active phases
    fuelDelta = -burnRateKgPerHour * dtHours;
  }

  // Station-keeping fuel use during operations
  if (state.phase === 'operations') {
    fuelDelta = -(state.fuelRemaining * 0.001) * dtHours; // 0.1% per hour
  }

  const newFuel = Math.max(0, state.fuelRemaining + fuelDelta);

  // Altitude model
  const altitudeTargets: Record<MissionType, number> = {
    'earth-observation': 500,
    'lunar-exploration': 100,
    'lunar-landing': 0,
    'planetary-science': 300,
  };
  const targetAlt = altitudeTargets[missionId];
  let newAlt = state.altitude;
  if (state.phase === 'launch') newAlt = Math.min(200, state.altitude + 200 * dtHours);
  else if (state.phase === 'deployment') newAlt = Math.min(500, state.altitude + 150 * dtHours);
  else if (state.phase === 'transit') newAlt = state.altitude; // In transit
  else if (state.phase === 'orbital-insertion') newAlt = targetAlt;
  else if (state.phase === 'operations') newAlt = targetAlt;

  // Velocity model (simplified)
  const velocityMap: Record<MissionPhase, number> = {
    'pre-launch': 0,
    launch: 7800,
    deployment: 7700,
    transit: missionId === 'earth-observation' ? 7700 : 1000,
    'orbital-insertion': missionId === 'earth-observation' ? 7700 : 1600,
    operations: missionId === 'earth-observation' ? 7700 : missionId === 'lunar-exploration' ? 1600 : 300,
    completed: 0,
    failed: 0,
  };

  // Scientific data collection
  let dataDelta = 0;
  if (state.phase === 'operations' && actualPower >= 0) {
    const dataRateGBPerHour = Math.max(1, selected.instruments.length) * 1.5 * dtHours;
    dataDelta = dataRateGBPerHour;
  }

  // Phase progression
  const currentPhaseElapsed = (state.phaseElapsedHours ?? 0) + dtHours;
  const phaseDuration =
    state.phase === 'transit'
      ? MISSION_TRANSIT_HOURS[missionId]
      : PHASE_DURATIONS[state.phase];

  let newPhase: MissionPhase = state.phase;
  let newPhaseElapsed = currentPhaseElapsed;
  let newEvents: SimulationEvent[] = [];
  const newElapsed = state.elapsedHours + dtHours;

  // Advance phase if duration met
  if (phaseDuration > 0 && currentPhaseElapsed >= phaseDuration && state.phase !== 'operations') {
    newPhase = getNextPhase(state.phase, missionId);
    newPhaseElapsed = 0;
    const phaseEvents = generatePhaseEvents(newPhase, missionId, selected, state, newElapsed);
    newEvents = phaseEvents;
  }

  // Failure conditions
  let failed = false;
  let failureReason = '';
  if (newFuel <= 0 && state.phase !== 'operations') {
    failed = true;
    failureReason = 'Fuel depleted before reaching target orbit';
  }
  if (actualPower < -500) {
    failed = true;
    failureReason = 'Critical power failure — all systems offline';
  }

  // Check objective completion in operations phase
  let objectivesCompleted = [...state.objectivesCompleted];
  if (state.phase === 'operations') {
    mission.objectives.forEach(obj => {
      if (objectivesCompleted.includes(obj.id)) return;
      // Check if required instruments are present
      const isInstrumentEquipped = (reqId: string) => {
        if (selected.instruments.includes(reqId)) return true;
        if (reqId === 'inst-spectrometer' && selected.instruments.includes('inst-imaging-spectrometer')) return true;
        if (reqId === 'inst-imaging-spectrometer' && selected.instruments.includes('inst-spectrometer')) return true;
        return false;
      };
      const hasInstruments =
        !obj.requiredInstruments ||
        obj.requiredInstruments.length === 0 ||
        obj.requiredInstruments.every(inst => isInstrumentEquipped(inst));
      // Check if enough data collected
      const dataThreshold = 40; // GB needed per objective
      if (hasInstruments && (state.scientificDataCollected + dataDelta) >= dataThreshold) {
        if (Math.random() < 0.25 * dtHours || currentPhaseElapsed > (PHASE_DURATIONS['operations'] * 0.7)) {
          // Progressive completion
          objectivesCompleted = [...objectivesCompleted, obj.id];
          newEvents.push({
            id: `evt-obj-complete-${obj.id}-${Date.now()}`,
            time: newElapsed,
            phase: state.phase,
            type: 'success',
            title: `🎯 Objective Complete!`,
            description: obj.description,
            resolved: true,
          });
        }
      }
    });

    // Check if all objectives done or ops duration ended
    if (
      (objectivesCompleted.length > 0 && objectivesCompleted.length === mission.objectives.length) ||
      currentPhaseElapsed >= PHASE_DURATIONS['operations']
    ) {
      newPhase = 'completed';
      newPhaseElapsed = 0;
    }
  }

  // Pending event from new events (only unresolved ones)
  const pendingEvent = newEvents.find(e => !e.resolved) ?? state.pendingEvent;

  return {
    phase: failed ? 'failed' : newPhase,
    elapsedHours: newElapsed,
    phaseElapsedHours: newPhaseElapsed,
    fuelRemaining: newFuel,
    powerBalance: actualPower,
    altitude: newAlt,
    velocity: velocityMap[newPhase] ?? state.velocity,
    events: [...state.events, ...newEvents.filter(e => e.resolved)],
    pendingEvent: failed ? null : (pendingEvent ?? null),
    failures: failed ? [...state.failures, failureReason] : state.failures,
    scientificDataCollected: state.scientificDataCollected + dataDelta,
    objectivesCompleted,
    budgetSpent: state.budgetSpent + (newPhase !== state.phase ? 0.5 : 0.01 * dtHours),
  };
}

// ─── Event Choice Handler ──────────────────────────────────────

export function resolveEventChoice(
  state: SimulationState,
  choiceId: string
): Partial<SimulationState> {
  const event = state.pendingEvent;
  if (!event) return {};
  const choice = event.choices?.find(c => c.id === choiceId);
  if (!choice) return {};

  const cons = choice.consequences;
  let newFuel = state.fuelRemaining + (cons.fuelDelta ?? 0);
  let newPower = state.powerBalance + (cons.powerDelta ?? 0);

  // Apply objective progress
  let objectivesCompleted = [...state.objectivesCompleted];
  if (cons.objectiveProgress) {
    cons.objectiveProgress.forEach(op => {
      if (op.delta > 0 && !objectivesCompleted.includes(op.id)) {
        // partial progress tracked elsewhere
      }
    });
  }

  // High-risk choice outcomes
  let failures = [...state.failures];
  if (cons.riskLevel && Math.random() < cons.riskLevel) {
    failures.push(`Event "${event.title}" choice backfired — risk materialized`);
  }

  const resolvedEvent = { ...event, resolved: true, choiceMade: choiceId };

  return {
    pendingEvent: null,
    fuelRemaining: Math.max(0, newFuel),
    powerBalance: newPower,
    failures,
    objectivesCompleted,
    events: [...state.events, resolvedEvent],
  };
}

