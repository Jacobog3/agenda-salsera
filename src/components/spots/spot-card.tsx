"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, ChevronDown, Banknote } from "lucide-react";
import type { LocalizedSpot } from "@/types/spot";

export function SpotCard({
  spot,
  expandable = false
}: {
  spot: LocalizedSpot;
  expandable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("common");

  if (!expandable) {
    return (
      <Card className="group flex flex-row overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] md:flex-col">
        <div className="relative w-[104px] shrink-0 self-stretch overflow-hidden bg-surface-soft md:w-full md:aspect-[4/3]">
          <Image
            src={spot.coverImageUrl}
            alt={spot.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 p-3 md:gap-3 md:p-5">
          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug tracking-tight text-foreground md:text-xl">
            {spot.name}
          </h3>
          <div className="flex flex-col gap-1 text-xs md:mt-auto md:text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
              {spot.city}
            </span>
            {spot.schedule && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                <span className="line-clamp-1">{spot.schedule}</span>
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 p-2.5 text-left transition-colors hover:bg-surface-soft/40 md:gap-4 md:p-3"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-soft md:h-16 md:w-16">
          <Image
            src={spot.coverImageUrl}
            alt={spot.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-bold leading-snug tracking-tight text-foreground md:text-base">
            {spot.name}
          </h3>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground md:text-xs">
            <MapPin className="h-3 w-3 shrink-0" />
            {spot.city}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-border/60 px-3 pb-3 pt-2.5 md:px-4 md:pb-4 md:pt-3">
            {spot.schedule && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground md:text-sm">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{spot.schedule}</span>
              </div>
            )}

            {spot.address && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground md:text-sm">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{spot.address} · {spot.city}</span>
              </div>
            )}

            {spot.coverCharge && (
              <div className="flex items-start gap-2 text-xs md:text-sm">
                <Banknote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                <span className="font-medium text-brand-600">
                  {t("coverCharge")}: {spot.coverCharge}
                </span>
              </div>
            )}

            {spot.description && (
              <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                {spot.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
