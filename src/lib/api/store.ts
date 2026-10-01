import type {
  AuthResponse,
  Company,
  Consultation,
  ConsultationMode,
  Trainer,
  ContentReport,
  InterviewOpening,
  InterviewQuestion,
  Paged,
  ReportTargetType,
  User,
} from "./types";

/**
 * Local persistence layer that stands in for the IntervuHub REST API while the
 * real service is not wired up. Every handler mirrors the documented contract
 * (method + path + payload), so `client.ts` can be pointed at a live base URL
 * without touching any screen code.
 */

const NS = "intervuhub.v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface StoredUser extends User {
  password: string;
  otp?: string | undefined;
  otpSentAt?: string | undefined;
  skills?: string[] | undefined;
  resumeName?: string | undefined;
}

interface Db {
  users: StoredUser[];
  companies: Company[];
  questions: InterviewQuestion[];
  openings: InterviewOpening[];
  reports: ContentReport[];
  consultations: Consultation[];
}

const EMPTY: Db = {
  users: [],
  companies: [],
  questions: [],
  openings: [],
  reports: [],
  consultations: [],
};

function hasStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read(): Db {
  if (!hasStorage()) return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(NS);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Db>) };
  } catch {
    return { ...EMPTY };
  }
}

function write(db: Db) {
  if (!hasStorage()) return;
  window.localStorage.setItem(NS, JSON.stringify(db));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function now() {
  return new Date().toISOString();
}

function publicUser(u: StoredUser): User {
  const {
    password: _password,
    otp: _otp,
    otpSentAt: _otpSentAt,
    skills: _skills,
    resumeName: _resumeName,
    ...rest
  } = u;
  return rest;
}

function encodeToken(userId: string) {
  return btoa(JSON.stringify({ sub: userId, iat: Date.now() }));
}

export function decodeToken(token: string): string | null {
  try {
    return (JSON.parse(atob(token)) as { sub: string }).sub;
  } catch {
    return null;
  }
}

function requireUser(token?: string | null): StoredUser {
  const db = read();
  const id = token ? decodeToken(token) : null;
  const user = id ? db.users.find((u) => u.id === id) : undefined;
  if (!user) throw new ApiError(401, "Your session has expired. Please sign in again.");
  if (user.status === "Suspended") throw new ApiError(403, "Your account is suspended.");
  if (user.status !== "Active") throw new ApiError(403, "Verify your email to continue.");
  return user;
}

function requireAdmin(token?: string | null): StoredUser {
  const user = requireUser(token);
  if (user.role !== "Admin") throw new ApiError(403, "Admin access is required for this action.");
  return user;
}

function paginate<T>(items: T[], page: number, pageSize: number): Paged<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const OTP_COOLDOWN_SECONDS = 30;

function normalizeMobile(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits.replace(/^0+/, "")}`;
}

function findByMobile(users: StoredUser[], mobile: string) {
  const target = normalizeMobile(mobile);
  return users.find((u) => u.mobile === mobile.trim() || (!!target && normalizeMobile(u.mobile) === target));
}

/* ------------------------------------------------------------------ auth */

export function register(input: {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: "JobSeeker" | "Trainer";
  skills?: string[];
  resumeName?: string;
}) {
  const db = read();
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase()))
    throw new ApiError(409, "An account with this email already exists.");
  if (db.users.some((u) => u.mobile === input.mobile))
    throw new ApiError(409, "An account with this mobile number already exists.");

  // Convenience rule for this build: an "admin…@" local part provisions the Admin console.
  const role = /^admin([+._-][^@]*)?@/i.test(input.email.trim()) ? "Admin" : input.role;
  const otp = genOtp();
  const user: StoredUser = {
    id: uid(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    mobile: input.mobile.trim(),
    password: input.password,
    role,
    status: "PendingActivation",
    createdAt: now(),
    otp,
    otpSentAt: now(),
    ...(input.role === "Trainer"
      ? { skills: input.skills ?? [], resumeName: input.resumeName }
      : {}),
  };
  db.users.push(user);
  write(db);
  return { email: user.email, devOtp: otp };
}

export function verifyOtp(input: { email: string; code: string }) {
  const db = read();
  const user = db.users.find((u) => u.email.toLowerCase() === input.email.trim().toLowerCase());
  if (!user) throw new ApiError(404, "No account found for this email.");
  if (user.status === "Active") return { status: "Active" as const };
  if (user.otp !== input.code.trim()) throw new ApiError(400, "That code is not correct.");
  user.status = "Active";
  user.otp = undefined;
  write(db);
  return { status: "Active" as const };
}

export function resendOtp(input: { email: string }) {
  const db = read();
  const user = db.users.find((u) => u.email.toLowerCase() === input.email.trim().toLowerCase());
  if (!user) throw new ApiError(404, "No account found for this email.");
  if (user.otpSentAt) {
    const elapsed = (Date.now() - new Date(user.otpSentAt).getTime()) / 1000;
    if (elapsed < OTP_COOLDOWN_SECONDS)
      throw new ApiError(
        429,
        `Please wait ${Math.ceil(OTP_COOLDOWN_SECONDS - elapsed)}s before requesting a new code.`,
      );
  }
  user.otp = genOtp();
  user.otpSentAt = now();
  write(db);
  return { devOtp: user.otp };
}


export function login(input: { identifier: string; password: string }): AuthResponse {
  const db = read();
  const raw = input.identifier.trim();
  const id = raw.toLowerCase();
  const mobile = normalizeMobile(raw);
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === id ||
      u.mobile === raw ||
      (!!mobile && normalizeMobile(u.mobile) === mobile),
  );
  if (!user || user.password !== input.password)
    throw new ApiError(401, "Incorrect credentials. Check your email/mobile and password.");
  if (user.status === "PendingActivation")
    throw new ApiError(403, "Verify your email to continue.");
  if (user.status === "Suspended")
    throw new ApiError(
      403,
      user.suspensionReason
        ? `Your account is suspended: ${user.suspensionReason}`
        : "Your account is suspended.",
    );
  return { token: encodeToken(user.id), user: publicUser(user) };
}

export function me(token: string): User {
  const db = read();
  const id = decodeToken(token);
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError(401, "Session expired.");
  return publicUser(user);
}

/* ------------------------------------------------------------- companies */

export function listCompanies(q: {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const db = read();
  let items = db.companies.filter((c) => c.status !== "Rejected");
  if (q.search) {
    const s = q.search.toLowerCase();
    items = items.filter(
      (c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s),
    );
  }
  if (typeof q.isActive === "boolean") items = items.filter((c) => c.isActive === q.isActive);
  items = items.sort((a, b) => a.name.localeCompare(b.name));
  return paginate(items, q.page ?? 1, q.pageSize ?? 20);
}

export function getCompany(id: string) {
  const c = read().companies.find((x) => x.id === id);
  if (!c) throw new ApiError(404, "Company not found.");
  return c;
}

export function createCompany(token: string | null, input: { name: string; code: string }) {
  const user = requireUser(token);
  const db = read();
  if (db.companies.some((c) => c.code.toLowerCase() === input.code.trim().toLowerCase()))
    throw new ApiError(409, "A company with this code already exists.");
  const company: Company = {
    id: uid(),
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    isActive: true,
    status: user.role === "Admin" ? "Approved" : "Pending",
    createdAt: now(),
    createdByName: user.name,
  };
  db.companies.push(company);
  write(db);
  return company;
}

/* ------------------------------------------------------------- questions */

export interface QuestionFilters {
  companyId?: string;
  techStack?: string[];
  experienceLevel?: string;
  role?: string;
  round?: string;
  page?: number;
  pageSize?: number;
}

export function listQuestions(f: QuestionFilters) {
  const db = read();
  let items = db.questions.filter((q) => !q.isHidden);
  if (f.companyId) items = items.filter((q) => q.companyId === f.companyId);
  if (f.techStack?.length)
    items = items.filter((q) => f.techStack!.every((t) => q.techStack.includes(t)));
  if (f.experienceLevel) items = items.filter((q) => q.experienceLevel === f.experienceLevel);
  if (f.role) items = items.filter((q) => q.role.toLowerCase().includes(f.role!.toLowerCase()));
  if (f.round) items = items.filter((q) => q.round === f.round);
  items = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(items, f.page ?? 1, f.pageSize ?? 10);
}

export function getQuestion(id: string) {
  const q = read().questions.find((x) => x.id === id);
  if (!q || q.isHidden) throw new ApiError(404, "Question not found.");
  return q;
}

export function createQuestion(
  token: string | null,
  input: Omit<
    InterviewQuestion,
    "id" | "createdAt" | "authorId" | "authorName" | "isHidden" | "companyName"
  >,
) {
  const user = requireUser(token);
  const db = read();
  const company = db.companies.find((c) => c.id === input.companyId);
  if (!company) throw new ApiError(400, "Select a valid company.");
  const question: InterviewQuestion = {
    ...input,
    id: uid(),
    companyName: company.name,
    isHidden: false,
    createdAt: now(),
    authorId: user.id,
    authorName: user.name,
  };
  db.questions.push(question);
  write(db);
  return question;
}

/* -------------------------------------------------------------- openings */

export interface OpeningFilters {
  companyId?: string;
  techStack?: string[];
  experienceLevel?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}

export function listOpenings(f: OpeningFilters) {
  const db = read();
  const ts = Date.now();
  let items = db.openings.filter((o) => new Date(o.expiresAt).getTime() > ts);
  if (f.companyId) items = items.filter((o) => o.companyId === f.companyId);
  if (f.techStack?.length)
    items = items.filter((o) => f.techStack!.every((t) => o.techStack.includes(t)));
  if (f.experienceLevel) items = items.filter((o) => o.experienceLevel === f.experienceLevel);
  if (f.role) items = items.filter((o) => o.role.toLowerCase().includes(f.role!.toLowerCase()));
  items = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(items, f.page ?? 1, f.pageSize ?? 10);
}

export function getOpening(id: string) {
  const o = read().openings.find((x) => x.id === id);
  if (!o) throw new ApiError(404, "Opening not found.");
  if (new Date(o.expiresAt).getTime() <= Date.now())
    throw new ApiError(404, "This opening has expired.");
  return o;
}

export function createOpening(
  token: string | null,
  input: Omit<
    InterviewOpening,
    "id" | "createdAt" | "expiresAt" | "authorId" | "authorName" | "companyName"
  >,
) {
  const user = requireUser(token);
  const db = read();
  const company = db.companies.find((c) => c.id === input.companyId);
  if (!company) throw new ApiError(400, "Select a valid company.");
  const created = new Date();
  const opening: InterviewOpening = {
    ...input,
    id: uid(),
    companyName: company.name,
    createdAt: created.toISOString(),
    expiresAt: new Date(created.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: user.id,
    authorName: user.name,
  };
  db.openings.push(opening);
  write(db);
  return opening;
}

export function deleteOpening(token: string | null, id: string) {
  const user = requireUser(token);
  const db = read();
  const opening = db.openings.find((o) => o.id === id);
  if (!opening) throw new ApiError(404, "Opening not found.");
  if (opening.authorId !== user.id && user.role !== "Admin")
    throw new ApiError(403, "You can only delete openings you posted.");
  db.openings = db.openings.filter((o) => o.id !== id);
  write(db);
  return { deleted: true };
}

/* --------------------------------------------------------------- reports */

export function createReport(
  token: string | null,
  input: { targetType: ReportTargetType; targetId: string; reason: string },
) {
  const db = read();
  const id = token ? decodeToken(token) : null;
  const reporter = id ? db.users.find((u) => u.id === id) : undefined;

  let label = input.targetId;
  if (input.targetType === "Question")
    label = db.questions.find((q) => q.id === input.targetId)?.questionText ?? label;
  if (input.targetType === "Opening") {
    const o = db.openings.find((x) => x.id === input.targetId);
    if (o) label = `${o.role} @ ${o.companyName}`;
  }
  if (input.targetType === "Company")
    label = db.companies.find((c) => c.id === input.targetId)?.name ?? label;
  if (input.targetType === "User")
    label = db.users.find((u) => u.id === input.targetId)?.name ?? label;

  const report: ContentReport = {
    id: uid(),
    targetType: input.targetType,
    targetId: input.targetId,
    targetLabel: label,
    reason: input.reason.trim(),
    status: "Open",
    createdAt: now(),
    reportedByName: reporter?.name ?? "Anonymous",
  };
  db.reports.push(report);
  write(db);
  return report;
}

/* ----------------------------------------------------------------- admin */

export function listReports(token: string | null, status?: "Open" | "Resolved") {
  requireAdmin(token);
  const db = read();
  return db.reports
    .filter((r) => (status ? r.status === status : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function resolveReport(token: string | null, id: string) {
  requireAdmin(token);
  const db = read();
  const r = db.reports.find((x) => x.id === id);
  if (!r) throw new ApiError(404, "Report not found.");
  r.status = "Resolved";
  write(db);
  return r;
}

export function listUsers(token: string | null, search?: string) {
  requireAdmin(token);
  const db = read();
  const s = (search ?? "").toLowerCase();
  return db.users
    .filter(
      (u) =>
        !s ||
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.mobile.includes(s),
    )
    .map(publicUser)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function suspendUser(
  token: string | null,
  id: string,
  input: { reason: string; suspendedUntil?: string | null },
) {
  requireAdmin(token);
  const db = read();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError(404, "User not found.");
  if (user.role === "Admin") throw new ApiError(403, "Admin accounts cannot be suspended.");
  user.status = "Suspended";
  user.suspensionReason = input.reason;
  user.suspendedUntil = input.suspendedUntil ?? null;
  write(db);
  return publicUser(user);
}

export function reactivateUser(token: string | null, id: string) {
  requireAdmin(token);
  const db = read();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new ApiError(404, "User not found.");
  user.status = "Active";
  user.suspensionReason = undefined;
  user.suspendedUntil = null;
  write(db);
  return publicUser(user);
}

export function setCompanyApproval(token: string | null, id: string, approved: boolean) {
  requireAdmin(token);
  const db = read();
  const c = db.companies.find((x) => x.id === id);
  if (!c) throw new ApiError(404, "Company not found.");
  c.status = approved ? "Approved" : "Rejected";
  c.isActive = approved;
  write(db);
  return c;
}

export function setQuestionHidden(token: string | null, id: string, hidden: boolean) {
  requireAdmin(token);
  const db = read();
  const q = db.questions.find((x) => x.id === id);
  if (!q) throw new ApiError(404, "Question not found.");
  q.isHidden = hidden;
  write(db);
  return q;
}

export function adminListCompanies(token: string | null) {
  requireAdmin(token);
  return read().companies.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function adminGetQuestion(token: string | null, id: string) {
  requireAdmin(token);
  return read().questions.find((q) => q.id === id) ?? null;
}

/* -------------------------------------------------- trainers & consults */

export function listTrainers(q: { search?: string; skills?: string[]; page?: number; pageSize?: number }) {
  const db = read();
  let items: Trainer[] = db.users
    .filter((u) => u.role === "Trainer" && u.status === "Active")
    .map((u) => ({
      id: u.id,
      name: u.name,
      skills: u.skills ?? [],
      resumeName: u.resumeName,
      createdAt: u.createdAt,
    }));
  if (q.search) {
    const s = q.search.toLowerCase();
    items = items.filter(
      (t) => t.name.toLowerCase().includes(s) || t.skills.some((k) => k.toLowerCase().includes(s)),
    );
  }
  if (q.skills?.length) items = items.filter((t) => q.skills!.every((k) => t.skills.includes(k)));
  items = items.sort((a, b) => a.name.localeCompare(b.name));
  return paginate(items, q.page ?? 1, q.pageSize ?? 12);
}

export function getTrainer(id: string): Trainer {
  const u = read().users.find((x) => x.id === id && x.role === "Trainer");
  if (!u) throw new ApiError(404, "Trainer not found.");
  return {
    id: u.id,
    name: u.name,
    skills: u.skills ?? [],
    resumeName: u.resumeName,
    createdAt: u.createdAt,
  };
}

export function createConsultation(
  token: string | null,
  input: {
    trainerId: string;
    topic: string;
    details: string;
    mode: ConsultationMode;
    preferredDate: string;
  },
): Consultation {
  const user = requireUser(token);
  const db = read();
  const trainer = db.users.find((u) => u.id === input.trainerId && u.role === "Trainer");
  if (!trainer) throw new ApiError(400, "Select a trainer to book with.");
  const booking: Consultation = {
    id: uid(),
    trainerId: trainer.id,
    trainerName: trainer.name,
    seekerId: user.id,
    seekerName: user.name,
    topic: input.topic,
    details: input.details.trim(),
    mode: input.mode,
    preferredDate: input.preferredDate,
    status: "Requested",
    createdAt: now(),
  };
  db.consultations.push(booking);
  write(db);
  return booking;
}

export function listMyConsultations(token: string | null): Consultation[] {
  const user = requireUser(token);
  return read()
    .consultations.filter((c) => c.seekerId === user.id || c.trainerId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function cancelConsultation(token: string | null, id: string) {
  const user = requireUser(token);
  const db = read();
  const booking = db.consultations.find((c) => c.id === id);
  if (!booking) throw new ApiError(404, "Consultation not found.");
  if (booking.seekerId !== user.id && booking.trainerId !== user.id && user.role !== "Admin")
    throw new ApiError(403, "You can only cancel your own consultations.");
  booking.status = "Cancelled";
  write(db);
  return booking;
}

export function confirmConsultation(token: string | null, id: string) {
  const user = requireUser(token);
  const db = read();
  const booking = db.consultations.find((c) => c.id === id);
  if (!booking) throw new ApiError(404, "Consultation not found.");
  if (booking.trainerId !== user.id) throw new ApiError(403, "Only the trainer can confirm this.");
  booking.status = "Confirmed";
  write(db);
  return booking;
}

export function completeConsultation(token: string | null, id: string) {
  const user = requireUser(token);
  const db = read();
  const booking = db.consultations.find((c) => c.id === id);
  if (!booking) throw new ApiError(404, "Consultation not found.");
  if (booking.trainerId !== user.id) throw new ApiError(403, "Only the trainer can mark as completed.");
  if (booking.status !== "Confirmed") throw new ApiError(400, "Consultation must be confirmed first.");
  booking.status = "Completed";
  write(db);
  return booking;
}

export function rateConsultation(
  token: string | null,
  id: string,
  input: { stars: number; comment?: string },
) {
  const user = requireUser(token);
  const db = read();
  const booking = db.consultations.find((c) => c.id === id);
  if (!booking) throw new ApiError(404, "Consultation not found.");
  if (booking.seekerId !== user.id) throw new ApiError(403, "Only the job seeker can rate this consultation.");
  if (booking.status !== "Completed") throw new ApiError(400, "You can rate only after the consultation is completed.");
  if (booking.rating) throw new ApiError(409, "You have already rated this consultation.");
  booking.rating = {
    stars: input.stars,
    ...(input.comment ? { comment: input.comment } : {}),
  };
  write(db);
  return booking;
}
