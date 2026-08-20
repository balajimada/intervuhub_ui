import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { ReportTargetType } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReportButton({
  targetType,
  targetId,
  label = "Report",
}: {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const report = useMutation({
    mutationFn: () => api.report({ targetType, targetId, reason }),
    onSuccess: () => {
      setOpen(false);
      setReason("");
      toast.success("Report submitted. Our moderators will review it.");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not submit the report."),
  });

  const submit = () => {
    setError(null);
    if (reason.trim().length < 10) return setError("Please describe the issue (10+ characters).");
    if (reason.trim().length > 500) return setError("Keep the reason under 500 characters.");
    report.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {targetType.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Tell us what&apos;s wrong — spam, inaccurate content, or something offensive.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="report-reason">Reason</Label>
          <Textarea
            id="report-reason"
            rows={4}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the problem…"
          />
          <p className="text-xs text-muted-foreground">{reason.length}/500</p>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={report.isPending}>
            {report.isPending ? "Submitting…" : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
