import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Heart,
  MessageSquareQuote,
  Quote,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { relativeFromNow } from "@/lib/format";
import {
  TESTIMONIAL_OUTCOMES,
  type Testimonial,
  type TestimonialOutcome,
  type TestimonialTargetType,
} from "@/lib/api/types";
import {
  collectErrors,
  TESTIMONIAL_MAX,
  testimonialSchema,
  type FieldErrors,
} from "@/lib/validation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const OUTCOME_ICONS: Record<TestimonialOutcome, LucideIcon> = {
  "Got the job": Trophy,
  "Cleared the interview": CheckCircle2,
  "Better prepared": Sparkles,
};

function TargetLink({ t }: { t: Testimonial }) {
  if (!t.targetId) return <span>{t.targetLabel}</span>;
  const className = "font-medium text-primary underline-offset-4 hover:underline";
  return t.targetType === "Question" ? (
    <Link to="/questions/$questionId" params={{ questionId: t.targetId }} className={className}>
      {t.targetLabel}
    </Link>
  ) : (
    <Link to="/openings/$openingId" params={{ openingId: t.targetId }} className={className}>
      {t.targetLabel}
    </Link>
  );
}

export function TestimonialCard({
  testimonial: t,
  showTarget = true,
  className,
}: {
  testimonial: Testimonial;
  /** Hide the "helped by" line when the card already sits on that post's page. */
  showTarget?: boolean;
  className?: string;
}) {
  const OutcomeIcon = OUTCOME_ICONS[t.outcome] ?? Sparkles;
  return (
    <figure className={cn("surface flex h-full flex-col gap-3 p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className="gap-1">
          <OutcomeIcon className="h-3 w-3 text-primary" aria-hidden />
          {t.outcome}
        </Badge>
        <Quote className="h-5 w-5 text-primary/40" aria-hidden />
      </div>
      <blockquote className="flex-1 whitespace-pre-line text-sm leading-relaxed">
        {t.message}
      </blockquote>
      {showTarget && t.targetType !== "General" ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          Helped by {t.targetType === "Question" ? "the question" : "the opening"}{" "}
          <TargetLink t={t} />
        </p>
      ) : null}
      <figcaption className="flex items-center gap-2 border-t pt-3">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
          aria-hidden
        >
          {t.authorName.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{t.authorName}</span>
          <span className="block text-xs text-muted-foreground">{relativeFromNow(t.createdAt)}</span>
        </span>
      </figcaption>
    </figure>
  );
}

const EMPTY_STORY = { outcome: "", message: "" };

export function ShareStoryButton({
  targetType,
  targetId,
  label = "Share your story",
  ...buttonProps
}: {
  targetType: TestimonialTargetType;
  targetId?: string | undefined;
  label?: string;
} & Omit<ButtonProps, "asChild" | "onClick">) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY_STORY);
  const [errors, setErrors] = useState<FieldErrors>({});

  const share = useMutation({
    mutationFn: api.createTestimonial,
    onSuccess: () => {
      setOpen(false);
      setValues(EMPTY_STORY);
      toast.success("Thank you! Your story will appear once our team reviews it.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not share your story."),
  });

  if (!isAuthenticated) {
    return (
      <Button asChild {...buttonProps}>
        <Link to="/auth/login">Sign in to share your story</Link>
      </Button>
    );
  }

  const submit = () => {
    const parsed = testimonialSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    share.mutate({ targetType, ...(targetId ? { targetId } : {}), ...parsed.data });
  };

  const subject =
    targetType === "Question"
      ? "this question"
      : targetType === "Opening"
        ? "this opening"
        : "IntervuHub";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...buttonProps}>
          <Heart className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How did {subject} help you?</DialogTitle>
          <DialogDescription>
            Your story encourages other candidates and thanks the person who shared it. We show
            only your first name and last initial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">What happened?</legend>
            <RadioGroup
              value={values.outcome}
              onValueChange={(outcome) => setValues((v) => ({ ...v, outcome }))}
              className="grid gap-2 sm:grid-cols-3"
            >
              {TESTIMONIAL_OUTCOMES.map((o) => {
                const Icon = OUTCOME_ICONS[o];
                return (
                  <Label
                    key={o}
                    htmlFor={`outcome-${o}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-normal transition-colors hover:bg-secondary",
                      values.outcome === o && "border-primary bg-primary/10",
                    )}
                  >
                    <RadioGroupItem id={`outcome-${o}`} value={o} className="sr-only" />
                    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {o}
                  </Label>
                );
              })}
            </RadioGroup>
            {errors["outcome"] ? (
              <p role="alert" className="text-sm text-destructive">
                {errors["outcome"]}
              </p>
            ) : null}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="story-message">Your story</Label>
            <Textarea
              id="story-message"
              rows={5}
              maxLength={TESTIMONIAL_MAX}
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              placeholder="I was asked almost the same question in my second round. Practising it here helped me answer with confidence…"
            />
            <p className="text-xs text-muted-foreground">
              {values.message.length}/{TESTIMONIAL_MAX}
            </p>
            {errors["message"] ? (
              <p role="alert" className="text-sm text-destructive">
                {errors["message"]}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={share.isPending}>
            {share.isPending ? "Sharing…" : "Share story"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const POST_STORY_LIMIT = 6;

/** Approved stories about one question or opening, plus a way to add yours. */
export function PostTestimonials({
  targetType,
  targetId,
  isAuthor,
}: {
  targetType: "Question" | "Opening";
  targetId: string;
  isAuthor: boolean;
}) {
  const query = useQuery({
    queryKey: ["testimonials", targetType, targetId],
    queryFn: () => api.listTestimonials({ targetType, targetId, pageSize: POST_STORY_LIMIT }),
  });
  const data = query.data;
  const noun = targetType === "Question" ? "question" : "opening";

  return (
    <section aria-labelledby="stories-heading" className="surface mt-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="stories-heading" className="flex items-center gap-2 text-lg font-bold">
            <MessageSquareQuote className="h-5 w-5 text-primary" aria-hidden />
            Candidates this helped
            {data?.total ? <Badge variant="secondary">{data.total}</Badge> : null}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAuthor
              ? `Stories from people your ${noun} helped appear here after review.`
              : `Did this ${noun} help you in an interview? Let others know.`}
          </p>
        </div>
        {isAuthor ? null : (
          <ShareStoryButton targetType={targetType} targetId={targetId} size="sm" variant="outline" />
        )}
      </div>

      {data && data.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No stories yet.</p>
      ) : null}

      {data?.items.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {data.items.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} showTarget={false} />
          ))}
        </div>
      ) : null}

      {data && data.total > POST_STORY_LIMIT ? (
        <Button asChild variant="link" className="mt-2 px-0">
          <Link to="/testimonials">See all success stories</Link>
        </Button>
      ) : null}
    </section>
  );
}
