import SpotsPage, {
  generateMetadata as generateLocalizedMetadata
} from "@/app/[locale]/(public)/spots/page";

export function generateMetadata() {
  return generateLocalizedMetadata({
    params: Promise.resolve({ locale: "es" })
  });
}

export default function Page() {
  return SpotsPage({
    params: Promise.resolve({ locale: "es" })
  });
}
