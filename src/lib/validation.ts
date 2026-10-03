import { z } from "zod";

export const E164_INDIA = /^\+91[6-9]\d{9}$/;

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64, "Password must be under 64 characters.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/\d/, "Include at least one number.");

export const PROFILE_SUMMARY_MIN = 30;
export const PROFILE_SUMMARY_MAX = 1000;

export const trainerProfileSchema = z.object({
  skills: z
    .array(z.string())
    .min(1, "Select at least one skill you train on.")
    .max(10, "Pick up to 10 skills."),
  profileSummary: z
    .string()
    .trim()
    .min(PROFILE_SUMMARY_MIN, `Write at least ${PROFILE_SUMMARY_MIN} characters about your experience.`)
    .max(PROFILE_SUMMARY_MAX, `Keep it under ${PROFILE_SUMMARY_MAX} characters.`),
  resumeName: z.string().trim().min(1, "Upload your resume (PDF or DOC, up to 5 MB).").max(200),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long."),
    email: z.string().trim().email("Enter a valid email address.").max(255),
    mobile: z
      .string()
      .trim()
      .regex(E164_INDIA, "Enter a valid Indian mobile in E.164 format, e.g. +919876543210."),
    password: passwordSchema,
    role: z.enum(["JobSeeker", "Trainer"]),
    skills: z.array(z.string()).default([]),
    profileSummary: z.string().default(""),
    resumeName: z.string().default(""),
  })
  .superRefine((v, ctx) => {
    if (v.role !== "Trainer") return;
    const trainer = trainerProfileSchema.safeParse(v);
    if (!trainer.success) trainer.error.issues.forEach((issue) => ctx.addIssue(issue));
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current one.",
  });

export const consultationSchema = z.object({
  trainerId: z.string().min(1, "Pick a trainer."),
  topic: z.string().min(1, "Choose what you want help with."),
  details: z
    .string()
    .trim()
    .min(20, "Describe your doubt in at least 20 characters.")
    .max(1000, "Keep it under 1000 characters."),
  mode: z.enum(["Video call", "Phone call", "Chat"], {
    errorMap: () => ({ message: "Choose how you want to meet." }),
  }),
  preferredDate: z.string().min(1, "Pick a preferred date."),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your email or mobile number."),
  password: z.string().min(1, "Enter your password."),
});

export const otpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const ratingSchema = z.object({
  stars: z.number().int().min(1, "Pick at least 1 star.").max(5, "Maximum 5 stars."),
  comment: z.string().trim().max(500, "Keep feedback under 500 characters.").optional(),
});

export const questionSchema = z.object({
  companyId: z.string().min(1, "Pick a company."),
  techStack: z.array(z.string()).min(1, "Select at least one tech stack.").max(6, "Pick up to 6."),
  experienceLevel: z.enum(["Fresher", "Junior", "Senior", "Architect"], {
    errorMap: () => ({ message: "Select an experience level." }),
  }),
  role: z.string().trim().min(2, "Role must be at least 2 characters.").max(80, "Role is too long."),
  round: z.enum(["Screening", "Technical", "Coding", "System Design", "Managerial", "HR"], {
    errorMap: () => ({ message: "Select the interview round." }),
  }),
  questionText: z
    .string()
    .trim()
    .min(15, "Question must be at least 15 characters.")
    .max(1000, "Question must be under 1000 characters."),
  notes: z.string().trim().max(2000, "Notes must be under 2000 characters.").optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  interviewYear: z
    .number()
    .int()
    .min(2015, "Year looks too far back.")
    .max(new Date().getFullYear(), "Year can't be in the future.")
    .optional(),
  interviewMonth: z.number().int().min(1).max(12).optional(),
});

export const openingSchema = z.object({
  companyId: z.string().min(1, "Pick a company."),
  techStack: z.array(z.string()).min(1, "Select at least one tech stack.").max(6, "Pick up to 6."),
  role: z.string().trim().min(2, "Role must be at least 2 characters.").max(80, "Role is too long."),
  experienceLevel: z.enum(["Fresher", "Junior", "Senior", "Architect"], {
    errorMap: () => ({ message: "Select an experience level." }),
  }),
  location: z.string().trim().max(80, "Location is too long.").optional(),
  mode: z.enum(["Onsite", "Hybrid", "Remote"]).optional(),
  notes: z.string().trim().max(1000, "Notes must be under 1000 characters.").optional(),
  link: z.string().trim().url("Enter a valid URL (including https://).").max(300).optional(),
  sourceType: z.enum(["IWorkHere", "KnownOpening"], {
    errorMap: () => ({ message: "Select where this came from." }),
  }),
});

export const suspendSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Give a reason of at least 10 characters.")
    .max(300, "Keep the reason under 300 characters."),
  permanent: z.boolean(),
  suspendedUntil: z.string().optional(),
});

export type FieldErrors = Record<string, string>;

export function collectErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
