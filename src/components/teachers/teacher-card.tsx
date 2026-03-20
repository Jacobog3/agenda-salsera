import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isPrimaryDanceStyle } from "@/lib/academies/academy-helpers";
import { MapPin } from "lucide-react";
import type { LocalizedTeacher } from "@/types/teacher";

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
  const common = await getTranslations("common");
  const displayStyles = teacher.styleTags && teacher.styleTags.length > 0
    ? teacher.styleTags
    : teacher.stylesTaught.map((style) => common(`danceStyles.${style}`));
  const teacherMeta =
    teacher.classFormats?.slice(0, 2).join(" · ") ||
    teacher.levels ||
    null;

  return (
    <Link
      href={{ pathname: "/teachers/[slug]", params: { slug: teacher.slug } }}
      className="block"
    >
      <Card className="group flex flex-row overflow-hidden bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.98] md:flex-col">
        <div className="relative w-[104px] shrink-0 self-stretch overflow-hidden bg-surface-soft md:w-full md:aspect-[4/3]">
          {teacher.profileImageUrl ? (
            <Image
              src={teacher.profileImageUrl}
              alt={teacher.name}
              fill
              sizes="(min-width: 768px) 50vw, 104px"
              unoptimized={teacher.profileImageUrl.startsWith("/local-images/")}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-600 font-display text-2xl font-bold text-white">
              {getInitials(teacher.name)}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1 p-3 md:gap-3 md:p-5">
          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug tracking-tight text-foreground md:text-xl">
            {teacher.name}
          </h3>

          <div className="flex flex-col gap-1 text-xs md:mt-auto md:text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
              {teacher.city}
              {teacher.area ? ` · ${teacher.area}` : ""}
            </span>
            {teacherMeta ? (
              <span className="line-clamp-1 text-muted-foreground">
                {teacherMeta}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1">
            {displayStyles.slice(0, 4).map((style) => (
              <Badge
                key={style}
                variant="accent"
                className="px-2 py-px text-[10px] md:px-2.5 md:py-0.5 md:text-xs"
              >
                {isPrimaryDanceStyle(style) ? common(`danceStyles.${style}`) : style}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}
