import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { getSpotBySlug } from "@/lib/queries/spots";
import { MapPin, Clock, Banknote } from "lucide-react";
import type { Locale } from "@/types/locale";

export default async function SpotDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const common = await getTranslations({
    locale: currentLocale,
    namespace: "common"
  });
  const spot = await getSpotBySlug(currentLocale, slug);

  if (!spot) {
    notFound();
  }

  return (
    <section className="page-section pb-16">
      <Container>
        <div className="overflow-hidden rounded-2xl md:rounded-3xl">
          <div className="relative aspect-[2/1] bg-surface-soft md:aspect-[21/9]">
            <Image
              src={spot.coverImageUrl}
              alt={spot.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-5 md:mt-8 md:grid-cols-[1.2fr_0.8fr] md:gap-10">
          <div className="space-y-3 md:space-y-4">
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {spot.name}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-lg md:leading-8">
              {spot.description}
            </p>
          </div>

          <aside className="rounded-2xl bg-surface-soft p-4 md:rounded-3xl md:p-6">
            <div className="grid gap-3 md:gap-4">
              <InfoRow icon={Clock} label={common("schedule")}>
                {spot.schedule}
              </InfoRow>
              <InfoRow icon={MapPin} label={common("location")}>
                {spot.address ? <p>{spot.address}</p> : null}
                <p>{spot.city}</p>
              </InfoRow>
              {spot.coverCharge && (
                <InfoRow icon={Banknote} label={common("coverCharge")}>
                  {spot.coverCharge}
                </InfoRow>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 md:h-9 md:w-9 md:rounded-xl">
        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </div>
      <div className="text-xs md:text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        <div className="mt-0.5 text-foreground/70">{children}</div>
      </div>
    </div>
  );
}
