import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Plus, Trash2, MapPin, Flag, ChevronDown, ChevronUp, Move3d } from 'lucide-react';
import { Node3D } from '../../types/graph';
import { sound } from '../../utils/sound';

interface NodeManagerPanelProps {
  nodes: Node3D[];
  sourceNodeId: string;
  targetNodeId: string;
  selectedNodeId: string | null;
  onAddNode: (label: string, x: number, y: number, z: number) => void;
  onUpdateNodeCoordinates: (id: string, x: number, y: number, z: number) => void;
  onUpdateNodeLabel: (id: string, label: string) => void;
  onDeleteNode: (id: string) => void;
  onSetSourceNode: (id: string) => void;
  onSetTargetNode: (id: string) => void;
  onSelectNode: (id: string) => void;
}

export function NodeManagerPanel({
  nodes,
  sourceNodeId,
  targetNodeId,
  selectedNodeId,
  onAddNode,
  onUpdateNodeCoordinates,
  onUpdateNodeLabel,
  onDeleteNode,
  onSetSourceNode,
  onSetTargetNode,
  onSelectNode,
}: NodeManagerPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Node Form State
  const [newLabel, setNewLabel] = useState('');
  const [newX, setNewX] = useState(0);
  const [newY, setNewY] = useState(0);
  const [newZ, setNewZ] = useState(0);

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim() || `Node-${nodes.length + 1}`;
    onAddNode(label, Number(newX), Number(newY), Number(newZ));
    sound.playSelect();
    setNewLabel('');
    // Pick slightly random coordinates for next
    setNewX(Math.round((Math.random() * 8 - 4) * 2) / 2);
    setNewY(Math.round((Math.random() * 6 - 3) * 2) / 2);
    setNewZ(Math.round((Math.random() * 8 - 4) * 2) / 2);
    setShowAddForm(false);
  };

  return (
    <div className="fixed top-18 left-4 z-30 w-80 max-w-[calc(100vw-2rem)] select-none pointer-events-auto">
      <div className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="px-4 py-3 bg-slate-950/85 border-b border-cyan-500/20 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Boxes size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-400">
                  3D NODE MANAGER
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/90 text-cyan-300 font-mono border border-cyan-500/30">
                  {nodes.length} Nodes
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Coordinate & spatial editing</p>
            </div>
          </div>

          <button className="text-slate-400 hover:text-white p-1">
            {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Panel Content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Add Node Trigger */}
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Nodes & Spatial Positions</span>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/50 text-xs font-mono flex items-center gap-1 transition-all"
                >
                  <Plus size={13} />
                  <span>{showAddForm ? 'Cancel' : 'Add Node'}</span>
                </button>
              </div>

              {/* Add Node Form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddNode}
                  className="p-3 bg-slate-900/95 border-b border-cyan-500/30 space-y-2.5 text-xs font-mono"
                >
                  <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                    <Move3d size={12} /> Spawn 3D Node
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Custom Node Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Node-Z, Station-Alpha"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">X: {newX}</label>
                      <input
                        type="range"
                        min="-8"
                        max="8"
                        step="0.5"
                        value={newX}
                        onChange={(e) => setNewX(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Y: {newY}</label>
                      <input
                        type="range"
                        min="-6"
                        max="6"
                        step="0.5"
                        value={newY}
                        onChange={(e) => setNewY(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Z: {newZ}</label>
                      <input
                        type="range"
                        min="-8"
                        max="8"
                        step="0.5"
                        value={newZ}
                        onChange={(e) => setNewZ(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Plus size={14} /> Add 3D Node
                  </button>
                </form>
              )}

              {/* Node List with Coordinate Sliders */}
              <div className="max-h-80 overflow-y-auto p-3 space-y-3.5 divide-y divide-slate-800/60">
                {nodes.map((node) => {
                  const isSrc = node.id === sourceNodeId;
                  const isTgt = node.id === targetNodeId;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                      className={`pt-3 first:pt-0 cursor-pointer rounded-xl p-2 transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border border-cyan-500/50 shadow-cyan-950/50'
                          : isSrc
                          ? 'bg-emerald-950/20 border border-emerald-500/30'
                          : isTgt
                          ? 'bg-amber-950/20 border border-amber-500/30'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      {/* Node Header Row */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 font-sans font-medium text-slate-200">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isSrc ? 'bg-emerald-400' : isTgt ? 'bg-amber-400' : 'bg-cyan-400'
                            }`}
                          />
                          <input
                            type="text"
                            value={node.label}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdateNodeLabel(node.id, e.target.value)}
                            className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-cyan-400 focus:bg-slate-900 px-1 py-0.5 rounded text-xs text-slate-100 font-semibold max-w-[130px] outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetSourceNode(node.id);
                              sound.playSelect();
                            }}
                            title="Set as Source Node"
                            className={`p-1 rounded text-xs transition-colors ${
                              isSrc
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                            }`}
                          >
                            <MapPin size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetTargetNode(node.id);
                              sound.playSelect();
                            }}
                            title="Set as Target Node"
                            className={`p-1 rounded text-xs transition-colors ${
                              isTgt
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                            }`}
                          >
                            <Flag size={12} />
                          </button>
                          {nodes.length > 2 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNode(node.id);
                              }}
                              title="Delete Node"
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Coordinate Sliders (X, Y, Z in 3D Space) */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                        <div>
                          <div className="flex justify-between mb-0.5">
                            <span>X:</span>
                            <span className="text-cyan-300">{node.x.toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min="-8"
                            max="8"
                            step="0.2"
                            value={node.x}
                            onChange={(e) =>
                              onUpdateNodeCoordinates(node.id, Number(e.target.value), node.y, node.z)
                            }
                            className="w-full h-1 accent-cyan-400 bg-slate-800 rounded cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-0.5">
                            <span>Y:</span>
                            <span className="text-cyan-300">{node.y.toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min="-6"
                            max="6"
                            step="0.2"
                            value={node.y}
                            onChange={(e) =>
                              onUpdateNodeCoordinates(node.id, node.x, Number(e.target.value), node.z)
                            }
                            className="w-full h-1 accent-cyan-400 bg-slate-800 rounded cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-0.5">
                            <span>Z:</span>
                            <span className="text-cyan-300">{node.z.toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min="-8"
                            max="8"
                            step="0.2"
                            value={node.z}
                            onChange={(e) =>
                              onUpdateNodeCoordinates(node.id, node.x, node.y, Number(e.target.value))
                            }
                            className="w-full h-1 accent-cyan-400 bg-slate-800 rounded cursor-pointer"
                          />
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
