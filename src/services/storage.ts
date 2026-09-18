import type { AttendanceList, AttendanceRecord, AttendanceStatus, Person, User } from "../types";

const LEGACY_STORAGE_KEY = "attendtrack_lists_v1";
const USERS_STORAGE_KEY = "attendtrack_users_v1";
const SESSION_STORAGE_KEY = "attendtrack_current_user_v1";

/**
 * Returns the localStorage key for a specific user's attendance lists.
 * This guarantees 100% data isolation between different accounts.
 */
export function getUserListsKey(userId: string): string {
  return `attendtrack_lists_user_${userId}`;
}

/**
 * Generate a unique identifier.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
}

/* ==========================================================================
   User Authentication & Session Management
   ========================================================================== */

/**
 * Get all registered users from localStorage.
 */
export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load users from localStorage:", error);
    return [];
  }
}

/**
 * Save users array to localStorage.
 */
function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to localStorage:", error);
  }
}

/**
 * Register a new user with username and password.
 */
export function registerUser(
  username: string,
  password: string,
  name?: string
): { success: boolean; user?: User; error?: string } {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  const displayName = (name && name.trim()) || trimmedUsername;

  if (!trimmedUsername) {
    return { success: false, error: "Username cannot be empty." };
  }
  if (trimmedUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }
  if (!trimmedPassword) {
    return { success: false, error: "Password cannot be empty." };
  }
  if (trimmedPassword.length < 4) {
    return { success: false, error: "Password must be at least 4 characters." };
  }

  const users = getUsers();
  const exists = users.some(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (exists) {
    return { success: false, error: `Username "${trimmedUsername}" is already taken.` };
  }

  const newUser: User = {
    id: generateId(),
    username: trimmedUsername,
    password: trimmedPassword,
    name: displayName,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);

  // Strip password before returning and storing in session
  const sessionUser: User = {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    createdAt: newUser.createdAt,
  };
  setCurrentUser(sessionUser);

  return { success: true, user: sessionUser };
}

/**
 * Login an existing user with username and password.
 */
export function loginUser(
  username: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return { success: false, error: "Please enter both username and password." };
  }

  const users = getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (!user || user.password !== trimmedPassword) {
    return { success: false, error: "Invalid username or password." };
  }

  const sessionUser: User = {
    id: user.id,
    username: user.username,
    name: user.name,
    createdAt: user.createdAt,
  };
  setCurrentUser(sessionUser);

  return { success: true, user: sessionUser };
}

/**
 * Get current logged in user from session storage.
 */
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load current user session:", error);
    return null;
  }
}

/**
 * Set current logged in user session.
 */
export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to save current user session:", error);
  }
}

/**
 * Log out current user.
 */
export function logoutUser(): void {
  setCurrentUser(null);
}

/* ==========================================================================
   Attendance List Persistence (Isolated per User)
   ========================================================================== */

/**
 * Validates and normalizes raw parsed list object to guarantee type safety.
 */
function sanitizeList(raw: unknown, defaultUserId?: string): AttendanceList | null {
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
    userId: typeof item.userId === "string" ? item.userId : defaultUserId,
    people,
    attendanceRecords,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
  };
}

/**
 * Resolves the effective userId, falling back to current active session.
 */
function resolveUserId(userId?: string): string | null {
  if (userId) return userId;
  const current = getCurrentUser();
  return current ? current.id : null;
}

/**
 * Centralized retrieval of all lists for a specific user from localStorage.
 * Handles one-time migration of unassigned legacy lists to the first user.
 */
export function getLists(userId?: string): AttendanceList[] {
  const activeUserId = resolveUserId(userId);
  if (!activeUserId) return [];

  const userKey = getUserListsKey(activeUserId);

  try {
    const json = localStorage.getItem(userKey);

    // If user's specific storage exists, parse and return it
    if (json !== null) {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return [];

      const validLists: AttendanceList[] = [];
      for (const item of parsed) {
        const sanitized = sanitizeList(item, activeUserId);
        if (sanitized) validLists.push(sanitized);
      }
      return validLists;
    }

    // Check if there are legacy lists in the old shared storage key
    const legacyJson = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyJson) {
      try {
        const legacyParsed = JSON.parse(legacyJson);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          const migratedLists: AttendanceList[] = [];
          for (const item of legacyParsed) {
            const sanitized = sanitizeList(item, activeUserId);
            if (sanitized) migratedLists.push(sanitized);
          }

          // Migrate to this user and clean up the old shared key
          saveLists(migratedLists, activeUserId);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          return migratedLists;
        }
      } catch {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    // Brand new user with no lists yet
    return [];
  } catch (error) {
    console.error("Failed to load attendance lists from localStorage:", error);
    return [];
  }
}

/**
 * Persist lists array to localStorage isolated for the given user.
 */
export function saveLists(lists: AttendanceList[], userId?: string): void {
  const activeUserId = resolveUserId(userId);
  if (!activeUserId) return;

  try {
    const userKey = getUserListsKey(activeUserId);
    localStorage.setItem(userKey, JSON.stringify(lists));
  } catch (error) {
    console.error("Failed to save attendance lists to localStorage:", error);
  }
}

/**
 * Get a specific list by ID for the given user.
 */
export function getListById(id: string, userId?: string): AttendanceList | null {
  const lists = getLists(userId);
  return lists.find((l) => l.id === id) || null;
}

/**
 * Create and persist a new attendance list for the given user.
 */
export function createList(name: string, peopleNames: string[], userId?: string): AttendanceList {
  const activeUserId = resolveUserId(userId);
  const now = new Date().toISOString();
  const people: Person[] = peopleNames.map((pName) => ({
    id: generateId(),
    name: pName.trim(),
  }));

  const newList: AttendanceList = {
    id: generateId(),
    name: name.trim(),
    userId: activeUserId || undefined,
    people,
    attendanceRecords: [],
    createdAt: now,
    updatedAt: now,
  };

  const currentLists = getLists(activeUserId || undefined);
  saveLists([newList, ...currentLists], activeUserId || undefined);
  return newList;
}

/**
 * Update an existing list metadata or member roster for the given user.
 */
export function updateList(updated: AttendanceList, userId?: string): void {
  const activeUserId = resolveUserId(userId || updated.userId);
  const lists = getLists(activeUserId || undefined);
  const index = lists.findIndex((l) => l.id === updated.id);
  if (index !== -1) {
    lists[index] = {
      ...updated,
      userId: activeUserId || updated.userId,
      updatedAt: new Date().toISOString(),
    };
    saveLists(lists, activeUserId || undefined);
  }
}

/**
 * Delete a list by ID for the given user.
 */
export function deleteList(id: string, userId?: string): void {
  const activeUserId = resolveUserId(userId);
  const lists = getLists(activeUserId || undefined);
  const filtered = lists.filter((l) => l.id !== id);
  saveLists(filtered, activeUserId || undefined);
}

/**
 * Save attendance records for a specific list and date for the given user.
 */
export function saveAttendanceForDate(
  listId: string,
  date: string,
  records: { personId: string; status: AttendanceStatus }[],
  userId?: string
): AttendanceList | null {
  const activeUserId = resolveUserId(userId);
  const lists = getLists(activeUserId || undefined);
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
  saveLists(lists, activeUserId || undefined);
  return updatedList;
}
