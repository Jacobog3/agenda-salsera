const GUATEMALA_TIME_ZONE = "America/Guatemala";

const guatemalaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: GUATEMALA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

type EventTiming = {
  startsAt?: string | null;
  endsAt?: string | null;
  dateStatus?: "confirmed" | "coming_soon";
};

type HistoricalEventQuality = EventTiming & {
  title?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  city?: string | null;
  venueName?: string | null;
  organizerName?: string | null;
  organizerId?: string | null;
  academyId?: string | null;
};

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

function getDateKeyInGuatemala(date: Date) {
  return guatemalaDateFormatter.format(date);
}

export function hasMeaningfulEventEnd({ startsAt, endsAt }: EventTiming) {
  if (!startsAt || !endsAt) return false;

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return endDate.getTime() > startDate.getTime();
}

export function isEventActive({ startsAt, endsAt, dateStatus }: EventTiming, now = new Date()) {
  if (dateStatus === "coming_soon") return true;
  if (!startsAt) return false;

  const startDate = new Date(startsAt);
  if (!isValidDate(startDate)) return false;

  if (hasMeaningfulEventEnd({ startsAt, endsAt })) {
    return now.getTime() <= new Date(endsAt!).getTime();
  }

  return getDateKeyInGuatemala(now) <= getDateKeyInGuatemala(startDate);
}

export function isEventExpired(event: EventTiming, now = new Date()) {
  return !isEventActive(event, now);
}

export function isHistoricalEventIndexable(event: HistoricalEventQuality, now = new Date()) {
  if (!isEventExpired(event, now)) return true;

  const descriptionLength = event.description?.trim().length ?? 0;
  const hasIdentity = Boolean(
    event.organizerId ||
    event.academyId ||
    event.organizerName?.trim()
  );

  return Boolean(
    event.title?.trim() &&
    descriptionLength >= 250 &&
    event.coverImageUrl?.trim() &&
    event.city?.trim() &&
    event.venueName?.trim() &&
    hasIdentity
  );
}
