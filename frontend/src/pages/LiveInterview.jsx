import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/States";
import { InterviewRoom } from "@/components/live/InterviewRoom";
import { interviewsService } from "@/services";
import { useAsync } from "@/hooks/useAsync";

export default function LiveInterviewPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useAsync(() => interviewsService.getLiveSession(id), [id]);
  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 p-6" data-testid="interview-room-loading">
        <Skeleton className="h-10 w-80" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2"><Skeleton className="aspect-[4/3] rounded-2xl" /><Skeleton className="aspect-[4/3] rounded-2xl" /></div>
      </div>
    );
  if (error) return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><ErrorState error={error} onRetry={reload} className="w-full max-w-md" /></div>;
  return <InterviewRoom session={data} />;
}
