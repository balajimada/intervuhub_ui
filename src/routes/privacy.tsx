import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — IntervuHub" },
      {
        name: "description",
        content:
          "How IntervuHub collects, uses, stores and protects your personal data, and the rights you have over it.",
      },
      { property: "og:title", content: "IntervuHub Privacy Policy" },
    ],
  }),
  component: PrivacyPage,
});

const mail = (
  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary underline-offset-4 hover:underline">
    {SUPPORT_EMAIL}
  </a>
);

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "Who we are",
    body: (
      <p>
        IntervuHub is a community platform where job seekers share interview questions and
        openings, and trainers help clear interview doubts through consultations. For anything
        related to your personal data, contact us at {mail}.
      </p>
    ),
  },
  {
    id: "data-we-collect",
    heading: "Data we collect",
    body: (
      <>
        <p>We only collect what the platform needs to work:</p>
        <ul>
          <li>
            <strong>Account details</strong> — name, email address, mobile number, password (stored
            only as a secure hash) and your role (job seeker or trainer).
          </li>
          <li>
            <strong>Trainer profile</strong> — the skills you select and the resume file you upload.
          </li>
          <li>
            <strong>Content you post</strong> — interview questions, notes, openings, and reports
            you submit.
          </li>
          <li>
            <strong>Consultations</strong> — topic, description, preferred date and mode of the
            sessions you book or accept, and the ratings and feedback given afterwards.
          </li>
          <li>
            <strong>Verification</strong> — one-time codes sent to your email to activate your
            account. Codes are stored hashed and expire after a short time.
          </li>
        </ul>
        <p>We do not collect payment details, location tracking data or contacts from your device.</p>
      </>
    ),
  },
  {
    id: "how-we-use",
    heading: "How we use your data",
    body: (
      <ul>
        <li>To create and secure your account and verify your email address.</li>
        <li>To show the questions and openings you post, with your name as the author.</li>
        <li>To let job seekers find trainers and book consultations with them.</li>
        <li>To show trainer ratings so job seekers can choose with confidence.</li>
        <li>To review reports, moderate content and suspend accounts that break our Terms.</li>
        <li>To send essential service emails such as verification codes.</li>
      </ul>
    ),
  },
  {
    id: "who-sees",
    heading: "Who can see your data",
    body: (
      <>
        <ul>
          <li>
            <strong>Public:</strong> questions and openings you post, along with your display name.
            Trainer names and skills are listed publicly on the trainers page.
          </li>
          <li>
            <strong>The other party in a consultation:</strong> the trainer sees your name and the
            details you wrote; you see the trainer’s name.
          </li>
          <li>
            <strong>Admins:</strong> IntervuHub moderators can see account details to handle
            reports, suspensions and support requests.
          </li>
        </ul>
        <p>
          Your email address, mobile number and password are never shown publicly. We do not sell or
          rent your personal data to anyone.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    heading: "Storage and security",
    body: (
      <>
        <p>
          Your data is stored in our database and resume files are kept in protected server
          storage. Passwords and verification codes are hashed, and access to the platform uses
          signed session tokens.
        </p>
        <p>
          Your session token is kept in your browser’s local storage so you stay signed in. Signing
          out removes it. We do not use advertising or tracking cookies.
        </p>
        <p>
          No system is perfectly secure. If we become aware of a breach that affects your data, we
          will notify you and the relevant authorities as required by law.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "How long we keep data",
    body: (
      <ul>
        <li>Interview openings are removed from the board automatically 60 days after posting.</li>
        <li>Account data is kept while your account is active.</li>
        <li>
          You can delete your account at any time from <strong>Account settings</strong>. This
          permanently removes your name, email, mobile number, password and resume, removes the
          openings you posted and cancels upcoming consultations. Questions you posted stay on the
          platform so others can learn from them, but show “Deleted user” as the author.
        </li>
        <li>We may keep limited records where the law requires it or to resolve disputes.</li>
      </ul>
    ),
  },
  {
    id: "your-rights",
    heading: "Your rights",
    body: (
      <>
        <p>
          Under India’s Digital Personal Data Protection Act, 2023, you have the right to:
        </p>
        <ul>
          <li>Ask what personal data we hold about you.</li>
          <li>Correct or update inaccurate data.</li>
          <li>
            Delete your account and data — yourself from Account settings, or by asking us.
          </li>
          <li>Withdraw consent, which may mean we can no longer provide the service to you.</li>
          <li>Raise a grievance about how your data is handled.</li>
        </ul>
        <p>To use any of these rights, email {mail} from the address registered on your account.</p>
      </>
    ),
  },
  {
    id: "grievance",
    heading: "Grievance contact",
    body: (
      <p>
        If you have a concern about your personal data or content on IntervuHub, write to our
        grievance contact at {mail}. We aim to acknowledge complaints promptly and resolve them as
        quickly as possible.
      </p>
    ),
  },
  {
    id: "age",
    heading: "Age requirement",
    body: (
      <p>
        IntervuHub is meant for people aged 18 and above. We do not knowingly collect data from
        anyone under 18. If you believe a minor has created an account, please contact us.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the platform grows. The date at the top of this page shows
        when it was last changed. For significant changes, we will let registered users know by
        email.
      </p>
    ),
  },
];

function PrivacyPage() {
  return (
    <LegalPage
      icon={ShieldCheck}
      eyebrow="Your data, explained plainly"
      title="Privacy Policy"
      intro={
        <p>
          This policy explains what personal data IntervuHub collects, why we collect it, who can
          see it and the choices you have. We keep it short and specific to how the platform
          actually works.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
