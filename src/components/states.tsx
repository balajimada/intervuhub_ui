import { AlertCircle, Inbox, Loader2, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface space-y-3 p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Inbox className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const status = (error as { status?: number } | null)?.status;
  const message =
    error instanceof Error ? error.message : "Something went wrong while loading this view.";

  if (status === 403) return <ForbiddenState message={message} />;

  return (
    <div
      role="alert"
      className="surface flex flex-col items-center gap-3 border-destructive/30 px-6 py-14 text-center"
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">Couldn&apos;t load this</h3>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function ForbiddenState({ message }: { message?: string }) {
  return (
    <div
      role="alert"
      className="surface flex flex-col items-center gap-3 px-6 py-14 text-center"
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-warning/15 text-warning-foreground">
        <ShieldAlert className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">Not permitted</h3>
      <p className="max-w-md text-sm text-muted-foreground">
        {message ?? "Your account doesn't have access to this area."}
      </p>
    </div>
  );
}
