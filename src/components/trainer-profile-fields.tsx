import { toast } from "sonner";
import { TECH_STACKS } from "@/lib/api/types";
import { PROFILE_SUMMARY_MAX, type FieldErrors } from "@/lib/validation";
import { MultiSelect } from "@/components/multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export interface TrainerProfileValues {
  skills: string[];
  profileSummary: string;
  resumeName: string;
}

export function TrainerProfileFields({
  value,
  onChange,
  onResumeFile,
  errors,
  idPrefix = "trainer",
}: {
  value: TrainerProfileValues;
  onChange: (patch: Partial<TrainerProfileValues>) => void;
  onResumeFile: (file: File | null) => void;
  errors: FieldErrors;
  idPrefix?: string;
}) {
  const ids = {
    skills: `${idPrefix}-skills`,
    summary: `${idPrefix}-summary`,
    resume: `${idPrefix}-resume`,
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={ids.skills}>Skills you train on</Label>
        <MultiSelect
          id={ids.skills}
          options={TECH_STACKS}
          value={value.skills}
          onChange={(skills) => onChange({ skills })}
          placeholder="Select your skills"
        />
        {errors["skills"] ? <p className="text-sm text-destructive">{errors["skills"]}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.summary}>Profile summary</Label>
        <Textarea
          id={ids.summary}
          rows={5}
          maxLength={PROFILE_SUMMARY_MAX}
          value={value.profileSummary}
          onChange={(e) => onChange({ profileSummary: e.target.value })}
          placeholder="Example: Senior Java developer with 8 years in banking projects. I take technical interviews at my company and can help with Spring Boot, microservices and system design rounds."
          aria-invalid={!!errors["profileSummary"]}
        />
        <div className="flex justify-between gap-3 text-xs text-muted-foreground">
          <span>Your experience, current role and what you can help job seekers with.</span>
          <span className="shrink-0 tabular-nums">
            {value.profileSummary.trim().length}/{PROFILE_SUMMARY_MAX}
          </span>
        </div>
        {errors["profileSummary"] ? (
          <p className="text-sm text-destructive">{errors["profileSummary"]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.resume}>Resume</Label>
        <Input
          id={ids.resume}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file && file.size > MAX_RESUME_BYTES) {
              toast.error("Resume must be under 5 MB.");
              e.target.value = "";
              onChange({ resumeName: "" });
              onResumeFile(null);
              return;
            }
            onChange({ resumeName: file?.name ?? "" });
            onResumeFile(file);
          }}
        />
        <p className="text-xs text-muted-foreground">PDF or Word document, up to 5 MB.</p>
        {value.resumeName ? (
          <p className="text-xs text-primary">Attached: {value.resumeName}</p>
        ) : null}
        {errors["resumeName"] ? (
          <p className="text-sm text-destructive">{errors["resumeName"]}</p>
        ) : null}
      </div>
    </div>
  );
}
