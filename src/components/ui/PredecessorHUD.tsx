import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, ChevronDown, ChevronUp, Route, Zap, CheckCircle2, CircleDashed } from 'lucide-react';
import { Node3D, Edge3D } from '../../types/graph';

interface PredecessorHUDProps {
  nodes: Node3D[];
  edges: Edge3D[];
  sourceNodeId: string;
  targetNodeId: string;
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  shortestPath: string[];
  totalCost: number | null;
  onSelectNode: (id: string) => void;
}

export function PredecessorHUD({
  nodes,
  edges,
  sourceNodeId,
  targetNodeId,
  distances,
  predecessors,
  shortestPath,
  totalCost,
  onSelectNode,
}: PredecessorHUDProps) {
  const [collapsed, setCollapsed] = useState(false);

  const nodeMap = new Map<string, Node3D>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const shortestPathSet = new Set(shortestPath);

  // Build breadcrumb segments with weights
  const breadcrumbs = [];
  if (shortestPath.length > 0) {
    for (let i = 0; i < shortestPath.length; i++) {
      const currId = shortestPath[i];
      const currNode = nodeMap.get(currId);
      breadcrumbs.push({
        id: currId,
        label: currNode ? currNode.label : currId,
        isSource: currId === sourceNodeId,
        isTarget: currId === targetNodeId,
      });

      if (i < shortestPath.length - 1) {
        const nextId = shortestPath[i + 1];
        const connectingEdge = edges.find(
          (e) => (e.source === currId && e.target === nextId) || (e.source === nextId && e.target === currId)
        );
        breadcrumbs.push({
          isEdge: true,
          weight: connectingEdge ? connectingEdge.weight : '?',
        });
      }
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-30 w-[420px] max-w-[calc(100vw-2rem)] select-none pointer-events-auto">
      <div className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        {/* HUD Top Bar */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="px-4 py-3 bg-slate-950/80 border-b border-cyan-500/20 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Table size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-400">
                  PREDECESSOR HUD
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Routing table & optimal cost breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-slate-400 hover:text-white p-1">
              {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Shortest Path Cost Banner */}
        <div className="px-4 py-3 bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="text-rose-400" size={18} />
            <span className="text-xs font-semibold text-slate-300">Total Path Cost:</span>
          </div>

          <motion.div
            key={totalCost !== null ? totalCost : 'unreachable'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="flex items-center gap-1.5"
          >
            {totalCost !== null ? (
              <span className="text-xl font-mono font-black text-rose-400 glow-crimson-text">
                {totalCost}
                <span className="text-xs font-normal text-amber-300/80 ml-1">units</span>
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40">
                UNREACHABLE
              </span>
            )}
          </motion.div>
        </div>

        {/* Path Breadcrumbs */}
        {shortestPath.length > 0 && (
          <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto text-xs flex items-center gap-1.5 whitespace-nowrap scrollbar-none">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Path:</span>
            {breadcrumbs.map((item, idx) => {
              if (item.isEdge) {
                return (
                  <span key={idx} className="flex items-center gap-1 text-[11px] text-amber-400/90 font-mono">
                    <span className="text-slate-500">─</span>
                    <span className="bg-amber-950/60 border border-amber-500/30 px-1 rounded text-[10px]">
                      {item.weight}
                    </span>
                    <span className="text-slate-500">➔</span>
                  </span>
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => item.id && onSelectNode(item.id)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-transform hover:scale-105 ${
                    item.isSource
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60'
                      : item.isTarget
                      ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60'
                      : 'bg-rose-950/90 text-rose-300 border border-rose-500/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Animated Predecessor Table */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-64 overflow-y-auto"
            >
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono tracking-wider sticky top-0 backdrop-blur z-10">
                    <th className="py-2 px-3">Node</th>
                    <th className="py-2 px-2 text-center">Shortest Dist</th>
                    <th className="py-2 px-2 text-center">Via (Pred)</th>
                    <th className="py-2 px-3 text-right">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {nodes.map((node, index) => {
                    const isSrc = node.id === sourceNodeId;
                    const isTgt = node.id === targetNodeId;
                    const inPath = shortestPathSet.has(node.id);
                    const dist = distances[node.id];
                    const predId = predecessors[node.id];
                    const predNode = predId ? nodeMap.get(predId) : null;

                    return (
                      <motion.tr
                        key={node.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => onSelectNode(node.id)}
                        className={`cursor-pointer transition-colors ${
                          inPath
                            ? 'bg-rose-950/30 hover:bg-rose-900/40 text-rose-200'
                            : isSrc
                            ? 'bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-200'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              inPath
                                ? 'bg-rose-400 shadow-sm shadow-rose-400'
                                : isSrc
                                ? 'bg-emerald-400'
                                : isTgt
                                ? 'bg-amber-400'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span className="font-sans text-xs truncate max-w-[100px]">{node.label}</span>
                        </td>
                        <td className="py-2 px-2 text-center font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] ${
                              dist === Infinity
                                ? 'text-slate-500 bg-slate-900'
                                : inPath
                                ? 'text-rose-300 bg-rose-950/60 border border-rose-500/30'
                                : 'text-cyan-300 bg-slate-900/80'
                            }`}
                          >
                            {dist === Infinity ? '∞' : dist}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {predNode ? (
                            <span className="text-slate-300 font-sans text-xs bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700/50">
                              {predNode.label}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isSrc ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                              SOURCE
                            </span>
                          ) : isTgt ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40 font-bold">
                              TARGET
                            </span>
                          ) : inPath ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40 font-bold">
                              OPTIMAL
                            </span>
                          ) : dist !== Infinity ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                              SETTLED
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">UNREACHABLE</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
