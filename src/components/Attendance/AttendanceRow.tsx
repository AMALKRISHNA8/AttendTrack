import React from "react";
import type { AttendanceStatus, Person } from "../../types";

interface AttendanceRowProps {
  person: Person;
  index: number;
  status: AttendanceStatus | null; // null if unmarked
  onStatusChange: (personId: string, status: AttendanceStatus) => void;
}

export const AttendanceRow: React.FC<AttendanceRowProps> = ({
  person,
  index,
  status,
  onStatusChange,
}) => {
  const isPresent = status === "present";
  const isAbsent = status === "absent";

  return (
    <div className={`attendance-row ${isPresent ? "row-present" : isAbsent ? "row-absent" : "row-unmarked"}`}>
      <div className="attendance-person-info">
        <span className="person-number">{index + 1}</span>
        <span className="person-name-text">{person.name}</span>
        {status === null && <span className="status-badge-unmarked">Unmarked</span>}
      </div>

      <div className="attendance-toggle-group" role="group" aria-label={`Attendance for ${person.name}`}>
        <button
          type="button"
          className={`btn-attendance-toggle toggle-present ${isPresent ? "active" : ""}`}
          onClick={() => onStatusChange(person.id, "present")}
          aria-pressed={isPresent}
        >
          <span className="toggle-icon">✓</span>
          <span className="toggle-label">Present</span>
        </button>

        <button
          type="button"
          className={`btn-attendance-toggle toggle-absent ${isAbsent ? "active" : ""}`}
          onClick={() => onStatusChange(person.id, "absent")}
          aria-pressed={isAbsent}
        >
          <span className="toggle-icon">✕</span>
          <span className="toggle-label">Absent</span>
        </button>
      </div>
    </div>
  );
};

export default AttendanceRow;
