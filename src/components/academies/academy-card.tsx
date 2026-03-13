import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import type { LocalizedAcademy } from "@/types/academy";

export async function AcademyCard({ academy }: { academy: LocalizedAcademy }) {
  const t = await getTranslations("common");

  const socialLinks = [
    academy.whatsappUrl
      ? { href: academy.whatsappUrl, label: t("whatsapp") }
      : null,
    academy.instagramUrl
      ? { href: academy.instagramUrl, label: t("instagram") }
      : null,
    academy.websiteUrl
      ? { href: academy.websiteUrl, label: t("website") }
      : null
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <Card className="group flex h-full flex-col overflow-hidden bg-white">
      <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden bg-surface-soft p-4 md:aspect-[3/2] md:p-8">
        <Image
          src={academy.coverImageUrl}
          alt={academy.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 md:p-8"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 md:gap-3 md:p-5">
        <h3 className="font-display text-base font-bold leading-snug tracking-tight text-foreground md:text-xl">
          {academy.name}
        </h3>

        <span className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
          <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
          {academy.address ? `${academy.address} · ` : ""}
          {academy.city}
        </span>

        <div className="flex flex-wrap gap-1">
          {academy.stylesTaught.map((style) => (
            <Badge
              key={style}
              variant="accent"
              className="px-2 py-px text-[10px] md:px-2.5 md:py-0.5 md:text-xs"
            >
              {t(`danceStyles.${style}`)}
            </Badge>
          ))}
        </div>

        {academy.scheduleText && (
          <span className="flex items-start gap-1 text-xs text-muted-foreground">
            <Clock className="mt-px h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
            {academy.scheduleText}
          </span>
        )}

        {academy.levels && (
          <span className="text-xs text-muted-foreground">
            Niveles: {academy.levels}
          </span>
        )}

        {academy.trialClass && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Clase de prueba gratuita
          </span>
        )}

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
          {academy.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1 md:pt-2">
          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-1 md:gap-1.5">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-surface-soft/80 px-2 py-1 text-[10px] font-semibold text-foreground/70 transition-colors hover:border-brand-500 hover:text-brand-600 md:px-3 md:py-1.5 md:text-xs"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <div />
          )}
          <Link
            href={{
              pathname: "/academies/[slug]",
              params: { slug: academy.slug }
            }}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 md:text-sm"
          >
            {t("learnMore")}
            <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
