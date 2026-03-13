import { Container } from "@/components/shared/container";

export const metadata = {
  title: "Terms of Use | Exploraguate",
  robots: { index: true, follow: true }
};

export default function TermsPage() {
  return (
    <section className="page-section">
      <Container className="prose prose-sm mx-auto max-w-2xl text-foreground/80 prose-headings:text-foreground">
        <h1>Terms of Use</h1>
        <p>Last updated: March 10, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using <strong>exploraguate.com</strong> (the
          &quot;Site&quot;), operated by GuatCloud, you agree to be bound by
          these Terms of Use. If you do not agree, please do not use the Site.
        </p>

        <h2>2. Description of the Service</h2>
        <p>
          Exploraguate provides a curated agenda and directory of salsa, bachata,
          and Latin dance events, venues (&quot;Spots&quot;), and academies in
          Guatemala. The content is informational and intended to help users
          discover dance-related activities.
        </p>

        <h2>3. User-Submitted Content</h2>
        <p>
          Users may submit event information through the Site. By submitting
          content you represent that the information is accurate and that you
          have the right to share it. GuatCloud reserves the right to review,
          edit, or remove any submitted content at its sole discretion.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          All original content, design, and code on the Site are owned by
          GuatCloud. Event flyers and promotional images remain the property of
          their respective creators and are displayed solely for informational
          purposes.
        </p>

        <h2>5. Third-Party Links</h2>
        <p>
          The Site may contain links to third-party websites, including social
          media profiles and ticket platforms. GuatCloud is not responsible for
          the content, privacy practices, or availability of those external
          sites.
        </p>

        <h2>6. Disclaimer of Warranties</h2>
        <p>
          The Site and its content are provided &quot;as is&quot; without
          warranties of any kind. GuatCloud does not guarantee the accuracy,
          completeness, or timeliness of event information. Event details
          (dates, prices, venues) are subject to change by the organizers.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          GuatCloud shall not be liable for any direct, indirect, incidental,
          or consequential damages arising from your use of the Site or
          reliance on any information provided.
        </p>

        <h2>8. Changes to Terms</h2>
        <p>
          GuatCloud may update these Terms at any time. Continued use of the
          Site after changes constitutes acceptance of the revised Terms.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the Republic of Guatemala.
        </p>

        <h2>10. Contact</h2>
        <p>
          For questions about these Terms, contact us at{" "}
          <a href="mailto:hola@exploraguate.com">hola@exploraguate.com</a>.
        </p>
      </Container>
    </section>
  );
}
