import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, EyeOff, RotateCcw, Search, ShieldBan, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { ContentReport, TestimonialStatus, User } from "@/lib/api/types";
import { collectErrors, suspendSchema, type FieldErrors } from "@/lib/validation";
import { formatDate, relativeFromNow } from "@/lib/format";
import { RequireAuth } from "@/components/require-auth";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Moderation console — IntervuHub" },
      {
        name: "description",
        content:
          "Admin console: work the content report queue, approve or reject companies, hide questions and suspend members.",
      },
      { property: "og:title", content: "Moderation console — IntervuHub" },
      { property: "og:description", content: "Reports queue, company approvals and user actions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth adminOnly>
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Moderation console</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Work the report queue, approve companies, publish success stories and manage member
        accounts.
      </p>

      <Tabs defaultValue="reports" className="mt-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <ReportsQueue />
        </TabsContent>
        <TabsContent value="companies" className="mt-4">
          <CompaniesQueue />
        </TabsContent>
        <TabsContent value="stories" className="mt-4">
          <StoriesQueue />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* --------------------------------------------------------------- reports */

function ReportsQueue() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"Open" | "Resolved">("Open");
  const [suspendTarget, setSuspendTarget] = useState<{ id: string; name: string } | null>(null);

  const query = useQuery({
    queryKey: ["admin", "reports", status],
    queryFn: () => api.adminReports(status),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["questions"] });
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  };

  const act = useMutation({
    mutationFn: async ({ kind, id }: { kind: string; id: string }): Promise<unknown> => {
      switch (kind) {
        case "approveCompany":
          return api.approveCompany(id);
        case "rejectCompany":
          return api.rejectCompany(id);
        case "hideQuestion":
          return api.hideQuestion(id);
        case "restoreQuestion":
          return api.restoreQuestion(id);
        case "reactivateUser":
          return api.reactivateUser(id);
        default:
          return api.resolveReport(id);
      }
    },
    onSuccess: () => {
      toast.success("Action applied.");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Action failed."),
  });

  const actionsFor = (r: ContentReport) => {
    if (r.targetType === "Company")
      return [
        { kind: "approveCompany", label: "Approve company", icon: CheckCircle2 },
        { kind: "rejectCompany", label: "Reject company", icon: XCircle },
      ];
    if (r.targetType === "Question")
      return [
        { kind: "hideQuestion", label: "Hide question", icon: EyeOff },
        { kind: "restoreQuestion", label: "Restore question", icon: RotateCcw },
      ];
    if (r.targetType === "Opening") return [];
    return [{ kind: "reactivateUser", label: "Reactivate user", icon: RotateCcw }];
  };

  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["Open", "Resolved"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {query.isPending ? <ListSkeleton rows={3} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title={status === "Open" ? "Queue is clear" : "No resolved reports yet"}
          description={
            status === "Open"
              ? "Nothing needs moderation right now. New reports land here instantly."
              : "Reports you resolve will be archived here."
          }
        />
      ) : null}

      {data?.map((r) => (
        <article key={r.id} className="surface space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{r.targetType}</Badge>
                <Badge variant={r.status === "Open" ? "destructive" : "secondary"}>
                  {r.status}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 font-medium">{r.targetLabel}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {relativeFromNow(r.createdAt)} · {r.reportedByName}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">&ldquo;{r.reason}&rdquo;</p>

          <div className="flex flex-wrap gap-2 border-t pt-3">
            {actionsFor(r).map(({ kind, label, icon: Icon }) => (
              <Button
                key={kind}
                size="sm"
                variant="outline"
                disabled={act.isPending}
                onClick={() => act.mutate({ kind, id: r.targetId })}
              >
                <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                {label}
              </Button>
            ))}
            {r.targetType === "User" ? (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => setSuspendTarget({ id: r.targetId, name: r.targetLabel })}
              >
                <ShieldBan className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Suspend user
              </Button>
            ) : null}
            {r.status === "Open" ? (
              <Button
                size="sm"
                disabled={act.isPending}
                onClick={() => act.mutate({ kind: "resolve", id: r.id })}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Mark resolved
              </Button>
            ) : null}
          </div>
        </article>
      ))}

      <SuspendDialog
        target={suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onDone={invalidate}
      />
    </div>
  );
}

/* ------------------------------------------------------------- companies */

function CompaniesQueue() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "companies"], queryFn: () => api.adminCompanies() });

  const act = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      approve ? api.approveCompany(id) : api.rejectCompany(id),
    onSuccess: () => {
      toast.success("Company updated.");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the company."),
  });

  const data = query.data;

  return (
    <div className="space-y-3">
      {query.isPending ? <ListSkeleton rows={3} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="No companies yet"
          description="Companies added by members from the post forms will show up here for approval."
        />
      ) : null}

      {data?.map((c) => (
        <div key={c.id} className="surface flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="truncate font-semibold">{c.name}</p>
            <p className="text-xs uppercase text-muted-foreground">
              {c.code} · added {formatDate(c.createdAt)}
              {c.createdByName ? ` · by ${c.createdByName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <Button
              size="sm"
              variant="outline"
              disabled={act.isPending || c.status === "Approved"}
              onClick={() => act.mutate({ id: c.id, approve: true })}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              disabled={act.isPending || c.status === "Rejected"}
              onClick={() => act.mutate({ id: c.id, approve: false })}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- stories */

const STORY_STATUSES: TestimonialStatus[] = ["Pending", "Approved", "Rejected"];

function StoriesQueue() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<TestimonialStatus>("Pending");
  const query = useQuery({
    queryKey: ["admin", "testimonials", status],
    queryFn: () => api.adminTestimonials(status),
  });

  const act = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      approve ? api.approveTestimonial(id) : api.rejectTestimonial(id),
    onSuccess: (t) => {
      toast.success(t.status === "Approved" ? "Story published." : "Story rejected.");
      queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update the story."),
  });

  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {STORY_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {query.isPending ? <ListSkeleton rows={3} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title={status === "Pending" ? "No stories waiting" : `No ${status.toLowerCase()} stories`}
          description="When members share how a question or opening helped them, it lands here for review before going public."
        />
      ) : null}

      {data?.map((t) => (
        <article key={t.id} className="surface space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{t.targetType}</Badge>
              <Badge variant="secondary">{t.outcome}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {relativeFromNow(t.createdAt)} · {t.authorName}
            </p>
          </div>
          {t.targetType !== "General" ? (
            <p className="line-clamp-2 text-sm font-medium">{t.targetLabel}</p>
          ) : null}
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            &ldquo;{t.message}&rdquo;
          </p>
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <Button
              size="sm"
              disabled={act.isPending || t.status === "Approved"}
              onClick={() => act.mutate({ id: t.id, approve: true })}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {t.status === "Rejected" ? "Publish anyway" : "Publish"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              disabled={act.isPending || t.status === "Rejected"}
              onClick={() => act.mutate({ id: t.id, approve: false })}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {t.status === "Approved" ? "Unpublish" : "Reject"}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- users */

function UsersPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);

  const query = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => api.adminUsers(search),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  const reactivate = useMutation({
    mutationFn: (id: string) => api.reactivateUser(id),
    onSuccess: () => {
      toast.success("Account reactivated.");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not reactivate."),
  });

  const data = query.data as User[] | undefined;

  return (
    <div className="space-y-4">
      <div className="surface space-y-2 p-4 sm:p-5">
        <Label htmlFor="user-search">Find a member</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="user-search"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email or mobile"
          />
        </div>
      </div>

      {query.isPending ? <ListSkeleton rows={3} /> : null}
      {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="No members match"
          description="Try a different name, email or mobile number."
        />
      ) : null}

      {data?.map((u) => (
        <div key={u.id} className="surface flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="truncate font-semibold">{u.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {u.email} · {u.mobile}
            </p>
            {u.status === "Suspended" && u.suspensionReason ? (
              <p className="mt-1 text-xs text-destructive">
                {u.suspensionReason}
                {u.suspendedUntil ? ` · until ${formatDate(u.suspendedUntil)}` : " · permanent"}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{u.role}</Badge>
            <Badge variant={u.status === "Active" ? "secondary" : "destructive"}>{u.status}</Badge>
            {u.status === "Suspended" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={reactivate.isPending}
                onClick={() => reactivate.mutate(u.id)}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Reactivate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => setTarget({ id: u.id, name: u.name })}
              >
                <ShieldBan className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Suspend
              </Button>
            )}
          </div>
        </div>
      ))}

      <SuspendDialog target={target} onClose={() => setTarget(null)} onDone={invalidate} />
    </div>
  );
}

/* -------------------------------------------------------- suspend dialog */

function SuspendDialog({
  target,
  onClose,
  onDone,
}: {
  target: { id: string; name: string } | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [permanent, setPermanent] = useState(true);
  const [until, setUntil] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const suspend = useMutation({
    mutationFn: (input: { reason: string; suspendedUntil?: string | null }) =>
      api.suspendUser(target!.id, input),
    onSuccess: () => {
      toast.success("Account suspended.");
      setReason("");
      setUntil("");
      setPermanent(true);
      onDone();
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not suspend the account."),
  });

  const submit = () => {
    const parsed = suspendSchema.safeParse({
      reason,
      permanent,
      ...(permanent ? {} : { suspendedUntil: until }),
    });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    if (!permanent && !until) {
      setErrors({ suspendedUntil: "Pick the date the suspension lifts." });
      return;
    }
    setErrors({});
    suspend.mutate({
      reason: parsed.data.reason,
      suspendedUntil: permanent ? null : new Date(until).toISOString(),
    });
  };

  return (
    <Dialog open={!!target} onOpenChange={(o) => (o ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend {target?.name}</DialogTitle>
          <DialogDescription>
            The member keeps read access but cannot sign in or post while suspended.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suspend-reason">Reason</Label>
            <Textarea
              id="suspend-reason"
              rows={3}
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Repeated spam postings after a warning…"
            />
            {errors["reason"] ? (
              <p role="alert" className="text-sm text-destructive">
                {errors["reason"]}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div>
              <Label htmlFor="suspend-permanent">Permanent suspension</Label>
              <p className="text-xs text-muted-foreground">Turn off to set an end date.</p>
            </div>
            <Switch id="suspend-permanent" checked={permanent} onCheckedChange={setPermanent} />
          </div>

          {!permanent ? (
            <div className="space-y-2">
              <Label htmlFor="suspend-until">Suspend until</Label>
              <Input
                id="suspend-until"
                type="date"
                value={until}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setUntil(e.target.value)}
              />
              {errors["suspendedUntil"] ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors["suspendedUntil"]}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit} disabled={suspend.isPending}>
            {suspend.isPending ? "Suspending…" : "Suspend account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
