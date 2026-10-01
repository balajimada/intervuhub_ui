import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { collectErrors, otpSchema, type FieldErrors } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { BrandLogo } from "@/components/brand-logo";

const COOLDOWN = 30;

export const Route = createFileRoute("/auth/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search["email"] === "string" ? search["email"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Verify your email — IntervuHub" },
      {
        name: "description",
        content: "Enter the 6-digit code sent to your email to activate your IntervuHub account.",
      },
      { property: "og:title", content: "Verify your email — IntervuHub" },
      { property: "og:description", content: "Activate your IntervuHub account with an OTP." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { email: initialEmail } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [cooldown, setCooldown] = useState(initialEmail ? COOLDOWN : 0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = useMutation({
    mutationFn: (input: { email: string; code: string }) => api.verifyOtp(input),
    onSuccess: () => {
      toast.success("Email verified. You can sign in now.");
      navigate({ to: "/auth/login" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Verification failed."),
  });

  const resend = useMutation({
    mutationFn: () => api.resendOtp({ email }),
    onSuccess: (res) => {
      setCooldown(COOLDOWN);
      toast.success("A new code is on its way.", {
        ...(res.devOtp ? { description: `Verification code: ${res.devOtp}`, duration: 10000 } : {}),
      });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not resend the code."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = otpSchema.safeParse({ email, code });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    verify.mutate(parsed.data);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <Link to="/" aria-label="IntervuHub home">
          <BrandLogo className="h-32 w-32 sm:h-40 sm:w-40" />
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to your email. Enter it below to activate your account.
        </p>
      </div>


      <form onSubmit={onSubmit} noValidate className="surface mt-6 space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="verify-email">Email</Label>
          <Input
            id="verify-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {errors["email"] ? <p className="text-sm text-destructive">{errors["email"]}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="verify-code">Verification code</Label>
          <InputOTP maxLength={6} value={code} onChange={setCode} id="verify-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {errors["code"] ? <p className="text-sm text-destructive">{errors["code"]}</p> : null}
        </div>

        <Button type="submit" className="w-full" disabled={verify.isPending}>
          {verify.isPending ? "Verifying…" : "Verify and activate"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={cooldown > 0 || resend.isPending}
          onClick={() => resend.mutate()}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend OTP"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link to="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
