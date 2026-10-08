import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { SessionProvider } from "@/context/SessionContext";
import AppLayout from "@/components/shell/AppLayout";
import LandingPage from "@/pages/Landing";
import LoginPage from "@/pages/auth/Login";
import { SignupChooser, SignupForm } from "@/pages/auth/Signup";
import OverviewPage from "@/pages/app/Overview";
import InterviewsPage from "@/pages/app/Interviews";
import NewInterviewPage from "@/pages/app/NewInterview";
import CandidatesPage from "@/pages/app/Candidates";
import CandidateProfilePage from "@/pages/app/CandidateProfile";
import ResumePage from "@/pages/app/Resume";
import WorkspacesPage from "@/pages/app/Workspaces";
import MembersPage from "@/pages/app/Members";
import InvitationsPage from "@/pages/app/Invitations";
import SettingsPage from "@/pages/app/Settings";
import LiveInterviewPage from "@/pages/LiveInterview";
import { Logo } from "@/components/common/Logo";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center" data-testid="not-found-page">
      <Logo className="mb-10" />
      <p className="font-mono text-sm text-slate-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">This page doesn't exist</h1>
      <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupChooser />} />
            <Route path="/signup/individual" element={<SignupForm key="individual" type="individual" />} />
            <Route path="/signup/organization" element={<SignupForm key="organization" type="organization" />} />
            <Route path="/interview/:id" element={<LiveInterviewPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="interviews" element={<InterviewsPage />} />
              <Route path="interviews/new" element={<NewInterviewPage />} />
              <Route path="interviews/:id" element={<InterviewsPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="candidates/:id" element={<CandidateProfilePage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="workspaces" element={<WorkspacesPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="invitations" element={<InvitationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </SessionProvider>
  );
}
