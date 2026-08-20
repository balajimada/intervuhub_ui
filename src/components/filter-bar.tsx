import { Filter, X } from "lucide-react";
import { CompanyPicker } from "@/components/company-picker";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPERIENCE_LEVELS, ROUNDS, TECH_STACKS } from "@/lib/api/types";

export interface Filters {
  company: { id: string; name: string } | null;
  techStack: string[];
  experienceLevel: string;
  role: string;
  round: string;
}

export const emptyFilters: Filters = {
  company: null,
  techStack: [],
  experienceLevel: "",
  role: "",
  round: "",
};

export function hasActiveFilters(f: Filters) {
  return !!(f.company || f.techStack.length || f.experienceLevel || f.role || f.round);
}

export function FilterBar({
  value,
  onChange,
  showRound = false,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
  showRound?: boolean;
}) {
  const set = <K extends keyof Filters>(key: K, v: Filters[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <section aria-label="Filters" className="@container surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          Refine
        </h2>
        {hasActiveFilters(value) ? (
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...emptyFilters })}>
            <X className="mr-1 h-3.5 w-3.5" aria-hidden />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @3xl:grid-cols-3 [&>div]:min-w-0">
        <div className="space-y-2">
          <Label htmlFor="filter-company">Company</Label>
          <CompanyPicker
            id="filter-company"
            value={value.company}
            onChange={(c) => set("company", c)}
            allowCreate={false}
            placeholder="Any company"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-stack">Tech stack</Label>
          <MultiSelect
            id="filter-stack"
            options={TECH_STACKS}
            value={value.techStack}
            onChange={(v) => set("techStack", v)}
            placeholder="Any stack"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-level">Experience level</Label>
          <Select
            value={value.experienceLevel || "any"}
            onValueChange={(v) => set("experienceLevel", v === "any" ? "" : v)}
          >
            <SelectTrigger id="filter-level">
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any level</SelectItem>
              {EXPERIENCE_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-role">Role / title</Label>
          <Input
            id="filter-role"
            value={value.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="e.g. Backend Engineer"
          />
        </div>

        {showRound ? (
          <div className="space-y-2">
            <Label htmlFor="filter-round">Round</Label>
            <Select
              value={value.round || "any"}
              onValueChange={(v) => set("round", v === "any" ? "" : v)}
            >
              <SelectTrigger id="filter-round">
                <SelectValue placeholder="Any round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any round</SelectItem>
                {ROUNDS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
    </section>
  );
}
