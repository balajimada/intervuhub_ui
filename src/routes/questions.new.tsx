import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { QuestionForm } from "@/components/question-form";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/questions/new")({
  head: () => ({
    meta: [
      { title: "Share an interview question — IntervuHub" },
      {
        name: "description",
        content:
          "Post a question you were asked: company, tech stack, experience level, round, notes and difficulty.",
      },
      { property: "og:title", content: "Share an interview question — IntervuHub" },
      { property: "og:description", content: "Help the next candidate by sharing what got asked." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NewQuestionPage />
    </RequireAuth>
  ),
});

function NewQuestionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: api.createQuestion,
    onSuccess: (q) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question posted. Thanks for sharing!");
      navigate({ to: "/questions/$questionId", params: { questionId: q.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not post the question."),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Share an interview question</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep it factual and avoid names or anything confidential.
      </p>
      <QuestionForm
        submitLabel="Post question"
        pendingLabel="Posting…"
        isPending={create.isPending}
        onSubmit={(input) => create.mutate(input)}
      />
    </div>
  );
}
