import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Node3D, Edge3D } from '../../types/graph';
import { Graph3D } from './Graph3D';
import { ParticleField, CyberFloor } from './ParticleField';

export type CameraViewPreset = 'isometric' | 'top' | 'front' | 'side' | 'default';

interface SceneProps {
  nodes: Node3D[];
  edges: Edge3D[];
  sourceNodeId: string;
  targetNodeId: string;
  shortestPath: string[];
  shortestPathEdges: string[];
  distances: Record<string, number>;
  visitedNodes: string[];
  currentExaminingNodeId?: string | null;
  currentExaminingEdgeId?: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
  cameraPreset: CameraViewPreset;
  autoRotate: boolean;
  onClearSelection: () => void;
}

function CameraController({
  preset,
  autoRotate,
}: {
  preset: CameraViewPreset;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    let targetPos = new THREE.Vector3(0, 5, 18);
    let lookAt = new THREE.Vector3(0, 0, 0);

    switch (preset) {
      case 'isometric':
        targetPos = new THREE.Vector3(14, 12, 14);
        break;
      case 'top':
        targetPos = new THREE.Vector3(0, 22, 0.001);
        break;
      case 'front':
        targetPos = new THREE.Vector3(0, 0, 20);
        break;
      case 'side':
        targetPos = new THREE.Vector3(20, 0, 0);
        break;
      case 'default':
      default:
        targetPos = new THREE.Vector3(0, 5, 18);
        break;
    }

    camera.position.copy(targetPos);
    controlsRef.current.target.copy(lookAt);
    controlsRef.current.update();
  }, [preset, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={3}
      maxDistance={45}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      makeDefault
    />
  );
}

export function Scene({
  nodes,
  edges,
  sourceNodeId,
  targetNodeId,
  shortestPath,
  shortestPathEdges,
  distances,
  visitedNodes,
  currentExaminingNodeId,
  currentExaminingEdgeId,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  cameraPreset,
  autoRotate,
  onClearSelection,
}: SceneProps) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      <Canvas
        camera={{ position: [0, 5, 18], fov: 48 }}
        onPointerDown={(e) => {
          // If clicked directly on the canvas background, deselect
          if (e.target === e.currentTarget) {
            onClearSelection();
          }
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <CameraController preset={cameraPreset} autoRotate={autoRotate} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.7} color="#94a3b8" />
        <directionalLight position={[12, 20, 15]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-12, -10, -10]} intensity={0.6} color="#38bdf8" />
        <pointLight position={[0, 4, 0]} intensity={1.0} color="#00f0ff" distance={25} />

        {/* Space particles & Cyber grid floor */}
        <ParticleField count={900} />
        <CyberFloor />

        {/* Graph Mesh Group */}
        <Graph3D
          nodes={nodes}
          edges={edges}
          sourceNodeId={sourceNodeId}
          targetNodeId={targetNodeId}
          shortestPath={shortestPath}
          shortestPathEdges={shortestPathEdges}
          distances={distances}
          visitedNodes={visitedNodes}
          currentExaminingNodeId={currentExaminingNodeId}
          currentExaminingEdgeId={currentExaminingEdgeId}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          onSelectNode={onSelectNode}
          onSelectEdge={onSelectEdge}
        />
      </Canvas>
    </div>
  );
}
