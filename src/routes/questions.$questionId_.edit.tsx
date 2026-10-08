import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { QuestionForm } from "@/components/question-form";
import { RequireAuth } from "@/components/require-auth";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/states";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/questions/$questionId_/edit")({
  head: () => ({
    meta: [{ title: "Edit question — IntervuHub" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <RequireAuth>
      <EditQuestionPage />
    </RequireAuth>
  ),
});

function EditQuestionPage() {
  const { questionId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => api.getQuestion(questionId),
    retry: false,
  });

  const update = useMutation({
    mutationFn: (input: Parameters<typeof api.updateQuestion>[1]) =>
      api.updateQuestion(questionId, input),
    onSuccess: (q) => {
      queryClient.setQueryData(["question", questionId], q);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question updated.");
      navigate({ to: "/questions/$questionId", params: { questionId } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the question."),
  });

  const q = query.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/questions/$questionId" params={{ questionId }}>
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
          Back to question
        </Link>
      </Button>

      <h1 className="text-2xl font-bold">Edit question</h1>

      <div className="mt-6 empty:hidden">
        {query.isLoading ? <LoadingBlock /> : null}
        {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
        {q && q.authorId !== user?.id ? (
          <EmptyState
            title="You can't edit this question"
            description="Only the person who posted a question can edit it."
          />
        ) : null}
      </div>

      {q && q.authorId === user?.id ? (
        <QuestionForm
          initial={q}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          isPending={update.isPending}
          onSubmit={(input) => update.mutate(input)}
        />
      ) : null}
    </div>
  );
}
