import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Layers, Pencil, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { formatDate, monthName, relativeFromNow } from "@/lib/format";
import { FormattedText } from "@/components/formatted-text";
import { ReportButton } from "@/components/report-dialog";
import { ErrorState, LoadingBlock } from "@/components/states";
import { PostTestimonials } from "@/components/testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const query = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => api.getQuestion(questionId),
    retry: false,
  });

  const remove = useMutation({
    mutationFn: () => api.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["question", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question deleted.");
      navigate({ to: "/questions" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete the question."),
  });

  const q = query.data;
  const isAuthor = !!q && user?.id === q.authorId;
  const canDelete = isAuthor || (!!q && isAdmin);

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

      {q ? (
        <article className="surface p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{q.companyName}</Badge>
            <Badge variant="outline">Round: {q.round}</Badge>
            <Badge variant="secondary">{q.experienceLevel}</Badge>
            {q.difficulty ? <Badge variant="outline">Difficulty: {q.difficulty}</Badge> : null}
          </div>

          <h1 className="mt-4 text-lg font-bold leading-snug sm:text-xl">
            <FormattedText text={q.questionText} />
          </h1>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Role</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                {q.role}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Tech stack</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm">
                <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
                {q.techStack.join(", ")}
              </dd>
            </div>
            {q.interviewYear ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Interviewed
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {[monthName(q.interviewMonth), q.interviewYear].filter(Boolean).join(" ")}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Shared</dt>
              <dd className="mt-1 text-sm">
                {relativeFromNow(q.createdAt)} · {formatDate(q.createdAt)}
              </dd>
            </div>
          </dl>

          {q.notes ? (
            <section className="mt-6 rounded-lg bg-secondary p-4">
              <h2 className="text-sm font-semibold">Notes / answer hints</h2>
              <FormattedText text={q.notes} className="mt-2 text-sm text-muted-foreground" />
            </section>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Posted by {isAuthor ? "you" : q.authorName}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {isAuthor ? (
                <Button asChild size="sm" variant="outline">
                  <Link to="/questions/$questionId/edit" params={{ questionId: q.id }}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Link>
                </Button>
              ) : null}
              {canDelete ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      disabled={remove.isPending}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                      <AlertDialogDescription>
                        It will be removed for everyone. This can&apos;t be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => remove.mutate()}
                      >
                        Delete question
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
              {!isAuthor ? <ReportButton targetType="Question" targetId={q.id} /> : null}
            </div>
          </div>
        </article>
      ) : null}

      {q ? <PostTestimonials targetType="Question" targetId={q.id} isAuthor={isAuthor} /> : null}
    </div>
  );
}
