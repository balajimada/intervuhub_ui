import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { EXPERIENCE_LEVELS, TECH_STACKS } from "@/lib/api/types";
import type { ExperienceLevel, SourceType } from "@/lib/api/types";
import { collectErrors, openingSchema, type FieldErrors } from "@/lib/validation";
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

export const Route = createFileRoute("/openings/new")({
  head: () => ({
    meta: [
      { title: "Share an interview opening — IntervuHub" },
      {
        name: "description",
        content:
          "Post a role you know is open: company, tech stack, experience level, location, mode and an optional link.",
      },
      { property: "og:title", content: "Share an interview opening — IntervuHub" },
      {
        property: "og:description",
        content: "Help someone land an interview by sharing an opening you know about.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NewOpeningPage />
    </RequireAuth>
  ),
});

function Err({ message }: { message?: string | undefined }) {
  return message ? (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  ) : null;
}

function NewOpeningPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [company, setCompany] = useState<{ id: string; name: string } | null>(null);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = useMutation({
    mutationFn: (input: {
      companyId: string;
      techStack: string[];
      role: string;
      experienceLevel: ExperienceLevel;
      location?: string;
      mode?: "Onsite" | "Hybrid" | "Remote";
      notes?: string;
      link?: string;
      sourceType: SourceType;
    }) => api.createOpening(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["openings"] });
      toast.success("Opening posted. It stays live for 60 days.");
      navigate({ to: "/openings/$openingId", params: { openingId: created.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not post the opening."),
  });

  const onSubmit = (e: React.FormEvent) => {
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
    submit.mutate(parsed.data as Parameters<typeof submit.mutate>[0]);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Post an interview opening</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Openings expire automatically after 60 days so the board stays fresh.
      </p>

      <form onSubmit={onSubmit} noValidate className="surface mt-6 space-y-5 p-6">
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
              </SelectContent>
            </Select>
            <Err message={errors["sourceType"]} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening-location">Location (optional)</Label>
            <Input
              id="opening-location"
              value={location}
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
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Referral available, hiring for 3 positions, interview rounds…"
          />
          <p className="text-xs text-muted-foreground">{notes.length}/1000</p>
          <Err message={errors["notes"]} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={submit.isPending}>
            {submit.isPending ? "Posting…" : "Post opening"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/openings" })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
