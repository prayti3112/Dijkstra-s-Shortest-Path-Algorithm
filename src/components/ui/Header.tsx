import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
  HelpCircle,
  Network,
  Cpu,
  Info,
  X,
} from 'lucide-react';
import { GRAPH_PRESETS } from '../../constants/presets';
import { sound } from '../../utils/sound';

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onResetGraph: () => void;
  nodesCount: number;
  edgesCount: number;
  pathHops: number;
  totalCost: number | null;
}

export function Header({
  currentPresetId,
  onSelectPreset,
  onResetGraph,
  nodesCount,
  edgesCount,
  pathHops,
  totalCost,
}: HeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [showHelp, setShowHelp] = useState(false);

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(sound.enabled);
    if (sound.enabled) {
      sound.playSelect();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 select-none pointer-events-none">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
              <Cpu size={22} className="text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400 m-0">
                  DIJKSTRA 3D
                </h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono">
                  QUANTUM HUD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                Interactive 3D Graph Optimization & Routing
              </p>
            </div>
          </div>

          {/* Central Stats Badges (Hidden on tiny screens) */}
          <div className="hidden lg:flex items-center gap-3 pointer-events-auto">
            <div className="glass-panel px-3 py-1.5 rounded-xl border border-cyan-500/20 flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Nodes:</span>
                <span className="text-cyan-300 font-bold">{nodesCount}</span>
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Edges:</span>
                <span className="text-cyan-300 font-bold">{edgesCount}</span>
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Path Hops:</span>
                <span className="text-rose-400 font-bold">{pathHops}</span>
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Cost:</span>
                <span className="text-rose-400 font-bold glow-crimson-text">
                  {totalCost !== null ? totalCost : '∞'}
                </span>
              </div>
            </div>
          </div>

          {/* Preset Selector & Utilities */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Preset Selector */}
            <div className="glass-panel px-2 py-1 rounded-xl border border-cyan-500/30 flex items-center gap-1 text-xs">
              <Layers size={14} className="text-cyan-400 ml-1" />
              <select
                value={currentPresetId}
                onChange={(e) => onSelectPreset(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-mono py-1 px-1.5 rounded focus:outline-none cursor-pointer"
              >
                {GRAPH_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id} className="bg-slate-900 text-slate-200">
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Graph */}
            <button
              onClick={onResetGraph}
              title="Reset to Preset Defaults"
              className="glass-panel p-2 rounded-xl border border-slate-700/60 hover:border-cyan-400 text-slate-400 hover:text-white transition-all"
            >
              <RotateCcw size={16} />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
              className={`glass-panel p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Help / Guide */}
            <button
              onClick={() => setShowHelp(true)}
              title="Color Guide & Controls"
              className="glass-panel p-2 rounded-xl border border-slate-700/60 hover:border-cyan-400 text-slate-400 hover:text-white transition-all"
            >
              <HelpCircle size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-cyan-500/40 p-5 shadow-2xl relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Info className="text-cyan-400" size={20} />
              <h2 className="text-base font-mono font-bold text-slate-100 m-0">
                Visual & Controls Guide
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Explore Dijkstra's shortest path algorithm in an interactive 3D environment. Adjust
              weights live or drag spatial coordinates to see optimal path reconfiguration in real-time.
            </p>

            {/* Color Palette Guide */}
            <div className="space-y-2 mb-4 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                <span className="flex items-center gap-2 text-emerald-300">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  Source Node
                </span>
                <span className="text-slate-400">Starting point (dist = 0)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/40 border border-amber-500/30">
                <span className="flex items-center gap-2 text-amber-300">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                  Target Node
                </span>
                <span className="text-slate-400">Goal destination</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                <span className="flex items-center gap-2 text-rose-300">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-400" />
                  Shortest Path
                </span>
                <span className="text-slate-400">Neon Crimson with moving photons</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-sky-950/40 border border-cyan-500/30">
                <span className="flex items-center gap-2 text-cyan-300">
                  <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  Normal Edges & Nodes
                </span>
                <span className="text-slate-400">Neon Cyan 3D lines</span>
              </div>
            </div>

            {/* Controls Guide */}
            <div className="text-xs text-slate-400 space-y-1 border-t border-slate-800 pt-3">
              <div>• <b>Rotate View:</b> Left click & drag in 3D canvas</div>
              <div>• <b>Pan View:</b> Right click & drag</div>
              <div>• <b>Zoom:</b> Mouse scroll wheel</div>
              <div>• <b>Select Node/Edge:</b> Click directly in 3D or in HUD panels</div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
