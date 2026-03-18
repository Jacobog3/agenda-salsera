import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LocalizedTeacher } from "@/types/teacher";

function InstagramIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path
        fill="currentColor"
        d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM17.5 6.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
      />
    </svg>
  );
}

function WhatsAppIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
      <path
        fill="currentColor"
        d="M12 2a9.84 9.84 0 0 0-8.52 14.76L2 22l5.39-1.41A10 10 0 1 0 12 2Zm0 18.2a8.15 8.15 0 0 1-4.15-1.13l-.3-.18-3.2.84.86-3.12-.2-.31A8.2 8.2 0 1 1 12 20.2Zm4.5-6.15c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.57.12-.17.25-.65.8-.8.96-.15.17-.3.19-.55.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.1-.5.1-.1.25-.27.37-.4.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.57-1.38-.78-1.89-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.02 2.58.12.17 1.76 2.69 4.26 3.77.6.26 1.08.42 1.44.54.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29Z"
      />
    </svg>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function TeacherCard({
  teacher
}: {
  teacher: LocalizedTeacher;
}) {
  const t = await getTranslations("academies");
  const common = await getTranslations("common");

  return (
    <Link
      href={{ pathname: "/teachers/[slug]", params: { slug: teacher.slug } }}
      className="block h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden border-border/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.99]">
      <div className="border-b border-brand-100 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.12),_transparent_45%),linear-gradient(135deg,_#fff6ea,_#ffffff_65%)] p-4 md:p-5">
        <div className="flex items-start gap-3">
          {teacher.profileImageUrl ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-brand-100 shadow-sm">
              <Image
                src={teacher.profileImageUrl}
                alt={teacher.name}
                fill
                sizes="64px"
                unoptimized={teacher.profileImageUrl.startsWith("/local-images/")}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600 font-display text-lg font-bold text-white shadow-sm">
              {getInitials(teacher.name)}
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <div className="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700 ring-1 ring-brand-100">
              {t("teachers.label")}
            </div>
            <h3 className="font-display text-lg font-bold leading-tight text-foreground md:text-xl">
              {teacher.name}
            </h3>
            <p className="text-xs text-muted-foreground md:text-sm">
              {teacher.city}
              {teacher.area ? ` · ${teacher.area}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
        <div className="flex flex-wrap gap-1.5">
          {teacher.stylesTaught.map((style) => (
            <Badge key={style} variant="accent" className="px-2.5 py-0.5 text-[11px] md:text-xs">
              {common(`danceStyles.${style}`)}
            </Badge>
          ))}
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2 md:text-sm">
          {teacher.teachingVenues?.length ? (
            <div className="rounded-xl bg-surface-soft px-3 py-2">
              <p className="font-semibold text-foreground">{t("teachers.teachesAtLabel")}</p>
              <p>{teacher.teachingVenues.join(" · ")}</p>
            </div>
          ) : null}

          {teacher.levels ? (
            <div className="rounded-xl bg-surface-soft px-3 py-2">
              <p className="font-semibold text-foreground">{t("levelsLabel")}</p>
              <p>{teacher.levels}</p>
            </div>
          ) : null}
        </div>

        {teacher.classFormats?.length ? (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("teachers.formatsLabel")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {teacher.classFormats.map((format) => (
                <span
                  key={format}
                  className="inline-flex min-h-9 items-center rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {(teacher.whatsappUrl || teacher.instagramUrl) ? (
          <div className="mt-auto space-y-1.5 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("contactTitle")}
            </p>
            <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              {teacher.whatsappUrl ? (
                <a
                  href={teacher.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("teachers.whatsappAria")}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-all hover:brightness-95 active:scale-[0.98]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
              ) : null}
              {teacher.instagramUrl ? (
                <a
                  href={teacher.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("teachers.instagramAria")}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-all hover:border-brand-200 hover:text-brand-700 active:scale-[0.98]"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
    </Link>
  );
}
