import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { OpeningForm } from "@/components/opening-form";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/openings/new")({
  head: () => ({
    meta: [
      { title: "Share an interview opening — IntervuHub" },
      {
        name: "description",
        content:
          "Post a role you know is open: company, tech stack, experience level, location, mode and an optional link.",
      },
      { property: "og:title", content: "Share an interview opening — IntervuHub" },
      {
        property: "og:description",
        content: "Help someone land an interview by sharing an opening you know about.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NewOpeningPage />
    </RequireAuth>
  ),
});

function NewOpeningPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const submit = useMutation({
    mutationFn: api.createOpening,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["openings"] });
      toast.success("Opening posted. It stays live for 60 days.");
      navigate({ to: "/openings/$openingId", params: { openingId: created.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not post the opening."),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Post an interview opening</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Openings expire automatically after 60 days so the board stays fresh.
      </p>
      <OpeningForm
        submitLabel="Post opening"
        pendingLabel="Posting…"
        isPending={submit.isPending}
        onSubmit={(input) => submit.mutate(input)}
        onCancel={() => navigate({ to: "/openings" })}
      />
    </div>
  );
}
