import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "LifeMax privacy policy for the private beta app shell and WHOOP Developer app review."
};

export default function PrivacyPage() {
  return (
    <main className="privacy-shell">
      <div className="privacy-page">
        <Link className="privacy-back" href="/">
          Back to LifeMax
        </Link>
        <article className="privacy-article">
          <header className="screen-header">
            <p className="kicker">Privacy</p>
            <h1 className="screen-title">LifeMax Privacy Policy</h1>
            <p className="screen-copy">
              LifeMax is a personal health and wellness tracking app currently in private development and private beta.
              This policy describes the intended data handling for the LifeMax app shell and connected health data once
              implemented.
            </p>
            <p className="privacy-updated">Last updated: June 19, 2026</p>
          </header>

          <section className="privacy-section">
            <h2>Information LifeMax May Process</h2>
            <p>
              If you authorize a WHOOP connection, LifeMax may process WHOOP profile, body measurement, cycle, recovery,
              sleep, and workout data. LifeMax may also store manually entered supplements, habits, symptoms, check-ins,
              daily plans, and app operation logs.
            </p>
          </section>

          <section className="privacy-section">
            <h2>How Data Is Used</h2>
            <p>
              LifeMax uses data for personal health summaries, freshness and status checks, habit and supplement
              tracking, daily planning, and wellness insights. LifeMax is not a medical device and does not provide
              diagnosis, treatment, or medical advice.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Sharing</h2>
            <p>
              Personal data is not sold. WHOOP data is not shared with advertisers. Infrastructure providers may process
              data only as needed to operate LifeMax.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Tokens And Secrets</h2>
            <p>
              Where WHOOP integration is implemented, WHOOP tokens should be stored server-side as encrypted secret
              references. Raw WHOOP tokens should not be exposed in logs, reports, public documents, or client-side code.
            </p>
          </section>

          <section className="privacy-section">
            <h2>User Controls</h2>
            <p>
              Users can disconnect WHOOP and request deletion of LifeMax data associated with their private beta use.
              Production-grade export and deletion workflows are not promised by this app shell until they are built and
              verified.
            </p>
          </section>

          <section className="privacy-section">
            <h2>Contact</h2>
            <p>
              No public support email is listed for this private beta shell yet. Add a real public contact address here
              before broad external beta access.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
