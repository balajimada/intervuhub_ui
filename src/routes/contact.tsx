import { createFileRoute, Link } from "@tanstack/react-router";
import { Flag, LifeBuoy, Mail, ShieldAlert, UserCog, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — IntervuHub" },
      {
        name: "description",
        content: `Get help with your IntervuHub account, report a problem or send feedback. Email ${SUPPORT_EMAIL}.`,
      },
      { property: "og:title", content: "Contact IntervuHub" },
    ],
  }),
  component: ContactPage,
});

const TOPICS = [
  {
    icon: UserCog,
    title: "Account and sign-in help",
    body: "Didn't get your verification code, can't sign in, or need to update your details.",
    subject: "Account help",
  },
  {
    icon: UserX,
    title: "Suspended account",
    body: "Think your account was suspended by mistake? Tell us your registered email and what happened.",
    subject: "Suspension review",
  },
  {
    icon: Flag,
    title: "Report content or a user",
    body: "Use the Report button on any question or opening. For urgent or serious issues, email us directly.",
    subject: "Content report",
  },
  {
    icon: ShieldAlert,
    title: "Privacy and data requests",
    body: "Ask for a copy of your data, a correction, or deletion of your account.",
    subject: "Privacy request",
  },
];

function mailto(subject: string) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`IntervuHub: ${subject}`)}`;
}

function ContactPage() {
  return (
    <div className="hero-gradient">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="panel glow-ring p-6 sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <LifeBuoy className="h-3.5 w-3.5 text-primary" aria-hidden />
            Support
          </span>
          <h1 className="mt-5 text-3xl font-bold sm:text-5xl">
            We&apos;re here to <span className="text-gradient-accent">help</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Questions, problems or feedback about IntervuHub — send us an email and we&apos;ll get
            back to you as soon as we can. Please write from the email address registered on your
            account so we can find it quickly.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href={mailto("Support")}
              className="surface inline-flex items-center gap-3 px-5 py-4 transition-colors hover:border-primary/50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary">
                <Mail className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">Support email</span>
                <span className="block font-semibold text-foreground">{SUPPORT_EMAIL}</span>
              </span>
            </a>
            <Button asChild size="lg">
              <a href={mailto("Support")}>Email us</a>
            </Button>
          </div>
        </header>

        <section aria-labelledby="topics-heading" className="mt-12">
          <h2 id="topics-heading" className="text-xl font-bold sm:text-2xl">
            What can we help with?
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {TOPICS.map((t) => (
              <article key={t.title} className="surface flex flex-col p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                  <t.icon className="h-5 w-5 text-primary" aria-hidden />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{t.title}</h3>
                <p className="mt-1 flex-1 text-xs text-muted-foreground">{t.body}</p>
                <a
                  href={mailto(t.subject)}
                  className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Email about this
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="panel mt-12 p-6 sm:p-8">
          <h2 className="text-lg font-bold">Before you write</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              Verification code not arriving? Check your spam folder, then use “Resend OTP” on the
              verify page.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              Never share your password or verification code — IntervuHub will never ask for them.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              See how we handle your data in our{" "}
              <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                Privacy Policy
              </Link>{" "}
              and the community rules in our{" "}
              <Link to="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                Terms of Use
              </Link>
              .
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
