import { ExternalLink, MapPinned } from "lucide-react";

function getGoogleMapsPlaceUrl(placeId: string, query: string) {
  const params = new URLSearchParams({
    api: "1",
    query,
    query_place_id: placeId
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function GoogleMapsLink({
  placeId,
  query,
  linkLabel
}: {
  placeId: string;
  query: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 md:p-5">
      <a
        href={getGoogleMapsPlaceUrl(placeId, query)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
      >
        <MapPinned className="h-4 w-4" aria-hidden="true" />
        {linkLabel}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      <p className="mt-2 text-[10px] font-medium text-muted-foreground">
        Google Maps
      </p>
    </div>
  );
}
