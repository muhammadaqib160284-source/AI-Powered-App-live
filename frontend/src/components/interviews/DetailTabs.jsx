import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Send, Radio, Clock3, Hourglass, ChevronDown, Play, Download, Sparkles, Bot, User, Video } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/common/Layout";
import { SkillBar } from "@/components/common/SkillBar";
import { Chip } from "@/components/common/Badges";
import { EmptyState } from "@/components/common/States";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { ResumeDocument, downloadResume } from "@/components/media/Resume";
import { PipelineSteps } from "./PipelineSteps";
import { OverallScore, Summary, StrengthsWeaknesses, RecommendationCard } from "./ReportBlocks";
import { formatClock, scoreTone } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotReady({ interview, what = "report" }) {
  const copy = () => { navigator.clipboard?.writeText(`https://intervia.app/i/${interview.id}`); toast.success("Interview link copied"); };
  const map = {
    in_progress: { icon: Radio, title: "Interview in progress", description: `${interview.candidate.name} is talking with the AI interviewer right now. The ${what} will appear here a few minutes after the session ends.` },
    pending: { icon: Hourglass, title: "Waiting for the candidate", description: `The interview link was sent to ${interview.candidate.email}. The ${what} will be generated once they complete it.` },
    expired: { icon: Clock3, title: "Interview link expired", description: `${interview.candidate.name} didn't start the interview before the link expired.` },
  };
  const s = map[interview.status];
  const roomLabel = interview.status === "in_progress" ? "Open live interview" : interview.context === "individual" ? "Start interview" : "Preview candidate view";
  const room = interview.status !== "expired" && (
    <Button asChild size="sm" variant={interview.status === "in_progress" ? "default" : "outline"} data-testid="open-interview-room-button">
      <Link to={`/interview/${interview.id}`}><Video className="mr-1.5 h-3.5 w-3.5" />{roomLabel}</Link>
    </Button>
  );
  return (
    <EmptyState icon={s.icon} title={s.title} description={s.description} testId={`not-ready-${interview.status}`}
      action={interview.status === "in_progress" ? room : (
        <div className="flex flex-wrap justify-center gap-2">
          {room}
          <Button variant="outline" size="sm" onClick={copy} data-testid="copy-interview-link-button"><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy link</Button>
          <Button size="sm" onClick={() => toast.success(`Invitation re-sent to ${interview.candidate.email}`)} data-testid="resend-invite-button"><Send className="mr-1.5 h-3.5 w-3.5" /> Resend invite</Button>
        </div>
      )}
    />
  );
}

export function OverviewTab({ detail, onOpenVideo, onOpenResume, goTab }) {
  const { interview, report, recording, resume } = detail;
  return (
    <div className="space-y-5">
      <Panel title="Hiring pipeline" description="Where this interview is in the Intervia workflow">
        <PipelineSteps status={interview.status} />
      </Panel>
      {!report ? <NotReady interview={interview} /> : (
        <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
          <div className="space-y-5">
            <Panel title="Evaluation" description="Scored against the interview's required skills"><OverallScore score={interview.overallScore} recommendation={report.recommendation} dimensions={report.dimensions} /></Panel>
            <Panel title="Summary" actions={<button onClick={() => goTab("report")} className="text-xs font-medium text-blue-600 hover:underline" data-testid="overview-full-report-link">Full report</button>}>
              <Summary text={report.summary} />
              <div className="mt-5"><StrengthsWeaknesses strengths={report.strengths.slice(0, 3)} weaknesses={report.weaknesses.slice(0, 3)} /></div>
            </Panel>
          </div>
          <div className="space-y-5">
            <Panel title="Top skills" actions={<button onClick={() => goTab("skills")} className="text-xs font-medium text-blue-600 hover:underline" data-testid="overview-all-skills-link">All skills</button>} bodyClassName="space-y-4">
              {[...report.skills].sort((a, b) => b.score - a.score).slice(0, 4).map((s) => <SkillBar key={s.name} {...s} compact />)}
            </Panel>
            {recording && <Panel title="Recording" bodyClassName="p-3"><VideoPlayer recording={recording} candidateName={interview.candidate.name} onExpand={onOpenVideo} /></Panel>}
            {resume && (
              <Panel title="Resume" description={resume.fileName} actions={<button onClick={onOpenResume} className="text-xs font-medium text-blue-600 hover:underline" data-testid="overview-view-resume-link">View</button>} bodyClassName="p-0">
                <button onClick={onOpenResume} className="relative block h-48 w-full overflow-hidden bg-slate-100 px-6 pt-5 text-left" data-testid="overview-resume-preview">
                  <ResumeDocument resume={resume} name={interview.candidate.name} className="origin-top scale-[0.62] px-6 py-6" />
                  <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-100" />
                </button>
              </Panel>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillsTab({ detail }) {
  const { interview, report } = detail;
  if (!report)
    return (
      <div className="space-y-5">
        <Panel title="Required skills"><div className="flex flex-wrap gap-2">{interview.requiredSkills.map((s) => <Chip key={s}>{s}</Chip>)}</div></Panel>
        <NotReady interview={interview} what="skill evaluation" />
      </div>
    );
  const sorted = [...report.skills].sort((a, b) => b.score - a.score);
  const avg = Math.round(report.skills.reduce((a, s) => a + s.score, 0) / report.skills.length);
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
      <Panel title="Skill evaluation" description="Each required skill is scored from evidence in the interview. Expand a skill to read the AI's reasoning." bodyClassName="space-y-2.5">
        {report.skills.map((s, i) => <SkillBar key={s.name} {...s} defaultOpen={i < 2} />)}
      </Panel>
      <div className="space-y-4">
        {[["Average skill score", avg], ["Strongest skill", sorted[0].name, sorted[0].score], ["Biggest gap", sorted[sorted.length - 1].name, sorted[sorted.length - 1].score]].map(([label, v, score]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1.5 font-display text-xl font-semibold text-slate-950">{v}{score != null && <span className={cn("ml-2 font-mono text-sm", scoreTone(score).text)}>{score}</span>}</p>
          </div>
        ))}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs text-slate-500">Skills distribution</p>
          <div className="flex h-24 items-end gap-1.5">
            {report.skills.map((s) => (
              <motion.div key={s.name} title={`${s.name}: ${s.score}`} className={cn("flex-1 rounded-t", scoreTone(s.score).bar)} initial={{ height: 0 }} animate={{ height: `${s.score}%` }} transition={{ duration: 0.7 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const RATING = { strong: "border-emerald-200 bg-emerald-50 text-emerald-700", adequate: "border-blue-200 bg-blue-50 text-blue-700", weak: "border-amber-200 bg-amber-50 text-amber-700" };

function QA({ item, onJump, index }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-slate-200 bg-white" data-testid={`transcript-item-${item.id}`}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left" data-testid={`transcript-toggle-${item.id}`}>
        <span className="font-mono text-xs text-slate-400">Q{index + 1}</span>
        <span className="flex-1 truncate text-sm font-medium text-slate-900">{item.question}</span>
        <span className={cn("hidden rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize sm:inline", RATING[item.rating])}>{item.rating}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-4 border-t border-slate-100 px-5 py-4">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white"><Bot className="h-3.5 w-3.5" /></span>
                <div><p className="text-xs font-semibold text-slate-500">AI Interviewer <button onClick={() => onJump(item.at)} className="ml-1.5 font-mono font-normal text-blue-600 hover:underline" data-testid={`transcript-jump-${item.id}`}>{item.at}</button></p><p className="mt-1 text-sm text-slate-900">{item.question}</p></div>
              </div>
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"><User className="h-3.5 w-3.5" /></span>
                <div><p className="text-xs font-semibold text-slate-500">Candidate</p><p className="mt-1 text-sm leading-relaxed text-slate-700">“{item.answer}”</p></div>
              </div>
              <div className="ml-10 rounded-lg border border-blue-100 bg-blue-50/50 px-3.5 py-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-700"><Sparkles className="h-3 w-3" /> Evaluation · {item.skill}</p>
                <p className="mt-1 text-[13px] text-slate-700">{item.evaluation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TranscriptTab({ detail, onOpenVideo }) {
  const { interview, transcript } = detail;
  const [rating, setRating] = useState("all");
  if (!transcript.length) return <NotReady interview={interview} what="transcript" />;
  const items = transcript.filter((t) => rating === "all" || t.rating === rating);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{transcript.length} questions · click a timestamp to jump to the recording</p>
        <div className="flex gap-1 rounded-md bg-slate-100 p-0.5">
          {["all", "strong", "adequate", "weak"].map((r) => (
            <button key={r} onClick={() => setRating(r)} className={cn("rounded px-2.5 py-1 text-xs font-medium capitalize", rating === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")} data-testid={`transcript-filter-${r}`}>{r}</button>
          ))}
        </div>
      </div>
      {items.map((t) => <QA key={t.id} item={t} index={transcript.indexOf(t)} onJump={(at) => { const [m, s] = at.split(":").map(Number); onOpenVideo(m * 60 + s); }} />)}
    </div>
  );
}

export function ReportTab({ detail }) {
  const { interview, report } = detail;
  if (!report) return <NotReady interview={interview} />;
  return (
    <article className="rounded-xl border border-slate-200 bg-white" data-testid="full-report">
      <header className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">Candidate report</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{interview.candidate.name} · {interview.role}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Report exported as PDF", { description: "Demo only — export isn't connected yet." })} data-testid="export-report-button"><Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF</Button>
      </header>
      <div className="space-y-8 p-6">
        <OverallScore score={interview.overallScore} recommendation={report.recommendation} dimensions={report.dimensions} />
        <Summary text={report.summary} generatedAt={report.generatedAt} />
        <StrengthsWeaknesses strengths={report.strengths} weaknesses={report.weaknesses} />
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">Skill scores</p>
          <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">{report.skills.map((s) => <SkillBar key={s.name} {...s} compact />)}</div>
        </div>
        <RecommendationCard recommendation={report.recommendation} note={report.recommendationNote} />
      </div>
    </article>
  );
}

export function RecordingTab({ detail, onOpenVideo }) {
  const { interview, recording } = detail;
  if (!recording) return <NotReady interview={interview} what="recording" />;
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        <VideoPlayer recording={recording} candidateName={interview.candidate.name} onExpand={onOpenVideo} />
        {recording.status === "ready" && <Button onClick={() => onOpenVideo(0)} data-testid="open-video-modal-button"><Play className="mr-2 h-4 w-4" /> Watch interview</Button>}
      </div>
      <div className="space-y-4">
        <Panel title="Recording details" bodyClassName="space-y-2.5 text-sm">
          {[["Status", recording.status === "ready" ? "Processed · ready" : "Recording live"], ["Duration", formatClock(recording.durationSec)], ["File size", recording.sizeMb ? `${recording.sizeMb} MB` : "—"], ["Transcript", recording.status === "ready" ? "Synced" : "Pending"]].map(([k, v]) => (
            <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="font-medium text-slate-900" data-testid={`recording-${k.toLowerCase().replace(" ", "-")}`}>{v}</span></div>
          ))}
        </Panel>
        <Panel title="Chapters" bodyClassName="p-2">
          {recording.markers.map((m) => (
            <button key={m.at} onClick={() => onOpenVideo(m.at)} disabled={recording.status !== "ready"} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-60" data-testid={`chapter-${m.at}`}>
              <span className="font-mono text-xs text-blue-600">{formatClock(m.at)}</span><span className="text-slate-700">{m.label}</span>
            </button>
          ))}
        </Panel>
      </div>
    </div>
  );
}

export { downloadResume };
