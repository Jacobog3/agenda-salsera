import Image from "next/image";
import { PageIntro } from "@/components/shared/page-intro";
import type { Locale } from "@/types/locale";

export function AgendaIntro({
  title,
  description,
  partnerLabel,
  partnerName,
  lastUpdated,
  locale
}: {
  title: string;
  description: string;
  partnerLabel: string;
  partnerName: string;
  lastUpdated: string | null;
  locale: Locale;
}) {
  return (
    <PageIntro
      title={title}
      description={description}
      lastUpdated={lastUpdated}
      locale={locale}
      accent="puro"
      aside={
        <Image
          src="/images/puro-salsero-logo-color-transparent.png"
          alt={partnerName}
          width={605}
          height={479}
          className="h-auto w-24 md:w-40"
          priority
        />
      }
    >
      <p className="text-[11px] font-semibold leading-tight text-gray-500 md:text-sm">
        {partnerLabel}{" "}
        <span className="font-extrabold text-[#c94f25]">{partnerName}</span>
      </p>
    </PageIntro>
  );
}
