import { useEffect, useState } from "react";
import { Mic, Video, Captions, PhoneOff, Circle, Sparkles } from "lucide-react";
import { CandidateTile, InterviewerTile } from "@/components/live/Tiles";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  { skill: "Introduction", text: "Tell me about your backend development experience and the largest system you've owned." },
  { skill: "System Design", text: "How would you design a scalable API for a multi-tenant SaaS platform?" },
  { skill: "PostgreSQL", text: "A query on a 400M-row table has become slow. Walk me through your investigation." },
];

function useLoop() {
  const [q, setQ] = useState(1);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState("speaking");
  useEffect(() => {
    const text = QUESTIONS[q].text;
    if (phase === "speaking") {
      if (n < text.length) { const t = setTimeout(() => setN(n + 1), 30); return () => clearTimeout(t); }
      const t = setTimeout(() => setPhase("listening"), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setQ((q + 1) % QUESTIONS.length); setN(0); setPhase("speaking"); }, 4200);
    return () => clearTimeout(t);
  }, [n, q, phase]);
  return { q, phase, typed: QUESTIONS[q].text.slice(0, n), skill: QUESTIONS[q].skill };
}

export function HeroMockup() {
  const { q, phase, typed, skill } = useLoop();
  const [sec, setSec] = useState(1122);
  useEffect(() => { const t = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(t); }, []);
  const speaking = phase === "speaking";

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#0E1422] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]" data-testid="hero-interview-mockup">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded bg-rose-500/15 px-1.5 py-0.5 font-mono text-[10px] text-rose-400"><Circle className="h-1.5 w-1.5 animate-pulse fill-current" />LIVE · REC</span>
        <span className="text-[13px] font-medium text-slate-200">Video interview · Senior Backend Engineer</span>
        <span className="ml-auto font-mono text-xs tabular text-slate-400">{formatClock(sec)}</span>
      </div>
      <div className="flex items-center gap-1 px-3 pb-3">
        {Array.from({ length: 8 }).map((_, i) => <span key={i} className={cn("h-1 flex-1 rounded-full", i < q + 2 ? "bg-blue-500" : i === q + 2 ? "bg-blue-500/40" : "bg-slate-800")} />)}
        <span className="ml-2 whitespace-nowrap font-mono text-[10px] text-slate-500">Q{q + 3}/8</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <CandidateTile name="Sarah Khan" micOn camOn answering={!speaking} small className="aspect-[4/5] sm:aspect-[4/4.2]" />
        <InterviewerTile interviewer={{ name: "Ava", title: "AI Interviewer" }} speaking={speaking} small avatarSize={150} className="aspect-[4/5] sm:aspect-[4/4.2]" />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-slate-800 bg-[#0B0F17] px-4 py-3" data-testid="hero-current-question">
          <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-300"><Sparkles className="h-3 w-3" />Ava is asking · {skill}</p>
          <p className={cn("min-h-[42px] text-[13.5px] leading-relaxed text-slate-200", speaking && "caret")}>{typed}</p>
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-[#0B0F17] px-3 py-3">
          {[Mic, Video, Captions].map((I, i) => <span key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-300"><I className="h-3.5 w-3.5" /></span>)}
          <span className="flex h-8 w-10 items-center justify-center rounded-full bg-rose-600 text-white"><PhoneOff className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </div>
  );
}
