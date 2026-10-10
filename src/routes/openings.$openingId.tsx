import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, ExternalLink, MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { daysUntil, formatDate, relativeFromNow } from "@/lib/format";
import { ReportButton } from "@/components/report-dialog";
import { ErrorState, LoadingBlock } from "@/components/states";
import { PostTestimonials } from "@/components/testimonials";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/openings/$openingId")({
  head: () => ({
    meta: [
      { title: "Opening details — IntervuHub" },
      {
        name: "description",
        content:
          "Full details of a community-shared interview opening: role, company, stack, location and how it was sourced.",
      },
      { property: "og:title", content: "Opening details — IntervuHub" },
      { property: "og:description", content: "A community-shared interview opening." },
    ],
  }),
  component: OpeningDetailPage,
});

function OpeningDetailPage() {
  const { openingId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const query = useQuery({
    queryKey: ["opening", openingId],
    queryFn: () => api.getOpening(openingId),
  });

  const remove = useMutation({
    mutationFn: () => api.deleteOpening(openingId),
    onSuccess: () => {
      toast.success("Opening removed.");
      queryClient.invalidateQueries({ queryKey: ["openings"] });
      navigate({ to: "/openings" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete the opening."),
  });

  const o = query.data;
  const isAuthor = !!o && user?.id === o.authorId;
  const canDelete = isAuthor || (!!o && isAdmin);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/openings">
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
          All openings
        </Link>
      </Button>

      {query.isPending ? <LoadingBlock label="Loading this opening…" /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}

      {o ? (
        <article className="surface space-y-5 p-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">{o.role}</h1>
            <p className="text-muted-foreground">{o.companyName}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant={daysUntil(o.expiresAt) <= 5 ? "destructive" : "secondary"}>
                <Clock className="mr-1 h-3 w-3" aria-hidden />
                Expires in {daysUntil(o.expiresAt)} days
              </Badge>
              <Badge variant="outline">{o.experienceLevel}</Badge>
              {o.mode ? <Badge variant="outline">{o.mode}</Badge> : null}
              {o.techStack.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </header>

          <Alert>
            <AlertTitle>Verify before you apply</AlertTitle>
            <AlertDescription>
              Community-sourced information. Confirm the role on the company&apos;s official
              careers page.
            </AlertDescription>
          </Alert>

          {o.notes ? <p className="whitespace-pre-wrap text-sm">{o.notes}</p> : null}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {o.location ? (
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Location</dt>
                <dd className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {o.location}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Source</dt>
              <dd>{o.sourceType === "IWorkHere" ? "Posted by an employee" : "Known opening"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Posted</dt>
              <dd>
                {relativeFromNow(o.createdAt)} by {o.authorName}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Expires on</dt>
              <dd>{formatDate(o.expiresAt)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            {o.link ? (
              <Button asChild size="sm">
                <a href={o.link} target="_blank" rel="noreferrer noopener">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Open listing
                </a>
              </Button>
            ) : null}
            {isAuthor ? (
              <Button asChild size="sm" variant="outline">
                <Link to="/openings/$openingId/edit" params={{ openingId: o.id }}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Edit
                </Link>
              </Button>
            ) : isAuthenticated ? (
              <ReportButton targetType="Opening" targetId={o.id} />
            ) : null}
            {canDelete ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                disabled={remove.isPending}
                onClick={() => remove.mutate()}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Delete
              </Button>
            ) : null}
          </div>
        </article>
      ) : null}

      {o ? <PostTestimonials targetType="Opening" targetId={o.id} isAuthor={isAuthor} /> : null}
    </div>
  );
}
