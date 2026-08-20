import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Layers, User } from "lucide-react";
import { api } from "@/lib/api/client";
import { formatDate, monthName, relativeFromNow } from "@/lib/format";
import { ReportButton } from "@/components/report-dialog";
import { ErrorState, LoadingBlock } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/questions/$questionId")({
  head: () => ({
    meta: [
      { title: "Interview question detail — IntervuHub" },
      {
        name: "description",
        content:
          "Full detail for a shared interview question: round, difficulty, stack, role and candidate notes.",
      },
      { property: "og:title", content: "Interview question detail — IntervuHub" },
      { property: "og:description", content: "See the round, difficulty and notes for this question." },
    ],
  }),
  component: QuestionDetail,
});

function QuestionDetail() {
  const { questionId } = Route.useParams();
  const query = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => api.getQuestion(questionId),
    retry: false,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/questions">
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
          All questions
        </Link>
      </Button>

      {query.isLoading ? <LoadingBlock /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}

      {query.data ? (
        <article className="surface p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{query.data.companyName}</Badge>
            <Badge variant="outline">Round: {query.data.round}</Badge>
            <Badge variant="secondary">{query.data.experienceLevel}</Badge>
            {query.data.difficulty ? (
              <Badge variant="outline">Difficulty: {query.data.difficulty}</Badge>
            ) : null}
          </div>

          <h1 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">
            {query.data.questionText}
          </h1>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Role</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                {query.data.role}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Tech stack</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm">
                <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
                {query.data.techStack.join(", ")}
              </dd>
            </div>
            {query.data.interviewYear ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Interviewed
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {[monthName(query.data.interviewMonth), query.data.interviewYear]
                    .filter(Boolean)
                    .join(" ")}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Shared</dt>
              <dd className="mt-1 text-sm">
                {relativeFromNow(query.data.createdAt)} · {formatDate(query.data.createdAt)}
              </dd>
            </div>
          </dl>

          {query.data.notes ? (
            <section className="mt-6 rounded-lg bg-secondary p-4">
              <h2 className="text-sm font-semibold">Notes / answer hints</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {query.data.notes}
              </p>
            </section>
          ) : null}

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted-foreground">Posted by {query.data.authorName}</p>
            <ReportButton targetType="Question" targetId={query.data.id} />
          </div>
        </article>
      ) : null}
    </div>
  );
}
