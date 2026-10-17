import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Edge3D, Node3D } from '../../types/graph';

interface EdgeLineProps {
  edge: Edge3D;
  sourceNode: Node3D;
  targetNode: Node3D;
  isShortestPath: boolean;
  isExamining: boolean;
  onSelectEdge?: (edgeId: string) => void;
  isSelected?: boolean;
}

export function EdgeLine({
  edge,
  sourceNode,
  targetNode,
  isShortestPath,
  isExamining,
  onSelectEdge,
  isSelected,
}: EdgeLineProps) {
  const packetRef1 = useRef<THREE.Mesh>(null);
  const packetRef2 = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const vSource = useMemo(
    () => new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
    [sourceNode.x, sourceNode.y, sourceNode.z]
  );
  const vTarget = useMemo(
    () => new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z),
    [targetNode.x, targetNode.y, targetNode.z]
  );

  const { midPoint, tubeGeometry, length } = useMemo(() => {
    const curve = new THREE.LineCurve3(vSource, vTarget);
    const radius = isShortestPath ? 0.08 : 0.035;
    const geom = new THREE.TubeGeometry(curve, 1, radius, 8, false);
    const mid = new THREE.Vector3().addVectors(vSource, vTarget).multiplyScalar(0.5);
    const len = vSource.distanceTo(vTarget);
    return { midPoint: mid, tubeGeometry: geom, length: len };
  }, [vSource, vTarget, isShortestPath]);

  // Dynamic colors
  const edgeColor = isShortestPath
    ? '#ff0055' // Neon crimson
    : isExamining
    ? '#eab308' // Yellow
    : hovered || isSelected
    ? '#38bdf8' // Bright sky
    : '#0284c7'; // Deep cyan

  const emissiveColor = isShortestPath
    ? '#ff1a75'
    : isExamining
    ? '#ca8a04'
    : hovered || isSelected
    ? '#0284c7'
    : '#0369a1';

  const emissiveIntensity = isShortestPath ? 2.8 : isExamining ? 2.0 : hovered ? 1.5 : 0.8;

  // Frame animation for pulse energy packets
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Pulse material if shortest path
    if (materialRef.current && isShortestPath) {
      const pulse = 2.4 + Math.sin(time * 8) * 0.8;
      materialRef.current.emissiveIntensity = pulse;
    }

    // Move energy packet along the line
    if (isShortestPath && packetRef1.current) {
      const t1 = (time * 0.85) % 1;
      packetRef1.current.position.lerpVectors(vSource, vTarget, t1);
    }
    if (isShortestPath && packetRef2.current) {
      const t2 = (time * 0.85 + 0.5) % 1;
      packetRef2.current.position.lerpVectors(vSource, vTarget, t2);
    }
  });

  return (
    <group>
      {/* 3D Glowing Tube */}
      <mesh
        geometry={tubeGeometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelectEdge?.(edge.id);
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
        <meshStandardMaterial
          ref={materialRef}
          color={edgeColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={isShortestPath ? 0.95 : 0.65}
        />
      </mesh>

      {/* Energy Flow Packets (Photons traveling on Shortest Path) */}
      {isShortestPath && (
        <>
          <mesh ref={packetRef1}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
          <mesh ref={packetRef2}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </>
      )}

      {/* 3D Midpoint Weight HUD Tag */}
      <Html
        position={[midPoint.x, midPoint.y + 0.25, midPoint.z]}
        center
        distanceFactor={15}
        className="pointer-events-auto"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectEdge?.(edge.id);
          }}
          className={`cursor-pointer transition-all duration-200 select-none ${
            hovered || isSelected ? 'scale-125 z-40' : 'scale-100'
          }`}
          title={`Click to adjust weight of ${sourceNode.label} ↔ ${targetNode.label}`}
        >
          <div
            className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs shadow-lg backdrop-blur-md border flex items-center gap-1 ${
              isShortestPath
                ? 'bg-rose-950/90 text-amber-300 border-rose-500 shadow-rose-950/60 ring-2 ring-amber-400/50'
                : isExamining
                ? 'bg-amber-950/90 text-amber-200 border-amber-400 shadow-amber-950/60'
                : isSelected
                ? 'bg-cyan-950/95 text-cyan-200 border-cyan-400 ring-2 ring-cyan-400/40'
                : hovered
                ? 'bg-slate-900/90 text-white border-cyan-400 shadow-cyan-900/40'
                : 'bg-slate-950/75 text-cyan-300 border-slate-700/80'
            }`}
          >
            <span className="text-[10px] text-slate-400 font-sans">w:</span>
            <span>{edge.weight}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
