// ============================================================
// engine/engineeringCalculations.ts
// Core engineering math — separated from UI code
// ============================================================

import { COMPONENTS } from '../data/components';
import { MISSIONS } from '../data/missions';
import type {
  SelectedComponents,
  EngineeringStats,
  EngineeringIssue,
  MissionType,
} from '../types';

// ─── Mass Calculations ────────────────────────────────────────

export function calculateDryMass(selected: SelectedComponents): number {
  let mass = 0;
  const addMass = (id: string | null) => {
    if (id && COMPONENTS[id]) mass += COMPONENTS[id].mass;
  };
  addMass(selected.bus);
  addMass(selected.engine);
  addMass(selected.fuelTank);
  addMass(selected.antenna);
  addMass(selected.thermal);
  addMass(selected.attitude);
  selected.instruments.forEach(addMass);
  selected.power.forEach(addMass);
  return mass;
}

export function calculateFuelMass(selected: SelectedComponents): number {
  const tank = selected.fuelTank ? COMPONENTS[selected.fuelTank] : null;
  return tank?.fuelCapacity ?? 0;
}

export function calculateTotalMass(selected: SelectedComponents): number {
  return calculateDryMass(selected) + calculateFuelMass(selected);
}

// ─── Power Calculations ───────────────────────────────────────

export function calculatePowerGeneration(selected: SelectedComponents): number {
  let gen = 0;
  selected.power.forEach(id => {
    if (COMPONENTS[id]) {
      const consumption = COMPONENTS[id].powerConsumption;
      if (consumption < 0) gen += Math.abs(consumption);
    }
  });
  return gen;
}

export function calculatePowerConsumption(selected: SelectedComponents): number {
  let consumption = 0;
  const addPower = (id: string | null) => {
    if (id && COMPONENTS[id]) {
      const p = COMPONENTS[id].powerConsumption;
      if (p > 0) consumption += p;
    }
  };
  addPower(selected.bus);
  addPower(selected.engine);
  addPower(selected.antenna);
  addPower(selected.thermal);
  addPower(selected.attitude);
  selected.instruments.forEach(addPower);
  // Power components can also consume (e.g. ion engine)
  selected.power.forEach(id => {
    if (id && COMPONENTS[id]) {
      const p = COMPONENTS[id].powerConsumption;
      if (p > 0) consumption += p;
    }
  });
  return consumption;
}

// ─── Cost Calculations ─────────────────────────────────────────

export function calculateTotalCost(selected: SelectedComponents): number {
  let cost = 0;
  const addCost = (id: string | null) => {
    if (id && COMPONENTS[id]) cost += COMPONENTS[id].cost;
  };
  addCost(selected.launchVehicle);
  addCost(selected.bus);
  addCost(selected.engine);
  addCost(selected.fuelTank);
  addCost(selected.antenna);
  addCost(selected.thermal);
  addCost(selected.attitude);
  selected.instruments.forEach(addCost);
  selected.power.forEach(addCost);
  return cost;
}

// ─── Delta-V (Tsiolkovsky Rocket Equation) ────────────────────
// ΔV = Isp × g₀ × ln(m_initial / m_final)
// g₀ = 9.80665 m/s²

const G0 = 9.80665; // m/s²

export function calculateDeltaV(selected: SelectedComponents): number {
  const engine = selected.engine ? COMPONENTS[selected.engine] : null;
  if (!engine || !engine.specificImpulse) return 0;

  const fuelMass = calculateFuelMass(selected);
  const dryMass = calculateDryMass(selected);

  if (dryMass <= 0 || fuelMass <= 0) return 0;

  const massRatio = (dryMass + fuelMass) / dryMass;
  const deltaV = engine.specificImpulse * G0 * Math.log(massRatio);
  return Math.round(deltaV);
}

// ─── Communication Data Rate ──────────────────────────────────

export function calculateDataRate(selected: SelectedComponents): number {
  const antenna = selected.antenna ? COMPONENTS[selected.antenna] : null;
  return antenna?.dataRate ?? 0;
}

// ─── Launch Vehicle Compatibility ─────────────────────────────

export function getPayloadCapacity(selected: SelectedComponents): number {
  const lv = selected.launchVehicle ? COMPONENTS[selected.launchVehicle] : null;
  return lv?.payloadCapacity ?? 0;
}

// ─── Main Engineering Stats Calculator ────────────────────────

export function calculateEngineeringStats(
  selected: SelectedComponents,
  missionId: MissionType | null
): EngineeringStats {
  const dryMass = calculateDryMass(selected);
  const fuelMass = calculateFuelMass(selected);
  const totalMass = dryMass + fuelMass;
  const totalCost = calculateTotalCost(selected);
  const powerGeneration = calculatePowerGeneration(selected);
  const powerConsumption = calculatePowerConsumption(selected);
  const payloadCapacity = getPayloadCapacity(selected);
  const deltaV = calculateDeltaV(selected);
  const communicationRate = calculateDataRate(selected);
  const mission = missionId ? MISSIONS[missionId] : null;
  const budgetLimit = mission?.budgetLimit ?? Infinity;
  const deltaVRequired = mission?.deltaVRequirement ?? 0;

  // Spacecraft mass (without launch vehicle itself)
  const payloadMass = totalMass;

  return {
    totalMass,
    dryMass,
    fuelMass,
    totalCost,
    powerGeneration,
    powerConsumption,
    powerBalance: powerGeneration - powerConsumption,
    payloadCapacity,
    payloadMass,
    fuelCapacity: fuelMass,
    deltaV,
    communicationRate,
    isLaunchVehicleCompatible: payloadCapacity > 0 && payloadMass <= payloadCapacity,
    isPowerSufficient: powerGeneration >= powerConsumption,
    isFuelSufficient: deltaV >= deltaVRequired,
    isBudgetOk: totalCost <= budgetLimit,
    hasRequiredComponents:
      !!selected.bus &&
      !!selected.engine &&
      !!selected.fuelTank &&
      !!selected.launchVehicle &&
      !!selected.antenna &&
      selected.power.length > 0,
  };
}

export function isInstrumentEquipped(selectedInstruments: string[], reqId: string): boolean {
  if (selectedInstruments.includes(reqId)) return true;
  if (reqId === 'inst-spectrometer' && selectedInstruments.includes('inst-imaging-spectrometer')) return true;
  if (reqId === 'inst-imaging-spectrometer' && selectedInstruments.includes('inst-spectrometer')) return true;
  return false;
}

// ─── Engineering Issue Detector ───────────────────────────────

export function detectEngineeringIssues(
  selected: SelectedComponents,
  stats: EngineeringStats,
  missionId: MissionType | null
): EngineeringIssue[] {
  const issues: EngineeringIssue[] = [];
  const mission = missionId ? MISSIONS[missionId] : null;

  // Missing required components
  if (!selected.launchVehicle) {
    issues.push({
      type: 'error',
      code: 'NO_LAUNCH_VEHICLE',
      title: 'No Launch Vehicle Selected',
      description: 'You need a rocket to reach orbit! Without a launch vehicle, the mission cannot begin.',
      suggestion: 'Go to Launch Vehicle and select a rocket that matches your payload mass.',
    });
  }
  if (!selected.bus) {
    issues.push({
      type: 'error',
      code: 'NO_BUS',
      title: 'No Spacecraft Bus',
      description: 'The spacecraft bus is the structural backbone and avionics core of your satellite.',
      suggestion: 'Select a spacecraft bus that fits your mission complexity and instrument requirements.',
    });
  }
  if (!selected.engine) {
    issues.push({
      type: 'error',
      code: 'NO_ENGINE',
      title: 'No Propulsion System',
      description: 'Without an engine, you cannot perform orbital maneuvers or course corrections.',
      suggestion: 'Add a propulsion engine. For Earth orbit, a hydrazine thruster works. Deep space needs higher Isp.',
    });
  }
  if (!selected.fuelTank) {
    issues.push({
      type: 'error',
      code: 'NO_FUEL',
      title: 'No Fuel Tank',
      description: 'Your engine has no fuel storage. The spacecraft cannot make any maneuvers.',
      suggestion: 'Add a propellant tank. Match the tank size to your mission delta-V requirements.',
    });
  }
  if (selected.power.length === 0) {
    issues.push({
      type: 'error',
      code: 'NO_POWER',
      title: 'No Power System',
      description: 'All spacecraft instruments and systems need electrical power to operate.',
      suggestion: 'Add solar panels for near-Earth missions, or an RTG for deep space or polar missions.',
    });
  }
  if (!selected.antenna) {
    issues.push({
      type: 'error',
      code: 'NO_ANTENNA',
      title: 'No Communications System',
      description: 'Without an antenna, there is no way to receive commands or send data to Earth.',
      suggestion: 'Add at least a UHF antenna for basic communication. High-data missions need X-Band or HGA.',
    });
  }
  if (selected.instruments.length === 0) {
    issues.push({
      type: 'warning',
      code: 'NO_INSTRUMENTS',
      title: 'No Scientific Instruments',
      description: 'This spacecraft carries no scientific instruments, so it cannot complete any scientific objectives.',
      suggestion: 'Add instruments that match your mission objectives. Check the mission brief for required instruments.',
    });
  }

  // Power issues
  if (stats.powerBalance < 0) {
    const deficit = Math.abs(stats.powerBalance);
    issues.push({
      type: 'error',
      code: 'POWER_DEFICIT',
      title: `Power Deficit: ${deficit.toFixed(0)} W`,
      description: `Your instruments consume ${stats.powerConsumption} W but your power system only generates ${stats.powerGeneration} W. This will cause instruments to shut down.`,
      suggestion: `Add more solar panels or upgrade to a larger array (+${Math.ceil(deficit / 500) * 500} W needed). Or remove power-hungry instruments like SAR radar.`,
    });
  } else if (stats.powerBalance < 50 && stats.powerBalance >= 0) {
    issues.push({
      type: 'warning',
      code: 'POWER_MARGINAL',
      title: 'Power Budget Very Tight',
      description: `Only ${stats.powerBalance.toFixed(0)} W of power margin remains. Any unexpected power demand will cause failures.`,
      suggestion: 'Add a battery pack as backup, or upgrade to a larger solar array for safety margin.',
    });
  }

  // Launch vehicle compatibility
  if (selected.launchVehicle && stats.payloadMass > stats.payloadCapacity) {
    const excess = stats.payloadMass - stats.payloadCapacity;
    issues.push({
      type: 'error',
      code: 'PAYLOAD_EXCEEDED',
      title: `Payload Too Heavy: ${excess.toFixed(0)} kg over limit`,
      description: `Your spacecraft (${stats.payloadMass.toFixed(0)} kg) exceeds the launch vehicle's capacity (${stats.payloadCapacity.toFixed(0)} kg).`,
      suggestion: 'Switch to a larger launch vehicle, or reduce mass by removing heavy instruments or using a smaller fuel tank.',
    });
  }

  // Budget issues
  if (mission && stats.totalCost > stats.totalCost * 0 + mission.budgetLimit) {
    // Already handled in stats.isBudgetOk
  }
  if (!stats.isBudgetOk && mission) {
    const overrun = stats.totalCost - mission.budgetLimit;
    issues.push({
      type: 'error',
      code: 'BUDGET_EXCEEDED',
      title: `Over Budget by \$${overrun.toFixed(1)}M`,
      description: `Total mission cost ($${stats.totalCost.toFixed(1)}M) exceeds the $${mission.budgetLimit}M budget limit.`,
      suggestion: 'Remove expensive instruments, choose a smaller launch vehicle, or downgrade the spacecraft bus.',
    });
  }

  // Delta-V sufficiency
  if (mission && stats.deltaV < mission.deltaVRequirement && stats.deltaV > 0) {
    const shortfall = mission.deltaVRequirement - stats.deltaV;
    issues.push({
      type: 'error',
      code: 'INSUFFICIENT_DELTAV',
      title: `Insufficient Delta-V: ${shortfall.toFixed(0)} m/s short`,
      description: `Your spacecraft has ${stats.deltaV.toFixed(0)} m/s of delta-V but the mission requires at least ${mission.deltaVRequirement} m/s for orbital maneuvers.`,
      suggestion: 'Add a larger fuel tank, use an engine with higher specific impulse (Isp), or reduce the spacecraft dry mass.',
    });
  }

  // Ion thruster power check
  if (selected.engine === 'eng-ion' && stats.powerGeneration < 2500) {
    issues.push({
      type: 'error',
      code: 'ION_POWER_INSUFFICIENT',
      title: 'Ion Thruster Needs More Power',
      description: 'The Hall Effect Ion Thruster requires at least 2500 W, but your power system cannot provide it.',
      suggestion: 'Add a large solar array (3000 W) or switch to a conventional chemical engine.',
    });
  }

  // Missing thermal control
  if (!selected.thermal) {
    issues.push({
      type: 'warning',
      code: 'NO_THERMAL',
      title: 'No Thermal Control',
      description: 'Without thermal protection, extreme temperature swings will damage electronics and instruments.',
      suggestion: 'Add passive thermal control (MLI blankets) at minimum. Lunar/deep space missions need active thermal control.',
    });
  }

  // Missing attitude control
  if (!selected.attitude) {
    issues.push({
      type: 'warning',
      code: 'NO_ATTITUDE',
      title: 'No Attitude Control',
      description: 'Without attitude control, the spacecraft cannot point instruments or antennas accurately.',
      suggestion: 'Add an attitude control system. Spin stabilization is cheap; 3-axis or momentum wheels enable precise pointing.',
    });
  }

  // Mission-specific instrument checks
  if (mission) {
    mission.objectives.forEach(obj => {
      if (obj.requiredInstruments && obj.requiredInstruments.length > 0) {
        const missing = obj.requiredInstruments.filter(
          inst => !isInstrumentEquipped(selected.instruments, inst)
        );
        if (missing.length > 0) {
          const instrumentNames = missing
            .map(id => COMPONENTS[id]?.name ?? id)
            .join(', ');
          issues.push({
            type: 'warning',
            code: `MISSING_INSTRUMENT_${obj.id}`,
            title: `Cannot Complete: "${obj.description.substring(0, 40)}..."`,
            description: `This objective requires ${instrumentNames} which is not in your payload.`,
            suggestion: `Add ${instrumentNames} to your instrument suite if you want to achieve this objective.`,
          });
        }
      }
    });
  }

  // Deep space communication warning
  if (
    missionId === 'planetary-science' &&
    selected.antenna !== 'ant-hga' &&
    selected.antenna !== 'ant-dsn'
  ) {
    issues.push({
      type: 'warning',
      code: 'COMM_INADEQUATE_DEEP_SPACE',
      title: 'Communications Inadequate for Deep Space',
      description: 'Mars is 200+ million km from Earth. Simple antennas cannot send data over this distance reliably.',
      suggestion: 'Upgrade to an HGA (High-Gain Dish Antenna) or DSN Transponder for Mars missions.',
    });
  }

  // Seismometer requires lander
  if (
    selected.instruments.includes('inst-seismometer') &&
    missionId !== 'lunar-landing'
  ) {
    issues.push({
      type: 'info',
      code: 'SEISMOMETER_ORBITAL',
      title: 'Seismometer Not Useful in Orbit',
      description: 'The seismometer detects ground vibrations and only works on a surface lander, not an orbiter.',
      suggestion: 'Consider a different scientific instrument for orbital missions. The seismometer is ideal for the Lunar Landing mission.',
    });
  }

  return issues;
}

// ─── Fuel Consumption Model ────────────────────────────────────

export function estimateFuelBurn(
  selected: SelectedComponents,
  phaseId: string
): number {
  const engine = selected.engine ? COMPONENTS[selected.engine] : null;
  if (!engine) return 0;

  const burnRates: Record<string, number> = {
    launch: 0,        // launch vehicle handles this
    deployment: 0.05, // 5% of fuel for initial deployment
    transit: 0.3,     // 30% for transit maneuvers
    'orbital-insertion': 0.25, // 25% for orbital insertion
    operations: 0.1,  // 10% for station-keeping
  };

  const totalFuel = calculateFuelMass(selected);
  return totalFuel * (burnRates[phaseId] ?? 0.05);
}

// ─── Power Factor by Distance from Sun ────────────────────────

export function getSolarPowerFactor(missionId: MissionType | null): number {
  // Solar power decreases with square of distance from Sun (1 AU = Earth)
  const factors: Record<MissionType, number> = {
    'earth-observation': 1.0,   // 1 AU
    'lunar-exploration': 0.99,  // nearly same as Earth
    'lunar-landing': 0.99,
    'planetary-science': 0.43,  // Mars at 1.52 AU: 1/1.52² ≈ 0.43
  };
  return missionId ? (factors[missionId] ?? 1.0) : 1.0;
}

// ─── Mission Feasibility Score ─────────────────────────────────

export function calculateFeasibilityScore(
  stats: EngineeringStats,
  issues: EngineeringIssue[]
): number {
  let score = 100;
  const errors = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  score -= errors * 20;
  score -= warnings * 5;
  if (!stats.hasRequiredComponents) score -= 30;
  return Math.max(0, Math.min(100, score));
}

