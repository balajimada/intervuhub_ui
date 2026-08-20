import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/questions", label: "Questions" },
  { to: "/openings", label: "Openings" },
  { to: "/trainers", label: "Trainers" },
  { to: "/consultations", label: "Consultations" },
  
] as const;

export function SiteHeader() {
  const { user, isAuthenticated, isAdmin, signOut, ready } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    signOut();
    setOpen(false);
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-2 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center">
          <Link
            to="/"
            className="flex min-w-0 items-center rounded-xl transition-shadow hover:glow-ring"
            aria-label="IntervuHub home"
          >
            <BrandLogo className="h-12 w-12 sm:h-14 sm:w-14" />
          </Link>
        </div>


        <nav aria-label="Main" className="hidden items-center justify-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-primary" }}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              to="/admin"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-primary" }}
            >
              Admin
            </Link>
          ) : null}
        </nav>


        <div className="flex items-center justify-end gap-2">

          {ready && isAuthenticated ? (
            <div className="hidden md:flex md:items-center md:gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/questions/new">Post question</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/openings/new">Post opening</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu">
                    <UserIcon className="h-4 w-4" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="space-y-1">
                    <p className="truncate text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {user?.role}
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="mr-2 h-4 w-4" aria-hidden />
                        Admin console
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" aria-hidden />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}

          {ready && !isAuthenticated ? (
            <div className="hidden md:flex md:items-center md:gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/auth/login">
                  <UserIcon className="mr-2 h-4 w-4" aria-hidden />
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth/register">Get started</Link>
              </Button>
            </div>
          ) : null}


          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-xs p-6">
              <SheetTitle className="mb-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm hover:bg-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm hover:bg-secondary"
                  >
                    Admin console
                  </Link>
                ) : null}
              </nav>
              <div className="mt-6 space-y-2 border-t pt-6">
                {isAuthenticated ? (
                  <>
                    <p className="truncate text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/questions/new" onClick={() => setOpen(false)}>
                        Post question
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/openings/new" onClick={() => setOpen(false)}>
                        Post opening
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth/login" onClick={() => setOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/auth/register" onClick={() => setOpen(false)}>
                        Create account
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
