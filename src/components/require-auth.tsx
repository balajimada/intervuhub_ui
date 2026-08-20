import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/states";

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { ready, isAuthenticated, isAdmin, user } = useAuth();

  if (!ready) return <LoadingBlock label="Checking your session…" />;

  if (!isAuthenticated)
    return (
      <div className="surface mx-auto max-w-md px-6 py-12 text-center">
        <h2 className="text-xl font-semibold">Sign in to continue</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need an active IntervuHub account to post and manage content.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/auth/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth/register">Create account</Link>
          </Button>
        </div>
      </div>
    );

  if (adminOnly && !isAdmin)
    return (
      <div className="surface mx-auto max-w-md px-6 py-12 text-center" role="alert">
        <h2 className="text-xl font-semibold">Not permitted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The admin console is restricted. You are signed in as {user?.role}.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );

  return <>{children}</>;
}
