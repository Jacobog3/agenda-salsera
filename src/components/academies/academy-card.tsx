import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import type { LocalizedAcademy } from "@/types/academy";

export async function AcademyCard({ academy }: { academy: LocalizedAcademy }) {
  const t = await getTranslations("common");

  return (
    <Link
      href={{ pathname: "/academies/[slug]", params: { slug: academy.slug } }}
      className="block"
    >
      <Card className="group flex flex-row overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] md:flex-col">
        {/* Image: compact square on mobile, full area on desktop */}
        <div className="relative w-[88px] shrink-0 self-stretch overflow-hidden bg-surface-soft md:w-full md:aspect-[3/2]">
          <Image
            src={academy.coverImageUrl}
            alt={academy.name}
            fill
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105 md:p-8"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center gap-1 p-3 md:gap-2.5 md:p-5">
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug tracking-tight text-foreground md:text-xl">
            {academy.name}
          </h3>

          <span className="flex items-center gap-1 text-[11px] text-muted-foreground md:text-sm">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">
              {academy.address ? `${academy.address} · ` : ""}
              {academy.city}
            </span>
          </span>

          <div className="flex flex-wrap gap-1">
            {academy.stylesTaught.map((style) => (
              <Badge
                key={style}
                variant="accent"
                className="px-1.5 py-px text-[9px] md:px-2.5 md:py-0.5 md:text-xs"
              >
                {t(`danceStyles.${style}`)}
              </Badge>
            ))}
          </div>

          {/* Extra details: desktop only */}
          <p className="hidden line-clamp-2 text-sm leading-relaxed text-muted-foreground md:block">
            {academy.description}
          </p>

          <div className="mt-auto flex items-center justify-end pt-0.5 md:pt-1">
            <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 md:text-sm">
              {t("learnMore")}
              <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
