import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Layers, Pencil, Plus, User } from "lucide-react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { relativeFromNow } from "@/lib/format";
import { FilterBar, emptyFilters, hasActiveFilters, type Filters } from "@/components/filter-bar";
import { FormattedText } from "@/components/formatted-text";
import { ReportButton } from "@/components/report-dialog";
import { Pager } from "@/components/pager";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/questions/")({
  head: () => ({
    meta: [
      { title: "Interview questions by company & stack — IntervuHub" },
      {
        name: "description",
        content:
          "Search real interview questions filtered by company, tech stack, experience level, role and round. Free to browse, no account needed.",
      },
      { property: "og:title", content: "Interview questions by company & stack — IntervuHub" },
      {
        property: "og:description",
        content: "Filter thousands of real interview questions shared by candidates.",
      },
    ],
  }),
  component: QuestionsPage,
});

function QuestionsPage() {
  const { isAuthenticated, user } = useAuth();
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters });
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["questions", filters, page],
    queryFn: () =>
      api.listQuestions({
        ...(filters.company ? { companyId: filters.company.id } : {}),
        ...(filters.techStack.length ? { techStack: filters.techStack } : {}),
        ...(filters.experienceLevel ? { experienceLevel: filters.experienceLevel } : {}),
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.round ? { round: filters.round } : {}),
        page,
        pageSize: 10,
      }),
  });

  const updateFilters = (next: Filters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">Interview questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real questions shared by candidates, grouped by round and stack.
          </p>
        </div>
        {isAuthenticated ? (
          <Button asChild className="shrink-0">
            <Link to="/questions/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Post a question
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <FilterBar value={filters} onChange={updateFilters} showRound />

        <div className="space-y-4">
          {query.isLoading ? <ListSkeleton /> : null}
          {query.isError ? (
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          ) : null}

          {query.data && query.data.items.length === 0 ? (
            <EmptyState
              title={hasActiveFilters(filters) ? "No matching questions" : "No questions yet"}
              description={
                hasActiveFilters(filters)
                  ? "Try widening your filters — fewer tags usually means more results."
                  : "Nothing has been shared yet. Be the first to post a question you were asked."
              }
              action={
                isAuthenticated ? (
                  <Button asChild className="mt-2">
                    <Link to="/questions/new">Post the first question</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="mt-2">
                    <Link to="/auth/register">Create an account to post</Link>
                  </Button>
                )
              }
            />
          ) : null}

          {query.data?.items.map((q) => (
            <article key={q.id} className="surface p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{q.companyName}</Badge>
                <Badge variant="outline">{q.round}</Badge>
                <Badge variant="secondary">{q.experienceLevel}</Badge>
                {q.difficulty ? <Badge variant="outline">{q.difficulty}</Badge> : null}
              </div>
              <h2 className="mt-3 text-base font-semibold leading-snug">
                <Link
                  to="/questions/$questionId"
                  params={{ questionId: q.id }}
                  className="hover:underline"
                >
                  <FormattedText text={q.questionText} preview />
                </Link>
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" aria-hidden />
                  {q.techStack.join(", ")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" aria-hidden />
                  {q.role}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {relativeFromNow(q.createdAt)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Link
                  to="/questions/$questionId"
                  params={{ questionId: q.id }}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  View details
                </Link>
                {q.authorId === user?.id ? (
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/questions/$questionId/edit" params={{ questionId: q.id }}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Edit
                    </Link>
                  </Button>
                ) : (
                  <ReportButton targetType="Question" targetId={q.id} />
                )}
              </div>
            </article>
          ))}

          {query.data ? (
            <Pager
              page={query.data.page}
              totalPages={query.data.totalPages}
              total={query.data.total}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
