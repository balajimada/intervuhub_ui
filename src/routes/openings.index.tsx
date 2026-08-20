import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Clock, ExternalLink, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { daysUntil, relativeFromNow } from "@/lib/format";
import { FilterBar, emptyFilters, hasActiveFilters, type Filters } from "@/components/filter-bar";
import { ReportButton } from "@/components/report-dialog";
import { Pager } from "@/components/pager";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/openings/")({
  head: () => ({
    meta: [
      { title: "Live interview openings shared by candidates — IntervuHub" },
      {
        name: "description",
        content:
          "Browse community-sourced interview openings by company, tech stack and experience level. Every post expires after 90 days.",
      },
      { property: "og:title", content: "Live interview openings — IntervuHub" },
      {
        property: "og:description",
        content: "Community-shared openings with company, stack and expiry indicators.",
      },
    ],
  }),
  component: OpeningsPage,
});

function OpeningsPage() {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters });
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["openings", filters, page],
    queryFn: () =>
      api.listOpenings({
        ...(filters.company ? { companyId: filters.company.id } : {}),
        ...(filters.techStack.length ? { techStack: filters.techStack } : {}),
        ...(filters.experienceLevel ? { experienceLevel: filters.experienceLevel } : {}),
        ...(filters.role ? { role: filters.role } : {}),
        page,
        pageSize: 10,
      }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteOpening(id),
    onSuccess: () => {
      toast.success("Opening removed.");
      queryClient.invalidateQueries({ queryKey: ["openings"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete the opening."),
  });

  const updateFilters = (next: Filters) => {
    setFilters(next);
    setPage(1);
  };

  const data = query.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">Interview openings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared by people in the community. Posts disappear 90 days after they go up.
          </p>
        </div>
        {isAuthenticated ? (
          <Button asChild className="shrink-0">
            <Link to="/openings/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Post an opening
            </Link>
          </Button>
        ) : null}
      </header>

      <Alert className="mt-6">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        <AlertTitle>Community-sourced, not official listings</AlertTitle>
        <AlertDescription>
          These openings are posted by other members and may be filled, outdated or inaccurate.
          Always confirm on the company&apos;s own careers page before applying.
        </AlertDescription>
      </Alert>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <FilterBar value={filters} onChange={updateFilters} />

        <div className="space-y-4">
          {query.isPending ? <ListSkeleton /> : null}
          {query.isError ? (
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          ) : null}

          {data && data.items.length === 0 ? (
            <EmptyState
              title="No live openings match this"
              description={
                hasActiveFilters(filters)
                  ? "Try clearing a filter or two — openings expire after 90 days, so the board moves fast."
                  : "Nothing is live right now. If you know of a role that's open, be the first to share it."
              }
              action={
                isAuthenticated ? (
                  <Button asChild>
                    <Link to="/openings/new">Post an opening</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link to="/auth/login">Sign in to post</Link>
                  </Button>
                )
              }
            />
          ) : null}

          {data?.items.map((o) => {
            const expiresIn = daysUntil(o.expiresAt);
            const canDelete = isAdmin || (user ? user.id === o.authorId : false);
            return (
              <article key={o.id} className="surface space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">
                      <Link
                        to="/openings/$openingId"
                        params={{ openingId: o.id }}
                        className="hover:underline"
                      >
                        {o.role}
                      </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">{o.companyName}</p>
                  </div>
                  <Badge variant={expiresIn <= 5 ? "destructive" : "secondary"}>
                    <Clock className="mr-1 h-3 w-3" aria-hidden />
                    Expires in {expiresIn} day{expiresIn === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{o.experienceLevel}</Badge>
                  {o.mode ? <Badge variant="outline">{o.mode}</Badge> : null}
                  {o.techStack.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>

                {o.notes ? <p className="text-sm text-muted-foreground">{o.notes}</p> : null}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  {o.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {o.location}
                    </span>
                  ) : null}
                  <span>Posted {relativeFromNow(o.createdAt)}</span>
                  <span>by {o.authorName}</span>
                  <span>
                    {o.sourceType === "IWorkHere" ? "Posted by an employee" : "Known opening"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {o.link ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={o.link} target="_blank" rel="noreferrer noopener">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        Open link
                      </a>
                    </Button>
                  ) : null}
                  {isAuthenticated ? <ReportButton targetType="Opening" targetId={o.id} /> : null}
                  {canDelete ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(o.id)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Delete
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}

          {data ? (
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
