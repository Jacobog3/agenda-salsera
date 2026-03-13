import EventDetailPage from "@/app/[locale]/(public)/events/[slug]/page";

export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return EventDetailPage({
    params: Promise.resolve({ locale: "es", slug })
  });
}
