import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { collectErrors, registerSchema, type FieldErrors } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BrandLogo } from "@/components/brand-logo";
import { MultiSelect } from "@/components/multi-select";
import { TECH_STACKS } from "@/lib/api/types";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Create your IntervuHub account" },
      {
        name: "description",
        content:
          "Register with your mobile number to share interview questions and post interview openings on IntervuHub.",
      },
      { property: "og:title", content: "Create your IntervuHub account" },
      {
        property: "og:description",
        content: "Join IntervuHub to share real interview questions and openings.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    mobile: "+91",
    password: "",
    role: "JobSeeker" as "JobSeeker" | "Trainer",
    skills: [] as string[],
    resumeName: "" as string,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = useMutation({
    mutationFn: (input: typeof values) => api.register(input),
    onSuccess: (res) => {
      toast.success("Account created. Enter the code we sent to your mobile.", {
        description: `Verification code: ${res.devOtp}`,
        duration: 10000,
      });
      navigate({ to: "/auth/verify", search: { mobile: res.mobile } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Registration failed."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    submit.mutate(values);
  };

  const field = (key: keyof typeof values) => ({
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <Link to="/" aria-label="IntervuHub home">
          <BrandLogo className="h-32 w-32 sm:h-40 sm:w-40" />
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reading is free — an account lets you post questions and openings.
        </p>
      </div>


      <form onSubmit={onSubmit} noValidate className="surface mt-6 space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            placeholder="Your name"
            {...field("name")}
          />
          {errors["name"] ? (
            <p id="name-error" className="text-sm text-destructive">
              {errors["name"]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            placeholder="you@example.com"
            {...field("email")}
          />
          {errors["email"] ? (
            <p id="email-error" className="text-sm text-destructive">
              {errors["email"]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile number</Label>
          <Input
            id="mobile"
            inputMode="tel"
            value={values.mobile}
            onChange={(e) => setValues({ ...values, mobile: e.target.value })}
            placeholder="+919876543210"
            {...field("mobile")}
          />
          <p className="text-xs text-muted-foreground">E.164 format, e.g. +919876543210</p>
          {errors["mobile"] ? (
            <p id="mobile-error" className="text-sm text-destructive">
              {errors["mobile"]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            {...field("password")}
          />
          <p className="text-xs text-muted-foreground">
            8+ characters with an uppercase letter, a lowercase letter and a number.
          </p>
          {errors["password"] ? (
            <p id="password-error" className="text-sm text-destructive">
              {errors["password"]}
            </p>
          ) : null}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">I am a</legend>
          <RadioGroup
            value={values.role}
            onValueChange={(v) => setValues({ ...values, role: v as "JobSeeker" | "Trainer" })}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="role-jobseeker"
              className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm has-[:checked]:border-primary"
            >
              <RadioGroupItem id="role-jobseeker" value="JobSeeker" />
              Job seeker
            </Label>
            <Label
              htmlFor="role-trainer"
              className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm has-[:checked]:border-primary"
            >
              <RadioGroupItem id="role-trainer" value="Trainer" />
              Trainer
            </Label>
          </RadioGroup>
        </fieldset>

        {values.role === "Trainer" ? (
          <div className="space-y-5 rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">Trainer profile</p>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills you train on</Label>
              <MultiSelect
                id="skills"
                options={TECH_STACKS}
                value={values.skills}
                onChange={(skills) => setValues({ ...values, skills })}
                placeholder="Select your skills"
              />
              {errors["skills"] ? (
                <p className="text-sm text-destructive">{errors["skills"]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    setValues({ ...values, resumeName: "" });
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Resume must be under 5 MB.");
                    e.target.value = "";
                    setValues({ ...values, resumeName: "" });
                    return;
                  }
                  setValues({ ...values, resumeName: file.name });
                }}
              />
              <p className="text-xs text-muted-foreground">PDF or Word document, up to 5 MB.</p>
              {values.resumeName ? (
                <p className="text-xs text-primary">Attached: {values.resumeName}</p>
              ) : null}
              {errors["resumeName"] ? (
                <p className="text-sm text-destructive">{errors["resumeName"]}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={submit.isPending}>
          {submit.isPending ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="rounded-md bg-secondary p-3 text-xs text-muted-foreground">
          Moderator setup: registering with an address starting with <code>admin@</code> provisions
          an Admin account with access to the moderation console.
        </p>
      </form>
    </div>
  );
}
