import { Mic, MicOff, Video, VideoOff, Circle } from "lucide-react";
import { AiAvatar, SpeakingDots } from "./AiAvatar";
import { CandidateVideo } from "./CandidateVideo";
import { cn } from "@/lib/utils";

const Chip = ({ children, className, ...rest }) => <span className={cn("inline-flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 text-[11px] font-medium text-slate-100 backdrop-blur-sm", className)} {...rest}>{children}</span>;

export const DeviceIndicator = ({ on, kind, small }) => {
  const Icon = kind === "mic" ? (on ? Mic : MicOff) : on ? Video : VideoOff;
  return (
    <span className={cn("flex items-center justify-center rounded-md", small ? "h-6 w-6" : "h-7 w-7", on ? "bg-black/45 text-slate-100" : "bg-rose-600 text-white")} title={`${kind === "mic" ? "Microphone" : "Camera"} ${on ? "on" : "off"}`} data-testid={`${kind}-status-indicator`} data-on={on}>
      <Icon className={small ? "h-3 w-3" : "h-3.5 w-3.5"} />
    </span>
  );
};

const frame = "relative overflow-hidden rounded-2xl border bg-[#0E1422] transition-[border-color,box-shadow] duration-300";

export function CandidateTile({ name, micOn, camOn, answering, stream, className, small }) {
  return (
    <div className={cn(frame, answering && micOn ? "border-emerald-500/70 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" : "border-slate-800", className)} data-testid="candidate-panel">
      <CandidateVideo stream={stream} cameraOn={camOn} name={name} compact={small} />
      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
        <Chip className="font-mono uppercase tracking-[0.14em]">Candidate</Chip>
        <Chip className="text-rose-300"><Circle className="h-2 w-2 animate-pulse fill-rose-500 text-rose-500" />Recording</Chip>
      </div>
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
        <div className="min-w-0 rounded-lg bg-black/45 px-3 py-2 backdrop-blur-sm">
          <p className={cn("truncate font-semibold text-white", small ? "text-[12px]" : "text-sm")} data-testid="candidate-panel-name">{name}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-300" data-testid="candidate-panel-status">
            {!micOn ? "Muted" : answering ? <><SpeakingDots active className="text-emerald-400" /> Answering</> : "Listening to question"}
          </p>
        </div>
        <div className="flex gap-1.5"><DeviceIndicator kind="mic" on={micOn} small={small} /><DeviceIndicator kind="cam" on={camOn} small={small} /></div>
      </div>
    </div>
  );
}

export function InterviewerTile({ interviewer, speaking, caption, avatarSize = 240, className, small }) {
  return (
    <div className={cn(frame, speaking ? "border-blue-500/70 shadow-[0_0_0_3px_rgba(37,99,235,0.15)]" : "border-slate-800", className)} data-testid="ai-interviewer-panel">
      <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute inset-0 flex items-center justify-center pb-8"><AiAvatar speaking={speaking} size={avatarSize} /></div>
      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
        <Chip className="font-mono uppercase tracking-[0.14em]">AI Interviewer</Chip>
        <Chip className={speaking ? "text-blue-200" : "text-slate-300"} data-testid="ai-speaking-indicator"><SpeakingDots active={speaking} />{speaking ? "Speaking" : "Listening"}</Chip>
      </div>
      <div className="absolute inset-x-3 bottom-3">
        {caption && <p className="mb-2 line-clamp-2 rounded-lg bg-black/55 px-3 py-2 text-center text-[12.5px] leading-snug text-slate-100 backdrop-blur-sm" data-testid="ai-caption">{caption}</p>}
        <div className="flex items-center justify-between">
          <div className="rounded-lg bg-black/45 px-3 py-2 backdrop-blur-sm">
            <p className={cn("font-semibold text-white", small ? "text-[12px]" : "text-sm")}>{interviewer.name}</p>
            <p className="text-[11px] text-slate-300">{interviewer.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
