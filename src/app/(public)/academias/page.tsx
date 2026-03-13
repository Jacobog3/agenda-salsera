import AcademiesPage, {
  generateMetadata as generateLocalizedMetadata
} from "@/app/[locale]/(public)/academies/page";

export function generateMetadata() {
  return generateLocalizedMetadata({
    params: Promise.resolve({ locale: "es" })
  });
}

export default function Page() {
  return AcademiesPage({ params: Promise.resolve({ locale: "es" }) });
}
