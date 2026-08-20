import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Pager } from "@/components/pager";
import { ReportButton } from "@/components/report-dialog";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/companies/")({
  head: () => ({
    meta: [
      { title: "Companies hiring & interviewing — IntervuHub" },
      {
        name: "description",
        content:
          "Search companies covered on IntervuHub, see their code and approval status, and report inaccurate entries.",
      },
      { property: "og:title", content: "Companies on IntervuHub" },
      {
        property: "og:description",
        content: "Every company with shared interview questions and openings.",
      },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["companies", search, page],
    queryFn: () => api.listCompanies({ search, page, pageSize: 12, isActive: true }),
  });

  const data = query.data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Companies</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every company members have shared questions or openings for.
      </p>

      <div className="surface mt-6 space-y-2 p-4 sm:p-5">
        <Label htmlFor="company-search">Search by name or code</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="company-search"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Infosys, TCS, ACME…"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {query.isPending ? <ListSkeleton rows={3} /> : null}
        {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}

        {data && data.items.length === 0 ? (
          <EmptyState
            title="No companies found"
            description="Try a shorter search term. You can add a missing company from the post question or post opening form."
          />
        ) : null}

        {data && data.items.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.items.map((c) => (
              <li key={c.id} className="surface flex flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{c.name}</h2>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {c.code}
                    </p>
                  </div>
                  <Badge
                    variant={
                      c.status === "Approved"
                        ? "secondary"
                        : c.status === "Pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Added {formatDate(c.createdAt)}</p>
                {isAuthenticated ? (
                  <div className="pt-1">
                    <ReportButton targetType="Company" targetId={c.id} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

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
  );
}
