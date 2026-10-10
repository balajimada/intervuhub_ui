import { useState } from "react";
import { toast } from "sonner";
import { EXPERIENCE_LEVELS, TECH_STACKS } from "@/lib/api/types";
import type { InterviewOpening } from "@/lib/api/types";
import type { OpeningInput } from "@/lib/api/store";
import {
  collectErrors,
  OPENING_NOTES_MAX,
  openingSchema,
  type FieldErrors,
} from "@/lib/validation";
import { CompanyPicker } from "@/components/company-picker";
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

function Err({ message }: { message?: string | undefined }) {
  return message ? (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  ) : null;
}

export function OpeningForm({
  initial,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
  onCancel,
}: {
  initial?: InterviewOpening;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (input: OpeningInput) => void;
  onCancel: () => void;
}) {
  const [company, setCompany] = useState<{ id: string; name: string } | null>(
    initial ? { id: initial.companyId, name: initial.companyName } : null,
  );
  const [techStack, setTechStack] = useState<string[]>(initial?.techStack ?? []);
  const [role, setRole] = useState(initial?.role ?? "");
  const [experienceLevel, setExperienceLevel] = useState<string>(initial?.experienceLevel ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [mode, setMode] = useState<string>(initial?.mode ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [sourceType, setSourceType] = useState<string>(initial?.sourceType ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = {
      companyId: company?.id ?? "",
      techStack,
      role,
      experienceLevel,
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(mode ? { mode } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(link.trim() ? { link: link.trim() } : {}),
      sourceType,
    };
    const parsed = openingSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="surface mt-6 space-y-5 p-6">
      <div className="space-y-2">
        <Label htmlFor="opening-company">Company</Label>
        <CompanyPicker id="opening-company" value={company} onChange={setCompany} />
        <Err message={errors["companyId"]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opening-role">Role / title</Label>
        <Input
          id="opening-role"
          value={role}
          maxLength={80}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Senior Backend Engineer"
          aria-invalid={!!errors["role"]}
        />
        <Err message={errors["role"]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opening-stack">Tech stack</Label>
        <MultiSelect
          id="opening-stack"
          options={TECH_STACKS}
          value={techStack}
          onChange={setTechStack}
          placeholder="Select up to 6"
        />
        <Err message={errors["techStack"]} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="opening-level">Experience level</Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger id="opening-level">
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
          <Err message={errors["experienceLevel"]} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="opening-source">Where is this from?</Label>
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger id="opening-source">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IWorkHere">I work here</SelectItem>
              <SelectItem value="KnownOpening">Known opening</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Other Job Board">Other Job Board</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Err message={errors["sourceType"]} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="opening-location">Location (optional)</Label>
          <Input
            id="opening-location"
            value={location}
            maxLength={80}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Bengaluru"
          />
          <Err message={errors["location"]} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="opening-mode">Work mode (optional)</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger id="opening-mode">
              <SelectValue placeholder="Not specified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Onsite">Onsite</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Err message={errors["mode"]} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opening-link">Application link (optional)</Label>
        <Input
          id="opening-link"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://careers.example.com/job/123"
          aria-invalid={!!errors["link"]}
        />
        <Err message={errors["link"]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opening-notes">Notes (optional)</Label>
        <Textarea
          id="opening-notes"
          rows={4}
          maxLength={OPENING_NOTES_MAX}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Referral available, hiring for 3 positions, interview rounds…"
        />
        <p className="text-xs text-muted-foreground">
          {notes.length}/{OPENING_NOTES_MAX}
        </p>
        <Err message={errors["notes"]} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
