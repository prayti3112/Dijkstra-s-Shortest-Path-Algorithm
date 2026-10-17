import { useState, useMemo, useEffect, useRef } from 'react';
import { GRAPH_PRESETS } from './constants/presets';
import { Node3D, Edge3D } from './types/graph';
import { runDijkstra } from './utils/dijkstra';
import { sound } from './utils/sound';
import { Scene, CameraViewPreset } from './components/canvas/Scene';
import { Header } from './components/ui/Header';
import { PredecessorHUD } from './components/ui/PredecessorHUD';
import { EdgeManagerPanel } from './components/ui/EdgeManagerPanel';
import { NodeManagerPanel } from './components/ui/NodeManagerPanel';
import { CameraHUD } from './components/ui/CameraHUD';
import { AlgorithmControls } from './components/ui/AlgorithmControls';

export default function App() {
  const initialPreset = GRAPH_PRESETS[0];

  const [currentPresetId, setCurrentPresetId] = useState<string>(initialPreset.id);
  const [nodes, setNodes] = useState<Node3D[]>(initialPreset.nodes);
  const [edges, setEdges] = useState<Edge3D[]>(initialPreset.edges);
  const [sourceNodeId, setSourceNodeId] = useState<string>(initialPreset.sourceNodeId);
  const [targetNodeId, setTargetNodeId] = useState<string>(initialPreset.targetNodeId);

  // Selection states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Camera states
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('default');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // Step-by-Step Simulation states
  const [isStepMode, setIsStepMode] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Run Dijkstra Algorithm
  const dijkstraResult = useMemo(() => {
    return runDijkstra(nodes, edges, sourceNodeId, targetNodeId);
  }, [nodes, edges, sourceNodeId, targetNodeId]);

  // Track previous shortest path to trigger sound effect on change
  const prevPathRef = useRef<string>('');
  useEffect(() => {
    const pathKey = dijkstraResult.shortestPath.join('-');
    if (prevPathRef.current && prevPathRef.current !== pathKey && pathKey.length > 0) {
      sound.playPathRecalculated();
    }
    prevPathRef.current = pathKey;
  }, [dijkstraResult.shortestPath]);

  // When step mode is active, display the tentative step values
  const currentStep = dijkstraResult.steps[currentStepIndex] || null;

  const activeDistances = isStepMode && currentStep ? currentStep.distances : dijkstraResult.distances;
  const activePredecessors =
    isStepMode && currentStep ? currentStep.predecessors : dijkstraResult.predecessors;
  const activeVisitedNodes =
    isStepMode && currentStep ? currentStep.visitedNodes : dijkstraResult.visitedOrder;
  const activeExaminingNodeId = isStepMode && currentStep ? currentStep.currentNodeId : null;
  const activeExaminingEdgeId = isStepMode && currentStep ? currentStep.edgeId : null;

  // Handlers for Preset Management
  const handleSelectPreset = (presetId: string) => {
    const found = GRAPH_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setCurrentPresetId(found.id);
    setNodes(JSON.parse(JSON.stringify(found.nodes)));
    setEdges(JSON.parse(JSON.stringify(found.edges)));
    setSourceNodeId(found.sourceNodeId);
    setTargetNodeId(found.targetNodeId);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setIsStepMode(false);
    setCurrentStepIndex(0);
    sound.playSelect();
  };

  const handleResetGraph = () => {
    handleSelectPreset(currentPresetId);
  };

  // Handlers for Dynamic Edge Weights & Connections
  const handleUpdateEdgeWeight = (edgeId: string, newWeight: number) => {
    setEdges((prev) =>
      prev.map((e) => (e.id === edgeId ? { ...e, weight: Math.max(1, newWeight) } : e))
    );
  };

  const handleAddEdge = (sourceId: string, targetId: string, weight: number) => {
    const newEdge: Edge3D = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      weight: Math.max(1, weight),
    };
    setEdges((prev) => [...prev, newEdge]);
    setSelectedEdgeId(newEdge.id);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
  };

  // Handlers for Dynamic Node Management
  const handleAddNode = (label: string, x: number, y: number, z: number) => {
    const newNode: Node3D = {
      id: `node-${Date.now()}`,
      label,
      x,
      y,
      z,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleUpdateNodeCoordinates = (id: string, x: number, y: number, z: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y, z } : n)));
  };

  const handleUpdateNodeLabel = (id: string, label: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, label } : n)));
  };

  const handleDeleteNode = (id: string) => {
    if (nodes.length <= 2) {
      alert('Graph must contain at least 2 nodes.');
      return;
    }
    // Remove node
    const remainingNodes = nodes.filter((n) => n.id !== id);
    setNodes(remainingNodes);
    // Remove attached edges
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));

    // Reassign source / target if deleted
    if (sourceNodeId === id) {
      const nextSource = remainingNodes.find((n) => n.id !== targetNodeId) || remainingNodes[0];
      setSourceNodeId(nextSource.id);
    }
    if (targetNodeId === id) {
      const nextTarget = remainingNodes.find((n) => n.id !== sourceNodeId) || remainingNodes[0];
      setTargetNodeId(nextTarget.id);
    }
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleSetSourceNode = (id: string) => {
    if (id === targetNodeId) {
      setTargetNodeId(sourceNodeId);
    }
    setSourceNodeId(id);
    setIsStepMode(false);
    setCurrentStepIndex(0);
  };

  const handleSetTargetNode = (id: string) => {
    if (id === sourceNodeId) {
      setSourceNodeId(targetNodeId);
    }
    setTargetNodeId(id);
    setIsStepMode(false);
    setCurrentStepIndex(0);
  };

  const handleSwapSourceTarget = () => {
    const temp = sourceNodeId;
    setSourceNodeId(targetNodeId);
    setTargetNodeId(temp);
    setIsStepMode(false);
    setCurrentStepIndex(0);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Scene */}
      <Scene
        nodes={nodes}
        edges={edges}
        sourceNodeId={sourceNodeId}
        targetNodeId={targetNodeId}
        shortestPath={dijkstraResult.shortestPath}
        shortestPathEdges={dijkstraResult.shortestPathEdges}
        distances={activeDistances}
        visitedNodes={activeVisitedNodes}
        currentExaminingNodeId={activeExaminingNodeId}
        currentExaminingEdgeId={activeExaminingEdgeId}
        selectedNodeId={selectedNodeId}
        selectedEdgeId={selectedEdgeId}
        onSelectNode={(id) => {
          setSelectedNodeId(id);
          sound.playSelect();
        }}
        onSelectEdge={(id) => {
          setSelectedEdgeId(id);
          sound.playSelect();
        }}
        cameraPreset={cameraPreset}
        autoRotate={autoRotate}
        onClearSelection={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
      />

      {/* Futuristic HUD Header */}
      <Header
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onResetGraph={handleResetGraph}
        nodesCount={nodes.length}
        edgesCount={edges.length}
        pathHops={dijkstraResult.shortestPathEdges.length}
        totalCost={dijkstraResult.totalCost}
      />

      {/* Top Center Camera HUD */}
      <CameraHUD
        cameraPreset={cameraPreset}
        onSelectPreset={setCameraPreset}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
      />

      {/* Left Dock: Dynamic 3D Node Manager */}
      <NodeManagerPanel
        nodes={nodes}
        sourceNodeId={sourceNodeId}
        targetNodeId={targetNodeId}
        selectedNodeId={selectedNodeId}
        onAddNode={handleAddNode}
        onUpdateNodeCoordinates={handleUpdateNodeCoordinates}
        onUpdateNodeLabel={handleUpdateNodeLabel}
        onDeleteNode={handleDeleteNode}
        onSetSourceNode={handleSetSourceNode}
        onSetTargetNode={handleSetTargetNode}
        onSelectNode={(id) => {
          setSelectedNodeId(id);
          sound.playSelect();
        }}
      />

      {/* Right Dock: Dynamic Weights & Connections with Real-Time Sliders */}
      <EdgeManagerPanel
        nodes={nodes}
        edges={edges}
        shortestPathEdges={dijkstraResult.shortestPathEdges}
        selectedEdgeId={selectedEdgeId}
        onUpdateEdgeWeight={handleUpdateEdgeWeight}
        onAddEdge={handleAddEdge}
        onDeleteEdge={handleDeleteEdge}
        onSelectEdge={(id) => {
          setSelectedEdgeId(id);
          sound.playSelect();
        }}
      />

      {/* Bottom Left Dock: Animated Predecessor Table & Cost HUD */}
      <PredecessorHUD
        nodes={nodes}
        edges={edges}
        sourceNodeId={sourceNodeId}
        targetNodeId={targetNodeId}
        distances={activeDistances}
        predecessors={activePredecessors}
        shortestPath={dijkstraResult.shortestPath}
        totalCost={dijkstraResult.totalCost}
        onSelectNode={(id) => {
          setSelectedNodeId(id);
          sound.playSelect();
        }}
      />

      {/* Bottom Right Dock: Source/Target Controls & Simulation Mode */}
      <AlgorithmControls
        nodes={nodes}
        sourceNodeId={sourceNodeId}
        targetNodeId={targetNodeId}
        onSetSourceNode={handleSetSourceNode}
        onSetTargetNode={handleSetTargetNode}
        onSwapSourceTarget={handleSwapSourceTarget}
        isStepMode={isStepMode}
        onToggleStepMode={setIsStepMode}
        steps={dijkstraResult.steps}
        currentStepIndex={currentStepIndex}
        onStepChange={setCurrentStepIndex}
      />
    </div>
  );
}
