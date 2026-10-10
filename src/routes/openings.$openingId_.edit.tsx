import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { OpeningForm } from "@/components/opening-form";
import { RequireAuth } from "@/components/require-auth";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/states";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/openings/$openingId_/edit")({
  head: () => ({
    meta: [{ title: "Edit opening — IntervuHub" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <RequireAuth>
      <EditOpeningPage />
    </RequireAuth>
  ),
});

function EditOpeningPage() {
  const { openingId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["opening", openingId],
    queryFn: () => api.getOpening(openingId),
    retry: false,
  });

  const update = useMutation({
    mutationFn: (input: Parameters<typeof api.updateOpening>[1]) =>
      api.updateOpening(openingId, input),
    onSuccess: (o) => {
      queryClient.setQueryData(["opening", openingId], o);
      queryClient.invalidateQueries({ queryKey: ["openings"] });
      toast.success("Opening updated.");
      navigate({ to: "/openings/$openingId", params: { openingId } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the opening."),
  });

  const o = query.data;
  const backToOpening = () => navigate({ to: "/openings/$openingId", params: { openingId } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/openings/$openingId" params={{ openingId }}>
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
          Back to opening
        </Link>
      </Button>

      <h1 className="text-2xl font-bold sm:text-3xl">Edit opening</h1>
      {o ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Editing doesn&apos;t change the expiry date. This opening expires on{" "}
          {formatDate(o.expiresAt)}.
        </p>
      ) : null}

      <div className="mt-6 empty:hidden">
        {query.isLoading ? <LoadingBlock /> : null}
        {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
        {o && o.authorId !== user?.id ? (
          <EmptyState
            title="You can't edit this opening"
            description="Only the person who posted an opening can edit it."
          />
        ) : null}
      </div>

      {o && o.authorId === user?.id ? (
        <OpeningForm
          initial={o}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          isPending={update.isPending}
          onSubmit={(input) => update.mutate(input)}
          onCancel={backToOpening}
        />
      ) : null}
    </div>
  );
}
