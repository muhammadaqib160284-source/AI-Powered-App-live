import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mic, MicOff, Video, VideoOff, Captions, PhoneOff, Circle, Check, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/common/Logo";
import { CandidateTile, InterviewerTile } from "./Tiles";
import { SpeakingDots } from "./AiAvatar";
import { useInterviewSimulation } from "./useInterviewSimulation";
import { useMediaQuery } from "@/hooks/useAsync";
import { useSession } from "@/context/SessionContext";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

function Progress({ index, total, skill }) {
  return (
    <div className="flex items-center gap-4" data-testid="interview-progress">
      <span className="whitespace-nowrap text-[13px] font-medium text-slate-900">Question {index + 1} <span className="text-slate-400">of {total}</span></span>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: total }).map((_, i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < index ? "bg-slate-900" : i === index ? "bg-blue-600" : "bg-slate-200")} />)}
      </div>
      <span className="hidden whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 sm:inline">{skill}</span>
    </div>
  );
}

function CtlButton({ on, onClick, iconOn: On, iconOff: Off, label, testId }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onClick} aria-label={label} aria-pressed={on} data-testid={testId} className={cn("flex h-12 w-12 items-center justify-center rounded-full border transition-colors", on ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-100" : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100")}>
          {on ? <On className="h-5 w-5" /> : <Off className="h-5 w-5" />}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Ended({ interview, elapsed, answered }) {
  const { isAuthenticated } = useSession();
  const steps = [["Recording saved", "done"], ["Transcript processing", "active"], ["AI evaluation against required skills", "queued"], ["Skill scores & candidate report", "queued"]];
  return (
    <div className="flex min-h-screen flex-col bg-slate-50" data-testid="interview-ended">
      <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6"><Logo /></header>
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-6 w-6" /></span>
          <h1 className="mt-5 text-2xl font-semibold text-slate-950">Interview submitted</h1>
          <p className="mt-2 text-sm text-slate-500">Thanks, {interview.candidate.name.split(" ")[0]}. Your {interview.role} interview has ended and is being evaluated.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Duration</p><p className="font-mono text-lg font-semibold text-slate-900" data-testid="ended-duration">{formatClock(elapsed)}</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Questions answered</p><p className="font-mono text-lg font-semibold text-slate-900">{answered}</p></div>
          </div>
          <ul className="mt-6 space-y-3">
            {steps.map(([s, st]) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", st === "done" ? "bg-emerald-500 text-white" : st === "active" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400")}>
                  {st === "done" ? <Check className="h-3 w-3" /> : st === "active" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Circle className="h-1.5 w-1.5 fill-current" />}
                </span>
                <span className={st === "queued" ? "text-slate-400" : "text-slate-800"}>{s}</span>
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8 w-full" data-testid="ended-back-button"><Link to={isAuthenticated ? `/app/interviews/${interview.id}` : "/"}>{isAuthenticated ? "Back to Intervia" : "Done"}</Link></Button>
        </motion.div>
      </div>
    </div>
  );
}

export function InterviewRoom({ session }) {
  const { interview, interviewer, questions } = session;
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [ended, setEnded] = useState(false);
  const sim = useInterviewSimulation(questions, { running: !ended });
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const speaking = sim.phase === "speaking";
  const answering = sim.phase === "listening";

  if (ended) return <Ended interview={interview} elapsed={sim.elapsed} answered={sim.index + (answering ? 1 : 0)} />;

  const tileH = "aspect-[4/3] lg:aspect-auto lg:h-[min(56vh,580px)]";
  return (
    <div className="flex min-h-screen flex-col bg-slate-50" data-testid="interview-room">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <Logo className="hidden sm:inline-flex" />
          <span className="hidden h-6 w-px bg-slate-200 sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900" data-testid="room-title">{interview.title}</p>
            <p className="truncate text-xs text-slate-500">{interview.company} · {interview.candidate.name}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-rose-50 px-2 py-1 font-mono text-[11px] font-medium text-rose-600" data-testid="room-live-status"><Circle className="h-2 w-2 animate-pulse fill-current" />LIVE · REC</span>
            <span className="rounded-md border border-slate-200 px-2 py-1 font-mono text-xs tabular text-slate-700" data-testid="room-duration">{formatClock(sim.elapsed)}</span>
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-2.5 sm:px-6"><Progress index={sim.index} total={sim.total} skill={sim.question.skill} /></div>
      </header>

      <main className="mx-auto grid w-full max-w-[1500px] flex-1 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-2 lg:gap-5">
        <CandidateTile name={interview.candidate.name} micOn={micOn} camOn={camOn} answering={answering} className={tileH} />
        <InterviewerTile interviewer={interviewer} speaking={speaking} caption={null} avatarSize={isDesktop ? 260 : 180} className={tileH} />

        <section className="order-last rounded-xl border border-slate-200 bg-white p-5 lg:order-none" data-testid="candidate-answer-card">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">Your answer</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5" />Recorded for evaluation</span>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            {!micOn ? <span className="text-rose-600">Your microphone is muted. Unmute to answer.</span> : answering ? <><SpeakingDots active className="text-emerald-500" /> Listening to your answer…</> : "Wait for Ava to finish the question, then answer naturally."}
          </p>
          <p className="mt-3 text-xs text-slate-400">Take your time — it's fine to pause and think before you answer.</p>
        </section>
        <section className={cn("rounded-xl border bg-white p-5 transition-colors", speaking ? "border-blue-200" : "border-slate-200", !captions && "opacity-60")} data-testid="current-question-card">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-blue-700"><Sparkles className="h-3 w-3" />Current question</p>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{sim.question.skill}</span>
          </div>
          <p className={cn("mt-3 min-h-[52px] text-[15px] leading-relaxed text-slate-900", speaking && "caret")} data-testid="current-question-text">{captions ? sim.typed : "Captions are hidden."}</p>
        </section>
      </main>

      <footer className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-3 px-4 py-3 sm:justify-between sm:px-6">
          <p className="hidden text-xs text-slate-500 sm:block">{micOn ? "Microphone on" : "Microphone off"} · {camOn ? "Camera on" : "Camera off"}</p>
          <div className="flex items-center gap-2.5">
            <CtlButton on={micOn} onClick={() => setMicOn((v) => !v)} iconOn={Mic} iconOff={MicOff} label={micOn ? "Mute microphone" : "Unmute microphone"} testId="toggle-mic-button" />
            <CtlButton on={camOn} onClick={() => setCamOn((v) => !v)} iconOn={Video} iconOff={VideoOff} label={camOn ? "Turn camera off" : "Turn camera on"} testId="toggle-camera-button" />
            <CtlButton on={captions} onClick={() => setCaptions((v) => !v)} iconOn={Captions} iconOff={Captions} label={captions ? "Hide captions" : "Show captions"} testId="toggle-captions-button" />
            <button onClick={() => setConfirm(true)} className="ml-1 inline-flex h-12 items-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700" data-testid="end-interview-button">
              <PhoneOff className="h-4 w-4" /><span className="hidden sm:inline">End interview</span>
            </button>
          </div>
          <p className="hidden w-[150px] text-right text-xs text-slate-400 sm:block">{questions.length - sim.index - 1} questions remaining</p>
        </div>
      </footer>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent data-testid="end-interview-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>End the interview now?</AlertDialogTitle>
            <AlertDialogDescription>You've answered {sim.index + (answering ? 1 : 0)} of {questions.length} questions. Your recording and answers so far will be submitted for evaluation, and you won't be able to rejoin this session.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="end-interview-cancel">Continue interview</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => { setEnded(true); toast.success("Interview submitted for evaluation"); }} data-testid="end-interview-confirm">End interview</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
