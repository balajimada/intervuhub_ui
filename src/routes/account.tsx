import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  GraduationCap,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UserCircle,
} from "lucide-react";
import { api } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { SUPPORT_EMAIL } from "@/lib/site";
import {
  changePasswordSchema,
  collectErrors,
  trainerProfileSchema,
  type FieldErrors,
} from "@/lib/validation";
import { RequireAuth } from "@/components/require-auth";
import {
  TrainerProfileFields,
  type TrainerProfileValues,
} from "@/components/trainer-profile-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Account settings — IntervuHub" }, { name: "robots", content: "noindex" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <RequireAuth>
        <AccountSettings />
      </RequireAuth>
    </div>
  );
}

function AccountSettings() {
  const { user, isAdmin } = useAuth();
  if (!user) return null;

  const details = [
    { icon: UserCircle, label: "Name", value: user.name },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Mobile", value: user.mobile },
  ];

  return (
    <>
      <header>
        <h1 className="text-3xl font-bold">Account settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your profile details and account options.
        </p>
      </header>

      <section aria-labelledby="profile-heading" className="surface mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="profile-heading" className="text-lg font-bold">
            Profile
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {user.role === "Admin" ? (
              <Badge variant="secondary">Admin</Badge>
            ) : (
              <>
                <Badge variant="secondary">Job seeker</Badge>
                {user.role === "Trainer" ? <Badge>Trainer</Badge> : null}
              </>
            )}
          </div>
        </div>
        <dl className="mt-4 space-y-3">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary">
                <d.icon className="h-4 w-4 text-primary" aria-hidden />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{d.label}</dt>
                <dd className="truncate text-sm font-medium">{d.value}</dd>
              </div>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Member since {formatDate(user.createdAt)}. To change these details, email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      {user.role === "Trainer" ? <TrainerProfileSection user={user} /> : null}
      {user.role === "JobSeeker" ? <BecomeTrainerSection /> : null}

      <ChangePasswordSection />

      {isAdmin ? (
        <section className="surface mt-6 flex items-start gap-3 p-6">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Admin accounts can&apos;t be deleted from this page, so the platform is never left
            without a moderator.
          </p>
        </section>
      ) : (
        <DeleteAccountSection isTrainer={user.role === "Trainer"} />
      )}
    </>
  );
}

function SectionHeading({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof KeyRound;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </span>
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-bold">
          {title}
        </h2>
        {children ? <div className="mt-1 text-sm text-muted-foreground">{children}</div> : null}
      </div>
    </div>
  );
}

function TrainerProfileSection({ user }: { user: User }) {
  return (
    <section aria-labelledby="trainer-heading" className="surface mt-6 p-6">
      <SectionHeading id="trainer-heading" icon={GraduationCap} title="Trainer profile">
        This is what job seekers see on the trainers page. Your trainer account also includes
        everything a job seeker can do.
      </SectionHeading>
      {user.skills?.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {user.skills.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>
      ) : null}
      <p className="mt-4 whitespace-pre-line text-sm">
        {user.profileSummary || "No profile summary yet."}
      </p>
    </section>
  );
}

const EMPTY_TRAINER_PROFILE: TrainerProfileValues = { skills: [], profileSummary: "", resumeName: "" };

function BecomeTrainerSection() {
  const { token, signIn } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY_TRAINER_PROFILE);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const upgrade = useMutation({
    mutationFn: () => api.becomeTrainer({ ...values, resumeFile }),
    onSuccess: (updated) => {
      if (token) signIn(token, updated);
      void queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast.success("You're now a trainer. Job seekers can find you on the trainers page.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not upgrade your account."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = trainerProfileSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    upgrade.mutate();
  };

  return (
    <section id="become-trainer" aria-labelledby="become-heading" className="surface mt-6 scroll-mt-28 p-6">
      <SectionHeading id="become-heading" icon={GraduationCap} title="Become a trainer">
        Work in IT? Help job seekers by explaining questions, running mock interviews and reviewing
        resumes. You keep everything you can do as a job seeker.
      </SectionHeading>

      {open ? (
        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-5">
          <TrainerProfileFields
            idPrefix="upgrade"
            value={values}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
            onResumeFile={setResumeFile}
            errors={errors}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={upgrade.isPending}>
              {upgrade.isPending ? "Upgrading…" : "Upgrade to trainer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={upgrade.isPending}
              onClick={() => {
                setOpen(false);
                setValues(EMPTY_TRAINER_PROFILE);
                setResumeFile(null);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button className="mt-4" variant="outline" onClick={() => setOpen(true)}>
          Set up my trainer profile
        </Button>
      )}
    </section>
  );
}

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };

function ChangePasswordSection() {
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState<FieldErrors>({});

  const change = useMutation({
    mutationFn: () =>
      api.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      setValues(EMPTY_PASSWORDS);
      toast.success("Password changed.");
    },
    onError: (e) => {
      const message = e instanceof Error ? e.message : "Could not change your password.";
      setErrors(/current/i.test(message) ? { currentPassword: message } : { newPassword: message });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    change.mutate();
  };

  const fields = [
    { key: "currentPassword", label: "Current password", autoComplete: "current-password" },
    { key: "newPassword", label: "New password", autoComplete: "new-password" },
    { key: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
  ] as const;

  return (
    <section aria-labelledby="password-heading" className="surface mt-6 p-6">
      <SectionHeading id="password-heading" icon={KeyRound} title="Change password" />
      <form onSubmit={onSubmit} noValidate className="mt-5 max-w-sm space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              type="password"
              autoComplete={f.autoComplete}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              aria-invalid={!!errors[f.key]}
            />
            {f.key === "newPassword" ? (
              <p className="text-xs text-muted-foreground">
                8+ characters with an uppercase letter, a lowercase letter and a number.
              </p>
            ) : null}
            {errors[f.key] ? <p className="text-sm text-destructive">{errors[f.key]}</p> : null}
          </div>
        ))}
        <Button type="submit" disabled={change.isPending}>
          {change.isPending ? "Saving…" : "Update password"}
        </Button>
      </form>
    </section>
  );
}

function DeleteAccountSection({ isTrainer }: { isTrainer: boolean }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const remove = useMutation({
    mutationFn: () => api.deleteAccount({ password }),
    onSuccess: () => {
      setOpen(false);
      queryClient.clear();
      signOut();
      toast.success("Your account has been deleted.");
      navigate({ to: "/", replace: true });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not delete your account."),
  });

  const consequences = [
    "Your name, email, mobile number and password are permanently removed.",
    ...(isTrainer ? ["Your resume file and listed skills are deleted."] : []),
    "Interview openings you posted are removed.",
    "Any requested or confirmed consultations are cancelled.",
    "Questions you posted stay on IntervuHub so others can still learn from them, but show “Deleted user” as the author.",
  ];

  const onOpenChange = (next: boolean) => {
    if (remove.isPending) return;
    setOpen(next);
    if (!next) {
      setPassword("");
      setError("");
    }
  };

  const onConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Enter your password to confirm.");
      return;
    }
    setError("");
    remove.mutate();
  };

  return (
    <section
      aria-labelledby="delete-heading"
      className="surface mt-6 border-destructive/40 p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="delete-heading" className="text-lg font-bold">
            Delete account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete your IntervuHub account. This can&apos;t be undone. Read how we
            handle deletion in our{" "}
            <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <Button variant="destructive" className="mt-4" onClick={() => setOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden />
            Delete my account
          </Button>
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <form onSubmit={onConfirm} noValidate className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>This is permanent. When you delete your account:</p>
                  <ul className="space-y-1.5">
                    {consequences.map((c) => (
                      <li key={c} className="flex gap-2">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"
                          aria-hidden
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2">
              <Label htmlFor="delete-password">Enter your password to confirm</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? "delete-password-error" : undefined}
              />
              {error ? (
                <p id="delete-password-error" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={remove.isPending}>
                Keep my account
              </AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={remove.isPending}>
                {remove.isPending ? "Deleting…" : "Delete permanently"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
