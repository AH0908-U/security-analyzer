'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { Color, PointLight } from 'three'

function Particles({ count = 120, color = '#00f5ff' }: { count?: number; color?: string }) {
  const mesh = useRef<any>()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 5
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.015
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.08
      mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

function ShieldCenter({ color = '#00f5ff' }: { color?: string }) {
  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <mesh>
        <icosahedronGeometry args={[0.7, 1]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.25}
          distort={0.4}
          speed={2}
          wireframe
        />
      </mesh>
    </Float>
  )
}

function GeometricRing({ color = '#00f5ff' }: { color?: string }) {
  const ref = useRef<any>()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.08
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.4
    }
  })

  return (
    <group ref={ref}>
      <mesh>
        <torusKnotGeometry args={[2.8, 0.35, 64, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} wireframe />
      </mesh>
      <mesh>
        <torusGeometry args={[2.5, 0.015, 16, 80]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
      <mesh>
        <ringGeometry args={[2.2, 2.25, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} side={2} />
      </mesh>
    </group>
  )
}

function ScanLine() {
  const ref = useRef<any>()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = ((state.clock.elapsedTime * 0.8) % 6) - 3
    }
  })

  return (
    <mesh ref={ref} position={[0, -3, 2.5]} rotation={[0, 0, 0.1]}>
      <planeGeometry args={[5, 0.03]} />
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.15} />
    </mesh>
  )
}

interface ThreeBackgroundProps {
  score?: number
}

export default function ThreeBackground({ score = 50 }: ThreeBackgroundProps) {
  const color = score > 70 ? '#00ff88' : score > 40 ? '#ffaa33' : '#ff3366'

  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color={color} />
        <directionalLight position={[-5, -3, -3]} intensity={0.2} color="#7b2ff7" />

        <Particles color={color} />
        <ShieldCenter color={color} />
        <GeometricRing color={color} />
        <ScanLine />
      </Canvas>
    </div>
  )
}
