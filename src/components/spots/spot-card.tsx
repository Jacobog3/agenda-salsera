import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import type { LocalizedSpot } from "@/types/spot";

export async function SpotCard({ spot }: { spot: LocalizedSpot }) {
  const t = await getTranslations("common");

  const socialLinks = [
    spot.whatsappUrl
      ? { href: spot.whatsappUrl, label: t("whatsapp") }
      : null,
    spot.instagramUrl
      ? { href: spot.instagramUrl, label: t("instagram") }
      : null
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <Card className="group flex h-full flex-col overflow-hidden bg-white">
      <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden bg-surface-soft md:aspect-[3/2]">
        <Image
          src={spot.coverImageUrl}
          alt={spot.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 md:gap-3 md:p-5">
        <h3 className="font-display text-base font-bold leading-snug tracking-tight text-foreground md:text-xl">
          {spot.name}
        </h3>

        <span className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
          <Clock className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
          {spot.schedule}
        </span>

        <span className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
          <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
          {spot.address ? `${spot.address} · ` : ""}
          {spot.city}
        </span>

        {spot.coverCharge && (
          <p className="text-xs font-medium text-brand-600 md:text-sm">
            {t("coverCharge")}: {spot.coverCharge}
          </p>
        )}

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
          {spot.description}
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
              pathname: "/spots/[slug]",
              params: { slug: spot.slug }
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
