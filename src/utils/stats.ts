import type { AttendanceList } from "../types";

export interface PersonStats {
  personId: string;
  name: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number; // 0 to 100
}

export interface ListStats {
  totalPeople: number;
  totalDatesRecorded: number;
  overallPercentage: number; // 0 to 100
  lastTrackedDate: string | null;
  selectedDatePresent: number;
  selectedDateAbsent: number;
  selectedDateUnmarked: number;
  selectedDatePercentage: number;
  selectedDateTotalRecorded: number;
}

/**
 * Calculates attendance statistics for an entire list and an optional selected date.
 */
export function calculateListStats(list: AttendanceList, selectedDate?: string): ListStats {
  const totalPeople = list.people.length;

  // Find unique recorded dates
  const uniqueDates = Array.from(new Set(list.attendanceRecords.map((r) => r.date))).sort().reverse();
  const totalDatesRecorded = uniqueDates.length;
  const lastTrackedDate = uniqueDates.length > 0 ? uniqueDates[0] : null;

  // Overall attendance calculation
  const totalRecords = list.attendanceRecords.length;
  const totalPresentRecords = list.attendanceRecords.filter((r) => r.status === "present").length;
  const overallPercentage = totalRecords > 0 ? Math.round((totalPresentRecords / totalRecords) * 100) : 0;

  // Selected date statistics
  let selectedDatePresent = 0;
  let selectedDateAbsent = 0;

  if (selectedDate) {
    for (const record of list.attendanceRecords) {
      if (record.date === selectedDate) {
        if (record.status === "present") selectedDatePresent++;
        if (record.status === "absent") selectedDateAbsent++;
      }
    }
  }

  const selectedDateTotalRecorded = selectedDatePresent + selectedDateAbsent;
  const selectedDateUnmarked = Math.max(0, totalPeople - selectedDateTotalRecorded);
  const selectedDatePercentage =
    selectedDateTotalRecorded > 0 ? Math.round((selectedDatePresent / selectedDateTotalRecorded) * 100) : 0;

  return {
    totalPeople,
    totalDatesRecorded,
    overallPercentage,
    lastTrackedDate,
    selectedDatePresent,
    selectedDateAbsent,
    selectedDateUnmarked,
    selectedDatePercentage,
    selectedDateTotalRecorded,
  };
}

/**
 * Calculates attendance statistics for a single person within a list.
 */
export function calculatePersonStats(personId: string, list: AttendanceList): PersonStats {
  const person = list.people.find((p) => p.id === personId);
  const name = person ? person.name : "Unknown";

  const personRecords = list.attendanceRecords.filter((r) => r.personId === personId);
  const totalDays = personRecords.length;
  const presentDays = personRecords.filter((r) => r.status === "present").length;
  const absentDays = personRecords.filter((r) => r.status === "absent").length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return {
    personId,
    name,
    totalDays,
    presentDays,
    absentDays,
    percentage,
  };
}

/**
 * Calculates statistics for all people in a list.
 */
export function calculateAllPeopleStats(list: AttendanceList): PersonStats[] {
  return list.people.map((person) => calculatePersonStats(person.id, list));
}
