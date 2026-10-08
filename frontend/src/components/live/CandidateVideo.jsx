import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { VideoOff } from "lucide-react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Candidate camera tile. Pass a MediaStream via `stream` to render the real feed; otherwise a placeholder is shown.
export function CandidateVideo({ stream, cameraOn = true, name = "", className, compact = false }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-[#141b27]", className)} data-testid="candidate-video">
      {cameraOn && stream && <video ref={ref} autoPlay playsInline muted className="h-full w-full scale-x-[-1] object-cover" data-testid="candidate-video-stream" />}
      {cameraOn && !stream && <Placeholder compact={compact} />}
      {!cameraOn && (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#0f141d]" data-testid="candidate-camera-off">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 font-display text-2xl font-semibold text-slate-200">{initials(name)}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400"><VideoOff className="h-3.5 w-3.5" /> Camera is off</span>
        </div>
      )}
    </div>
  );
}

function Placeholder({ compact }) {
  return (
    <div className="absolute inset-0" data-testid="candidate-video-placeholder">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="cv-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3a4558" /><stop offset="100%" stopColor="#1d2533" /></linearGradient>
          <linearGradient id="cv-light" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(255,236,200,0.22)" /><stop offset="100%" stopColor="rgba(255,236,200,0)" /></linearGradient>
          <linearGradient id="cv-shirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4b5d7a" /><stop offset="100%" stopColor="#2f3c52" /></linearGradient>
          <radialGradient id="cv-skin" cx="45%" cy="40%" r="65%"><stop offset="0%" stopColor="#d9ac8c" /><stop offset="100%" stopColor="#b5876a" /></radialGradient>
          <radialGradient id="cv-vig" cx="50%" cy="45%" r="75%"><stop offset="60%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.55)" /></radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#cv-wall)" />
        <rect x="0" y="0" width="150" height="300" fill="url(#cv-light)" />
        <g opacity="0.35">
          <rect x="285" y="40" width="90" height="120" rx="3" fill="#2a3242" />
          {[0, 1, 2].map((r) => <rect key={r} x="290" y={52 + r * 36} width="80" height="3" fill="#465166" />)}
          {[0, 1, 2, 3, 4, 5].map((b) => <rect key={b} x={294 + b * 12} y={60 - (b % 3) * 4} width="8" height={26 + (b % 3) * 4} fill={["#6b5b4b", "#4f6b6b", "#7a6a55"][b % 3]} />)}
          <path d="M44 210 C34 170 60 150 58 120 C70 150 82 170 70 210 Z" fill="#3d5a48" />
          <rect x="46" y="208" width="26" height="34" rx="3" fill="#5b4b3d" />
        </g>
        <motion.g animate={{ y: [0, -1.5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M92 300 C96 238 140 214 200 212 C260 214 304 238 308 300 Z" fill="url(#cv-shirt)" />
          <path d="M178 206 L222 206 L218 232 Q200 242 182 232 Z" fill="#b5876a" />
          <path d="M176 222 Q200 250 224 222 L232 232 Q200 262 168 232 Z" fill="#e7ecf3" opacity="0.9" />
          <ellipse cx="200" cy="148" rx="44" ry="54" fill="url(#cv-skin)" />
          <path d="M154 142 C150 96 182 82 204 84 C236 86 254 106 248 146 C242 124 228 112 206 112 C182 112 162 120 154 142 Z" fill="#2b211c" />
          <ellipse cx="157" cy="152" rx="6" ry="11" fill="#b5876a" />
          <ellipse cx="243" cy="152" rx="6" ry="11" fill="#b5876a" />
        </motion.g>
        <rect width="400" height="300" fill="url(#cv-vig)" />
      </svg>
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:3px_3px]" />
    </div>
  );
}
