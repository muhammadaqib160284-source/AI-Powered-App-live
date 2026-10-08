import { interviews, candidates, reports, transcripts, recordings, resumes, aiInterviewer } from "@/data";

const planFor = (iv) => {
  const fromTranscript = (transcripts[iv.id] || []).map((t) => ({ id: t.id, skill: t.skill, text: t.question }));
  if (fromTranscript.length >= 3) return fromTranscript;
  return [
    { id: "q0", skill: "Introduction", text: `Thanks for joining. To start, tell me about your background and what draws you to the ${iv.role} role.` },
    ...iv.requiredSkills.map((s, i) => ({ id: `q${i + 1}`, skill: s, text: `Walk me through a recent project where ${s} was central. What decisions did you make, and what would you change now?` })),
  ];
};
import { respond, reject, uid } from "./client";

const sortKey = (iv) => new Date(iv.interviewDate || iv.createdAt).getTime();
export const withCandidate = (iv) => ({ ...iv, candidate: candidates.find((c) => c.id === iv.candidateId) });

export const scopeInterviews = ({ context = "organization", orgId } = {}) =>
  interviews
    .filter((iv) => (context === "individual" ? iv.context === "individual" : iv.context === "organization" && iv.orgId === orgId))
    .sort((a, b) => sortKey(b) - sortKey(a));

export const interviewsService = {
  list(scope) {
    return respond(scopeInterviews(scope).map(withCandidate));
  },
  getDetail(id) {
    const iv = interviews.find((i) => i.id === id);
    if (!iv) return reject("This interview doesn't exist or you no longer have access to it.");
    const full = withCandidate(iv);
    return respond({
      interview: full,
      report: reports[id] || null,
      transcript: transcripts[id] || [],
      recording: recordings[id] || null,
      resume: resumes[full.candidate?.resumeId] || null,
    });
  },
  getLiveSession(id) {
    const iv = interviews.find((i) => i.id === id);
    if (!iv) return reject("This interview link is invalid or has expired.");
    return respond({ interview: withCandidate(iv), interviewer: aiInterviewer, questions: planFor(iv) });
  },
  create(payload, scope) {
    const candidate = { id: uid("cand"), name: payload.candidateName || payload.candidateEmail.split("@")[0], email: payload.candidateEmail, phone: "—", location: "—", experience: "—", currentTitle: "—", resumeId: null };
    candidates.push(candidate);
    const iv = {
      id: uid("iv"), context: scope.context, orgId: scope.orgId, workspaceId: payload.workspaceId, candidateId: candidate.id,
      title: payload.title, role: payload.role, company: payload.company, description: payload.description,
      requiredSkills: payload.skills, status: "pending", createdAt: new Date().toISOString(), interviewDate: null,
      durationMin: null, overallScore: null, recommendation: null, createdBy: "Hannah Reyes",
    };
    interviews.unshift(iv);
    return respond(withCandidate(iv), { latency: 1100, mutation: true });
  },
};
