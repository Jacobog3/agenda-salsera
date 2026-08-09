import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  PartyPopper,
  Ticket,
  UsersRound
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventImageGallery } from "@/components/events/event-image-gallery";
import { getFestivalBySlug } from "@/lib/queries/festivals";
import { formatLocation } from "@/lib/locations";
import { formatCurrency, formatEventDateRange } from "@/lib/utils/formatters";
import type { FestivalArtist, FestivalPassPriceTier } from "@/types/festival";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const detail = await getFestivalBySlug(locale as Locale, slug);
  if (!detail) return {};
  return {
    title: `${detail.festival.name} | SomosSalsa`,
    description: detail.festival.shortDescription
  };
}

export default async function FestivalDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const currentLocale = locale as Locale;
  const t = await getTranslations({ locale: currentLocale, namespace: "festivals" });
  const detail = await getFestivalBySlug(currentLocale, slug);
  if (!detail) notFound();

  const { festival, currentEdition, editions, media, passes, schedule, artists } = detail;
  const historicalEditions = currentEdition
    ? editions.filter((edition) => edition.id !== currentEdition.id)
    : editions;
  const imageMedia = media.filter((item) => item.mediaType === "image");
  const videoMedia = media.filter((item) => item.mediaType === "video" || item.mediaType === "embed");
  const cover = currentEdition?.coverImageUrl ?? festival.bannerImageUrl;
  const gallery = imageMedia.map((item) => item.url);
  const location = currentEdition?.city && currentEdition.countryCode
    ? formatLocation(currentEdition.city, currentEdition.countryCode, currentLocale)
    : festival.homeCity && festival.homeCountryCode
      ? formatLocation(festival.homeCity, festival.homeCountryCode, currentLocale)
      : null;
  const dateText = currentEdition?.startsOn
    ? formatDateOnlyRange(currentEdition.startsOn, currentEdition.endsOn, currentLocale)
    : currentEdition?.startsAt && currentEdition.endsAt
      ? formatEventDateRange(
          currentEdition.startsAt,
          currentEdition.endsAt,
          currentLocale,
          currentEdition.timeZone ?? "UTC"
        )
      : currentEdition?.dateLabel;
  const typeLabel = festival.seriesType === "congress" ? t("types.congress") : t("types.festival");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="page-section pb-24 md:pb-16">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
          {cover ? (
            <div className="relative aspect-[16/8] bg-gray-50 md:aspect-[16/6]">
              <Image src={cover} alt={festival.name} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accentScale-500">{typeLabel} · {t("permanentProfile")}</p>
                <h1 className="mt-2 max-w-4xl font-display text-3xl font-bold md:text-5xl">{festival.name}</h1>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-salsaRed-100 via-accentScale-50 to-brand-100 p-8 md:p-12">
              <PartyPopper className="h-10 w-10 text-salsaRed-500" />
              <h1 className="mt-4 font-display text-3xl font-bold md:text-5xl">{festival.name}</h1>
            </div>
          )}

          <div className="grid gap-7 p-5 md:grid-cols-[1fr_auto] md:p-8">
            <div>
              <p className="max-w-3xl text-base leading-7 text-gray-600 md:text-lg">{festival.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="bg-salsaRed-50 text-salsaRed-700">{typeLabel}</Badge>
                {location ? <Badge className="bg-salsaGreen-50 text-salsaGreen-700"><MapPin className="mr-1 h-3.5 w-3.5" />{location}</Badge> : null}
                {festival.verificationStatus !== "unverified" ? <Badge className="bg-brand-50 text-brand-700"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />{t("verifiedSource")}</Badge> : null}
              </div>
            </div>
            {festival.websiteUrl ? (
              <Button asChild variant="outline">
                <a href={festival.websiteUrl} target="_blank" rel="noreferrer">{t("officialWebsite")}<ExternalLink className="h-4 w-4" /></a>
              </Button>
            ) : null}
          </div>
        </div>

        {currentEdition ? (
          <div className="mt-10 space-y-10">
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-salsaRed-600">{t("currentEdition")}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-gray-950">{currentEdition.name}</h2>
                  <p className="mt-2 max-w-3xl text-gray-600">{currentEdition.summary}</p>
                </div>
                {currentEdition.ticketUrl ? (
                  <Button asChild className="bg-salsaRed-500 hover:bg-salsaRed-600">
                    <a href={currentEdition.ticketUrl} target="_blank" rel="noreferrer"><Ticket className="h-4 w-4" />{t("tickets")}</a>
                  </Button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dateText ? <InfoCard icon={CalendarDays} label={t("dateLabel")} value={dateText} tone="blue" /> : null}
                {location ? <InfoCard icon={MapPin} label={t("locationLabel")} value={location} tone="green" /> : null}
                {currentEdition.primaryVenueName ? <InfoCard icon={PartyPopper} label={t("venueLabel")} value={currentEdition.primaryVenueName} tone="yellow" /> : null}
              </div>

              {currentEdition.hotelInfo || currentEdition.rulesUrl ? (
                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                  {currentEdition.hotelInfo ? (
                    <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
                      <div className="flex gap-3">
                        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                        <div>
                          <h3 className="font-semibold text-gray-950">{t("hotelTitle")}</h3>
                          <p className="mt-1 text-sm leading-6 text-gray-600">{currentEdition.hotelInfo}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {currentEdition.rulesUrl ? (
                    <Button asChild variant="outline" className="h-auto min-h-12">
                      <a href={currentEdition.rulesUrl} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" />{t("rules")}</a>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </section>

            {cover && gallery.length > 0 ? (
              <section>
                <SectionTitle eyebrow={t("mediaEyebrow")} title={t("mediaTitle")} />
                <div className="mt-5 max-w-4xl"><EventImageGallery coverImageUrl={cover} galleryUrls={gallery} alt={currentEdition.name} /></div>
              </section>
            ) : null}

            {videoMedia.length > 0 ? (
              <section>
                <SectionTitle eyebrow={t("videoEyebrow")} title={t("videosTitle")} />
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {videoMedia.map((item) => (
                    <video key={item.id} controls poster={item.thumbnailUrl ?? undefined} className="aspect-video w-full rounded-2xl bg-black" preload="metadata">
                      <source src={item.url} />
                    </video>
                  ))}
                </div>
              </section>
            ) : null}

            {artists.length > 0 ? (
              <section>
                <SectionTitle eyebrow={t("artistsEyebrow")} title={t("artistsTitle")} />
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {artists.map((artist) => (
                    artist.slug ? (
                      <Link key={artist.id} href={{ pathname: "/artists/[slug]", params: { slug: artist.slug } }} className="rounded-2xl border border-gray-100 bg-white p-3 transition hover:border-salsaOrange-200 hover:shadow-sm">
                        <ArtistCardContent artist={artist} candidateLabel={t("artistCandidate")} />
                      </Link>
                    ) : (
                      <article key={artist.id} className="rounded-2xl border border-gray-100 bg-white p-3">
                        <ArtistCardContent artist={artist} candidateLabel={t("artistCandidate")} />
                      </article>
                    )
                  ))}
                </div>
              </section>
            ) : null}

            {schedule.length > 0 ? (
              <section>
                <SectionTitle eyebrow={t("scheduleEyebrow")} title={t("scheduleTitle")} />
                <div className="mt-5 divide-y divide-gray-100 overflow-hidden rounded-3xl border border-gray-100 bg-white">
                  {schedule.map((item) => (
                    <div key={item.id} className="grid gap-2 p-4 sm:grid-cols-[11rem_1fr] sm:p-5">
                      <p className="text-sm font-semibold text-brand-700">{item.startsAt ? new Intl.DateTimeFormat(currentLocale, { dateStyle: "medium", timeStyle: "short", timeZone: currentEdition.timeZone ?? "UTC" }).format(new Date(item.startsAt)) : t("timePending")}</p>
                      <div><h3 className="font-semibold text-gray-950">{item.title}</h3>{item.venueName ? <p className="mt-1 text-sm text-gray-500">{item.venueName}{item.roomName ? ` · ${item.roomName}` : ""}</p> : null}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {passes.length > 0 ? (
              <section>
                <SectionTitle eyebrow={t("passesEyebrow")} title={t("passesTitle")} />
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {passes.map((pass) => (
                    <article key={pass.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <Ticket className="h-5 w-5 text-salsaRed-500" />
                      <h3 className="mt-3 font-display text-xl font-bold">{pass.name}</h3>
                      {pass.priceAmount != null && pass.currency ? <p className="mt-2 text-lg font-bold text-salsaRed-600">{formatCurrency(pass.priceAmount, pass.currency, currentLocale)}</p> : null}
                      {pass.description ? <p className="mt-2 text-sm leading-6 text-gray-600">{pass.description}</p> : null}
                      {pass.priceTiers.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          {groupPriceTiers(pass.priceTiers, today).map((group) => (
                            <div
                              key={group.label}
                              className={`rounded-xl border px-3 py-2.5 ${
                                group.phase === "active"
                                  ? "border-salsaGreen-200 bg-salsaGreen-50"
                                  : group.phase === "expired"
                                    ? "border-gray-100 bg-gray-50 opacity-65"
                                    : "border-accentScale-100 bg-accentScale-50"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                  {group.label}
                                  <Badge
                                    variant="outline"
                                    className={`px-1.5 py-0 text-[9px] ${
                                      group.phase === "active"
                                        ? "border-salsaGreen-300 text-salsaGreen-700"
                                        : group.phase === "expired"
                                          ? "border-gray-200 text-gray-400"
                                          : "border-accentScale-200 text-accentScale-700"
                                    }`}
                                  >
                                    {t(group.phase === "active" ? "tierActive" : group.phase === "expired" ? "tierExpired" : "tierUpcoming")}
                                  </Badge>
                                </span>
                                <span className="text-sm font-bold text-brand-700">
                                  {group.tiers.map((tier) => formatCurrency(tier.priceAmount, tier.currency, currentLocale)).join(" · ")}
                                </span>
                              </div>
                              {group.endsOn ? <p className="mt-1 text-[11px] text-gray-400">{t("validUntil", { date: formatDateOnly(group.endsOn, currentLocale) })}</p> : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {pass.includes.length > 0 ? <ul className="mt-4 space-y-2 text-sm text-gray-600">{pass.includes.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-salsaGreen-500" />{item}</li>)}</ul> : null}
                      {pass.purchaseUrl ? <Button asChild className="mt-5 w-full bg-brand-600 hover:bg-brand-700"><a href={pass.purchaseUrl} target="_blank" rel="noreferrer">{t("buyPass")}<ExternalLink className="h-4 w-4" /></a></Button> : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {historicalEditions.length > 0 ? (
              <section>
                <SectionTitle eyebrow={t("historyEyebrow")} title={t("historyTitle")} />
                <div className="mt-5 flex flex-wrap gap-2">{historicalEditions.map((edition) => <Badge key={edition.id} variant="outline">{edition.editionLabel ?? edition.name}</Badge>)}</div>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-accentScale-50 p-6 text-accentScale-700">{t("noEdition")}</div>
        )}
      </Container>
    </section>
  );
}

function ArtistCardContent({ artist, candidateLabel }: { artist: FestivalArtist; candidateLabel: string }) {
  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-salsaOrange-50">
        {artist.profileImageUrl ? <Image src={artist.profileImageUrl} alt={artist.name} fill className="object-cover" /> : <UsersRound className="absolute inset-0 m-auto h-8 w-8 text-salsaOrange-500" />}
      </div>
      <h3 className="mt-3 font-semibold text-gray-950">{artist.name}</h3>
      {artist.roles.length > 0 ? <p className="mt-1 text-xs text-gray-500">{artist.roles.join(" · ")}</p> : null}
      {artist.isCandidate ? <Badge variant="outline" className="mt-2 border-accentScale-300 text-[10px] text-accentScale-700">{candidateLabel}</Badge> : null}
    </>
  );
}

function formatDateOnly(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function formatDateOnlyRange(start: string, end: string | null | undefined, locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });
  const startDate = new Date(`${start}T12:00:00Z`);
  if (!end || end === start) return formatter.format(startDate);
  return formatter.formatRange(startDate, new Date(`${end}T12:00:00Z`));
}

type PriceTierPhase = "active" | "expired" | "upcoming";

function groupPriceTiers(tiers: FestivalPassPriceTier[], today: string) {
  const groups = new Map<string, {
    label: string;
    startsOn?: string | null;
    endsOn?: string | null;
    tiers: FestivalPassPriceTier[];
  }>();
  for (const tier of tiers) {
    const group = groups.get(tier.label) ?? {
      label: tier.label,
      startsOn: tier.startsOn,
      endsOn: tier.endsOn,
      tiers: []
    };
    group.tiers.push(tier);
    groups.set(tier.label, group);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, phase: getPriceTierPhase(group.startsOn, group.endsOn, today) }))
    .sort((a, b) => priceTierOrder(a.phase) - priceTierOrder(b.phase));
}

function getPriceTierPhase(startsOn: string | null | undefined, endsOn: string | null | undefined, today: string): PriceTierPhase {
  if (endsOn && endsOn < today) return "expired";
  if (startsOn && startsOn > today) return "upcoming";
  return "active";
}

function priceTierOrder(phase: PriceTierPhase) {
  if (phase === "active") return 0;
  if (phase === "upcoming") return 1;
  return 2;
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-salsaRed-600">{eyebrow}</p><h2 className="mt-2 font-display text-2xl font-bold text-gray-950 md:text-3xl">{title}</h2></div>;
}

function InfoCard({ icon: Icon, label, value, tone }: { icon: typeof CalendarDays; label: string; value: string; tone: "blue" | "green" | "yellow" }) {
  const tones = { blue: "bg-brand-50 text-brand-700", green: "bg-salsaGreen-50 text-salsaGreen-700", yellow: "bg-accentScale-50 text-accentScale-700" };
  return <div className="rounded-2xl border border-gray-100 bg-white p-4"><span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></span><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 text-sm font-semibold text-gray-900">{value}</p></div>;
}
