import { CalendarDays, GraduationCap, MapPinned, UserRound } from "lucide-react";

export type SubmitOption = {
  href: "/submit-event" | "/submit-academy" | "/submit-teacher" | "/submit-spot";
  icon: typeof CalendarDays;
  labelKey: string;
  descKey: string;
};

export const submitOptions: SubmitOption[] = [
  {
    href: "/submit-event",
    icon: CalendarDays,
    labelKey: "submitEventLabel",
    descKey: "submitEventDesc"
  },
  {
    href: "/submit-academy",
    icon: GraduationCap,
    labelKey: "submitAcademyLabel",
    descKey: "submitAcademyDesc"
  },
  {
    href: "/submit-teacher",
    icon: UserRound,
    labelKey: "submitTeacherLabel",
    descKey: "submitTeacherDesc"
  },
  {
    href: "/submit-spot",
    icon: MapPinned,
    labelKey: "submitSpotLabel",
    descKey: "submitSpotDesc"
  }
];
