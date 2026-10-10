import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareQuote } from "lucide-react";
import { api } from "@/lib/api/client";
import type { TestimonialTargetType } from "@/lib/api/types";
import { Pager } from "@/components/pager";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { ShareStoryButton, TestimonialCard } from "@/components/testimonials";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Success stories from candidates — IntervuHub" },
      {
        name: "description",
        content:
          "Read how candidates used shared interview questions and openings on IntervuHub to clear interviews and land jobs.",
      },
      { property: "og:title", content: "Success stories — IntervuHub" },
      {
        property: "og:description",
        content: "Real candidates on the questions and openings that helped them.",
      },
    ],
  }),
  component: TestimonialsPage,
});

const FILTERS: { value: TestimonialTargetType | "All"; label: string }[] = [
  { value: "All", label: "All stories" },
  { value: "Question", label: "From questions" },
  { value: "Opening", label: "From openings" },
  { value: "General", label: "About IntervuHub" },
];

function TestimonialsPage() {
  const [filter, setFilter] = useState<TestimonialTargetType | "All">("All");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["testimonials", "page", filter, page],
    queryFn: () =>
      api.listTestimonials({
        ...(filter === "All" ? {} : { targetType: filter }),
        page,
        pageSize: 12,
      }),
  });
  const data = query.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <MessageSquareQuote className="h-7 w-7 shrink-0 text-primary" aria-hidden />
            Success stories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Candidates share which questions and openings helped them. Every story is reviewed
            before it&apos;s published.
          </p>
        </div>
        <ShareStoryButton targetType="General" className="shrink-0" />
      </header>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter stories">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            aria-pressed={filter === f.value}
            onClick={() => {
              setFilter(f.value);
              setPage(1);
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {query.isPending ? <ListSkeleton rows={3} /> : null}
        {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}

        {data && data.items.length === 0 ? (
          <EmptyState
            title="No stories here yet"
            description="Did a question or opening on IntervuHub help you? Open it and choose “Share your story”, or share general feedback above."
            action={
              <Button asChild variant="outline">
                <Link to="/questions">Browse questions</Link>
              </Button>
            }
          />
        ) : null}

        {data?.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        ) : null}

        {data && data.totalPages > 1 ? (
          <Pager
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </div>
  );
}
