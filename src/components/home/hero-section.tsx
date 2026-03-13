import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";
import { CalendarDays, MapPin, Music } from "lucide-react";
import type { LocalizedEvent } from "@/types/event";
import type { Locale } from "@/types/locale";

export async function HeroSection({
  events: _events,
  locale
}: {
  events: LocalizedEvent[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <section className="page-section pt-1 md:pt-4">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-brand-900 to-brand-700 px-5 py-8 text-white md:rounded-3xl md:px-12 md:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accentScale-500/15 blur-2xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="max-w-lg">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300 md:text-xs">
                {t("eyebrow")}
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold leading-[1.05] tracking-tight sm:text-3xl md:mt-4 md:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <div className="mt-4 flex gap-2 md:mt-6">
                <Link
                  href="/events"
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md transition-all hover:bg-white/90 active:scale-[0.97] md:px-5 md:py-2.5 md:text-sm"
                >
                  {t("primaryCta")}
                </Link>
                <Link
                  href="/academies"
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.97] md:px-5 md:py-2.5 md:text-sm"
                >
                  {t("secondaryCta")}
                </Link>
              </div>
            </div>

            <div className="hidden gap-3 md:flex md:flex-col">
              <HeroPill icon={CalendarDays} text={t("highlights.events")} />
              <HeroPill icon={MapPin} text={t("highlights.academies")} />
              <HeroPill icon={Music} text={t("highlights.submissions")} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroPill({
  icon: Icon,
  text
}: {
  icon: typeof CalendarDays;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2.5 backdrop-blur-sm">
      <Icon className="h-4 w-4 text-brand-300" />
      <span className="text-sm font-medium text-white/80">{text}</span>
    </div>
  );
}
