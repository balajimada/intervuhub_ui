import { useState } from "react";
import { toast } from "sonner";
import { DIFFICULTIES, EXPERIENCE_LEVELS, ROUNDS, TECH_STACKS } from "@/lib/api/types";
import type { InterviewQuestion } from "@/lib/api/types";
import type { QuestionInput } from "@/lib/api/store";
import {
  collectErrors,
  questionSchema,
  QUESTION_NOTES_MAX,
  QUESTION_TEXT_MAX,
  type FieldErrors,
} from "@/lib/validation";
import { MONTH_OPTIONS } from "@/lib/format";
import { CompanyPicker } from "@/components/company-picker";
import { FormattedText } from "@/components/formatted-text";
import { MultiSelect } from "@/components/multi-select";
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

const YEARS = Array.from({ length: 11 }, (_, i) => String(new Date().getFullYear() - i));

export function QuestionForm({
  initial,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
}: {
  initial?: InterviewQuestion;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (input: QuestionInput) => void;
}) {
  const [company, setCompany] = useState<{ id: string; name: string } | null>(
    initial ? { id: initial.companyId, name: initial.companyName } : null,
  );
  const [techStack, setTechStack] = useState<string[]>(initial?.techStack ?? []);
  const [experienceLevel, setExperienceLevel] = useState<string>(initial?.experienceLevel ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [round, setRound] = useState<string>(initial?.round ?? "");
  const [questionText, setQuestionText] = useState(initial?.questionText ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [difficulty, setDifficulty] = useState<string>(initial?.difficulty ?? "");
  const [year, setYear] = useState(initial?.interviewYear ? String(initial.interviewYear) : "");
  const [month, setMonth] = useState(initial?.interviewMonth ? String(initial.interviewMonth) : "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
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
    onSubmit(parsed.data);
  };

  const Err = ({ name }: { name: string }) =>
    errors[name] ? (
      <p role="alert" className="text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="surface mt-6 space-y-5 p-6">
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
          rows={6}
          maxLength={QUESTION_TEXT_MAX}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={"What exactly were you asked?\nFor several questions, number them: 1) … 2) … 3) …"}
        />
        <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
          <span>Line breaks and numbering like 1) 2) 3) are kept when shown.</span>
          <span>
            {questionText.length}/{QUESTION_TEXT_MAX}
          </span>
        </div>
        <Err name="questionText" />
        {questionText.trim() ? (
          <div className="rounded-md border bg-secondary/40 p-3 text-sm">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Preview</p>
            <FormattedText text={questionText} />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="q-notes">Notes / answer hints (optional)</Label>
        <Textarea
          id="q-notes"
          rows={3}
          maxLength={QUESTION_NOTES_MAX}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {notes.length}/{QUESTION_NOTES_MAX}
        </p>
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
