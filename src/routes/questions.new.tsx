import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { DIFFICULTIES, EXPERIENCE_LEVELS, ROUNDS, TECH_STACKS } from "@/lib/api/types";
import type { Difficulty, ExperienceLevel, InterviewRound } from "@/lib/api/types";
import { collectErrors, questionSchema, type FieldErrors } from "@/lib/validation";
import { MONTH_OPTIONS } from "@/lib/format";
import { CompanyPicker } from "@/components/company-picker";
import { MultiSelect } from "@/components/multi-select";
import { RequireAuth } from "@/components/require-auth";
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

export const Route = createFileRoute("/questions/new")({
  head: () => ({
    meta: [
      { title: "Share an interview question — IntervuHub" },
      {
        name: "description",
        content:
          "Post a question you were asked: company, tech stack, experience level, round, notes and difficulty.",
      },
      { property: "og:title", content: "Share an interview question — IntervuHub" },
      { property: "og:description", content: "Help the next candidate by sharing what got asked." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NewQuestionPage />
    </RequireAuth>
  ),
});

const YEARS = Array.from({ length: 11 }, (_, i) => String(new Date().getFullYear() - i));

function NewQuestionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [company, setCompany] = useState<{ id: string; name: string } | null>(null);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [role, setRole] = useState("");
  const [round, setRound] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const create = useMutation({
    mutationFn: (input: {
      companyId: string;
      techStack: string[];
      experienceLevel: ExperienceLevel;
      role: string;
      round: InterviewRound;
      questionText: string;
      notes?: string | undefined;
      difficulty?: Difficulty | undefined;
      interviewYear?: number | undefined;
      interviewMonth?: number | undefined;
    }) => api.createQuestion(input),
    onSuccess: (q) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question posted. Thanks for sharing!");
      navigate({ to: "/questions/$questionId", params: { questionId: q.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not post the question."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = {
      companyId: company?.id ?? "",
      techStack,
      experienceLevel,
      role,
      round,
      questionText,
      ...(notes.trim() ? { notes } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(year ? { interviewYear: Number(year) } : {}),
      ...(month ? { interviewMonth: Number(month) } : {}),
    };
    const parsed = questionSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    create.mutate(parsed.data);
  };

  const Err = ({ name }: { name: string }) =>
    errors[name] ? (
      <p role="alert" className="text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Share an interview question</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep it factual and avoid names or anything confidential.
      </p>

      <form onSubmit={onSubmit} noValidate className="surface mt-6 space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="q-company">Company</Label>
          <CompanyPicker id="q-company" value={company} onChange={setCompany} />
          <Err name="companyId" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="q-stack">Tech stack</Label>
          <MultiSelect
            id="q-stack"
            options={TECH_STACKS}
            value={techStack}
            onChange={setTechStack}
            placeholder="Select up to 6"
          />
          <Err name="techStack" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="q-level">Experience level</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger id="q-level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Err name="experienceLevel" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="q-round">Round</Label>
            <Select value={round} onValueChange={setRound}>
              <SelectTrigger id="q-round">
                <SelectValue placeholder="Select round" />
              </SelectTrigger>
              <SelectContent>
                {ROUNDS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Err name="round" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="q-role">Role / title</Label>
          <Input
            id="q-role"
            value={role}
            maxLength={80}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Backend Engineer"
          />
          <Err name="role" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="q-text">Question</Label>
          <Textarea
            id="q-text"
            rows={4}
            maxLength={1000}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="What exactly were you asked?"
          />
          <p className="text-xs text-muted-foreground">{questionText.length}/1000</p>
          <Err name="questionText" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="q-notes">Notes / answer hints (optional)</Label>
          <Textarea
            id="q-notes"
            rows={3}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{notes.length}/2000</p>
          <Err name="notes" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="q-difficulty">Difficulty (optional)</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="q-difficulty">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-year">Year (optional)</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="q-year">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Err name="interviewYear" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-month">Month (optional)</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="q-month">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? "Posting…" : "Post question"}
        </Button>
      </form>
    </div>
  );
}
