import { Node3D, Edge3D, DijkstraResult, DijkstraStep } from '../types/graph';

export function runDijkstra(
  nodes: Node3D[],
  edges: Edge3D[],
  sourceId: string,
  targetId: string
): DijkstraResult {
  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const visitedSet = new Set<string>();
  const visitedOrder: string[] = [];
  const steps: DijkstraStep[] = [];

  // Initialize
  for (const node of nodes) {
    distances[node.id] = node.id === sourceId ? 0 : Infinity;
    predecessors[node.id] = null;
  }

  // Build adjacency list (undirected graph)
  const adj = new Map<string, Array<{ neighborId: string; weight: number; edgeId: string }>>();
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    // Skip negative weights if any, clamp to >= 0
    const w = Math.max(0, edge.weight);
    adj.get(edge.source)?.push({ neighborId: edge.target, weight: w, edgeId: edge.id });
    adj.get(edge.target)?.push({ neighborId: edge.source, weight: w, edgeId: edge.id });
  }

  let stepCounter = 0;

  // Initial step
  steps.push({
    stepIndex: stepCounter++,
    type: 'select',
    currentNodeId: sourceId,
    distances: { ...distances },
    predecessors: { ...predecessors },
    visitedNodes: [],
    explanation: `Start algorithm at Source Node [${getNodeLabel(nodes, sourceId)}]. Initial distance = 0, all others = ∞.`,
  });

  while (visitedSet.size < nodes.length) {
    // Find unvisited node with smallest distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const node of nodes) {
      if (!visitedSet.has(node.id) && distances[node.id] < minDistance) {
        minDistance = distances[node.id];
        currentId = node.id;
      }
    }

    // If no reachable unvisited node remains, break
    if (currentId === null || minDistance === Infinity) {
      steps.push({
        stepIndex: stepCounter++,
        type: 'unreachable',
        currentNodeId: null,
        distances: { ...distances },
        predecessors: { ...predecessors },
        visitedNodes: Array.from(visitedSet),
        explanation: 'All remaining unvisited nodes are disconnected / unreachable from the source.',
      });
      break;
    }

    // Mark current as visited
    visitedSet.add(currentId);
    visitedOrder.push(currentId);

    const currentLabel = getNodeLabel(nodes, currentId);

    steps.push({
      stepIndex: stepCounter++,
      type: 'select',
      currentNodeId: currentId,
      distances: { ...distances },
      predecessors: { ...predecessors },
      visitedNodes: Array.from(visitedSet),
      explanation: `Selected [${currentLabel}] with minimal tentative distance ${minDistance}. Settling node.`,
    });

    // Relax all unvisited neighbors of current
    const neighbors = adj.get(currentId) || [];
    for (const { neighborId, weight, edgeId } of neighbors) {
      if (visitedSet.has(neighborId)) continue;

      const neighborLabel = getNodeLabel(nodes, neighborId);
      const tentativeDistance = distances[currentId] + weight;
      const currentNeighborDist = distances[neighborId];

      if (tentativeDistance < currentNeighborDist) {
        distances[neighborId] = tentativeDistance;
        predecessors[neighborId] = currentId;

        steps.push({
          stepIndex: stepCounter++,
          type: 'relax',
          currentNodeId: currentId,
          neighborNodeId: neighborId,
          edgeId,
          distances: { ...distances },
          predecessors: { ...predecessors },
          visitedNodes: Array.from(visitedSet),
          relaxedEdgeSuccess: true,
          explanation: `Relaxing [${currentLabel} ➔ ${neighborLabel}]: New cost ${tentativeDistance} (${minDistance} + ${weight}) is shorter than ${currentNeighborDist === Infinity ? '∞' : currentNeighborDist}. Updating predecessor to [${currentLabel}].`,
        });
      } else {
        steps.push({
          stepIndex: stepCounter++,
          type: 'relax',
          currentNodeId: currentId,
          neighborNodeId: neighborId,
          edgeId,
          distances: { ...distances },
          predecessors: { ...predecessors },
          visitedNodes: Array.from(visitedSet),
          relaxedEdgeSuccess: false,
          explanation: `Checking [${currentLabel} ➔ ${neighborLabel}]: Path via [${currentLabel}] gives ${tentativeDistance}, which is not shorter than existing ${currentNeighborDist}. No update.`,
        });
      }
    }
  }

  // Reconstruct shortest path from targetId back to sourceId
  const shortestPath: string[] = [];
  const shortestPathEdges: string[] = [];
  let totalCost: number | null = null;

  if (distances[targetId] !== Infinity && distances[targetId] !== undefined) {
    totalCost = distances[targetId];
    let curr: string | null = targetId;
    while (curr) {
      shortestPath.unshift(curr);
      curr = predecessors[curr];
    }

    // If sourceId is not in path or target has no path, clear
    if (shortestPath[0] !== sourceId) {
      shortestPath.length = 0;
      totalCost = null;
    } else {
      // Find edge IDs between path nodes
      for (let i = 0; i < shortestPath.length - 1; i++) {
        const u = shortestPath[i];
        const v = shortestPath[i + 1];
        const matchingEdge = edges.find(
          (e) => (e.source === u && e.target === v) || (e.source === v && e.target === u)
        );
        if (matchingEdge) {
          shortestPathEdges.push(matchingEdge.id);
        }
      }
    }
  }

  steps.push({
    stepIndex: stepCounter++,
    type: 'complete',
    currentNodeId: targetId,
    distances: { ...distances },
    predecessors: { ...predecessors },
    visitedNodes: Array.from(visitedSet),
    explanation:
      totalCost !== null
        ? `Algorithm complete. Shortest path to [${getNodeLabel(nodes, targetId)}] has total cost ${totalCost}.`
        : `Target [${getNodeLabel(nodes, targetId)}] is unreachable from [${getNodeLabel(nodes, sourceId)}].`,
  });

  return {
    distances,
    predecessors,
    shortestPath,
    shortestPathEdges,
    totalCost,
    visitedOrder,
    steps,
  };
}

export function getNodeLabel(nodes: Node3D[], id: string): string {
  const node = nodes.find((n) => n.id === id);
  return node ? node.label : id;
}
