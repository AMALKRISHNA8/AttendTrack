import React from "react";
import type { AttendanceList } from "../../types";
import { calculateAllPeopleStats, calculateListStats } from "../../utils/stats";
import { formatDisplayDate } from "../../utils/date";

interface StatisticsViewProps {
  list: AttendanceList;
  selectedDate?: string;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ list, selectedDate }) => {
  const listStats = calculateListStats(list, selectedDate);
  const peopleStats = calculateAllPeopleStats(list);

  // Sort people alphabetically or by attendance rate
  const sortedPeople = [...peopleStats].sort((a, b) => b.percentage - a.percentage || a.name.localeCompare(b.name));

  return (
    <div className="stats-container">
      {/* Top summary KPI cards */}
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total People</span>
          <span className="kpi-value">{listStats.totalPeople}</span>
          <span className="kpi-subtext">Active roster members</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Recorded Sessions</span>
          <span className="kpi-value">{listStats.totalDatesRecorded}</span>
          <span className="kpi-subtext">
            {listStats.lastTrackedDate
              ? `Last: ${formatDisplayDate(listStats.lastTrackedDate)}`
              : "No dates recorded yet"}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Overall Attendance</span>
          <span className="kpi-value highlight-rate">
            {listStats.totalDatesRecorded > 0 ? `${listStats.overallPercentage}%` : "—"}
          </span>
          <span className="kpi-subtext">
            {listStats.totalDatesRecorded > 0
              ? `Across all ${listStats.totalDatesRecorded} session(s)`
              : "Awaiting attendance entries"}
          </span>
        </div>

        {selectedDate && (
          <div className="kpi-card kpi-card-focus">
            <span className="kpi-label">Selected Date ({selectedDate})</span>
            <div className="kpi-date-split">
              <span className="text-success">{listStats.selectedDatePresent} Present</span>
              <span className="text-separator">•</span>
              <span className="text-danger">{listStats.selectedDateAbsent} Absent</span>
            </div>
            <span className="kpi-subtext">
              {listStats.selectedDateTotalRecorded > 0
                ? `${listStats.selectedDatePercentage}% present today`
                : "Not recorded for this date"}
            </span>
          </div>
        )}
      </div>

      {/* People Individual Breakdown */}
      <div className="people-stats-section card">
        <div className="card-header">
          <h3>Individual Attendance Breakdown</h3>
          <p className="card-subtitle">
            Detailed attendance performance for each person across all recorded dates.
          </p>
        </div>

        {listStats.totalDatesRecorded === 0 ? (
          <div className="empty-state-small">
            <p>No attendance records have been saved yet.</p>
            <span className="hint-text">
              Take attendance on the "Take Attendance" tab to populate individual percentages.
            </span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Sessions</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th className="th-rate">Rate</th>
                </tr>
              </thead>
              <tbody>
                {sortedPeople.map((person, index) => {
                  const rateClass =
                    person.percentage >= 80
                      ? "rate-high"
                      : person.percentage >= 60
                      ? "rate-medium"
                      : "rate-low";

                  return (
                    <tr key={person.personId}>
                      <td className="td-index">{index + 1}</td>
                      <td className="td-name">
                        <strong>{person.name}</strong>
                      </td>
                      <td>{person.totalDays}</td>
                      <td className="text-success font-semibold">{person.presentDays}</td>
                      <td className="text-danger font-semibold">{person.absentDays}</td>
                      <td className="td-rate">
                        <div className="rate-container">
                          <div className="progress-bar-bg">
                            <div
                              className={`progress-bar-fill ${rateClass}`}
                              style={{ width: `${person.percentage}%` }}
                            />
                          </div>
                          <span className={`rate-text ${rateClass}`}>
                            {person.totalDays > 0 ? `${person.percentage}%` : "0%"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsView;
