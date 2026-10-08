# Intervia — PRD

## Original problem statement
Build the complete frontend application for a premium, modern AI-powered interview SaaS product from scratch (landing → auth → dashboard → interviews → candidate details → report → workspaces → members/settings). Frontend only, realistic centralized DUMMY DATA, clean service/data-access layer for later API integration; do NOT invent endpoints or connect APIs. Supports Individual users and Organizations (roles ADMIN / HR / VIEWER). Interviews page uses a ~20/80 list/detail layout. (Full brief in conversation, sections 1–49.)

User choices: light app with dark landing hero; product name "Intervia"; default demo user = Organization ADMIN with role switcher; separate signup pages for individual and organization; users can switch between both later.

## Architecture
- React (CRA/craco), Tailwind, shadcn/ui, framer-motion, recharts. No backend usage.
- `src/data/*` — centralized dummy data (users, orgs, workspaces, members, invitations, notifications, candidates, resumes, interviews, recordings, reports, transcripts).
- `src/services/*` — data-access layer (auth, interviews, candidates, dashboard, workspaces/members/invitations, resumes, notifications, search). Each method returns a Promise via `client.respond()`; replace bodies with real API calls later. `?simulate=error|empty` previews error/empty states.
- `src/context/SessionContext.jsx` — simulated auth, context (individual/organization), org, demo role, `can(perm)`; persisted in localStorage.
- `src/lib/permissions.js` — frontend permission matrix.
- Routes: /, /login, /signup, /signup/individual, /signup/organization, /app, /app/interviews, /app/interviews/new, /app/interviews/:id, /app/candidates, /app/candidates/:id, /app/resume, /app/workspaces, /app/members, /app/invitations, /app/settings.

## User personas
- Recruiter / HR (creates interviews, reviews reports, records decisions)
- Org Admin (members, invitations, org settings)
- Viewer (read-only reviewer / hiring manager)
- Individual job seeker / developer (practice interviews, resume, history)

## Implemented (2026-10-07)
- Landing: dark hero with live AI interviewer + candidate mockup, interactive product preview, interactive 4-step how-it-works, features, Sarah Khan report preview, use cases, final CTA, footer
- Auth UI: login (remember me, forgot password dialog), signup chooser + separate individual/organization forms with validation and provisioning state
- App shell: sidebar (context/role aware), header with context switcher, ⌘K/Ctrl K command search, notifications, profile menu (contexts, orgs, role), demo role switcher
- Org + individual overviews, 20/80 interviews management with tabs (overview, skills, interview transcript, report, recording), video player + modal (placeholder), resume viewer/modal, candidates table + profile, new interview form with skills chips & live preview, resume management with simulated upload, workspaces, members, invitations, settings (incl. billing placeholder, danger zone)
- Loading skeletons, empty, error, success, restricted states
- Tested: 58/58 frontend checks passed (iteration_1)

## Implemented (2026-10-08) — Two-sided AI video interview
- New candidate-facing live room `/interview/:id` (outside app shell): equal candidate video tile (left) + animated emoji-style AI interviewer "Ava" (right), labels, status, speaking indicator, mic/camera indicators, duration, question progress, current question card, mic/camera/captions controls, end interview with confirmation, ended/submitted state
- `components/live/`: AiAvatar (accepts `level` 0–1 for future audio sync), CandidateVideo (accepts `stream` MediaStream for future WebRTC), Tiles, InterviewRoom, useInterviewSimulation (local simulated loop)
- `interviewsService.getLiveSession(id)` returns dummy interview + question plan
- Entry points: "Open live interview" / "Preview candidate view" / "Start interview" buttons on not-ready interviews
- Landing hero, How-it-works step 02 and recording player picture-in-picture now show video + AI avatar instead of audio waveform
- Tested: iteration_2 100% pass

## Backlog
- P0: Connect real backend APIs in services layer; real auth
- P1: Real AI interviewer + candidate video, recording playback, resume storage
- P2: Candidate comparison view, PDF export, recruiter notes/comments

## Next tasks
- Replace service method bodies with real API calls when backend contract is ready
