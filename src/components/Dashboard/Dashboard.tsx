import { useState } from "react";
import type { AttendanceList, User } from "../../types";
import ListCard from "./ListCard";
import ConfirmModal from "../ConfirmModal";

interface DashboardProps {
  lists: AttendanceList[];
  currentUser?: User | null;
  onCreateNew: () => void;
  onOpenList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
  onLogout?: () => void;
}

export function Dashboard({
  lists,
  currentUser,
  onCreateNew,
  onOpenList,
  onDeleteList,
  onLogout,
}: DashboardProps) {
  const [listToDelete, setListToDelete] = useState<AttendanceList | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const totalMembersTracked = lists.reduce((sum, l) => sum + l.people.length, 0);

  return (
    <div className="dashboard-container">
      {/* Header section with brand and action */}
      <header className="dashboard-header">
        <div className="dashboard-branding">
          <div className="brand-badge-group">
            <div className="brand-logo-icon">✓</div>
            <div>
              <h1 className="brand-title">AttendTrack</h1>
              <p className="brand-tagline">Simple, reliable attendance tracking</p>
            </div>
          </div>
        </div>

        <div className="dashboard-header-actions">
          {currentUser && (
            <div className="user-profile-badge">
              <span className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</span>
              <div className="user-info-text">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-handle">@{currentUser.username}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary create-button"
            onClick={onCreateNew}
          >
            + Create List
          </button>

          {onLogout && (
            <button
              type="button"
              className="btn btn-secondary btn-logout"
              onClick={() => setShowLogoutModal(true)}
              title="Sign out of your account"
            >
              Log Out
            </button>
          )}
        </div>
      </header>

      {/* Main content: Empty state OR Cards Grid */}
      <main className="dashboard-main">
        {lists.length === 0 ? (
          <section className="empty-state-card card">
            <div className="empty-icon-circle">✓</div>
            <h2 className="empty-title">No attendance lists yet</h2>
            <p className="empty-description">
              Create your first attendance list to start tracking attendance for your team, class, or group.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onCreateNew}
            >
              + Create List
            </button>
          </section>
        ) : (
          <div className="dashboard-content">
            <div className="dashboard-stats-strip">
              <div className="strip-item">
                <span className="strip-label">Lists</span>
                <span className="strip-val">{lists.length}</span>
              </div>
              <div className="strip-divider" />
              <div className="strip-item">
                <span className="strip-label">Total Members</span>
                <span className="strip-val">{totalMembersTracked}</span>
              </div>
            </div>

            <div className="lists-grid">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  onOpen={onOpenList}
                  onDeleteRequest={(targetList) => setListToDelete(targetList)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete List Confirmation Modal */}
      <ConfirmModal
        isOpen={listToDelete !== null}
        title="Delete Attendance List"
        message={
          listToDelete
            ? `Are you sure you want to delete "${listToDelete.name}"? This will permanently remove all member records and recorded attendance history.`
            : ""
        }
        confirmLabel="Delete List"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (listToDelete) {
            onDeleteList(listToDelete.id);
            setListToDelete(null);
          }
        }}
        onCancel={() => setListToDelete(null)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out of AttendTrack?"
        confirmLabel="Log Out"
        cancelLabel="Stay Logged In"
        isDestructive={false}
        onConfirm={() => {
          setShowLogoutModal(false);
          onLogout?.();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}

export default Dashboard;
