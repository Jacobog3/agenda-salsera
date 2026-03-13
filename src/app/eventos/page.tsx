import EventsPage, {
  generateMetadata as generateLocalizedMetadata
} from "@/app/[locale]/(public)/events/page";
import type { DanceStyle } from "@/types/event";

type SearchParams = {
  city?: string;
  danceStyle?: DanceStyle | "all";
  date?: string;
};

export function generateMetadata() {
  return generateLocalizedMetadata({
    params: Promise.resolve({ locale: "es" })
  });
}

export default function Page({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  return EventsPage({
    params: Promise.resolve({ locale: "es" }),
    searchParams
  });
}
