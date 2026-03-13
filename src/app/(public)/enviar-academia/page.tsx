import SubmitAcademyPage from "@/app/[locale]/(public)/submit-academy/page";

export default function Page() {
  return SubmitAcademyPage({ params: Promise.resolve({ locale: "es" }) });
}
