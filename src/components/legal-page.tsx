import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { LEGAL_LAST_UPDATED, SUPPORT_EMAIL } from "@/lib/site";

export interface LegalSection {
  id: string;
  heading: string;
  body: ReactNode;
}

export function LegalPage({
  icon: Icon,
  eyebrow,
  title,
  intro,
  sections,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="panel p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
          {eyebrow}
        </span>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>
        <div className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base">{intro}</div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-28 space-y-2 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-4">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="surface scroll-mt-28 p-5 sm:p-6">
              <h2 className="text-lg font-bold">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-1.5">
                {s.body}
              </div>
            </section>
          ))}

          <p className="pt-2 text-sm text-muted-foreground">
            Questions about this page? Write to{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
