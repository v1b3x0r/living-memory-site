import type { Metadata } from "next";
import { PolicyPage } from "../../components/PolicyPage";
import { JoinRoom } from "../../components/JoinRoom";
import { pageMeta } from "../../lib/page-meta";

export const metadata: Metadata = {
  ...pageMeta({
    path: "join",
    title: "Join a shared memory room — Living Memory",
    description:
      "Someone invited you into a shared memory room. Pick your AI app, paste one address, and your assistants start remembering together.",
  }),
  // Every join link is private to its recipients; the page has nothing to
  // rank without a fragment, and fragments never reach crawlers anyway.
  robots: { index: false },
};

export default function JoinPage() {
  return (
    <PolicyPage
      eyebrow="YOU'RE INVITED"
      title="Join a shared memory room"
      updated="August 27, 2026"
      dateLabel="Page updated"
    >
      <JoinRoom />
    </PolicyPage>
  );
}
