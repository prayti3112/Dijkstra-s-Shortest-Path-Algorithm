export interface Node3D {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  color?: string;
}

export interface Edge3D {
  id: string;
  source: string; // node ID
  target: string; // node ID
  weight: number;
}

export interface DijkstraStep {
  stepIndex: number;
  type: 'select' | 'relax' | 'complete' | 'unreachable';
  currentNodeId: string | null;
  neighborNodeId?: string;
  edgeId?: string;
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  visitedNodes: string[];
  explanation: string;
  relaxedEdgeSuccess?: boolean;
}

export interface DijkstraResult {
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  shortestPath: string[]; // sequence of node IDs from start to end
  shortestPathEdges: string[]; // sequence of edge IDs along shortest path
  totalCost: number | null; // null if unreachable
  visitedOrder: string[];
  steps: DijkstraStep[];
}

export interface GraphPreset {
  id: string;
  name: string;
  description: string;
  sourceNodeId: string;
  targetNodeId: string;
  nodes: Node3D[];
  edges: Edge3D[];
}
