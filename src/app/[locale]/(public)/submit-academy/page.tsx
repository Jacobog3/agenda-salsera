import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { SubmitAcademyForm } from "@/components/forms/submit-academy-form";
import { buildMetadata } from "@/lib/metadata/build-metadata";
import { GraduationCap } from "lucide-react";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "submitAcademyTitle", "submitAcademyDescription", {
    pathname: "/submit-academy"
  });
}

export default function SubmitAcademyPage() {
  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl space-y-6 md:space-y-8">
        <SectionHeading
          as="h1"
          icon={GraduationCap}
          title="Registrar academia"
          description="Completá el formulario y publicamos tu academia gratis. Más personas la van a encontrar."
        />
        <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-5 shadow-soft md:rounded-3xl md:p-8">
          <SubmitAcademyForm />
        </div>
      </Container>
    </section>
  );
}
