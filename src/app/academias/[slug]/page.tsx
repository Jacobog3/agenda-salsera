import AcademyDetailPage from "@/app/[locale]/(public)/academies/[slug]/page";

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return AcademyDetailPage({
    params: Promise.resolve({ locale: "es", slug })
  });
}
