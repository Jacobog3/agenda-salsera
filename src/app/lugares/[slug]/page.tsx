import SpotDetailPage from "@/app/[locale]/(public)/spots/[slug]/page";

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return SpotDetailPage({
    params: Promise.resolve({ locale: "es", slug })
  });
}
