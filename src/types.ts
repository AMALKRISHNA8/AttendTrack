export type AttendanceStatus = "present" | "absent";

export interface User {
  id: string;
  username: string;
  password?: string; // Stored in users database
  name: string;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  personId: string;
  status: AttendanceStatus;
}

export interface AttendanceList {
  id: string;
  name: string;
  userId?: string;
  people: Person[];
  attendanceRecords: AttendanceRecord[];
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export type Screen =
  | { type: "dashboard" }
  | { type: "create-list" }
  | { type: "add-people"; listName: string; listId?: string }
  | { type: "attendance-detail"; listId: string; initialTab?: "take" | "history" | "stats" | "edit" };
