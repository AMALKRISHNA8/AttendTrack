import React from "react";
import type { AttendanceList } from "../../types";
import { calculateListStats } from "../../utils/stats";
import { formatDisplayDate } from "../../utils/date";

interface ListCardProps {
  list: AttendanceList;
  onOpen: (listId: string) => void;
  onDeleteRequest: (list: AttendanceList) => void;
}

export const ListCard: React.FC<ListCardProps> = ({
  list,
  onOpen,
  onDeleteRequest,
}) => {
  const stats = calculateListStats(list);

  // Determine badge styling based on overall percentage
  const rateClass =
    stats.totalDatesRecorded === 0
      ? "badge-neutral"
      : stats.overallPercentage >= 80
      ? "badge-success"
      : stats.overallPercentage >= 60
      ? "badge-warning"
      : "badge-danger";

  return (
    <div className="list-card">
      <div className="list-card-header">
        <h3 className="list-card-title">{list.name}</h3>
        <span className={`badge ${rateClass}`}>
          {stats.totalDatesRecorded > 0 ? `${stats.overallPercentage}% Overall` : "No records yet"}
        </span>
      </div>

      <div className="list-card-body">
        <div className="list-stat-row">
          <span className="stat-icon">👥</span>
          <span className="stat-text">
            <strong>{list.people.length}</strong> {list.people.length === 1 ? "person" : "people"}
          </span>
        </div>

        <div className="list-stat-row">
          <span className="stat-icon">📅</span>
          <span className="stat-text">
            {stats.lastTrackedDate ? (
              <>
                Last tracked: <strong>{formatDisplayDate(stats.lastTrackedDate)}</strong>
              </>
            ) : (
              <span className="text-muted">Not tracked yet</span>
            )}
          </span>
        </div>
      </div>

      <div className="list-card-actions">
        <button
          type="button"
          className="btn btn-primary btn-sm flex-1"
          onClick={() => onOpen(list.id)}
        >
          Open Tracker →
        </button>
        <button
          type="button"
          className="btn btn-ghost-danger btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(list);
          }}
          aria-label={`Delete ${list.name}`}
          title="Delete list"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ListCard;
