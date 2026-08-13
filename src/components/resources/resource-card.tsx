import Image from "next/image";
import { Camera, CheckCircle2, Disc3, ExternalLink, Instagram, MoreHorizontal, PackageSearch, PencilLine, Shirt, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatLocation } from "@/lib/locations";
import type { Locale } from "@/types/locale";
import type { LocalizedResource, ResourceCategory } from "@/types/resource";

const CATEGORY_ICONS = {
  dancewear: Shirt,
  dj: Disc3,
  photography: Camera,
  other: PackageSearch
} satisfies Record<ResourceCategory, typeof Shirt>;

export function ResourceCard({
  resource,
  locale,
  categoryLabels,
  labels
}: {
  resource: LocalizedResource;
  locale: Locale;
  categoryLabels: Record<ResourceCategory, string>;
  labels: {
    instagram: string;
    viewProfile: string;
    verified: string;
    verifiedPrefix: string;
    communityRecommendation: string;
    contactOnline: string;
    actionsLabel: string;
    suggestChange: string;
  };
}) {
  const primaryCategory = resource.categories[0] ?? "dancewear";
  const Icon = CATEGORY_ICONS[primaryCategory];
  const imageUrl = resource.imageUrl || resource.teacherImageUrl;
  const location = resource.city || resource.countryCode
    ? formatLocation(resource.city ?? "", resource.countryCode ?? "", locale)
    : labels.contactOnline;
  const verifiedDate = resource.lastVerifiedAt
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(resource.lastVerifiedAt))
    : null;

  return (
    <Card id={resource.slug} className="group flex h-full scroll-mt-24 flex-col bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accentScale-50">
        <details className="group/actions absolute right-3 top-3 z-10">
          <summary
            role="button"
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/70 bg-white/95 text-foreground shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 [&::-webkit-details-marker]:hidden"
            aria-label={labels.actionsLabel}
          >
            <MoreHorizontal className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 top-12 w-56 rounded-2xl border border-border bg-white p-1.5 shadow-xl">
            <Link
              href={{
                pathname: "/submit-resource",
                query: {
                  resource: resource.slug,
                  name: resource.name,
                  category: primaryCategory
                }
              }}
              className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-soft"
            >
              <PencilLine className="h-4 w-4 text-brand-600" />
              {labels.suggestChange}
            </Link>
          </div>
        </details>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={resource.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-brand-600 shadow-soft">
              <Icon className="h-9 w-9" strokeWidth={1.7} />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {resource.categories.map((category) => (
              <Badge key={category} variant="accent">
                {categoryLabels[category]}
              </Badge>
            ))}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
              {resource.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{location}</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{resource.description}</p>
        </div>

        <div className="mt-auto space-y-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            {resource.verificationStatus === "source_confirmed" || resource.verificationStatus === "owner_confirmed" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-salsaGreen-600" />
            ) : (
              <UserRound className="h-3.5 w-3.5 text-salsaOrange-500" />
            )}
            {resource.verificationStatus === "unverified"
              ? labels.communityRecommendation
              : verifiedDate
                ? `${labels.verifiedPrefix} ${verifiedDate}`
                : labels.verified}
          </p>

          <div className="flex flex-wrap gap-2">
            {resource.teacherSlug ? (
              <Link
                href={{ pathname: "/artists/[slug]", params: { slug: resource.teacherSlug } }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
              >
                <UserRound className="h-4 w-4" />
                {labels.viewProfile}
              </Link>
            ) : null}
            {resource.instagramUrl ? (
              <a
                href={resource.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-foreground hover:border-brand-200 hover:text-brand-700"
              >
                <Instagram className="h-4 w-4" />
                {labels.instagram}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
