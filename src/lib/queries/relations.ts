import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAcademies } from "@/lib/queries/academies";
import { getEvents } from "@/lib/queries/events";
import { getTeachers } from "@/lib/queries/teachers";
import type { LocalizedAcademy } from "@/types/academy";
import type { LocalizedEvent } from "@/types/event";
import type { Locale } from "@/types/locale";
import type { OrganizerSummary } from "@/types/organizer";
import type { LocalizedTeacher } from "@/types/teacher";
import { getOrganizerById } from "./organizers";

async function getTeacherIdsForEvent(eventId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("event_teachers")
    .select("teacher_id")
    .eq("event_id", eventId);

  if (error) {
    console.error("[relations:event_teachers]", error.message);
    return [];
  }

  return (data ?? []).map((row) => String(row.teacher_id));
}

async function getTeacherIdsForAcademy(academyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("academy_teachers")
    .select("teacher_id")
    .eq("academy_id", academyId);

  if (error) {
    console.error("[relations:academy_teachers]", error.message);
    return [];
  }

  return (data ?? []).map((row) => String(row.teacher_id));
}

async function getAcademyIdsForTeacher(teacherId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("academy_teachers")
    .select("academy_id")
    .eq("teacher_id", teacherId);

  if (error) {
    console.error("[relations:teacher_academies]", error.message);
    return [];
  }

  return (data ?? []).map((row) => String(row.academy_id));
}

export async function getRelatedTeachersForEvent(
  locale: Locale,
  eventId: string
): Promise<LocalizedTeacher[]> {
  const [teacherIds, teachers] = await Promise.all([
    getTeacherIdsForEvent(eventId),
    getTeachers(locale)
  ]);

  if (teacherIds.length === 0) return [];
  return teachers.filter((teacher) => teacherIds.includes(teacher.id));
}

export async function getRelatedAcademyForEvent(
  locale: Locale,
  academyId?: string | null
): Promise<LocalizedAcademy | null> {
  if (!academyId) return null;
  const academies = await getAcademies(locale);
  return academies.find((academy) => academy.id === academyId) ?? null;
}

export async function getRelatedOrganizerForEvent(
  organizerId?: string | null
): Promise<OrganizerSummary | null> {
  if (!organizerId) return null;
  return getOrganizerById(organizerId);
}

export async function getEventsForAcademy(
  locale: Locale,
  academyId: string
): Promise<LocalizedEvent[]> {
  const events = await getEvents(locale);
  return events.filter((event) => event.academyId === academyId);
}

export async function getTeachersForAcademy(
  locale: Locale,
  academyId: string
): Promise<LocalizedTeacher[]> {
  const [teacherIds, teachers] = await Promise.all([
    getTeacherIdsForAcademy(academyId),
    getTeachers(locale)
  ]);

  if (teacherIds.length === 0) return [];
  return teachers.filter((teacher) => teacherIds.includes(teacher.id));
}

export async function getEventsForTeacher(
  locale: Locale,
  teacherId: string
): Promise<LocalizedEvent[]> {
  const [teacherEventIds, events] = await Promise.all([
    (async () => {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("event_teachers")
        .select("event_id")
        .eq("teacher_id", teacherId);

      if (error) {
        console.error("[relations:teacher_events]", error.message);
        return [] as string[];
      }

      return (data ?? []).map((row) => String(row.event_id));
    })(),
    getEvents(locale)
  ]);

  if (teacherEventIds.length === 0) return [];
  return events.filter((event) => teacherEventIds.includes(event.id));
}

export async function getAcademiesForTeacher(
  locale: Locale,
  teacherId: string
): Promise<LocalizedAcademy[]> {
  const [academyIds, academies] = await Promise.all([
    getAcademyIdsForTeacher(teacherId),
    getAcademies(locale)
  ]);

  if (academyIds.length === 0) return [];
  return academies.filter((academy) => academyIds.includes(academy.id));
}
