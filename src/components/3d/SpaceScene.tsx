// ============================================================
// SpaceScene.tsx – Main Three.js 3D scene using React Three Fiber
// ============================================================

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useRef, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { SelectedComponents } from '../../types'
import SpacecraftModel from './SpacecraftModel'

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface SpaceSceneProps {
  missionId?: string
  phase?: string
  selectedComponents?: SelectedComponents
}

// ─────────────────────────────────────────────
// Animated Earth
// ─────────────────────────────────────────────
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.08
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhongMaterial
        color="#1a6bcc"
        emissive="#0a2a55"
        emissiveIntensity={0.25}
        specular="#88ccff"
        shininess={60}
      />
      {/* Cloud-like overlay */}
      <mesh>
        <sphereGeometry args={[1.01, 32, 32]} />
        <meshPhongMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.08, 32, 32]} />
        <meshPhongMaterial
          color="#4488ff"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </mesh>
  )
}

// ─────────────────────────────────────────────
// Moon
// ─────────────────────────────────────────────
function Moon() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.04
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.03
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[3, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshPhongMaterial
          color="#aaaaaa"
          emissive="#222222"
          emissiveIntensity={0.1}
          specular="#ffffff"
          shininess={10}
        />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────
// Mars
// ─────────────────────────────────────────────
function Mars() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.06
  })

  return (
    <mesh ref={meshRef} position={[8, 0, -2]} castShadow>
      <sphereGeometry args={[0.53, 32, 32]} />
      <meshPhongMaterial
        color="#c1440e"
        emissive="#3a0c00"
        emissiveIntensity={0.2}
        specular="#ff8866"
        shininess={20}
      />
      {/* Polar ice cap */}
      <mesh position={[0, 0.51, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhongMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </mesh>
  )
}

// ─────────────────────────────────────────────
// Trajectory Arc (TubeGeometry along a Bezier curve)
// ─────────────────────────────────────────────
interface TrajectoryArcProps {
  destination: THREE.Vector3
}

function TrajectoryArc({ destination }: TrajectoryArcProps) {
  const tube = useMemo(() => {
    const origin = new THREE.Vector3(0, 0, 0)
    const mid = new THREE.Vector3(
      (origin.x + destination.x) / 2,
      Math.max(destination.length() * 0.6, 2.5),
      (origin.z + destination.z) / 2
    )
    const curve = new THREE.QuadraticBezierCurve3(origin, mid, destination)
    return new THREE.TubeGeometry(curve, 60, 0.012, 6, false)
  }, [destination])

  return (
    <mesh geometry={tube}>
      <meshBasicMaterial
        color="#00eeff"
        transparent
        opacity={0.45}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────
// Auto-rotating camera rig
// ─────────────────────────────────────────────
function AutoRotate() {
  useFrame((state, delta) => {
    state.camera.position.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      delta * 0.03
    )
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

// ─────────────────────────────────────────────
// Inner scene (rendered inside Canvas)
// ─────────────────────────────────────────────
function SceneContent({ missionId, selectedComponents }: SpaceSceneProps) {
  const isLunar = Boolean(missionId?.toLowerCase().includes('lunar'))
  const isPlanetary = Boolean(missionId?.toLowerCase().includes('planetary'))

  const trajectoryDest = useMemo<THREE.Vector3>(() => {
    if (isPlanetary) return new THREE.Vector3(8, 0, -2)
    if (isLunar) return new THREE.Vector3(3, 0.3, 0)
    return new THREE.Vector3(0, 3, 0) // Earth orbit
  }, [isLunar, isPlanetary])

  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.18} color="#c0d8ff" />
      <directionalLight
        position={[10, 6, 8]}
        intensity={1.8}
        color="#fff5e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-6, -4, -6]} intensity={0.15} color="#2244aa" />

      {/* ── Background stars ── */}
      <Stars
        radius={120}
        depth={60}
        count={2000}
        factor={5}
        saturation={0.3}
        fade
        speed={0.4}
      />

      {/* ── Celestial bodies ── */}
      <Earth />
      {isLunar && <Moon />}
      {isPlanetary && <Mars />}

      {/* ── Trajectory ── */}
      <TrajectoryArc destination={trajectoryDest} />

      {/* ── Spacecraft ── */}
      <Suspense fallback={null}>
        {selectedComponents && (
          <SpacecraftModel components={selectedComponents} />
        )}
      </Suspense>

      {/* ── Camera controls ── */}
      <AutoRotate />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={20}
        autoRotate={false}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  )
}

// ─────────────────────────────────────────────
// Loader fallback
// ─────────────────────────────────────────────
function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <span className="text-xs tracking-widest text-cyan-400">
          LOADING SCENE…
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────
export default function SpaceScene({
  missionId,
  phase,
  selectedComponents,
}: SpaceSceneProps) {
  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<SceneFallback />}>
        <Canvas
          camera={{ position: [0, 2, 10], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
          shadows
          style={{ background: '#00001a' }}
        >
          <SceneContent
            missionId={missionId}
            phase={phase}
            selectedComponents={selectedComponents}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}
