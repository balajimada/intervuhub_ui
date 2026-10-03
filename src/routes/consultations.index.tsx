import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarCheck,
  ClipboardList,
  Compass,
  FileText,
  MessageCircleQuestion,
  Presentation,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { CONSULTATION_MODES, CONSULTATION_TOPICS, type ConsultationMode } from "@/lib/api/types";
import { collectErrors, consultationSchema, ratingSchema, type FieldErrors } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/consultations/")({
  validateSearch: (search: Record<string, unknown>): { trainerId?: string } =>
    typeof search["trainerId"] === "string" && search["trainerId"]
      ? { trainerId: search["trainerId"] }
      : {},
  head: () => ({
    meta: [
      { title: "Consultations — book time with a trainer" },
      {
        name: "description",
        content:
          "Book a one-to-one consultation with an IntervuHub trainer to clear doubts on interview questions, system design, coding rounds, resumes and career moves.",
      },
      { property: "og:title", content: "Book a consultation on IntervuHub" },
      {
        property: "og:description",
        content: "One-to-one sessions with working IT professionals to clear your interview doubts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsultationsPage,
});

const WHY = [
  {
    icon: MessageCircleQuestion,
    title: "A question you didn't understand",
    body: "You read a question posted here and the answer still doesn't click. A trainer explains the concept, the expected depth and the follow-ups an interviewer would ask.",
  },
  {
    icon: Presentation,
    title: "System design and architecture",
    body: "Walk through a design problem out loud — trade-offs, scaling, data modelling — and find out where your reasoning loses the panel.",
  },
  {
    icon: ClipboardList,
    title: "Mock interview with feedback",
    body: "Run a full round the way the company runs it, then get direct feedback on what to fix before the real one.",
  },
  {
    icon: FileText,
    title: "Resume and profile review",
    body: "Get your resume read the way a shortlister reads it: what stands out, what gets skipped and what to rewrite.",
  },
  {
    icon: Compass,
    title: "Career and switch guidance",
    body: "Which stack to invest in, whether a switch makes sense now, how to pitch your experience for a higher band.",
  },
  {
    icon: CalendarCheck,
    title: "Offer and negotiation doubts",
    body: "Understand the offer structure, the expectations of the role and how to negotiate without losing it.",
  },
];

function ConsultationsPage() {
  const { trainerId } = Route.useSearch();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const trainers = useQuery({
    queryKey: ["trainers", "all"],
    queryFn: () => api.listTrainers({ pageSize: 100 }),
  });

  const bookings = useQuery({
    queryKey: ["consultations", "me"],
    queryFn: () => api.myConsultations(),
    enabled: isAuthenticated,
  });

  const [values, setValues] = useState({
    trainerId: trainerId ?? "",
    topic: "",
    details: "",
    mode: "Video call" as ConsultationMode,
    preferredDate: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const book = useMutation({
    mutationFn: (input: typeof values) => api.createConsultation(input),
    onSuccess: (res) => {
      toast.success(`Consultation requested with ${res.trainerName}.`, {
        description: "You'll see it below as soon as the trainer confirms.",
      });
      setValues({
        trainerId: "",
        topic: "",
        details: "",
        mode: "Video call",
        preferredDate: "",
      });
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not book the consultation."),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.cancelConsultation(id),
    onSuccess: () => {
      toast.success("Consultation cancelled.");
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not cancel."),
  });

  const complete = useMutation({
    mutationFn: (id: string) => api.completeConsultation(id),
    onSuccess: () => {
      toast.success("Consultation marked as completed.");
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not complete."),
  });

  const rate = useMutation({
    mutationFn: (input: { id: string; stars: number; comment?: string | undefined }) =>
      api.rateConsultation(input.id, { stars: input.stars, comment: input.comment }),
    onSuccess: () => {
      toast.success("Thanks for your feedback.");
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit rating."),
  });

  const [ratingDraft, setRatingDraft] = useState<Record<string, { stars: number; comment: string }>>({});

  const confirm = useMutation({
    mutationFn: (id: string) => api.confirmConsultation(id),
    onSuccess: () => {
      toast.success("Consultation confirmed.");
      void queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not confirm."),
  });

  const submitRating = (consultationId: string) => {
    const draft = ratingDraft[consultationId] ?? { stars: 5, comment: "" };
    const parsed = ratingSchema.safeParse(draft);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid rating.");
      return;
    }
    rate.mutate({
      id: consultationId,
      stars: parsed.data.stars,
      comment: parsed.data.comment,
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = consultationSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    book.mutate(values);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="panel p-6 sm:p-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Consultations — get your doubt cleared{" "}
          <span className="text-gradient-accent">properly</span>
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Reading questions gets you far, but some doubts need a conversation. A consultation is a
          scheduled one-to-one session with a trainer — a working IT professional — where you bring
          the exact thing you're stuck on and leave with a clear explanation and a next step. Pick
          what you want to clarify, describe it in your own words, choose a date and a trainer, and
          book.
        </p>
      </header>

      <section aria-labelledby="why-heading" className="mt-10">
        <h2 id="why-heading" className="text-xl font-bold">
          What people book a consultation for
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <article key={w.title} className="surface p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                <w.icon className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{w.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{w.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="book-heading" className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          <h2 id="book-heading" className="text-xl font-bold">
            Book a consultation
          </h2>

          {!isAuthenticated ? (
            <div className="surface mt-4 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Sign in to book a session with a trainer.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Button onClick={() => navigate({ to: "/auth/login" })}>Sign in</Button>
                <Button variant="outline" onClick={() => navigate({ to: "/auth/register" })}>
                  Create account
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="surface mt-4 space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="trainer">Trainer</Label>
                <Select
                  value={values.trainerId}
                  onValueChange={(v) => setValues({ ...values, trainerId: v })}
                >
                  <SelectTrigger id="trainer">
                    <SelectValue placeholder="Choose a trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(trainers.data?.items ?? []).filter((t) => t.id !== user?.id).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        {t.skills.length ? ` — ${t.skills.slice(0, 3).join(", ")}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {trainers.data && trainers.data.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No trainers have joined yet.{" "}
                    <Link to="/trainers" className="text-primary underline-offset-4 hover:underline">
                      See what trainers do
                    </Link>
                  </p>
                ) : null}
                {errors["trainerId"] ? (
                  <p className="text-sm text-destructive">{errors["trainerId"]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">What do you want to clarify?</Label>
                <Select
                  value={values.topic}
                  onValueChange={(v) => setValues({ ...values, topic: v })}
                >
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSULTATION_TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors["topic"] ? (
                  <p className="text-sm text-destructive">{errors["topic"]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Describe your doubt</Label>
                <Textarea
                  id="details"
                  rows={5}
                  value={values.details}
                  onChange={(e) => setValues({ ...values, details: e.target.value })}
                  placeholder="Example: I was asked how I'd design a rate limiter and I couldn't explain the trade-offs between token bucket and sliding window."
                />
                <p className="text-xs text-muted-foreground">
                  The more specific you are, the more useful the session is. 20–1000 characters.
                </p>
                {errors["details"] ? (
                  <p className="text-sm text-destructive">{errors["details"]}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mode">Mode</Label>
                  <Select
                    value={values.mode}
                    onValueChange={(v) => setValues({ ...values, mode: v as ConsultationMode })}
                  >
                    <SelectTrigger id="mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONSULTATION_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors["mode"] ? (
                    <p className="text-sm text-destructive">{errors["mode"]}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={values.preferredDate}
                    onChange={(e) => setValues({ ...values, preferredDate: e.target.value })}
                  />
                  {errors["preferredDate"] ? (
                    <p className="text-sm text-destructive">{errors["preferredDate"]}</p>
                  ) : null}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={book.isPending}>
                {book.isPending ? "Requesting…" : "Request consultation"}
              </Button>
            </form>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold">Your consultations</h2>
          <div className="mt-4 space-y-3">
            {!isAuthenticated ? (
              <p className="text-sm text-muted-foreground">
                Sign in to see the sessions you've requested.
              </p>
            ) : bookings.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading your consultations…</p>
            ) : bookings.isError ? (
              <p className="text-sm text-destructive">Couldn&apos;t load your consultations.</p>
            ) : bookings.data && bookings.data.length > 0 ? (
              bookings.data.map((c) => (
                <article key={c.id} className="surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{c.topic}</Badge>
                    <Badge variant="outline">{c.mode}</Badge>
                    <Badge variant="secondary">{c.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    With {c.trainerName} · {formatDate(c.preferredDate)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.details}</p>
                  {c.rating ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Rated {c.rating.stars}/5
                      {c.rating.comment ? ` — ${c.rating.comment}` : ""}
                    </p>
                  ) : null}
                  {c.status === "Requested" || c.status === "Confirmed" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.status === "Requested" && user?.id === c.trainerId ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirm.mutate(c.id)}
                          disabled={confirm.isPending}
                        >
                          Confirm
                        </Button>
                      ) : null}
                      {c.status === "Confirmed" && user?.id === c.trainerId ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => complete.mutate(c.id)}
                          disabled={complete.isPending}
                        >
                          Mark completed
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancel.mutate(c.id)}
                        disabled={cancel.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                  {c.status === "Completed" && user?.id === c.seekerId && !c.rating ? (
                    <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
                      <Label htmlFor={`stars-${c.id}`}>Rate this trainer</Label>
                      <Select
                        value={String(ratingDraft[c.id]?.stars ?? 5)}
                        onValueChange={(v) =>
                          setRatingDraft((prev) => ({
                            ...prev,
                            [c.id]: { stars: Number(v), comment: prev[c.id]?.comment ?? "" },
                          }))
                        }
                      >
                        <SelectTrigger id={`stars-${c.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} star{n === 1 ? "" : "s"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        rows={2}
                        placeholder="Optional feedback (what helped, what to improve)"
                        value={ratingDraft[c.id]?.comment ?? ""}
                        onChange={(e) =>
                          setRatingDraft((prev) => ({
                            ...prev,
                            [c.id]: { stars: prev[c.id]?.stars ?? 5, comment: e.target.value },
                          }))
                        }
                      />
                      <Button size="sm" onClick={() => submitRating(c.id)} disabled={rate.isPending}>
                        Submit rating
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="surface p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t booked a consultation yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
