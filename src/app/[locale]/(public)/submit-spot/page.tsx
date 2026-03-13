import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { SubmitSpotForm } from "@/components/forms/submit-spot-form";
import { MapPinned } from "lucide-react";

export async function generateMetadata() {
  return { title: "Publicar Bar o Lugar | ExploraGuate" };
}

export default function SubmitSpotPage() {
  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl space-y-6 md:space-y-8">
        <SectionHeading
          icon={MapPinned}
          title="Registrar bar o lugar"
          description="¿Tenés un bar, restaurante o espacio con noches de salsa o bachata? Registralo gratis."
        />
        <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-5 shadow-soft md:rounded-3xl md:p-8">
          <SubmitSpotForm />
        </div>
      </Container>
    </section>
  );
}
