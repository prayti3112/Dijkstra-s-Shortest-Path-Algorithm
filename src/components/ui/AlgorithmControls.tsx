import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Zap,
  ArrowRightLeft,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Node3D, DijkstraStep } from '../../types/graph';
import { sound } from '../../utils/sound';

interface AlgorithmControlsProps {
  nodes: Node3D[];
  sourceNodeId: string;
  targetNodeId: string;
  onSetSourceNode: (id: string) => void;
  onSetTargetNode: (id: string) => void;
  onSwapSourceTarget: () => void;
  isStepMode: boolean;
  onToggleStepMode: (enabled: boolean) => void;
  steps: DijkstraStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

export function AlgorithmControls({
  nodes,
  sourceNodeId,
  targetNodeId,
  onSetSourceNode,
  onSetTargetNode,
  onSwapSourceTarget,
  isStepMode,
  onToggleStepMode,
  steps,
  currentStepIndex,
  onStepChange,
}: AlgorithmControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  // Auto-playback loop for step mode
  useEffect(() => {
    let timer: any;
    if (isPlaying && isStepMode) {
      timer = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          onStepChange(currentStepIndex + 1);
          sound.playStep();
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isStepMode, currentStepIndex, steps.length, playbackSpeed, onStepChange]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed bottom-4 right-4 z-30 w-96 max-w-[calc(100vw-2rem)] select-none pointer-events-auto">
      <div className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        {/* Source & Target Node Selector Bar */}
        <div className="p-3 bg-slate-950/90 border-b border-cyan-500/20 flex items-center justify-between gap-2">
          {/* Source node select */}
          <div className="flex-1">
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block mb-0.5">
              Start Node
            </span>
            <select
              value={sourceNodeId}
              onChange={(e) => {
                onSetSourceNode(e.target.value);
                sound.playSelect();
              }}
              className="w-full bg-slate-900 border border-emerald-500/40 rounded px-2 py-1 text-emerald-200 text-xs font-semibold focus:outline-none"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={() => {
              onSwapSourceTarget();
              sound.playSelect();
            }}
            title="Swap Start and Target"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors mt-3"
          >
            <ArrowRightLeft size={13} />
          </button>

          {/* Target node select */}
          <div className="flex-1">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block mb-0.5">
              Target Node
            </span>
            <select
              value={targetNodeId}
              onChange={(e) => {
                onSetTargetNode(e.target.value);
                sound.playSelect();
              }}
              className="w-full bg-slate-900 border border-amber-500/40 rounded px-2 py-1 text-amber-200 text-xs font-semibold focus:outline-none"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Toggle Bar: Real-time vs Step-by-Step */}
        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Activity size={14} className={isStepMode ? 'text-amber-400' : 'text-cyan-400'} />
            <span className="text-slate-300 font-medium">Calculation Mode:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                onToggleStepMode(false);
                setIsPlaying(false);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                !isStepMode
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={11} /> Real-Time
            </button>
            <button
              onClick={() => {
                onToggleStepMode(true);
                onStepChange(0);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1 ${
                isStepMode
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={11} /> Step Sim
            </button>
          </div>
        </div>

        {/* Step-by-Step Controls & Live Explanation */}
        {isStepMode && (
          <div className="p-3 bg-slate-950/80 space-y-2.5">
            {/* Step progress & Playback bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400">
                Step {currentStepIndex + 1} / {steps.length}
              </span>

              {/* Playback action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onStepChange(0);
                    sound.playStep();
                  }}
                  title="Reset to beginning"
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => {
                    onStepChange(Math.max(0, currentStepIndex - 1));
                    sound.playStep();
                  }}
                  title="Previous Step"
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
                  className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  disabled={currentStepIndex >= steps.length - 1}
                  onClick={() => {
                    onStepChange(Math.min(steps.length - 1, currentStepIndex + 1));
                    sound.playStep();
                  }}
                  title="Next Step"
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <SkipForward size={14} />
                </button>
              </div>
            </div>

            {/* Step slider scrubber */}
            <input
              type="range"
              min="0"
              max={steps.length - 1}
              value={currentStepIndex}
              onChange={(e) => onStepChange(Number(e.target.value))}
              className="w-full accent-amber-400 h-1 bg-slate-800 rounded cursor-pointer"
            />

            {/* Explanation card */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed min-h-[52px]">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                <Sparkles size={10} /> Algorithm Trace:
              </div>
              <div>{currentStep?.explanation || 'Simulating Dijkstra steps...'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
