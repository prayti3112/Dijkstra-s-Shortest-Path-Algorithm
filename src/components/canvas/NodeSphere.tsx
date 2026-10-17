import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Node3D } from '../../types/graph';

interface NodeSphereProps {
  node: Node3D;
  isSource: boolean;
  isTarget: boolean;
  isShortestPath: boolean;
  isVisited: boolean;
  isCurrentExamining: boolean;
  currentDistance: number | undefined;
  onSelect: (nodeId: string) => void;
  isSelected: boolean;
}

export function NodeSphere({
  node,
  isSource,
  isTarget,
  isShortestPath,
  isVisited,
  isCurrentExamining,
  currentDistance,
  onSelect,
  isSelected,
}: NodeSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Determine node palette
  let baseColor = '#0ea5e9'; // Cool cyan
  let emissiveColor = '#0284c7';
  let emissiveIntensity = 1.0;

  if (isSource) {
    baseColor = '#10b981'; // Emerald beacon
    emissiveColor = '#059669';
    emissiveIntensity = 2.2;
  } else if (isTarget) {
    baseColor = '#f59e0b'; // Gold beacon
    emissiveColor = '#d97706';
    emissiveIntensity = 2.4;
  } else if (isShortestPath) {
    baseColor = '#ff0055'; // Neon crimson / ruby
    emissiveColor = '#f43f5e';
    emissiveIntensity = 2.6;
  } else if (isCurrentExamining) {
    baseColor = '#eab308'; // Active examining yellow
    emissiveColor = '#ca8a04';
    emissiveIntensity = 2.5;
  } else if (isVisited) {
    baseColor = '#8b5cf6'; // Electric violet
    emissiveColor = '#7c3aed';
    emissiveIntensity = 1.4;
  }

  // Animation frame loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate holographic ring
    if (ringRef.current) {
      ringRef.current.rotation.x = time * 0.8;
      ringRef.current.rotation.y = time * 1.2;
    }

    // Orbiting particle
    if (orbitRef.current) {
      orbitRef.current.rotation.y = time * 2;
      orbitRef.current.rotation.z = Math.sin(time) * 0.5;
    }

    // Pulse animation if in shortest path or currently examining
    if (meshRef.current) {
      if (isShortestPath || isCurrentExamining) {
        const pulse = 1 + Math.sin(time * 6) * 0.12;
        meshRef.current.scale.set(pulse, pulse, pulse);
      } else if (hovered || isSelected) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const distText =
    currentDistance === undefined || currentDistance === Infinity
      ? '∞'
      : currentDistance.toString();

  return (
    <group position={[node.x, node.y, node.z]}>
      {/* Core Glowing Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? emissiveIntensity * 1.4 : emissiveIntensity}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Holographic Wireframe Shell */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.85, 0.02, 16, 64]} />
        <meshBasicMaterial
          color={isShortestPath ? '#ffd700' : baseColor}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Orbiting Photon Particle */}
      {(isShortestPath || isSource || isTarget || isCurrentExamining) && (
        <group ref={orbitRef}>
          <mesh position={[1.05, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial
              color={isShortestPath ? '#ffd700' : '#ffffff'}
            />
          </mesh>
        </group>
      )}

      {/* Selection Halo */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.2, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3D Billboard Label & Metrics HUD */}
      <Html
        position={[0, 1.05, 0]}
        center
        distanceFactor={14}
        className="pointer-events-auto"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node.id);
          }}
          className={`cursor-pointer transition-all duration-200 select-none flex flex-col items-center ${
            hovered || isSelected ? 'scale-110 z-50' : 'scale-95'
          }`}
        >
          {/* Main Label Pill */}
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-lg flex items-center gap-1.5 whitespace-nowrap ${
              isShortestPath
                ? 'bg-rose-950/85 text-rose-300 border-rose-500 shadow-rose-900/50'
                : isSource
                ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500 shadow-emerald-900/50'
                : isTarget
                ? 'bg-amber-950/85 text-amber-300 border-amber-500 shadow-amber-900/50'
                : isVisited
                ? 'bg-purple-950/85 text-purple-300 border-purple-500/60 shadow-purple-900/40'
                : 'bg-slate-900/85 text-slate-200 border-cyan-500/40 shadow-cyan-950/30'
            }`}
          >
            {/* Status indicator dot */}
            <span
              className={`w-2 h-2 rounded-full ${
                isShortestPath
                  ? 'bg-rose-400 animate-ping'
                  : isSource
                  ? 'bg-emerald-400'
                  : isTarget
                  ? 'bg-amber-400'
                  : isVisited
                  ? 'bg-purple-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span>{node.label}</span>

            {/* Distance badge */}
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                isShortestPath
                  ? 'bg-rose-500/30 text-rose-200'
                  : isSource
                  ? 'bg-emerald-500/30 text-emerald-200'
                  : 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              dist: {distText}
            </span>
          </div>

          {/* Role badge if source or target */}
          {(isSource || isTarget || isShortestPath) && (
            <div
              className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-b mt-[-2px] border-b border-x ${
                isSource
                  ? 'bg-emerald-600/90 text-white border-emerald-400'
                  : isTarget
                  ? 'bg-amber-600/90 text-white border-amber-400'
                  : 'bg-rose-600/90 text-white border-rose-400'
              }`}
            >
              {isSource ? 'START NODE' : isTarget ? 'TARGET NODE' : 'SHORTEST PATH'}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
