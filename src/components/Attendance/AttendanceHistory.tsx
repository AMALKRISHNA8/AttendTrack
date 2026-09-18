import React from "react";
import type { AttendanceList } from "../../types";
import { formatDisplayDate } from "../../utils/date";

interface AttendanceHistoryProps {
  list: AttendanceList;
  onSelectDate: (date: string) => void;
  onDeleteDateRecords?: (date: string) => void;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  list,
  onSelectDate,
  onDeleteDateRecords,
}) => {
  // Collect all unique recorded dates and sort descending
  const dates = Array.from(new Set(list.attendanceRecords.map((r) => r.date))).sort().reverse();

  if (dates.length === 0) {
    return (
      <div className="empty-history-card">
        <div className="empty-icon-circle">📅</div>
        <h3>No Attendance History Yet</h3>
        <p>You haven't saved any attendance sessions for this list yet.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onSelectDate(new Date().toISOString().split("T")[0])}
        >
          Take Today's Attendance
        </button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="section-header">
        <div>
          <h3>Recorded Sessions ({dates.length})</h3>
          <p className="section-subtitle">
            Click on any date to inspect or modify its attendance records.
          </p>
        </div>
      </div>

      <div className="history-list">
        {dates.map((date) => {
          const recordsForDate = list.attendanceRecords.filter((r) => r.date === date);
          const presentCount = recordsForDate.filter((r) => r.status === "present").length;
          const absentCount = recordsForDate.filter((r) => r.status === "absent").length;
          const totalMarked = presentCount + absentCount;
          const percentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

          const percentageColor =
            percentage >= 75 ? "badge-success" : percentage >= 50 ? "badge-warning" : "badge-danger";

          return (
            <div key={date} className="history-item-card">
              <div className="history-date-block">
                <span className="history-date-title">{formatDisplayDate(date)}</span>
                <span className="history-date-iso">{date}</span>
              </div>

              <div className="history-stats-block">
                <div className="history-metric">
                  <span className="metric-count text-success">{presentCount}</span>
                  <span className="metric-label">Present</span>
                </div>
                <div className="history-metric">
                  <span className="metric-count text-danger">{absentCount}</span>
                  <span className="metric-label">Absent</span>
                </div>
                <div className="history-percentage">
                  <span className={`badge ${percentageColor}`}>{percentage}%</span>
                </div>
              </div>

              <div className="history-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSelectDate(date)}
                  title="View or Edit Attendance for this date"
                >
                  View / Edit →
                </button>
                {onDeleteDateRecords && (
                  <button
                    type="button"
                    className="btn btn-ghost-danger btn-sm"
                    onClick={() => onDeleteDateRecords(date)}
                    title="Delete record for this date"
                    aria-label={`Delete record for ${date}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceHistory;
