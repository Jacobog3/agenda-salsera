import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";
import type { LocalizedEvent } from "@/types/event";
import type { Locale } from "@/types/locale";

function BrandCard() {
  return (
    <div className="relative flex h-full min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-white px-4 py-6 text-center shadow-lg ring-1 ring-black/[0.06]">
      <Image
        src="/images/exploraguate-logo.png"
        alt="ExploraGuate"
        width={420}
        height={280}
        className="h-auto w-full"
        priority
      />
    </div>
  );
}

export async function HeroSection({
  events: _events,
  locale
}: {
  events: LocalizedEvent[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <section className="page-section pt-2 md:pt-6">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-sky-50 px-4 py-8 sm:px-6 sm:py-10 md:rounded-3xl md:px-14 md:py-16">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-50 blur-2xl" />

          {/* 2-column on desktop */}
          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-[1fr_300px] md:items-center lg:grid-cols-[1fr_340px]">

            {/* Left: copy */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-600 md:text-xs">
                {t("eyebrow")}
              </p>
              <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight text-gray-900 md:mt-4 md:text-[2.75rem] lg:text-[3.25rem]">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500 md:text-[15px]">
                {t("heroSubtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
                <Link
                  href="/events"
                  className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md active:scale-[0.97]"
                >
                  {t("primaryCta")}
                </Link>
                <Link
                  href="/spots"
                  className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.97]"
                >
                  {t("secondaryCta")}
                </Link>
              </div>
            </div>

            {/* Right: brand card — desktop only */}
            <div className="hidden md:block">
              <BrandCard />
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
