// ============================================================
// types/index.ts — Core game type definitions
// ============================================================

export type GameScreen =
  | 'mainMenu'
  | 'missionSelect'
  | 'spacecraft-designer'
  | 'missionPlanning'
  | 'simulation'
  | 'results'
  | 'howToPlay'
  | 'credits'
  | 'missionLibrary';

export type MissionType =
  | 'earth-observation'
  | 'lunar-exploration'
  | 'lunar-landing'
  | 'planetary-science';

export type MissionPhase =
  | 'pre-launch'
  | 'launch'
  | 'deployment'
  | 'transit'
  | 'orbital-insertion'
  | 'operations'
  | 'completed'
  | 'failed';

export type ComponentCategory =
  | 'launch-vehicle'
  | 'engine'
  | 'fuel-tank'
  | 'bus'
  | 'instrument'
  | 'power'
  | 'antenna'
  | 'thermal'
  | 'attitude';

export interface ComponentSpec {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  mass: number;           // kg
  cost: number;           // million USD
  powerConsumption: number; // W (negative = generation)
  fuelCapacity?: number;  // kg
  thrustNewtons?: number; // N
  specificImpulse?: number; // s (Isp)
  payloadCapacity?: number; // kg (for launch vehicles)
  dataRate?: number;      // kbps
  resolution?: number;    // km (for imaging instruments)
  requirements?: string[];
  incompatibleWith?: string[];
  color?: string;
}

export interface SelectedComponents {
  launchVehicle: string | null;
  engine: string | null;
  fuelTank: string | null;
  bus: string | null;
  instruments: string[];
  power: string[];
  antenna: string | null;
  thermal: string | null;
  attitude: string | null;
}

export interface EngineeringStats {
  totalMass: number;          // kg
  dryMass: number;            // kg
  fuelMass: number;           // kg
  totalCost: number;          // million USD
  powerGeneration: number;    // W
  powerConsumption: number;   // W
  powerBalance: number;       // W (generation - consumption)
  payloadCapacity: number;    // kg (from launch vehicle)
  payloadMass: number;        // kg (spacecraft without launch vehicle)
  fuelCapacity: number;       // kg
  deltaV: number;             // m/s (estimated)
  communicationRate: number;  // kbps
  isLaunchVehicleCompatible: boolean;
  isPowerSufficient: boolean;
  isFuelSufficient: boolean;
  isBudgetOk: boolean;
  hasRequiredComponents: boolean;
}

export interface EngineeringIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  title: string;
  description: string;
  suggestion: string;
}

export interface MissionObjective {
  id: string;
  description: string;
  requiredInstruments?: string[];
  completed: boolean;
  partialProgress: number; // 0–1
  pointValue: number;
}

export interface MissionConfig {
  id: MissionType;
  name: string;
  subtitle: string;
  description: string;
  destination: string;
  duration: number;         // days
  budgetLimit: number;      // million USD
  objectives: MissionObjective[];
  requiredComponents: string[];
  recommendedComponents: string[];
  deltaVRequirement: number; // m/s
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  icon: string;
  color: string;
  backgroundInfo: string;
}

export interface SimulationEvent {
  id: string;
  time: number;             // mission elapsed time in hours
  phase: MissionPhase;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  choices?: EventChoice[];
  resolved: boolean;
  choiceMade?: string;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  consequences: {
    fuelDelta?: number;       // kg
    powerDelta?: number;      // W
    costDelta?: number;       // million USD
    objectiveProgress?: { id: string; delta: number }[];
    riskLevel?: number;       // 0–1
    timeDelayHours?: number;
  };
}

export interface SimulationState {
  phase: MissionPhase;
  elapsedHours: number;
  phaseElapsedHours: number;
  fuelRemaining: number;     // kg
  powerBalance: number;      // W
  altitude: number;          // km
  velocity: number;          // m/s
  objectivesCompleted: string[];
  events: SimulationEvent[];
  pendingEvent: SimulationEvent | null;
  isRunning: boolean;
  speed: number;             // 1x, 2x, 5x, 10x
  failures: string[];
  warnings: string[];
  scientificDataCollected: number; // Mb
  budgetSpent: number;       // million USD
}

export interface MissionResult {
  missionId: MissionType;
  success: boolean;
  partialSuccess: boolean;
  score: number;             // 0–100
  scoreBreakdown: {
    scientific: number;
    engineering: number;
    budget: number;
    efficiency: number;
  };
  objectivesAchieved: string[];
  objectivesFailed: string[];
  budgetUsed: number;
  budgetLimit: number;
  fuelEfficiency: number;    // 0–1
  powerEfficiency: number;   // 0–1
  massEfficiency: number;    // 0–1
  issues: string[];
  recommendations: string[];
  elapsedTime: number;       // hours
}

export interface GameState {
  screen: GameScreen;
  selectedMission: MissionType | null;
  selectedComponents: SelectedComponents;
  engineeringStats: EngineeringStats;
  engineeringIssues: EngineeringIssue[];
  simulationState: SimulationState;
  missionResult: MissionResult | null;
  savedDesigns: { name: string; components: SelectedComponents; missionId: MissionType }[];
  tutorialStep: number;
  showTutorial: boolean;
}

