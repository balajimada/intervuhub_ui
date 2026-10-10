export type UserRole = "JobSeeker" | "Trainer" | "Admin";
export type UserStatus = "PendingActivation" | "Active" | "Suspended" | "Deleted";

export const EXPERIENCE_LEVELS = [
  "Fresher",
  "Junior",
  "Mid Level",
  "Senior",
  "Architect",
  "Full Stack",
] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type Difficulty = "Easy" | "Medium" | "Hard";
export type InterviewRound =
  | "Screening"
  | "Technical"
  | "Coding"
  | "System Design"
  | "Managerial"
  | "HR";
export type SourceType = "IWorkHere" | "KnownOpening";
export type CompanyStatus = "Pending" | "Approved" | "Rejected";
export type ReportTargetType = "Company" | "Question" | "Opening" | "User";
export type ReportStatus = "Open" | "Resolved";

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
export const ROUNDS: InterviewRound[] = [
  "Screening",
  "Technical",
  "Coding",
  "System Design",
  "Managerial",
  "HR",
];
export const TECH_STACKS = [
  ".NET",
  "C#",
  "Java",
  "Spring Boot",
  "React",
  "Angular",
  "Node.js",
  "Python",
  "SQL",
  "Azure",
  "AWS",
  "DevOps",
  "Data Structures",
  "System Design",
  "Testing",
  "Mobile",
];

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  suspensionReason?: string | undefined;
  suspendedUntil?: string | null | undefined;
  createdAt: string;
  /** Present for trainers only. */
  skills?: string[] | undefined;
  profileSummary?: string | null | undefined;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  status: CompanyStatus;
  createdAt: string;
  createdByName?: string | undefined;
}

export interface InterviewQuestion {
  id: string;
  companyId: string;
  companyName: string;
  techStack: string[];
  experienceLevel: ExperienceLevel;
  role: string;
  round: InterviewRound;
  questionText: string;
  notes?: string | undefined;
  difficulty?: Difficulty | undefined;
  interviewYear?: number | undefined;
  interviewMonth?: number | undefined;
  isHidden: boolean;
  createdAt: string;
  authorId: string;
  authorName: string;
}

export interface InterviewOpening {
  id: string;
  companyId: string;
  companyName: string;
  techStack: string[];
  role: string;
  experienceLevel: ExperienceLevel;
  location?: string | undefined;
  mode?: "Onsite" | "Hybrid" | "Remote" | undefined;
  notes?: string | undefined;
  link?: string | undefined;
  sourceType: SourceType;
  createdAt: string;
  expiresAt: string;
  authorId: string;
  authorName: string;
}

export type TestimonialTargetType = "Question" | "Opening" | "General";
export type TestimonialStatus = "Pending" | "Approved" | "Rejected";
export const TESTIMONIAL_OUTCOMES = [
  "Got the job",
  "Cleared the interview",
  "Better prepared",
] as const;
export type TestimonialOutcome = (typeof TESTIMONIAL_OUTCOMES)[number];

export interface Testimonial {
  id: string;
  /** First name and last initial only, e.g. "Priya S.". */
  authorName: string;
  targetType: TestimonialTargetType;
  /** Missing for general feedback or when the post it mentions has been deleted. */
  targetId?: string | undefined;
  targetLabel: string;
  outcome: TestimonialOutcome;
  message: string;
  status: TestimonialStatus;
  createdAt: string;
}

export interface ContentReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reportedByName: string;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ConsultationMode = "Video call" | "Phone call" | "Chat";
export type ConsultationStatus = "Requested" | "Confirmed" | "Completed" | "Cancelled";

export const CONSULTATION_TOPICS = [
  "Resume & profile review",
  "Mock interview practice",
  "Tech stack doubt clearing",
  "System design walkthrough",
  "Coding round preparation",
  "Career path & switch guidance",
  "Salary negotiation & offer review",
] as const;

export type ConsultationTopic = (typeof CONSULTATION_TOPICS)[number];

export const CONSULTATION_MODES: ConsultationMode[] = ["Video call", "Phone call", "Chat"];

export interface Trainer {
  id: string;
  name: string;
  skills: string[];
  profileSummary?: string | undefined;
  resumeName?: string | undefined;
  createdAt: string;
}

export interface ConsultationRating {
  stars: number;
  comment?: string | undefined;
}

export interface Consultation {
  id: string;
  trainerId: string;
  trainerName: string;
  seekerId: string;
  seekerName: string;
  topic: string;
  details: string;
  mode: ConsultationMode;
  preferredDate: string;
  status: ConsultationStatus;
  createdAt: string;
  rating?: ConsultationRating | undefined;
}
