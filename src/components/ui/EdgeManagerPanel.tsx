import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Plus, Trash2, Zap, Link as LinkIcon, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Node3D, Edge3D } from '../../types/graph';
import { sound } from '../../utils/sound';

interface EdgeManagerPanelProps {
  nodes: Node3D[];
  edges: Edge3D[];
  shortestPathEdges: string[];
  selectedEdgeId: string | null;
  onUpdateEdgeWeight: (edgeId: string, newWeight: number) => void;
  onAddEdge: (sourceId: string, targetId: string, weight: number) => void;
  onDeleteEdge: (edgeId: string) => void;
  onSelectEdge: (edgeId: string) => void;
}

export function EdgeManagerPanel({
  nodes,
  edges,
  shortestPathEdges,
  selectedEdgeId,
  onUpdateEdgeWeight,
  onAddEdge,
  onDeleteEdge,
  onSelectEdge,
}: EdgeManagerPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [newSource, setNewSource] = useState(nodes[0]?.id || '');
  const [newTarget, setNewTarget] = useState(nodes[1]?.id || '');
  const [newWeight, setNewWeight] = useState(4);
  const [showAddForm, setShowAddForm] = useState(false);

  const shortestSet = new Set(shortestPathEdges);
  const nodeMap = new Map<string, Node3D>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource || !newTarget || newSource === newTarget) {
      alert('Please select two distinct nodes to connect.');
      return;
    }
    // Check if edge already exists
    const existing = edges.find(
      (edge) =>
        (edge.source === newSource && edge.target === newTarget) ||
        (edge.source === newTarget && edge.target === newSource)
    );
    if (existing) {
      alert('A connection between these two nodes already exists! Adjust its weight below.');
      onSelectEdge(existing.id);
      return;
    }

    onAddEdge(newSource, newTarget, Number(newWeight));
    sound.playSelect();
    setShowAddForm(false);
  };

  return (
    <div className="fixed top-18 right-4 z-30 w-80 max-w-[calc(100vw-2rem)] select-none pointer-events-auto">
      <div className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="px-4 py-3 bg-slate-950/85 border-b border-cyan-500/20 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-400">
                  DYNAMIC WEIGHTS
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-300 font-mono border border-cyan-500/30">
                  {edges.length} Links
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Real-time cost adjustment</p>
            </div>
          </div>

          <button className="text-slate-400 hover:text-white p-1">
            {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Panel Body */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Quick Add Connection Button */}
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Link Management</span>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/50 text-xs font-mono flex items-center gap-1 transition-all"
                >
                  <Plus size={13} />
                  <span>{showAddForm ? 'Close' : 'Connect Nodes'}</span>
                </button>
              </div>

              {/* Add Connection Form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddSubmit}
                  className="p-3 bg-slate-900/95 border-b border-cyan-500/30 space-y-2.5 text-xs font-mono"
                >
                  <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                    <LinkIcon size={12} /> Connect New Nodes in 3D
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Node 1</label>
                      <select
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                      >
                        {nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Node 2</label>
                      <select
                        value={newTarget}
                        onChange={(e) => setNewTarget(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                      >
                        {nodes.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Initial Weight</span>
                      <span className="text-cyan-300 font-bold">{newWeight}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={newWeight}
                      onChange={(e) => setNewWeight(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Plus size={14} /> Establish 3D Link
                  </button>
                </form>
              )}

              {/* Edge Sliders List */}
              <div className="max-h-80 overflow-y-auto p-3 space-y-3.5 divide-y divide-slate-800/60">
                {edges.map((edge) => {
                  const srcNode = nodeMap.get(edge.source);
                  const tgtNode = nodeMap.get(edge.target);
                  const isShortest = shortestSet.has(edge.id);
                  const isSelected = selectedEdgeId === edge.id;

                  return (
                    <div
                      key={edge.id}
                      onClick={() => onSelectEdge(edge.id)}
                      className={`pt-3 first:pt-0 cursor-pointer rounded-xl p-2 transition-all ${
                        isShortest
                          ? 'bg-rose-950/20 border border-rose-500/40 shadow-rose-950/40'
                          : isSelected
                          ? 'bg-cyan-950/30 border border-cyan-500/40'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      {/* Edge Label & Shortest Path Indicator */}
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <div className="flex items-center gap-1.5 font-sans font-medium text-slate-200">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isShortest ? 'bg-rose-500 shadow-sm shadow-rose-400' : 'bg-cyan-400'
                            }`}
                          />
                          <span className="text-xs truncate max-w-[150px]">
                            {srcNode?.label || edge.source} ↔ {tgtNode?.label || edge.target}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {isShortest && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/50 font-mono font-bold flex items-center gap-0.5">
                              <Sparkles size={9} /> OPTIMAL
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEdge(edge.id);
                            }}
                            title="Delete Edge"
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Real-Time Weight Slider */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="40"
                          value={edge.weight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            sound.playSlider(val);
                            onUpdateEdgeWeight(edge.id, val);
                          }}
                          className={`w-full h-1.5 rounded-lg cursor-pointer transition-all ${
                            isShortest
                              ? 'accent-rose-500 bg-rose-950/60'
                              : 'accent-cyan-400 bg-slate-800'
                          }`}
                        />

                        {/* Weight value badge */}
                        <div
                          className={`px-2 py-0.5 rounded font-mono font-bold text-xs min-w-[34px] text-center border ${
                            isShortest
                              ? 'bg-rose-900/80 text-rose-200 border-rose-500/60 shadow-sm shadow-rose-900/40'
                              : 'bg-slate-900 text-cyan-300 border-slate-700'
                          }`}
                        >
                          {edge.weight}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
