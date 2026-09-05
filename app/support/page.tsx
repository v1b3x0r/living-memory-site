import type { Metadata } from "next";
import { FeedbackBox } from "../../components/FeedbackBox";
import { PolicyPage } from "../../components/PolicyPage";

export const metadata: Metadata = {
  title: "Support | Living Memory Engine",
  description: "Get help with Living Memory Engine.",
};

export default function SupportPage() {
  return (
    <PolicyPage
      bridgeSource="support"
      eyebrow="HUMAN SUPPORT"
      title="Support"
      updated="August 29, 2026"
    >
      <p>
        Email <a href="mailto:support@viibe.to">support@viibe.to</a> for hosted access,
        privacy, deletion, or reliability questions. This is the shared support mailbox for products
        published by Natthawut Phurahong (Living Memory Engine and Squish). Include the approximate
        time of the problem and the client you used. Never email an API key, password, one-time code,
        or full memory token.
      </p>
      <h2>Self-service checks</h2>
      <ul>
        <li>Use the memory state tool to inspect counts and recent stored memories.</li>
        <li>Use a long, distinctive phrase with the forget tool to limit accidental broad deletion.</li>
        <li>An expired One Night Memory URL returns HTTP 410 and cannot be restored.</li>
        <li>For local OSS issues, include the package version and sanitized error output.</li>
      </ul>
      <h2 id="billing">Billing, cancellation, and refunds</h2>
      <ul>
        <li>
          Living Memory is US$9/month, billed through RevenueCat Web Billing with Stripe. Sign in
          and use <strong>Manage or cancel subscription</strong> under Billing on your account page —
          receipts, card changes, and cancellation are all there. The link in your RevenueCat receipt
          email opens the same page.
        </li>
        <li>
          Locked out of the account page? Email us from the address you subscribed with and we will
          cancel for you — effective at the end of the current paid period.
        </li>
        <li>Refund requests are reviewed case by case; include the approximate purchase time.</li>
        <li>We aim to answer billing email within 2 business days.</li>
      </ul>
      <h2>Open-source issues</h2>
      <p>
        Reproducible local-server bugs may also be filed on the
        {" "}<a href="https://github.com/v1b3x0r/living-memory-engine/issues">GitHub issue tracker</a>.
        Do not include private memory content or secrets in a public issue.
      </p>
      <h2 id="feedback">Report a problem in one tap</h2>
      <FeedbackBox />
    </PolicyPage>
  );
}
