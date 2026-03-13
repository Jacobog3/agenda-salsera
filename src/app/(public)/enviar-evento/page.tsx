import SubmitEventPage, {
  generateMetadata as generateLocalizedMetadata
} from "@/app/[locale]/(public)/submit-event/page";

export function generateMetadata() {
  return generateLocalizedMetadata({ params: Promise.resolve({ locale: "es" }) });
}

export default function Page() {
  return SubmitEventPage({ params: Promise.resolve({ locale: "es" }) });
}
