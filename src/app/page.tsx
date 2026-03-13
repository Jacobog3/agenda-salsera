import HomePage, {
  generateMetadata as generateLocalizedMetadata
} from "@/app/[locale]/(public)/page";

export function generateMetadata() {
  return generateLocalizedMetadata({
    params: Promise.resolve({ locale: "es" })
  });
}

export default function Page() {
  return HomePage({
    params: Promise.resolve({ locale: "es" })
  });
}
