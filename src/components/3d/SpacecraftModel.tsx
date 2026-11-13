// ============================================================
// SpacecraftModel.tsx – Procedural 3D spacecraft built from
// the player's selected components
// ============================================================

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SelectedComponents } from '../../types'

interface SpacecraftModelProps {
  components: SelectedComponents
}

// ─────────────────────────────────────────────
// Shared material helpers
// ─────────────────────────────────────────────
const metalMaterial = (
  color: string,
  metalness = 0.75,
  roughness = 0.3
) => (
  <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
)

const goldMaterial = (
  <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.2} />
)

// ─────────────────────────────────────────────
// Sub-parts
// ─────────────────────────────────────────────

/** Central spacecraft bus (main body box) */
function Bus({ color }: { color: string }) {
  return (
    <mesh position={[0, 0, 0]} castShadow>
      <boxGeometry args={[0.5, 0.55, 0.5]} />
      {metalMaterial(color)}
    </mesh>
  )
}

/** Rocket / thruster engine cone at the bottom */
function Engine() {
  return (
    <group position={[0, -0.42, 0]}>
      {/* Nozzle cone pointing down */}
      <mesh rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.18, 0.3, 12]} />
        {metalMaterial('#555566', 0.8, 0.25)}
      </mesh>
      {/* Engine bell rim glow ring */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.18, 0.025, 8, 24]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.6} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Cylindrical fuel tank attached below / beside bus */
function FuelTank() {
  return (
    <group>
      {/* Main propellant tank */}
      <mesh position={[0, -0.1, 0.35]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.45, 16]} />
        {metalMaterial('#b0c8e8', 0.6, 0.4)}
      </mesh>
      {/* Feed line */}
      <mesh position={[0, -0.1, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
        {metalMaterial('#445566', 0.7, 0.5)}
      </mesh>
    </group>
  )
}

/** Solar panels on either side */
function SolarPanels() {
  const panelGeom = <boxGeometry args={[0.55, 0.005, 0.28]} />
  return (
    <>
      {/* Left panel */}
      <mesh position={[-0.58, 0.05, 0]} castShadow>
        {panelGeom}
        {goldMaterial}
      </mesh>
      {/* Left panel inner cell grid lines (thin box overlay) */}
      <mesh position={[-0.58, 0.007, 0]}>
        <boxGeometry args={[0.54, 0.003, 0.27]} />
        <meshStandardMaterial color="#1a1a00" transparent opacity={0.35} />
      </mesh>
      {/* Right panel */}
      <mesh position={[0.58, 0.05, 0]} castShadow>
        {panelGeom}
        {goldMaterial}
      </mesh>
      <mesh position={[0.58, 0.007, 0]}>
        <boxGeometry args={[0.54, 0.003, 0.27]} />
        <meshStandardMaterial color="#1a1a00" transparent opacity={0.35} />
      </mesh>
    </>
  )
}

/** High-gain dish antenna on top */
function Antenna() {
  return (
    <group position={[0, 0.38, 0]}>
      {/* Mast */}
      <mesh castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
        {metalMaterial('#aaaaaa', 0.6, 0.5)}
      </mesh>
      {/* Dish (flat cone shape) */}
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 0.06, 20, 1, true]} />
        <meshStandardMaterial
          color="#ccddee"
          metalness={0.85}
          roughness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/** Science instruments (small colored boxes on face of bus) */
function Instruments({ count }: { count: number }) {
  const colors = ['#00ffcc', '#ff4466', '#ffaa00', '#aa44ff', '#44aaff']
  const positions: [number, number, number][] = [
    [0.22, 0.1, 0.27],
    [-0.22, 0.1, 0.27],
    [0, 0.1, 0.27],
    [0.14, -0.08, 0.27],
    [-0.14, -0.08, 0.27],
  ]

  return (
    <>
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <mesh key={i} position={positions[i]} castShadow>
          <boxGeometry args={[0.07, 0.07, 0.04]} />
          <meshStandardMaterial
            color={colors[i % colors.length]}
            emissive={colors[i % colors.length]}
            emissiveIntensity={0.25}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}
    </>
  )
}

/** Attitude control thrusters (tiny nozzles at corners) */
function AttitudeControl() {
  const thrusterPos: [number, number, number][] = [
    [0.26, 0.28, 0.26],
    [-0.26, 0.28, 0.26],
    [0.26, -0.28, 0.26],
    [-0.26, -0.28, 0.26],
  ]
  return (
    <>
      {thrusterPos.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 0.06, 8]} />
          {metalMaterial('#778899', 0.7, 0.4)}
        </mesh>
      ))}
    </>
  )
}

/** Thermal blanket stripes on the bus sides */
function Thermal() {
  return (
    <>
      {[-0.12, 0, 0.12].map((y, i) => (
        <mesh key={i} position={[0.256, y, 0]}>
          <boxGeometry args={[0.005, 0.07, 0.5]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#ffdd88' : '#444466'}
            metalness={0.3}
            roughness={0.8}
          />
        </mesh>
      ))}
    </>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function SpacecraftModel({ components }: SpacecraftModelProps) {
  const groupRef = useRef<THREE.Group>(null!)

  // Slow tumble animation
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25
      groupRef.current.rotation.x =
        Math.sin(_state.clock.elapsedTime * 0.18) * 0.08
    }
  })

  // Pick bus colour from launchVehicle/bus id string
  const busColor = (() => {
    const id = (components.bus ?? '').toLowerCase()
    if (id.includes('titan')) return '#334455'
    if (id.includes('explorer')) return '#1a3a5c'
    if (id.includes('voyager')) return '#3a2a4c'
    return '#2a3a4a'
  })()

  const hasBus = Boolean(components.bus)
  const hasEngine = Boolean(components.engine)
  const hasFuelTank = Boolean(components.fuelTank)
  const hasSolarPanels = components.power.length > 0
  const hasAntenna = Boolean(components.antenna)
  const hasInstruments = components.instruments.length > 0
  const hasThermal = Boolean(components.thermal)
  const hasAttitude = Boolean(components.attitude)

  // Nothing selected – show ghost placeholder
  if (!hasBus && !hasEngine && !hasSolarPanels) {
    return (
      <mesh position={[3, 1.5, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial
          color="#334455"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
    )
  }

  return (
    <group ref={groupRef} position={[3, 1.5, 0]}>
      {hasBus && <Bus color={busColor} />}
      {hasEngine && <Engine />}
      {hasFuelTank && <FuelTank />}
      {hasSolarPanels && <SolarPanels />}
      {hasAntenna && <Antenna />}
      {hasInstruments && <Instruments count={components.instruments.length} />}
      {hasThermal && <Thermal />}
      {hasAttitude && <AttitudeControl />}
    </group>
  )
}
