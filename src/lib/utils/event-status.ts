const GUATEMALA_TIME_ZONE = "America/Guatemala";

const guatemalaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: GUATEMALA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

type EventTiming = {
  startsAt: string;
  endsAt?: string | null;
};

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

function getDateKeyInGuatemala(date: Date) {
  return guatemalaDateFormatter.format(date);
}

export function hasMeaningfulEventEnd({ startsAt, endsAt }: EventTiming) {
  if (!endsAt) return false;

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return endDate.getTime() > startDate.getTime();
}

export function isEventActive({ startsAt, endsAt }: EventTiming, now = new Date()) {
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
