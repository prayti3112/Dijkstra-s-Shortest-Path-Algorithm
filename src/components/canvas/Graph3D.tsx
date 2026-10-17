import { Node3D, Edge3D } from '../../types/graph';
import { NodeSphere } from './NodeSphere';
import { EdgeLine } from './EdgeLine';

interface Graph3DProps {
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
}

export function Graph3D({
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
}: Graph3DProps) {
  // Build fast node map
  const nodeMap = new Map<string, Node3D>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const shortestPathSet = new Set(shortestPath);
  const shortestPathEdgeSet = new Set(shortestPathEdges);
  const visitedSet = new Set(visitedNodes);

  return (
    <group>
      {/* 3D Edges */}
      {edges.map((edge) => {
        const srcNode = nodeMap.get(edge.source);
        const tgtNode = nodeMap.get(edge.target);
        if (!srcNode || !tgtNode) return null;

        const isShortest = shortestPathEdgeSet.has(edge.id);
        const isExamining = currentExaminingEdgeId === edge.id;
        const isSelected = selectedEdgeId === edge.id;

        return (
          <EdgeLine
            key={edge.id}
            edge={edge}
            sourceNode={srcNode}
            targetNode={tgtNode}
            isShortestPath={isShortest}
            isExamining={isExamining}
            onSelectEdge={onSelectEdge}
            isSelected={isSelected}
          />
        );
      })}

      {/* 3D Nodes */}
      {nodes.map((node) => {
        const isSource = node.id === sourceNodeId;
        const isTarget = node.id === targetNodeId;
        const isShortest = shortestPathSet.has(node.id);
        const isVisited = visitedSet.has(node.id);
        const isExamining = currentExaminingNodeId === node.id;
        const isSelected = selectedNodeId === node.id;

        return (
          <NodeSphere
            key={node.id}
            node={node}
            isSource={isSource}
            isTarget={isTarget}
            isShortestPath={isShortest}
            isVisited={isVisited}
            isCurrentExamining={isExamining}
            currentDistance={distances[node.id]}
            onSelect={onSelectNode}
            isSelected={isSelected}
          />
        );
      })}
    </group>
  );
}
