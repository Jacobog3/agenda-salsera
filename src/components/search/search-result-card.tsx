import Image from "next/image";
import { CalendarDays, GraduationCap, MapPinned, Search, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SearchResult, SearchResultType } from "@/lib/search/site-search";

const ICONS: Record<SearchResultType, typeof Search> = {
  event: CalendarDays,
  spot: MapPinned,
  academy: GraduationCap,
  teacher: UserRound
};

function getInitials(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function SearchResultCard({
  result,
  typeLabel,
  localizedBadges
}: {
  result: SearchResult;
  typeLabel: string;
  localizedBadges: string[];
}) {
  const Icon = ICONS[result.type];
  const useImage = Boolean(result.imageUrl);

  return (
    <a href={result.href} className="block">
      <Card className="group flex flex-row overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98]">
        <div className="relative flex w-[88px] shrink-0 self-stretch items-center justify-center overflow-hidden bg-surface-soft md:w-[104px]">
          {useImage ? (
            <Image
              src={result.imageUrl!}
              alt={result.title}
              fill
              sizes="(min-width: 768px) 104px, 88px"
              unoptimized={result.imageUrl!.startsWith("/local-images/")}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : result.type === "teacher" ? (
            <div className="flex h-full w-full items-center justify-center bg-brand-600 font-display text-xl font-bold text-white">
              {getInitials(result.title)}
            </div>
          ) : (
            <Icon className="h-6 w-6 text-brand-500" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-[0.14em]">
              {typeLabel}
            </Badge>
            {result.meta ? (
              <span className="text-[11px] text-muted-foreground">
                {result.meta}
              </span>
            ) : null}
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug tracking-tight text-foreground md:text-lg">
              {result.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground md:text-sm">
              {result.subtitle}
            </p>
          </div>

          {localizedBadges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {localizedBadges.map((badge) => (
                <Badge key={badge} variant="accent" className="px-2 py-px text-[10px] md:text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}

          <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">
            {result.description}
          </p>
        </div>
      </Card>
    </a>
  );
}
