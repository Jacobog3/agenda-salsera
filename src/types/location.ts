export type LocatedEntity = {
  city: string;
  countryCode: string;
};

export type EventLocation = LocatedEntity & {
  timeZone: string;
};
