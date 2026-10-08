# Interview Insights

Build Prompt: IntervuHub — Frontend (UI only)

Use this prompt with a coding assistant. The backend API already exists and is out of scope — build only the UI layer that consumes it.

Assumption: stack is React + TypeScript (Vite), calling the existing REST API over HTTP/JSON with a bearer JWT. If your actual frontend stack differs (Angular, Next.js, plain HTML, etc.), swap that in — everything else below (screens, flows, endpoints, validation) still applies.

Prompt

You are building the frontend UI for IntervuHub, a platform where job seekers share and search real interview questions by company, tech stack, and experience level, and post short-lived (30-day) interview openings. The backend REST API is already built and deployed — do not create or modify any backend code, migrations, or server logic. Treat the API as a fixed external contract and build only the client application against it.

Stack

React + TypeScript, Vite

React Router for navigation

A data-fetching layer (React Query/TanStack Query) for API calls, caching, and loading/error states

Form handling + client-side validation (e.g. React Hook Form) mirroring the server-side rules below, so users get instant feedback before hitting the API

Store JWT in memory/secure storage and attach as Authorization: Bearer <token> on authenticated calls

Responsive layout (mobile-first — many job seekers will use this on phones)

API base contract (already implemented server-side — call, don't rebuild)

Auth

POST /api/auth/register — name, email, mobile (E.164 / +91), password, role (JobSeeker|Trainer)

POST /api/auth/verify-otp — mobile + OTP code

POST /api/auth/resend-otp — mobile

POST /api/auth/login — email/mobile + password → JWT (only works once account is Active)

Companies

GET /api/companies — paginated, search by name/code, filter isActive

GET /api/companies/{id}

POST /api/companies — auth required

POST /api/companies/{id}/report

Interview questions

GET /api/interview-questions — filters: company, tech stack, experience level, role, round; paged; anonymous read

GET /api/interview-questions/{id}

POST /api/interview-questions — auth required

POST /api/interview-questions/{id}/report

Interview openings

GET /api/interview-openings — non-expired only; anonymous read

GET /api/interview-openings/{id}

POST /api/interview-openings — auth required

DELETE /api/interview-openings/{id} — author or admin

POST /api/interview-openings/{id}/report

Admin

POST /api/admin/users/{id}/suspend

POST /api/admin/users/{id}/reactivate

GET /api/admin/reports

POST /api/admin/companies/{id}/approve / /reject

POST /api/admin/questions/{id}/hide / /restore

(Confirm exact request/response shapes against the live Swagger doc before wiring each screen — treat the list above as the endpoint map, not the payload spec.)

Screens to build

1. Auth

Register form: name, email, mobile, password, role selector (JobSeeker/Trainer). Client-side validation: required fields, valid E.164/+91 mobile format, email format, password strength.

OTP verification screen: 6-digit code input, countdown timer, "Resend OTP" button that respects a cooldown (disable it and show remaining seconds).

Login form: email or mobile + password. Show a clear error if the account is not yet Active ("verify your mobile to continue") vs wrong credentials vs suspended.

Global auth state (logged-in user, role, token) available app-wide; redirect unauthenticated users away from write actions.

2. Interview questions

Search/browse page: filters for company (typeahead search), tech stack (multi-select), experience level (Fresher/Junior/Mid Level/Senior/Architect/Full Stack), role/title, round. Paginated results list.

Question detail view: grouped/labeled by round, shows notes/difficulty/interview date if present.

"Post a question" form (auth required): company picker (search-existing-or-suggest-new), tech stack, experience level, role, round, question text, optional notes/answer hints, optional difficulty, optional interview year/month. Mirror server validation (length limits) client-side with inline error messages.

Report action (flag icon/button) on each question, with a reason field.

3. Interview openings

List/browse page: same filter set as questions (company, tech stack, experience level, role) plus a visible "posted X days ago" / "expires in Y days" indicator per card.

Visible disclaimer banner: community-sourced, may be outdated, not an official listing guarantee.

"Post an opening" form (auth required): company, tech stack(s), role, experience level, optional location/mode, optional notes/link, source type (I work here / Known opening).

Delete action for the author's own openings.

Report action per opening.

4. Companies

Typeahead/search component reused across question and opening forms — search-as-you-type against GET /api/companies, with a "can't find it? add new" fallback that opens a lightweight create form (name, code) and shows a pending/approved state if the API returns one.

5. Admin console (only visible to Admin role)

Reports queue: list of ContentReport items (company/question/opening/user), with action buttons appropriate to each target type (approve/reject company, hide/restore question, suspend/reactivate user).

User suspend dialog: reason input, optional "suspend until" date vs permanent toggle.

Simple user list/search to locate a Job Seeker or Trainer to suspend directly (not just via the reports queue).

Cross-cutting UI requirements

Loading states, empty states, and error states for every list/detail view.

Role-aware navigation: hide "Post opening"/"Post question" CTAs and the Admin console from users who aren't permitted to use them; hide write actions entirely (not just disable) for anonymous visitors, since reads are public.

Toast/inline feedback on every mutation (post, report, suspend, delete) — success and failure.

401 responses should redirect to login; 403 should show a clear "not permitted" state rather than a blank screen.

Keep components small and reusable: a single <FilterBar> for the shared company/tech-stack/experience-level filters used by both questions and openings; a single <CompanyPicker> used by both post forms.

Explicitly out of scope for this pass

No backend, database, or API changes — the API is a black box you call.

No Trainers/booking/payment screens — those are Phase 2 and not yet exposed by the API.

No native mobile app — responsive web only.

Definition of done

A visitor can browse questions and openings, with working filters, without logging in.

Register → OTP verify → login works end-to-end and blocks login for a PendingActivation account with a clear message.

A logged-in Active user can post a question and an opening, with client-side validation matching the fields above.

Any user can report a question, opening, or company.

An Admin sees a working reports queue and can suspend/reactivate a user and approve/reject a company from the UI.

All screens handle loading/empty/error states and are usable on a mobile viewport.

Implement this now against the existing API. Confirm exact payload shapes from the live Swagger/OpenAPI spec before finalizing each form's submit handler, and flag any endpoint from the map above that the real API doesn't actually expose as documented.

dont show dummy values u need to implement this requirement without missing anything everypage should work if i try to login i can login with dummy values and all pages should load perfectly with no dummy values

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://interview-beacon-96.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7a184cb2-6ea7-42f5-8c2b-7e09982524fe).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
