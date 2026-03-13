import { Container } from "@/components/shared/container";

export const metadata = {
  title: "Privacy Policy | Exploraguate",
  robots: { index: true, follow: true }
};

export default function PrivacyPage() {
  return (
    <section className="page-section">
      <Container className="prose prose-sm mx-auto max-w-2xl text-foreground/80 prose-headings:text-foreground">
        <h1>Privacy Policy</h1>
        <p>Last updated: March 10, 2026</p>

        <h2>1. Data Controller</h2>
        <p>
          This website is operated by <strong>GuatCloud</strong>. For any
          privacy-related inquiries, contact us at{" "}
          <a href="mailto:hola@exploraguate.com">hola@exploraguate.com</a>.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>2.1 Automatically Collected</h3>
        <ul>
          <li>
            <strong>Analytics data:</strong> We use Google Analytics 4 to
            collect anonymous usage data such as pages visited, session
            duration, device type, and approximate geographic location. No
            personally identifiable information is collected through analytics.
          </li>
          <li>
            <strong>Cookies:</strong> We use essential cookies for site
            functionality (e.g., language preference). Analytics cookies are
            set by Google Analytics.
          </li>
        </ul>

        <h3>2.2 Voluntarily Provided</h3>
        <ul>
          <li>
            <strong>Event submissions:</strong> When you submit an event, we
            collect the event details you provide (title, description, date,
            venue, organizer name, contact link). This information is used
            solely to publish the event on the Site.
          </li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To display and curate dance event information</li>
          <li>To improve the Site through anonymous usage analytics</li>
          <li>To respond to inquiries or event submissions</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal
          information to third parties. Event details submitted for
          publication are displayed publicly on the Site as intended by the
          submitter.
        </p>

        <h2>5. Data Storage</h2>
        <p>
          Event and site data is stored on secure cloud infrastructure
          (Supabase and Vercel). We take reasonable measures to protect your
          information, but no internet transmission is 100% secure.
        </p>

        <h2>6. Your Rights</h2>
        <p>You may:</p>
        <ul>
          <li>Request deletion of any event content you have submitted</li>
          <li>
            Opt out of analytics tracking by using browser extensions such as
            Google Analytics Opt-out
          </li>
          <li>Clear cookies through your browser settings</li>
        </ul>

        <h2>7. Children&apos;s Privacy</h2>
        <p>
          The Site is not directed at children under 13. We do not knowingly
          collect information from children.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated revision date.
        </p>

        <h2>9. Contact</h2>
        <p>
          For questions about this Privacy Policy, contact us at{" "}
          <a href="mailto:hola@exploraguate.com">hola@exploraguate.com</a>.
        </p>
      </Container>
    </section>
  );
}
