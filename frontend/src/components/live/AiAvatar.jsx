import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Emoji-style AI interviewer. `speaking` drives the talking loop; pass `level` (0–1) later to sync the mouth with real audio.
export function AiAvatar({ speaking = false, level, size = 220, className, testId = "ai-avatar" }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let t;
    const loop = () => {
      t = setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 140); loop(); }, 2600 + Math.random() * 2400);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  const driven = typeof level === "number";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }} data-testid={testId} data-speaking={speaking}>
      <motion.span
        className="absolute inset-[6%] rounded-full border-2 border-blue-400/40"
        animate={speaking ? { scale: [1, 1.07, 1], opacity: [0.7, 0.15, 0.7] } : { scale: 1, opacity: 0 }}
        transition={{ duration: 1.6, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
      />
      <motion.svg viewBox="0 0 200 200" width={size * 0.86} height={size * 0.86} animate={speaking ? { y: [0, -2, 0, -1, 0] } : { y: [0, -1.5, 0] }} transition={{ duration: speaking ? 1.2 : 4, repeat: Infinity, ease: "easeInOut" }} aria-label="AI interviewer avatar" role="img">
        <defs>
          <radialGradient id="ava-face" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#FFE3A3" />
            <stop offset="70%" stopColor="#F9C35C" />
            <stop offset="100%" stopColor="#EBA93C" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="186" rx="52" ry="6" fill="rgba(0,0,0,0.18)" />
        <circle cx="100" cy="100" r="76" fill="url(#ava-face)" />
        <path d="M28 98 A72 72 0 0 1 172 98" fill="none" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
        <rect x="16" y="86" width="18" height="32" rx="8" fill="#1E293B" />
        <rect x="166" y="86" width="18" height="32" rx="8" fill="#1E293B" />
        <path d="M26 116 Q34 150 70 152" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="73" cy="152" r="5" fill="#2563EB" />
        <circle cx="62" cy="122" r="10" fill="rgba(244,114,94,0.22)" />
        <circle cx="138" cy="122" r="10" fill="rgba(244,114,94,0.22)" />
        <motion.path d="M60 72 Q72 64 84 70" fill="none" stroke="#7C4A12" strokeWidth="4" strokeLinecap="round" animate={{ y: speaking ? [0, -2, 0] : 0 }} transition={{ duration: 1.4, repeat: speaking ? Infinity : 0 }} />
        <motion.path d="M116 70 Q128 64 140 72" fill="none" stroke="#7C4A12" strokeWidth="4" strokeLinecap="round" animate={{ y: speaking ? [0, -2, 0] : 0 }} transition={{ duration: 1.4, repeat: speaking ? Infinity : 0, delay: 0.1 }} />
        <g style={{ transformOrigin: "100px 92px", transform: `scaleY(${blink ? 0.1 : 1})`, transition: "transform 90ms ease" }}>
          <ellipse cx="74" cy="92" rx="7.5" ry="9.5" fill="#1F2937" />
          <ellipse cx="126" cy="92" rx="7.5" ry="9.5" fill="#1F2937" />
          <circle cx="76.5" cy="88.5" r="2.4" fill="#fff" />
          <circle cx="128.5" cy="88.5" r="2.4" fill="#fff" />
        </g>
        {speaking || driven ? (
          <motion.path
            d="M82 121 Q100 125 118 121 Q115 143 100 143 Q85 143 82 121 Z" fill="#7A2E14"
            style={{ transformOrigin: "100px 121px" }}
            initial={false}
            animate={driven ? { scaleY: 0.25 + level * 0.75 } : { scaleY: [0.3, 1, 0.5, 0.85, 0.25, 0.7, 0.3] }}
            transition={driven ? { duration: 0.08 } : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <path d="M82 124 Q100 140 118 124" fill="none" stroke="#7A2E14" strokeWidth="4.5" strokeLinecap="round" />
        )}
      </motion.svg>
    </div>
  );
}

export function SpeakingDots({ active, className }) {
  return (
    <span className={cn("inline-flex items-end gap-[3px]", className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-current" animate={active ? { y: [0, -3, 0], opacity: [0.5, 1, 0.5] } : { y: 0, opacity: 0.35 }} transition={{ duration: 0.9, repeat: active ? Infinity : 0, delay: i * 0.15 }} />
      ))}
    </span>
  );
}
