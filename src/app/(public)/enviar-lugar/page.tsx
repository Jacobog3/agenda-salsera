import SubmitSpotPage from "@/app/[locale]/(public)/submit-spot/page";

export default function Page() {
  return SubmitSpotPage({ params: Promise.resolve({ locale: "es" }) });
}
