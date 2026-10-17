import { Compass, RotateCw, Eye, Maximize, Minimize } from 'lucide-react';
import { CameraViewPreset } from '../canvas/Scene';
import { useState } from 'react';

interface CameraHUDProps {
  cameraPreset: CameraViewPreset;
  onSelectPreset: (preset: CameraViewPreset) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
}

export function CameraHUD({
  cameraPreset,
  onSelectPreset,
  autoRotate,
  onToggleAutoRotate,
}: CameraHUDProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const presets: { id: CameraViewPreset; label: string }[] = [
    { id: 'default', label: 'Cinematic' },
    { id: 'isometric', label: 'Isometric' },
    { id: 'top', label: 'Top-Down' },
    { id: 'front', label: 'Front' },
  ];

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto">
      <div className="glass-panel px-3 py-1.5 rounded-full border border-cyan-500/30 flex items-center gap-1.5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 mr-2 border-r border-slate-700/60 pr-2">
          <Compass size={14} />
          <span className="hidden sm:inline">CAMERA</span>
        </div>

        {/* View Presets */}
        <div className="flex items-center gap-1">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                cameraPreset === p.id
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-sm shadow-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-700/60 mx-1" />

        {/* Auto Rotate Toggle */}
        <button
          onClick={onToggleAutoRotate}
          title="Toggle Auto Orbit Rotation"
          className={`px-2.5 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all ${
            autoRotate
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm shadow-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Orbit</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors ml-0.5"
        >
          {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
        </button>
      </div>
    </div>
  );
}
