import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, MapPin, PartyPopper } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { getFestivals } from "@/lib/queries/festivals";
import { formatLocation } from "@/lib/locations";
import type { Locale } from "@/types/locale";

export default async function FestivalsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale: currentLocale, namespace: "festivals" });
  const festivals = await getFestivals(currentLocale);

  return (
    <section className="page-section pb-24 md:pb-16">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} tone="red" />

        {festivals.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <PartyPopper className="mx-auto h-8 w-8 text-salsaRed-500" />
            <p className="mt-4 font-semibold text-gray-900">{t("empty")}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {festivals.map((festival) => (
              <Link
                key={festival.id}
                href={{ pathname: "/festivals/[slug]", params: { slug: festival.slug } }}
                className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-salsaRed-50">
                  {festival.bannerImageUrl ? (
                    <Image
                      src={festival.bannerImageUrl}
                      alt={festival.name}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-salsaRed-100 via-accentScale-50 to-brand-100">
                      <PartyPopper className="h-12 w-12 text-salsaRed-500" />
                    </div>
                  )}
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-salsaRed-600">
                    {festival.seriesType === "congress" ? t("types.congress") : t("types.festival")} · {t("permanentProfile")}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-gray-950">{festival.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{festival.shortDescription}</p>
                  {festival.homeCity && festival.homeCountryCode ? (
                    <p className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MapPin className="h-4 w-4 text-salsaGreen-500" />
                      {formatLocation(festival.homeCity, festival.homeCountryCode, currentLocale)}
                    </p>
                  ) : null}
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                    {festival.seriesType === "congress" ? t("viewCongress") : t("viewFestival")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
