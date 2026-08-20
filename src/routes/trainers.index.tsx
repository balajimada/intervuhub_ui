import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarCheck,
  GraduationCap,
  Lightbulb,
  MessagesSquare,
  Search,
  Users,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/trainers/")({
  head: () => ({
    meta: [
      { title: "Trainers — IT professionals who clear your interview doubts" },
      {
        name: "description",
        content:
          "Meet IntervuHub trainers: working IT professionals who explain interview questions, clear technical doubts and guide job seekers through preparation.",
      },
      { property: "og:title", content: "Trainers on IntervuHub" },
      {
        property: "og:description",
        content:
          "Working IT professionals who explain concepts, review answers and clear doubts for job seekers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrainersPage,
});

const WHAT_THEY_DO = [
  {
    icon: Lightbulb,
    title: "Explain the question behind the question",
    body: "Trainers break down what an interviewer is really testing, so you answer the intent and not just the words.",
  },
  {
    icon: MessagesSquare,
    title: "Clear your doubts one to one",
    body: "Stuck on a concept, a framework or a design trade-off? Ask a trainer and get a plain-language explanation.",
  },
  {
    icon: BadgeCheck,
    title: "Review your answers and resume",
    body: "They read what you wrote, point out the gaps and show how a hiring panel would read the same thing.",
  },
  {
    icon: CalendarCheck,
    title: "Run mock interviews",
    body: "Practise a real round with someone who takes interviews for a living, then get honest feedback.",
  },
];

function TrainersPage() {
  const [search, setSearch] = useState("");
  const trainers = useQuery({
    queryKey: ["trainers", search],
    queryFn: () =>
      api.listTrainers(search.trim() ? { search: search.trim(), pageSize: 24 } : { pageSize: 24 }),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="panel p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5 text-primary" aria-hidden />
          Who are trainers on IntervuHub?
        </span>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
          Working IT professionals who help you <span className="text-gradient-accent">understand</span>,
          not just memorise
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Trainers are experienced engineers, architects, testers and tech leads who already work in
          the industry and who often sit on the other side of the interview table. On IntervuHub they
          sign up with their skills and resume, then help job seekers make sense of the questions
          posted here — why a question is asked, what a strong answer looks like, and what to study
          next. If a question or an explanation is not clear to you, a trainer is the person who
          clears that doubt.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/consultations">
              <CalendarCheck className="mr-2 h-4 w-4" aria-hidden />
              Book a consultation
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth/register">Become a trainer</Link>
          </Button>
        </div>
      </header>

      <section aria-labelledby="what-heading" className="mt-10">
        <h2 id="what-heading" className="text-xl font-bold">
          What trainers do here
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_THEY_DO.map((f) => (
            <article key={f.title} className="surface p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                <f.icon className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="list-heading" className="mt-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 id="list-heading" className="text-xl font-bold">
              Trainers on the platform
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every trainer signs up with the skills they train on and a resume for verification.
            </p>
          </div>
        </div>

        <div className="mt-4 max-w-sm space-y-2">
          <Label htmlFor="trainer-search">Search by name or skill</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="trainer-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="React, System Design, Priya…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-5">
          {trainers.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading trainers…</p>
          ) : trainers.isError ? (
            <p className="text-sm text-destructive">Couldn&apos;t load trainers.</p>
          ) : trainers.data && trainers.data.items.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trainers.data.items.map((t) => (
                <li key={t.id} className="surface flex flex-col gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold uppercase text-primary">
                      {t.name.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.resumeName ? "Resume on file" : "Trainer"}
                      </p>
                    </div>
                  </div>
                  {t.skills.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {t.skills.slice(0, 6).map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No skills listed yet.</p>
                  )}
                  <Button asChild size="sm" className="mt-auto">
                    <Link to="/consultations" search={{ trainerId: t.id }}>
                      Book consultation
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="surface p-8 text-center">
              <Users className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
              <p className="mt-3 text-sm text-muted-foreground">
                {search
                  ? "No trainer matches that search yet."
                  : "No trainers have joined yet. If you work in IT, create a trainer account with your skills and resume to start helping job seekers."}
              </p>
              <Button asChild className="mt-4">
                <Link to="/auth/register">Become a trainer</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
