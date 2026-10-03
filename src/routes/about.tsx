import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  CalendarCheck,
  Eye,
  GraduationCap,
  HeartHandshake,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About IntervuHub — real interview questions from real interviews" },
      {
        name: "description",
        content:
          "IntervuHub is a community platform where job seekers share real interview questions and openings, and working IT professionals help clear interview doubts.",
      },
      { property: "og:title", content: "About IntervuHub" },
      {
        property: "og:description",
        content:
          "Why we built IntervuHub, how it works, and what we stand for.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const OFFERINGS = [
  {
    icon: MessagesSquare,
    title: "Real interview questions",
    body: "Questions posted by people who sat in the interview, filterable by company, tech stack, experience level and round.",
  },
  {
    icon: Briefcase,
    title: "Fresh interview openings",
    body: "Openings shared by employees and the community. Every post expires after 60 days so the board stays current.",
  },
  {
    icon: GraduationCap,
    title: "Trainers who explain",
    body: "Working IT professionals who break down what a question is really testing and what a strong answer looks like.",
  },
  {
    icon: CalendarCheck,
    title: "One-to-one consultations",
    body: "Book a session with a trainer to clear a doubt, run a mock round or get your resume reviewed.",
  },
];

const ROLES = [
  {
    icon: Users,
    title: "Job seekers",
    points: [
      "Search interview questions by company and stack",
      "Post questions you were asked to help others",
      "Share openings you know about",
      "Book trainers and rate them after the session",
    ],
  },
  {
    icon: GraduationCap,
    title: "Trainers",
    points: [
      "Sign up with your skills and resume",
      "Accept consultation requests from job seekers",
      "Explain concepts and review answers",
      "Build your reputation through ratings",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Admins",
    points: [
      "Review reported questions, openings and companies",
      "Approve new companies added by the community",
      "Suspend or reactivate accounts that break the rules",
      "Keep the platform useful and safe",
    ],
  },
];

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Community first",
    body: "Everything here is shared by people helping the next candidate. Reading is free for everyone.",
  },
  {
    icon: Eye,
    title: "Honest and transparent",
    body: "Content comes from the community and is not verified by the companies mentioned. We say so clearly.",
  },
  {
    icon: Star,
    title: "Quality through feedback",
    body: "Ratings, reports and moderation keep trainers accountable and remove content that doesn't belong.",
  },
];

function AboutPage() {
  return (
    <div className="hero-gradient">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="panel glow-ring p-6 sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            About IntervuHub
          </span>
          <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
            Interview preparation built on <span className="text-gradient-accent">real experience</span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Most interview prep is guesswork: generic question lists, outdated blog posts and
            rumours about what a company asks. IntervuHub was built to change that. It is a
            community platform where job seekers share the exact questions they were asked, the
            openings they know about, and where working IT professionals step in to explain the
            parts that are hard to understand on your own.
          </p>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Our goal is simple: help every candidate walk into an interview knowing what to expect,
            and walk out confident.
          </p>
        </header>

        <section aria-labelledby="offer-heading" className="mt-12">
          <h2 id="offer-heading" className="text-xl font-bold sm:text-2xl">
            What IntervuHub offers
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OFFERINGS.map((o) => (
              <article key={o.title} className="surface p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                  <o.icon className="h-5 w-5 text-primary" aria-hidden />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{o.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{o.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="roles-heading" className="mt-12">
          <h2 id="roles-heading" className="text-xl font-bold sm:text-2xl">
            How it works for each role
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {ROLES.map((r) => (
              <article key={r.title} className="surface p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary">
                    <r.icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <h3 className="text-base font-semibold">{r.title}</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {r.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="values-heading" className="mt-12">
          <h2 id="values-heading" className="text-xl font-bold sm:text-2xl">
            What we stand for
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {VALUES.map((v) => (
              <article key={v.title} className="surface p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                  <v.icon className="h-5 w-5 text-primary" aria-hidden />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{v.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{v.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel mt-12 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="min-w-0">
            <h2 className="text-xl font-bold">Ready to prepare smarter?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse questions for free, or create an account to share and book trainers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/questions">Browse questions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth/register">Create account</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
