import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { collectErrors, loginSchema, type FieldErrors } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrandLogo } from "@/components/brand-logo";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — IntervuHub" },
      {
        name: "description",
        content:
          "Sign in to IntervuHub with your email or mobile number to post interview questions and openings.",
      },
      { property: "og:title", content: "Sign in — IntervuHub" },
      { property: "og:description", content: "Access your IntervuHub account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [values, setValues] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<{ title: string; body: string; pending?: boolean } | null>(
    null,
  );

  const submit = useMutation({
    mutationFn: (input: typeof values) => api.login(input),
    onSuccess: (res) => {
      signIn(res.token, res.user);
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}.`);
      navigate({ to: res.user.role === "Admin" ? "/admin" : "/questions" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Sign in failed.";
      const status = error instanceof ApiError ? error.status : 0;
      if (status === 403 && /verify/i.test(message))
        setNotice({
          title: "Your account isn't active yet",
          body: "Verify your email to continue.",
          pending: true,
        });
      else if (status === 403)
        setNotice({ title: "Account suspended", body: message });
      else setNotice({ title: "Incorrect credentials", body: message });
      toast.error(message);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    submit.mutate(parsed.data);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <Link to="/" aria-label="IntervuHub home">
          <BrandLogo className="h-32 w-32 sm:h-40 sm:w-40" />
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use your email or mobile number.</p>
      </div>


      {notice ? (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{notice.body}</p>
            {notice.pending ? (
              <Link
                to="/auth/verify"
                search={{
                  email: values.identifier.includes("@") ? values.identifier : "",
                }}
                className="font-medium underline underline-offset-4"
              >
                Verify your email now
              </Link>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="surface mt-6 space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or mobile</Label>
          <Input
            id="identifier"
            autoComplete="username"
            value={values.identifier}
            onChange={(e) => setValues({ ...values, identifier: e.target.value })}
            placeholder="you@example.com or +919876543210"
            aria-invalid={!!errors["identifier"]}
          />
          {errors["identifier"] ? (
            <p className="text-sm text-destructive">{errors["identifier"]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            aria-invalid={!!errors["password"]}
          />
          {errors["password"] ? (
            <p className="text-sm text-destructive">{errors["password"]}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={submit.isPending}>
          {submit.isPending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
