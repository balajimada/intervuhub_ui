import * as store from "./store";
import { ApiError } from "./store";

export { ApiError };

/**
 * API client. Every method maps 1:1 to a documented REST endpoint.
 * When VITE_API_BASE_URL is defined the request is sent over HTTP with a
 * bearer token; otherwise it is served by the local persistence layer so the
 * whole UI is exercisable end to end.
 */
const BASE_URL = import.meta.env["VITE_API_BASE_URL"] as string | undefined;

let authToken: string | null = null;
export function setAuthToken(token: string | null) {
  authToken = token;
}
export function getAuthToken() {
  return authToken;
}

async function http<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, (data?.message as string) ?? res.statusText);
  return data as T;
}

async function call<T>(
  method: string,
  path: string,
  local: () => T,
  body?: unknown,
): Promise<T> {
  if (BASE_URL) return http<T>(method, path, body);
  await new Promise((r) => setTimeout(r, 180));
  return local();
}

function qs(params: object) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
    else sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  /* auth */
  register: (input: Parameters<typeof store.register>[0]) =>
    call("POST", "/api/auth/register", () => store.register(input), input),
  verifyOtp: (input: { mobile: string; code: string }) =>
    call("POST", "/api/auth/verify-otp", () => store.verifyOtp(input), input),
  resendOtp: (input: { mobile: string }) =>
    call("POST", "/api/auth/resend-otp", () => store.resendOtp(input), input),
  login: (input: { identifier: string; password: string }) =>
    call("POST", "/api/auth/login", () => store.login(input), input),
  me: (token: string) => call("GET", "/api/auth/me", () => store.me(token)),

  /* companies */
  listCompanies: (q: Parameters<typeof store.listCompanies>[0]) =>
    call("GET", `/api/companies${qs(q)}`, () => store.listCompanies(q)),
  getCompany: (id: string) => call("GET", `/api/companies/${id}`, () => store.getCompany(id)),
  createCompany: (input: { name: string; code: string }) =>
    call("POST", "/api/companies", () => store.createCompany(authToken, input), input),

  /* questions */
  listQuestions: (f: store.QuestionFilters) =>
    call("GET", `/api/interview-questions${qs(f)}`, () => store.listQuestions(f)),
  getQuestion: (id: string) =>
    call("GET", `/api/interview-questions/${id}`, () => store.getQuestion(id)),
  createQuestion: (input: Parameters<typeof store.createQuestion>[1]) =>
    call("POST", "/api/interview-questions", () => store.createQuestion(authToken, input), input),

  /* openings */
  listOpenings: (f: store.OpeningFilters) =>
    call("GET", `/api/interview-openings${qs(f)}`, () => store.listOpenings(f)),
  getOpening: (id: string) =>
    call("GET", `/api/interview-openings/${id}`, () => store.getOpening(id)),
  createOpening: (input: Parameters<typeof store.createOpening>[1]) =>
    call("POST", "/api/interview-openings", () => store.createOpening(authToken, input), input),
  deleteOpening: (id: string) =>
    call("DELETE", `/api/interview-openings/${id}`, () => store.deleteOpening(authToken, id)),

  /* trainers & consultations */
  listTrainers: (q: Parameters<typeof store.listTrainers>[0]) =>
    call("GET", `/api/trainers${qs(q)}`, () => store.listTrainers(q)),
  getTrainer: (id: string) => call("GET", `/api/trainers/${id}`, () => store.getTrainer(id)),
  createConsultation: (input: Parameters<typeof store.createConsultation>[1]) =>
    call("POST", "/api/consultations", () => store.createConsultation(authToken, input), input),
  myConsultations: () =>
    call("GET", "/api/consultations/me", () => store.listMyConsultations(authToken)),
  cancelConsultation: (id: string) =>
    call("POST", `/api/consultations/${id}/cancel`, () => store.cancelConsultation(authToken, id)),
  confirmConsultation: (id: string) =>
    call("POST", `/api/consultations/${id}/confirm`, () =>
      store.confirmConsultation(authToken, id),
    ),

  /* reports */
  report: (input: Parameters<typeof store.createReport>[1]) => {
    const path =
      input.targetType === "Question"
        ? `/api/interview-questions/${input.targetId}/report`
        : input.targetType === "Opening"
          ? `/api/interview-openings/${input.targetId}/report`
          : `/api/companies/${input.targetId}/report`;
    return call("POST", path, () => store.createReport(authToken, input), {
      reason: input.reason,
    });
  },

  /* admin */
  adminReports: (status?: "Open" | "Resolved") =>
    call("GET", `/api/admin/reports${qs({ status })}`, () => store.listReports(authToken, status)),
  resolveReport: (id: string) =>
    call("POST", `/api/admin/reports/${id}/resolve`, () => store.resolveReport(authToken, id)),
  adminUsers: (search?: string) =>
    call("GET", `/api/admin/users${qs({ search })}`, () => store.listUsers(authToken, search)),
  suspendUser: (id: string, input: { reason: string; suspendedUntil?: string | null }) =>
    call("POST", `/api/admin/users/${id}/suspend`, () => store.suspendUser(authToken, id, input), input),
  reactivateUser: (id: string) =>
    call("POST", `/api/admin/users/${id}/reactivate`, () => store.reactivateUser(authToken, id)),
  approveCompany: (id: string) =>
    call("POST", `/api/admin/companies/${id}/approve`, () =>
      store.setCompanyApproval(authToken, id, true),
    ),
  rejectCompany: (id: string) =>
    call("POST", `/api/admin/companies/${id}/reject`, () =>
      store.setCompanyApproval(authToken, id, false),
    ),
  hideQuestion: (id: string) =>
    call("POST", `/api/admin/questions/${id}/hide`, () =>
      store.setQuestionHidden(authToken, id, true),
    ),
  restoreQuestion: (id: string) =>
    call("POST", `/api/admin/questions/${id}/restore`, () =>
      store.setQuestionHidden(authToken, id, false),
    ),
  adminCompanies: () =>
    call("GET", "/api/admin/companies", () => store.adminListCompanies(authToken)),
};
