import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { ScoreRing } from "@/components/common/ScoreRing";
import { ScoreBar } from "@/components/common/SkillBar";
import { CandidateTile, InterviewerTile } from "@/components/live/Tiles";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: "01", title: "Create an interview", body: "Define the role, a short description, the skills that matter and who you're inviting. Intervia turns it into a structured interview plan." },
  { n: "02", title: "Candidate interviews with AI", body: "The candidate joins from a private link. The AI interviewer asks role-specific questions and adaptive follow-ups — on camera, recorded." },
  { n: "03", title: "AI evaluates the interview", body: "Every answer is mapped to a required skill. The evaluation cites evidence from the transcript instead of producing a single opaque number." },
  { n: "04", title: "Review the report", body: "Overall score, per-skill scores, summary, strengths, weaknesses, recommendation and the full recording — ready for your hiring decision." },
];

const Frame = ({ children }) => <div className="h-full rounded-xl border border-slate-200 bg-white p-6">{children}</div>;

const V1 = () => (
  <Frame>
    <p className="text-xs text-slate-500">Interview title</p>
    <p className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900">Senior Backend Engineer — Platform</p>
    <p className="mt-4 text-xs text-slate-500">Required skills</p>
    <div className="mt-1.5 flex flex-wrap gap-1.5">{["Node.js", "PostgreSQL", "System Design", "REST API Design", "Docker", "Redis"].map((s, i) => <motion.span key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white">{s}</motion.span>)}</div>
    <p className="mt-4 text-xs text-slate-500">Candidate</p>
    <p className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900">sarah.khan@fastmail.com</p>
  </Frame>
);
const V2 = () => (
  <Frame>
    <div className="grid grid-cols-2 gap-2">
      <CandidateTile name="Sarah Khan" micOn camOn answering={false} small className="aspect-square" />
      <InterviewerTile interviewer={{ name: "Ava", title: "AI Interviewer" }} speaking small avatarSize={110} className="aspect-square" />
    </div>
    <p className="mt-4 rounded-lg bg-slate-100 px-3.5 py-2.5 text-sm text-slate-800"><span className="font-semibold">Ava:</span> How would you prevent duplicate charges when a client retries a payment request?</p>
  </Frame>
);
const V3 = () => (
  <Frame>
    {[["REST API Design", "Idempotency + request hashing", 91], ["PostgreSQL", "Partitioning, EXPLAIN ANALYZE", 88], ["Redis", "Cache-aside, no stampede control", 76]].map(([s, e, v], i) => (
      <motion.div key={s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }} className="border-b border-slate-100 py-3 last:border-0">
        <div className="flex items-center gap-2 text-sm"><Check className="h-3.5 w-3.5 text-emerald-600" /><span className="font-medium text-slate-900">{s}</span><span className="ml-auto font-mono text-slate-700">{v}</span></div>
        <p className="mb-2 ml-5 mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Sparkles className="h-3 w-3 text-blue-600" />Evidence: {e}</p>
        <ScoreBar score={v} className="ml-5 w-auto" />
      </motion.div>
    ))}
  </Frame>
);
const V4 = () => (
  <Frame>
    <div className="flex items-center gap-5">
      <ScoreRing score={87} size={104} stroke={9} />
      <div><p className="font-display text-lg font-semibold text-slate-950">Sarah Khan</p><p className="text-sm text-slate-500">Senior Backend Engineer</p><span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Strong Candidate</span></div>
    </div>
    <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
      <div className="rounded-lg bg-emerald-50 p-3 text-emerald-800">+ Strong API architecture<br />+ Deep PostgreSQL knowledge</div>
      <div className="rounded-lg bg-amber-50 p-3 text-amber-800">– Distributed systems depth<br />– Advanced caching</div>
    </div>
  </Frame>
);
const VIGNETTES = [V1, V2, V3, V4];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), 5200);
    return () => clearTimeout(t);
  }, [active, paused]);
  const V = VIGNETTES[active];

  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-24 lg:py-32" data-testid="how-it-works-section">
      <div className="mx-auto max-w-7xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-blue-700">How it works</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-slate-950 sm:text-4xl">From job requirements to a hiring decision in four steps.</h2>
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <ol className="relative">
            {STEPS.map((s, i) => (
              <li key={s.n}>
                <button onClick={() => setActive(i)} className={cn("relative w-full border-l-2 py-5 pl-6 text-left transition-colors", active === i ? "border-slate-900" : "border-slate-200 hover:border-slate-400")} data-testid={`how-step-${s.n}`}>
                  <span className="flex items-baseline gap-3"><span className="font-mono text-sm text-slate-400">{s.n}</span><span className={cn("font-display text-xl font-semibold", active === i ? "text-slate-950" : "text-slate-500")}>{s.title}</span></span>
                  <AnimatePresence initial={false}>
                    {active === i && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-9 text-[15px] leading-relaxed text-slate-600"><span className="block pt-2">{s.body}</span></motion.p>}
                  </AnimatePresence>
                </button>
              </li>
            ))}
          </ol>
          <div className="relative min-h-[320px] rounded-2xl border border-slate-200 bg-[radial-gradient(rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:16px_16px] p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="h-full"><V /></motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
