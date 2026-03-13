import { getTranslations } from "next-intl/server";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { GraduationCap, Mail } from "lucide-react";
import type { Locale } from "@/types/locale";

export async function generateMetadata() {
  return { title: "Publicar Academia | ExploraGuate" };
}

export default async function SubmitAcademyPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  void locale;

  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl space-y-6">
        <SectionHeading
          icon={GraduationCap}
          title="Publicar academia"
          description="Registrá tu academia de baile para que más personas la encuentren."
        />
        <div className="overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-6 shadow-soft md:rounded-3xl md:p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <GraduationCap className="h-8 w-8 text-brand-600" />
            </span>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900">¡Próximamente!</h2>
              <p className="max-w-sm text-sm leading-relaxed text-gray-500">
                El formulario de registro para academias está en desarrollo. Mientras tanto escribinos
                y con gusto te agregamos.
              </p>
            </div>
            <a
              href="mailto:info@exploraguate.com?subject=Quiero publicar mi academia"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.97]"
            >
              <Mail className="h-4 w-4" />
              Contactar por email
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
