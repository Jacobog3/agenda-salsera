import Image from "next/image";
import { Card } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { ExpandableSpotCard } from "@/components/spots/expandable-spot-card";
import type { LocalizedSpot } from "@/types/spot";
import { getLocale } from "next-intl/server";
import { formatLocation } from "@/lib/locations";
import type { Locale } from "@/types/locale";

export async function SpotCard({
  spot,
  expandable = false
}: {
  spot: LocalizedSpot;
  expandable?: boolean;
}) {
  const locale = await getLocale() as Locale;

  if (expandable) {
    return <ExpandableSpotCard spot={spot} locale={locale} />;
  }

  return (
    <Card className="group flex flex-row overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] md:flex-col">
      <div className="relative w-[104px] shrink-0 self-stretch overflow-hidden bg-surface-soft md:w-full md:aspect-[4/3]">
        <Image
          src={spot.coverImageUrl}
          alt={spot.name}
          fill
          sizes="(min-width: 768px) 50vw, 104px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1 p-3 md:gap-3 md:p-5">
        <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug tracking-tight text-foreground md:text-xl">
          {spot.name}
        </h3>

        <div className="flex flex-col gap-1 text-xs md:mt-auto md:text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 text-salsaGreen-600 md:h-3.5 md:w-3.5" />
            {formatLocation(spot.city, spot.countryCode, locale)}
          </span>
          {spot.schedule ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0 text-salsaGreen-600 md:h-3.5 md:w-3.5" />
              <span className="line-clamp-1">{spot.schedule}</span>
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
