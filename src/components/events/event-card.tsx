import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AutoRotateImage } from "@/components/events/auto-rotate-image";
import { MapPin } from "lucide-react";
import { formatCurrency, formatEventDate, formatEventDateRange } from "@/lib/utils/formatters";
import type { LocalizedEvent } from "@/types/event";
import type { Locale } from "@/types/locale";

export async function EventCard({
  event,
  locale
}: {
  event: LocalizedEvent;
  locale: Locale;
}) {
  const t = await getTranslations("common");

  return (
    <Link
      href={{ pathname: "/events/[slug]", params: { slug: event.slug } }}
      className="block"
    >
      <Card className="group flex flex-row overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] md:flex-col">
        {/* Image: compact square on mobile, full-width on desktop */}
        <div className="relative w-[104px] shrink-0 self-stretch overflow-hidden bg-surface-soft md:w-full md:aspect-[4/3]">
          {event.galleryUrls.length > 0 ? (
            <AutoRotateImage
              images={[event.coverImageUrl, ...event.galleryUrls]}
              alt={event.title}
              className="transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/50 to-transparent p-3 pt-8 md:block">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
              {event.endsAt
                ? formatEventDateRange(event.startsAt, event.endsAt, locale)
                : formatEventDate(event.startsAt, locale)}
            </span>
          </div>
        </div>

        {/* Content: compact on mobile, spacious on desktop */}
        <div className="flex flex-1 flex-col justify-center gap-1 p-3 md:gap-3 md:p-5">
          <div className="flex items-center gap-2">
            <Badge className="px-2 py-px text-[10px] md:px-2.5 md:py-0.5 md:text-xs">
              {t(`danceStyles.${event.danceStyle}`)}
            </Badge>
            <span className="text-[11px] text-muted-foreground md:hidden">
              {event.endsAt
                ? formatEventDateRange(event.startsAt, event.endsAt, locale)
                : formatEventDate(event.startsAt, locale)}
            </span>
          </div>

          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug tracking-tight text-foreground md:text-xl">
            {event.title}
          </h3>

          <div className="flex items-center justify-between gap-2 text-xs md:mt-auto md:text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
              <span className="line-clamp-1">
                {event.venueName} · {event.city}
              </span>
            </span>
            <span className="shrink-0 font-semibold text-brand-600">
              {event.priceText ?? formatCurrency(event.priceAmount, event.currency, locale)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
