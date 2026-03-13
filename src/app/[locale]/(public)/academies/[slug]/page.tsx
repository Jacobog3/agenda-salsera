import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { EventCard } from "@/components/events/event-card";
import { getAcademyBySlug } from "@/lib/queries/academies";
import { getFeaturedEvents } from "@/lib/queries/events";
import { MapPin, Music } from "lucide-react";
import type { Locale } from "@/types/locale";

export default async function AcademyDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({
    locale: currentLocale,
    namespace: "academies"
  });
  const common = await getTranslations({
    locale: currentLocale,
    namespace: "common"
  });
  const academy = await getAcademyBySlug(currentLocale, slug);
  const relatedEvents = await getFeaturedEvents(currentLocale);

  if (!academy) {
    notFound();
  }

  return (
    <>
      <section className="page-section pb-24 md:pb-16">
        <Container>
          <div className="overflow-hidden rounded-2xl md:rounded-3xl">
            <div className="relative aspect-[2/1] bg-surface-soft md:aspect-[21/9]">
              <Image
                src={academy.coverImageUrl}
                alt={academy.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-5 md:mt-8 md:grid-cols-[1.2fr_0.8fr] md:gap-10">
            <div className="space-y-3 md:space-y-4">
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                {academy.name}
              </h1>
              <div className="flex flex-wrap gap-1.5">
                {academy.stylesTaught.map((style) => (
                  <Badge key={style} variant="accent">
                    {common(`danceStyles.${style}`)}
                  </Badge>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-lg md:leading-8">
                {academy.description}
              </p>
            </div>

            <aside className="rounded-2xl bg-surface-soft p-4 md:rounded-3xl md:p-6">
              <div className="grid gap-3 md:gap-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 md:h-9 md:w-9 md:rounded-xl">
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </div>
                  <div className="text-xs md:text-sm">
                    <p className="font-semibold text-foreground">
                      {common("location")}
                    </p>
                    <div className="mt-0.5 text-foreground/70">
                      {academy.address ? <p>{academy.address}</p> : null}
                      <p>{academy.city}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 md:h-9 md:w-9 md:rounded-xl">
                    <Music className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </div>
                  <div className="text-xs md:text-sm">
                    <p className="font-semibold text-foreground">
                      {common("styles")}
                    </p>
                    <p className="mt-0.5 text-foreground/70">
                      {academy.stylesTaught
                        .map((style) => common(`danceStyles.${style}`))
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
              {academy.whatsappUrl ? (
                <Button asChild size="lg" className="mt-5 w-full md:mt-6">
                  <a
                    href={academy.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("contactCta")}
                  </a>
                </Button>
              ) : null}
            </aside>
          </div>

          {relatedEvents.length > 0 ? (
            <div className="mt-8 md:mt-14">
              <h2 className="section-title mb-4 md:mb-5">
                {common("relatedEvents")}
              </h2>
              <div className="grid gap-3 md:grid-cols-3 md:gap-6">
                {relatedEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    locale={currentLocale}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      {academy.whatsappUrl ? (
        <div className="fixed inset-x-0 bottom-[76px] z-30 border-t border-black/[0.06] bg-white/95 p-3 backdrop-blur-xl md:hidden">
          <Button asChild size="lg" className="w-full">
            <a href={academy.whatsappUrl} target="_blank" rel="noreferrer">
              {t("contactCta")}
            </a>
          </Button>
        </div>
      ) : null}
    </>
  );
}
