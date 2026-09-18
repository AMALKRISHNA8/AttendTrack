import { useState, useMemo } from "react";
import type { AttendanceList, AttendanceStatus } from "../../types";
import { formatDisplayDate, getTodayDateString, shiftDate } from "../../utils/date";
import AttendanceRow from "./AttendanceRow";
import AttendanceHistory from "./AttendanceHistory";
import StatisticsView from "./StatisticsView";
import EditList from "./EditList";
import ConfirmModal from "../ConfirmModal";

interface AttendanceViewProps {
  list: AttendanceList;
  allLists: AttendanceList[];
  initialTab?: "take" | "history" | "stats" | "edit";
  onBack: () => void;
  onSaveAttendance: (date: string, records: { personId: string; status: AttendanceStatus }[]) => void;
  onUpdateList: (updatedList: AttendanceList) => void;
  onDeleteList: (listId: string) => void;
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

interface TakeAttendancePaneProps {
  list: AttendanceList;
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  onSave: (records: { personId: string; status: AttendanceStatus }[]) => void;
  onNavigateToEdit: () => void;
  onCloseToHome: () => void;
}

function TakeAttendancePane({
  list,
  selectedDate,
  onDateChange,
  onSave,
  onNavigateToEdit,
  onCloseToHome,
}: TakeAttendancePaneProps) {
  // Initialize state directly from list records for this date
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const recordsForDate = list.attendanceRecords.filter((r) => r.date === selectedDate);
    const map: Record<string, AttendanceStatus> = {};
    for (const record of recordsForDate) {
      map[record.personId] = record.status;
    }
    return map;
  });
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const isDateRecorded = useMemo(() => {
    return list.attendanceRecords.some((r) => r.date === selectedDate);
  }, [list.attendanceRecords, selectedDate]);

  const { presentCount, absentCount, unmarkedCount } = useMemo(() => {
    let present = 0;
    let absent = 0;
    for (const person of list.people) {
      const status = attendanceMap[person.id];
      if (status === "present") present++;
      else if (status === "absent") absent++;
    }
    const unmarked = list.people.length - (present + absent);
    return { presentCount: present, absentCount: absent, unmarkedCount: unmarked };
  }, [list.people, attendanceMap]);

  const handleStatusChange = (personId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => {
      if (prev[personId] === status) return prev;
      return { ...prev, [personId]: status };
    });
    setIsDirty(true);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    for (const person of list.people) {
      updated[person.id] = "present";
    }
    setAttendanceMap(updated);
    setIsDirty(true);
  };

  const handleMarkAllAbsent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    for (const person of list.people) {
      updated[person.id] = "absent";
    }
    setAttendanceMap(updated);
    setIsDirty(true);
  };

  const handleClearAll = () => {
    setAttendanceMap({});
    setIsDirty(true);
  };

  const handleSaveAttendance = () => {
    const records: { personId: string; status: AttendanceStatus }[] = [];
    for (const person of list.people) {
      const status = attendanceMap[person.id];
      if (status) {
        records.push({
          personId: person.id,
          status,
        });
      }
    }
    onSave(records);
    setIsDirty(false);
  };

  const handleRequestDateChange = (newDate: string) => {
    if (!newDate || newDate === selectedDate) return;
    if (isDirty) {
      // Auto-save changes before transitioning
      handleSaveAttendance();
    }
    onDateChange(newDate);
  };

  return (
    <div className="take-attendance-pane">
      {/* Date Control Bar */}
      <div className="card date-control-card">
        <div className="date-picker-row">
          <div className="date-picker-left">
            <label htmlFor="attendanceDate" className="date-label">
              Attendance Date:
            </label>
            <div className="date-nav-controls">
              <button
                type="button"
                className="btn-date-arrow"
                onClick={() => handleRequestDateChange(shiftDate(selectedDate, -1))}
                title="Previous day"
                aria-label="Previous day"
              >
                ◀
              </button>

              <input
                id="attendanceDate"
                type="date"
                className="input-date"
                value={selectedDate}
                onChange={(e) => handleRequestDateChange(e.target.value)}
              />

              <button
                type="button"
                className="btn-date-arrow"
                onClick={() => handleRequestDateChange(shiftDate(selectedDate, 1))}
                title="Next day"
                aria-label="Next day"
              >
                ▶
              </button>

              {selectedDate !== getTodayDateString() && (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleRequestDateChange(getTodayDateString())}
                >
                  Today
                </button>
              )}
            </div>
          </div>

          <div className="date-status-indicator">
            {isDateRecorded ? (
              <span className="status-badge badge-success">
                ✓ Recorded on {formatDisplayDate(selectedDate)}
              </span>
            ) : (
              <span className="status-badge badge-neutral">
                ℹ No records saved yet for this date
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions & Live Stats for this date */}
        <div className="date-actions-bar">
          <div className="quick-actions-group">
            <span className="quick-actions-label">Quick:</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-success"
              onClick={handleMarkAllPresent}
            >
              Mark All Present
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleMarkAllAbsent}
            >
              Mark All Absent
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>

          <div className="live-date-metrics">
            <span className="metric-tag tag-present">
              Present: <strong>{presentCount}</strong>
            </span>
            <span className="metric-tag tag-absent">
              Absent: <strong>{absentCount}</strong>
            </span>
            {unmarkedCount > 0 && (
              <span className="metric-tag tag-unmarked">
                Unmarked: <strong>{unmarkedCount}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Roster List */}
      <div className="attendance-roster-card card">
        <div className="card-header roster-header">
          <div>
            <h3>Members ({list.people.length})</h3>
            <p className="card-subtitle">
              Select Present (green) or Absent (red) for each person, then click Save Attendance.
            </p>
          </div>

          {isDirty && (
            <span className="unsaved-badge">
              ● Unsaved Changes
            </span>
          )}
        </div>

        {list.people.length === 0 ? (
          <div className="empty-people-box">
            <p>No members in this list yet.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onNavigateToEdit}
            >
              Go to Edit List to Add Members
            </button>
          </div>
        ) : (
          <div className="attendance-rows-list">
            {list.people.map((person, index) => (
              <AttendanceRow
                key={person.id}
                person={person}
                index={index}
                status={attendanceMap[person.id] ?? null}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="save-attendance-footer">
          <div className="save-hint">
            {isDirty
              ? "You have unsaved changes. Click Save Attendance to keep them."
              : isDateRecorded
              ? "Attendance is saved for this date. You can update and save anytime."
              : "Make your selections and click Save Attendance."}
          </div>

          <div className="save-actions-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCloseToHome}
              title="Close and return to home screen"
            >
              Close
            </button>
            <button
              type="button"
              className={`btn ${isDirty ? "btn-primary btn-pulse" : "btn-primary"}`}
              onClick={handleSaveAttendance}
            >
              Save Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AttendanceView({
  list,
  allLists,
  initialTab = "take",
  onBack,
  onSaveAttendance,
  onUpdateList,
  onDeleteList,
  showToast,
}: AttendanceViewProps) {
  const [activeTab, setActiveTab] = useState<"take" | "history" | "stats" | "edit">(initialTab);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Modal confirmation state for deleting the entire list
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Handle selecting a date from history
  const handleSelectHistoryDate = (date: string) => {
    setSelectedDate(date);
    setActiveTab("take");
  };

  // Handle deleting a single date's record
  const handleDeleteDateRecord = (dateToDelete: string) => {
    const remainingRecords = list.attendanceRecords.filter((r) => r.date !== dateToDelete);
    const updated = {
      ...list,
      attendanceRecords: remainingRecords,
      updatedAt: new Date().toISOString(),
    };
    onUpdateList(updated);
    showToast(`Records for ${formatDisplayDate(dateToDelete)} deleted.`, "info");
  };

  const recordedDatesCount = useMemo(() => {
    return new Set(list.attendanceRecords.map((r) => r.date)).size;
  }, [list.attendanceRecords]);

  return (
    <div className="attendance-view-container">
      {/* Top Header */}
      <div className="view-header">
        <div className="view-header-left">
          <button
            type="button"
            className="btn btn-secondary back-button"
            onClick={onBack}
            title="Return to home screen"
          >
            ← Home
          </button>
          <div className="view-title-group">
            <h2>{list.name}</h2>
            <div className="view-meta-badges">
              <span className="badge badge-neutral">
                {list.people.length} {list.people.length === 1 ? "person" : "people"}
              </span>
              <span className="badge badge-neutral">
                {recordedDatesCount} {recordedDatesCount === 1 ? "session" : "sessions"} tracked
              </span>
            </div>
          </div>
        </div>

        <div className="view-header-actions">
          <button
            type="button"
            className="btn btn-secondary close-button"
            onClick={onBack}
            title="Close and return to home screen"
          >
            ✕ Close
          </button>
          <button
            type="button"
            className="btn btn-ghost-danger btn-sm"
            onClick={() => setShowDeleteModal(true)}
            title="Delete this entire list"
          >
            Delete List
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className="view-nav-tabs" aria-label="Attendance Views">
        <button
          type="button"
          className={`nav-tab ${activeTab === "take" ? "active" : ""}`}
          onClick={() => setActiveTab("take")}
        >
          <span className="tab-icon">📝</span>
          <span className="tab-label">Take Attendance</span>
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span className="tab-icon">📅</span>
          <span className="tab-label">History</span>
          {recordedDatesCount > 0 && (
            <span className="tab-counter">{recordedDatesCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Statistics</span>
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === "edit" ? "active" : ""}`}
          onClick={() => setActiveTab("edit")}
        >
          <span className="tab-icon">⚙️</span>
          <span className="tab-label">Edit List</span>
        </button>
      </nav>

      {/* Main Tab Content */}
      <div className="tab-content-area">
        {activeTab === "take" && (
          <TakeAttendancePane
            key={`${list.id}_${selectedDate}_${list.updatedAt}`}
            list={list}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSave={(records) => {
              onSaveAttendance(selectedDate, records);
              showToast(`Attendance saved for ${formatDisplayDate(selectedDate)}!`, "success");
            }}
            onNavigateToEdit={() => setActiveTab("edit")}
            onCloseToHome={onBack}
          />
        )}

        {activeTab === "history" && (
          <AttendanceHistory
            list={list}
            onSelectDate={handleSelectHistoryDate}
            onDeleteDateRecords={handleDeleteDateRecord}
          />
        )}

        {activeTab === "stats" && (
          <StatisticsView list={list} selectedDate={selectedDate} />
        )}

        {activeTab === "edit" && (
          <EditList
            list={list}
            allLists={allLists}
            onSave={(updatedList) => {
              onUpdateList(updatedList);
              showToast("List updated successfully!", "success");
              setActiveTab("take");
            }}
            onCancel={() => setActiveTab("take")}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Attendance List"
        message={`Are you sure you want to delete "${list.name}"? All its member data and ${recordedDatesCount} recorded session(s) will be permanently deleted.`}
        confirmLabel="Delete List"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDeleteList(list.id);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

export default AttendanceView;
