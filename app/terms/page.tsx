import type { Metadata } from "next";
import { PolicyPage } from "../../components/PolicyPage";

export const metadata: Metadata = {
  title: "Terms | Living Memory Engine",
  description: "Terms for the Living Memory Engine hosted service.",
};

export default function TermsPage() {
  return (
    <PolicyPage eyebrow="SERVICE TERMS" title="Terms of use" updated="August 29, 2026">
      <p>
        These terms cover the Living Memory Engine hosted service. By using it, you agree to use it
        lawfully and only with data you have the right to provide.
      </p>
      <h2>What the service does</h2>
      <p>
        LME can store user-directed memories, retrieve relevant stored memories, show memory state,
        permanently delete matching episodic memories, and pass exact short-lived handoff notes between
        the user’s authorized agents. One Night Memory is a limited free trial; a trial room left unused
        for an extended period is deleted. The local open-source package is governed by its repository
        license.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not use LME to store credentials, payment-card data, government identifiers, protected
        health information, unlawful content, malware, or data obtained without permission. Do not
        probe other users’ memory worlds, evade limits, or disrupt the service.
      </p>
      <h2>Your responsibility</h2>
      <p>
        Review memory before relying on it. Retrieval may be incomplete or irrelevant, and stored
        statements may become outdated. You are responsible for decisions made using recalled content
        and for keeping independent copies of information you cannot afford to lose.
      </p>
      <h2 id="billing">Subscriptions and billing</h2>
      <p>
        Living Memory is a paid subscription: US$9 per month, billed monthly in advance through
        RevenueCat Web Billing with Stripe as the payment processor. It renews automatically each
        month until cancelled. Cancel anytime from the Billing section of your account page after
        signing in, from the subscription-management link in your RevenueCat receipt email, or by
        emailing <a href="mailto:support@viibe.to">support@viibe.to</a> —
        cancellation takes effect at the end of the current paid period, and access runs until then.
        If a renewal payment fails, hosted access lapses until payment succeeds; your stored memory is
        not deleted by a failed payment. After checkout, entitlement activation on the memory server
        can take up to a minute. Refund requests are reviewed case by case — email support. Prices
        exclude any taxes your jurisdiction may apply.
      </p>
      <h2 id="cancel">If you cancel</h2>
      <p>
        Cancelling stops the billing. It does not delete anything: your world stays and your
        memories stay in it. You can still sign in afterwards and delete your world yourself
        whenever you choose.
      </p>
      <h2>Availability and changes</h2>
      <p>
        The service is provided as available and may change, be interrupted, or be discontinued.
        Trial limits and expiry are part of the service, not a guarantee of permanent storage.
      </p>
      <h2 id="discontinue">If we discontinue the service</h2>
      <p>
        If we discontinue Living Memory, we will provide notice when reasonably possible and
        explain the options available for stored data at that time.
      </p>
      <h2 id="where">Where your data lives</h2>
      <p>
        On servers operated by DigitalOcean in Singapore (region <code>sgp1</code>). Text sent for
        embedding is processed by Google under its paid API terms and may leave that region.
      </p>
      <h2>Contact</h2>
      <p>
        Living Memory Engine is operated by Natthawut Phurahong, its verified individual publisher.
        Questions or requests may be sent to <a href="mailto:support@viibe.to">support@viibe.to</a>.
      </p>
    </PolicyPage>
  );
}
