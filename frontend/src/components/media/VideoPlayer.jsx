import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, Circle } from "lucide-react";
import { formatClock, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AiAvatar } from "@/components/live/AiAvatar";
import { CandidateVideo } from "@/components/live/CandidateVideo";

export function Waveform({ bars = 18, className, color = "bg-blue-400" }) {
  return (
    <span className={cn("flex h-6 items-center gap-[3px]", className)} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} className={cn("wave-bar w-[3px] rounded-full", color)} style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${(i % 6) * 0.12}s` }} />
      ))}
    </span>
  );
}

// Visual placeholder for the candidate's camera feed. Replace with the real <video> element later.
export function CandidateFeed({ name, className }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-[#0d1320]", className)}>
      <div className="absolute inset-0 grid-lines opacity-60" />
      <svg viewBox="0 0 400 225" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <ellipse cx="200" cy="250" rx="120" ry="78" fill="#1c2638" />
        <circle cx="200" cy="112" r="44" fill="#243149" />
      </svg>
      <span className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 font-display text-2xl font-semibold text-slate-400/80">{initials(name)}</span>
    </div>
  );
}

export function VideoPlayer({ recording, candidateName, large = false, startAt = 0, onExpand }) {
  const total = recording.durationSec;
  const live = recording.status === "recording";
  const [time, setTime] = useState(startAt);
  const [playing, setPlaying] = useState(large && !live);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => setTime(startAt), [startAt]);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setTime((v) => (v + speed >= total ? (setPlaying(false), total) : v + speed)), 1000);
    return () => clearInterval(t);
  }, [playing, speed, total]);

  const marker = [...recording.markers].reverse().find((m) => m.at <= time);
  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTime(Math.round(((e.clientX - r.left) / r.width) * total));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950" data-testid={large ? "video-player-large" : "video-player-inline"}>
      <div className={cn("relative aspect-video", !large && onExpand && "cursor-pointer")} onClick={!large && onExpand ? () => onExpand(time) : () => !live && setPlaying((p) => !p)} data-testid="video-stage">
        <CandidateVideo name={candidateName} compact />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded bg-rose-600 px-2 py-0.5 font-mono text-[10px] font-medium text-white"><Circle className="h-2 w-2 animate-pulse fill-white" /> LIVE · RECORDING</span>
          ) : (
            <span className="rounded bg-black/50 px-2 py-0.5 font-mono text-[10px] text-slate-300">REC · {formatClock(total)}</span>
          )}
          <span className="rounded bg-black/50 px-2 py-0.5 text-[11px] text-slate-200">{candidateName}</span>
        </div>
        <div className="absolute right-3 top-3 flex w-[24%] min-w-[96px] max-w-[170px] flex-col items-center rounded-lg border border-white/10 bg-slate-900/90 pb-1.5 pt-1" data-testid="recording-ai-pip">
          <AiAvatar speaking={playing} size={64} testId="recording-ai-avatar" />
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">AI Interviewer</p>
        </div>
        {marker && <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-[11px] text-slate-200">{marker.label}</span>}
        {!playing && !live && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-slate-950 shadow-lg transition-transform hover:scale-105"><Play className="ml-0.5 h-6 w-6 fill-current" /></span>
          </span>
        )}
        {!large && onExpand && <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-[11px] text-white">Watch interview</span>}
      </div>
      <div className="space-y-2.5 px-4 pb-3 pt-3">
        <div className="relative h-5 cursor-pointer" onClick={live ? undefined : seek} data-testid="video-timeline">
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-800" />
          <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-500" style={{ width: `${(time / total) * 100}%` }} />
          {recording.markers.map((m) => (
            <button key={m.at} title={m.label} onClick={(e) => { e.stopPropagation(); setTime(m.at); }} className="absolute top-1/2 h-2.5 w-[3px] -translate-y-1/2 rounded-sm bg-slate-400 hover:bg-white" style={{ left: `${(m.at / total) * 100}%` }} />
          ))}
          <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${(time / total) * 100}%` }} />
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <Ctl onClick={() => setPlaying((p) => !p)} disabled={live} testId="video-play-toggle" label={playing ? "Pause" : "Play"}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Ctl>
          <Ctl onClick={() => setTime((t) => Math.max(0, t - 10))} disabled={live} label="Back 10s"><RotateCcw className="h-4 w-4" /></Ctl>
          <Ctl onClick={() => setTime((t) => Math.min(total, t + 10))} disabled={live} label="Forward 10s"><RotateCw className="h-4 w-4" /></Ctl>
          <Ctl onClick={() => setMuted((m) => !m)} label="Mute">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</Ctl>
          <span className="ml-2 font-mono text-xs tabular text-slate-400" data-testid="video-time">{formatClock(time)} / {formatClock(total)}</span>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setSpeed((s) => (s === 2 ? 1 : s + 0.5))} className="rounded px-2 py-1 font-mono text-xs text-slate-300 hover:bg-white/10" data-testid="video-speed-button">{speed}x</button>
            {onExpand && !large && <Ctl onClick={() => onExpand(time)} label="Expand" testId="video-expand-button"><Maximize2 className="h-4 w-4" /></Ctl>}
          </div>
        </div>
      </div>
    </div>
  );
}

const Ctl = ({ children, onClick, disabled, label, testId }) => (
  <button onClick={onClick} disabled={disabled} aria-label={label} title={label} data-testid={testId} className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40">
    {children}
  </button>
);
