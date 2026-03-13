import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { SubmitAcademyForm } from "@/components/forms/submit-academy-form";
import { GraduationCap } from "lucide-react";

export async function generateMetadata() {
  return { title: "Publicar Academia | ExploraGuate" };
}

export default function SubmitAcademyPage() {
  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl space-y-6 md:space-y-8">
        <SectionHeading
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
