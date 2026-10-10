import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Filter,
  GraduationCap,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { relativeFromNow } from "@/lib/format";
import { FormattedText } from "@/components/formatted-text";
import { ShareStoryButton, TestimonialCard } from "@/components/testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IntervuHub — Real interview questions & live openings" },
      {
        name: "description",
        content:
          "Browse real interview questions by company, tech stack and experience level. Find 90-day interview openings shared by people who were in the room.",
      },
      { property: "og:title", content: "IntervuHub — Real interview questions & live openings" },
      {
        property: "og:description",
        content: "Search interview questions and short-lived openings, shared by job seekers.",
      },
    ],
  }),
  component: Home,
});

function StatValue({ loading, value }: { loading: boolean; value: number | undefined }) {
  return (
    <span className="font-display text-2xl font-bold">{loading ? "—" : (value ?? 0)}</span>
  );
}

function Home() {
  const { isAuthenticated } = useAuth();

  const questions = useQuery({
    queryKey: ["questions", "count"],
    queryFn: () => api.listQuestions({ pageSize: 1 }),
  });
  const openings = useQuery({
    queryKey: ["openings", "count"],
    queryFn: () => api.listOpenings({ pageSize: 1 }),
  });
  const trainers = useQuery({
    queryKey: ["trainers", "home"],
    queryFn: () => api.listTrainers({ pageSize: 8 }),
  });
  const latest = useQuery({
    queryKey: ["questions", "latest"],
    queryFn: () => api.listQuestions({ pageSize: 4 }),
  });
  const stories = useQuery({
    queryKey: ["testimonials", "home"],
    queryFn: () => api.listTestimonials({ pageSize: 3 }),
  });

  return (
    <div className="hero-gradient">
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              Real Questions. Real Interviews. Real Success.
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Prepare Smart.
              <br />
              Interview <span className="text-gradient-accent">Confident.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Explore real interview questions shared by candidates, discover short-lived interview
              openings, and know what gets asked before you walk in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/questions">
                  Explore Questions
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={isAuthenticated ? "/questions/new" : "/auth/register"}>
                  <MessagesSquare className="mr-2 h-4 w-4" aria-hidden />
                  Post a Question
                </Link>
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <MessagesSquare className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <dd>
                    <StatValue loading={questions.isLoading} value={questions.data?.total} />
                  </dd>
                  <dt className="text-xs text-muted-foreground">Questions</dt>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0">
                  <dd>
                    <StatValue loading={openings.isLoading} value={openings.data?.total} />
                  </dd>
                  <dt className="text-xs text-muted-foreground">Live openings</dt>
                </div>
              </div>
            </dl>
          </div>

          <div className="panel glow-ring relative min-w-0 p-5 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="surface p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <MessagesSquare className="h-4 w-4 text-primary" aria-hidden />
                  Interview Questions
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Filter by company, stack, seniority and round.
                </p>
              </article>
              <article className="surface p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Briefcase className="h-4 w-4 text-primary" aria-hidden />
                  Openings
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Community leads that auto-expire after 90 days.
                </p>
              </article>
              <article className="surface p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <GraduationCap className="h-4 w-4 text-primary" aria-hidden />
                  Trainers
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Book IT professionals to clear doubts and practice interviews.
                </p>
              </article>
              <article className="surface p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                  Moderated
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Report anything inaccurate — moderators review it.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="trainers-heading" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="panel p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <h2
              id="trainers-heading"
              className="flex min-w-0 items-center gap-2 text-base font-semibold"
            >
              <GraduationCap className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate">Trainers</span>
            </h2>
            <Link
              to="/trainers"
              className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Meet the trainers
            </Link>
          </div>

          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            Trainers are working IT professionals who explain interview questions, clear technical
            doubts and guide job seekers through preparation. Book a consultation when a question
            needs a proper conversation.
          </p>

          <div className="mt-4">
            {trainers.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading trainers…</p>
            ) : trainers.isError ? (
              <p className="text-sm text-destructive">Couldn&apos;t load trainers.</p>
            ) : trainers.data && trainers.data.items.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trainers.data.items.map((t) => (
                  <li key={t.id} className="surface flex items-center gap-3 p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold uppercase text-primary">
                      {t.name.slice(0, 2)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{t.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t.skills.length ? t.skills.slice(0, 3).join(", ") : "Trainer"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No trainers have joined yet — IT professionals can sign up as a trainer to explain
                questions and take consultations.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="sm">
              <Link to="/consultations">Book a consultation</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/trainers">What do trainers do?</Link>
            </Button>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="panel grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "Verified contributors",
              body: "Learn from real interview experiences, posted by verified accounts.",
            },
            {
              icon: Filter,
              title: "Smart search & filters",
              body: "Find questions by company, role, tech stack and round.",
            },
            {
              icon: Timer,
              title: "Latest openings",
              body: "Short-lived opportunities that expire after 90 days.",
            },
            {
              icon: Users,
              title: "Trusted & safe",
              body: "Moderated content with reporting on every item.",
            },
          ].map((f) => (
            <article key={f.title} className="min-w-0">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                <f.icon className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <h2 className="mt-3 text-sm font-semibold">{f.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="stories-heading" className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h2 id="stories-heading" className="min-w-0 truncate text-xl font-bold">
            <span className="mr-2 inline-block h-4 w-1 rounded bg-primary align-middle" />
            Success stories
            {stories.data?.total ? (
              <Badge variant="secondary" className="ml-2 align-middle">
                {stories.data.total}
              </Badge>
            ) : null}
          </h2>
          <Link
            to="/testimonials"
            className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Read all stories
          </Link>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Candidates share which questions and openings helped them crack their interviews.
        </p>

        {stories.data && stories.data.items.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {stories.data.items.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        ) : stories.isSuccess ? (
          <div className="surface mt-4 flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-muted-foreground">
              Did a question or opening here help you? Your story could encourage the next
              candidate.
            </p>
            <ShareStoryButton targetType="General" size="sm" />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="latest-heading" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h2 id="latest-heading" className="min-w-0 truncate text-xl font-bold">
            <span className="mr-2 inline-block h-4 w-1 rounded bg-primary align-middle" />
            Latest questions
          </h2>
          <Link
            to="/questions"
            className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all questions
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {latest.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading questions…</p>
          ) : latest.isError ? (
            <p className="text-sm text-destructive">Couldn&apos;t load questions.</p>
          ) : latest.data && latest.data.items.length > 0 ? (
            latest.data.items.map((q) => (
              <article key={q.id} className="surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{q.companyName}</Badge>
                  <Badge variant="outline">{q.round}</Badge>
                  <Badge variant="secondary">{q.experienceLevel}</Badge>
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-snug">
                  <Link
                    to="/questions/$questionId"
                    params={{ questionId: q.id }}
                    className="hover:underline"
                  >
                    <FormattedText text={q.questionText} preview />
                  </Link>
                </h3>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {relativeFromNow(q.createdAt)}
                </p>
              </article>
            ))
          ) : (
            <div className="surface p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing has been shared yet. Be the first to post a question you were asked.
              </p>
              <Button asChild className="mt-4">
                <Link to={isAuthenticated ? "/questions/new" : "/auth/register"}>
                  Post the first question
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
