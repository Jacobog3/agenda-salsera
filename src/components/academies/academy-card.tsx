import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { LocalizedAcademy } from "@/types/academy";
import { isPrimaryDanceStyle } from "@/lib/academies/academy-helpers";

export async function AcademyCard({ academy }: { academy: LocalizedAcademy }) {
  const t = await getTranslations("common");
  const displayStyles = academy.styleTags && academy.styleTags.length > 0
    ? academy.styleTags
    : academy.stylesTaught.map((style) => t(`danceStyles.${style}`));

  return (
    <Link
      href={{ pathname: "/academies/[slug]", params: { slug: academy.slug } }}
      className="block"
    >
      <Card className="group flex flex-row overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] md:flex-col">
        <div className="relative w-[104px] shrink-0 self-stretch overflow-hidden bg-surface-soft md:w-full md:aspect-[4/3]">
          <Image
            src={academy.coverImageUrl}
            alt={academy.name}
            fill
            sizes="(min-width: 768px) 50vw, 104px"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105 md:p-8"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1 p-3 md:gap-3 md:p-5">
          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug tracking-tight text-foreground md:text-xl">
            {academy.name}
          </h3>

          <div className="flex flex-col gap-1 text-xs md:mt-auto md:text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
              {academy.city}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {displayStyles.slice(0, 4).map((style) => (
              <Badge
                key={style}
                variant="accent"
                className="px-2 py-px text-[10px] md:px-2.5 md:py-0.5 md:text-xs"
              >
                {isPrimaryDanceStyle(style) ? t(`danceStyles.${style}`) : style}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}
