import type { AttendanceList, AttendanceRecord, AttendanceStatus, Person } from "../types";

const STORAGE_KEY = "attendtrack_lists_v1";

/**
 * Generate a unique identifier.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
}

/**
 * Validates and normalizes raw parsed list object to guarantee type safety.
 */
function sanitizeList(raw: unknown): AttendanceList | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.name !== "string") {
    return null;
  }

  const people: Person[] = Array.isArray(item.people)
    ? item.people
        .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
        .map((p) => ({
          id: typeof p.id === "string" && p.id ? p.id : generateId(),
          name: typeof p.name === "string" ? p.name.trim() : "Unnamed",
        }))
        .filter((p) => p.name.length > 0)
    : [];

  const attendanceRecords: AttendanceRecord[] = Array.isArray(item.attendanceRecords)
    ? item.attendanceRecords
        .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
        .filter((r) => typeof r.date === "string" && typeof r.personId === "string" && (r.status === "present" || r.status === "absent"))
        .map((r) => ({
          date: r.date as string,
          personId: r.personId as string,
          status: r.status as AttendanceStatus,
        }))
    : [];

  return {
    id: item.id,
    name: item.name.trim(),
    people,
    attendanceRecords,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
  };
}

/**
 * Centralized retrieval of all lists from localStorage with error safety.
 */
export function getLists(): AttendanceList[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];

    const validLists: AttendanceList[] = [];
    for (const item of parsed) {
      const sanitized = sanitizeList(item);
      if (sanitized) {
        validLists.push(sanitized);
      }
    }
    return validLists;
  } catch (error) {
    console.error("Failed to load attendance lists from localStorage:", error);
    return [];
  }
}

/**
 * Persist lists array to localStorage.
 */
export function saveLists(lists: AttendanceList[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error("Failed to save attendance lists to localStorage:", error);
  }
}

/**
 * Get a specific list by ID.
 */
export function getListById(id: string): AttendanceList | null {
  const lists = getLists();
  return lists.find((l) => l.id === id) || null;
}

/**
 * Create and persist a new attendance list.
 */
export function createList(name: string, peopleNames: string[]): AttendanceList {
  const now = new Date().toISOString();
  const people: Person[] = peopleNames.map((pName) => ({
    id: generateId(),
    name: pName.trim(),
  }));

  const newList: AttendanceList = {
    id: generateId(),
    name: name.trim(),
    people,
    attendanceRecords: [],
    createdAt: now,
    updatedAt: now,
  };

  const currentLists = getLists();
  saveLists([newList, ...currentLists]);
  return newList;
}

/**
 * Update an existing list metadata or member roster while preserving attendance records.
 */
export function updateList(updated: AttendanceList): void {
  const lists = getLists();
  const index = lists.findIndex((l) => l.id === updated.id);
  if (index !== -1) {
    lists[index] = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    saveLists(lists);
  }
}

/**
 * Delete a list by ID.
 */
export function deleteList(id: string): void {
  const lists = getLists();
  const filtered = lists.filter((l) => l.id !== id);
  saveLists(filtered);
}

/**
 * Save attendance records for a specific list and date.
 * Replaces any existing records for the specified date and persons to avoid duplicates.
 */
export function saveAttendanceForDate(
  listId: string,
  date: string,
  records: { personId: string; status: AttendanceStatus }[]
): AttendanceList | null {
  const lists = getLists();
  const listIndex = lists.findIndex((l) => l.id === listId);
  if (listIndex === -1) return null;

  const currentList = lists[listIndex];
  // Filter out any previous records for this date
  const otherRecords = currentList.attendanceRecords.filter((r) => r.date !== date);

  // New records for this date
  const newDateRecords: AttendanceRecord[] = records.map((r) => ({
    date,
    personId: r.personId,
    status: r.status,
  }));

  const updatedList: AttendanceList = {
    ...currentList,
    attendanceRecords: [...otherRecords, ...newDateRecords],
    updatedAt: new Date().toISOString(),
  };

  lists[listIndex] = updatedList;
  saveLists(lists);
  return updatedList;
}
