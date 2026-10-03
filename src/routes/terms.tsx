import { createFileRoute, Link } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — IntervuHub" },
      {
        name: "description",
        content:
          "The rules for using IntervuHub: accounts, posting content, consultations with trainers, moderation and liability.",
      },
      { property: "og:title", content: "IntervuHub Terms of Use" },
    ],
  }),
  component: TermsPage,
});

const linkClass = "font-medium text-primary underline-offset-4 hover:underline";

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    heading: "Accepting these terms",
    body: (
      <p>
        By creating an account or using IntervuHub, you agree to these Terms of Use and to our{" "}
        <Link to="/privacy" className={linkClass}>
          Privacy Policy
        </Link>
        . If you do not agree, please do not use the platform.
      </p>
    ),
  },
  {
    id: "eligibility",
    heading: "Eligibility and accounts",
    body: (
      <ul>
        <li>You must be at least 18 years old to create an account.</li>
        <li>Give accurate details when you register and keep them up to date.</li>
        <li>Keep your password private. You are responsible for activity on your account.</li>
        <li>One person, one account. Do not impersonate anyone else.</li>
      </ul>
    ),
  },
  {
    id: "your-content",
    heading: "Content you post",
    body: (
      <>
        <p>
          You own the questions, openings and feedback you post. By posting, you give IntervuHub a
          non-exclusive, royalty-free licence to display, store and share that content on the
          platform so others can benefit from it.
        </p>
        <p>You confirm that the content you post:</p>
        <ul>
          <li>Is based on your own genuine experience or knowledge.</li>
          <li>
            Does not break any confidentiality or non-disclosure agreement you have signed with a
            company. <strong>You are responsible for what you share.</strong>
          </li>
          <li>Does not include anyone else’s personal data without their permission.</li>
          <li>Is not false, misleading, abusive, defamatory or illegal.</li>
        </ul>
      </>
    ),
  },
  {
    id: "not-allowed",
    heading: "What is not allowed",
    body: (
      <ul>
        <li>Posting fake openings, scams, or openings that ask candidates for money.</li>
        <li>Spam, advertising or unrelated promotional content.</li>
        <li>Harassment, hate speech or abusive behaviour towards other users.</li>
        <li>Leaking confidential test papers or proprietary company material.</li>
        <li>Giving fake ratings or manipulating trainer reviews.</li>
        <li>Scraping the platform, attacking it, or trying to access other accounts.</li>
      </ul>
    ),
  },
  {
    id: "community-content",
    heading: "Community content disclaimer",
    body: (
      <p>
        Questions and openings are shared by community members and are{" "}
        <strong>not verified by IntervuHub or by the companies mentioned</strong>. Company names are
        used only to describe where an interview took place. Always confirm an opening directly with
        the employer before applying, and never pay anyone to get an interview.
      </p>
    ),
  },
  {
    id: "consultations",
    heading: "Trainers and consultations",
    body: (
      <ul>
        <li>
          Trainers are independent professionals, not employees of IntervuHub. Their advice is their
          own.
        </li>
        <li>
          IntervuHub helps you find and book trainers but is not a party to the consultation itself.
        </li>
        <li>IntervuHub does not currently process payments for consultations.</li>
        <li>
          Ratings must reflect a real, completed consultation. Only the job seeker who booked the
          session can rate it.
        </li>
        <li>A consultation does not guarantee an interview result or a job offer.</li>
      </ul>
    ),
  },
  {
    id: "moderation",
    heading: "Moderation and suspension",
    body: (
      <p>
        Anyone can report content they believe breaks these terms. IntervuHub admins may hide or
        remove content, and may suspend or close accounts — temporarily or permanently — when these
        terms are broken. Where possible, we will tell you the reason.
      </p>
    ),
  },
  {
    id: "ip",
    heading: "Our platform",
    body: (
      <p>
        The IntervuHub name, logo, design and software belong to IntervuHub. You may not copy,
        resell or reuse them without written permission.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Disclaimers and liability",
    body: (
      <>
        <p>
          IntervuHub is provided “as is”. We work to keep it accurate and available, but we do not
          guarantee that content is complete or correct, or that the service will always be
          uninterrupted.
        </p>
        <p>
          To the extent permitted by law, IntervuHub is not liable for losses arising from your use
          of community content, openings, or consultations with trainers.
        </p>
      </>
    ),
  },
  {
    id: "law",
    heading: "Governing law",
    body: <p>These terms are governed by the laws of India.</p>,
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    body: (
      <p>
        We may update these terms as the platform evolves. Continuing to use IntervuHub after an
        update means you accept the revised terms. Questions? Email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

function TermsPage() {
  return (
    <LegalPage
      icon={ScrollText}
      eyebrow="The rules of the community"
      title="Terms of Use"
      intro={
        <p>
          IntervuHub works because people share honestly and treat each other with respect. These
          terms set out what you can expect from us and what we expect from you.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
