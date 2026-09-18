import { useState, useEffect, useCallback } from "react";
import "./App.css";
import type { AttendanceList, AttendanceStatus, Screen } from "./types";
import {
  getLists,
  createList,
  updateList,
  deleteList,
  saveAttendanceForDate,
} from "./services/storage";
import Dashboard from "./components/Dashboard/Dashboard";
import CreateList from "./CreateList";
import AddPeople from "./AddPeople";
import AttendanceView from "./components/Attendance/AttendanceView";
import Toast from "./components/Toast";

function App() {
  const [lists, setLists] = useState<AttendanceList[]>(() => getLists());
  const [screen, setScreen] = useState<Screen>({ type: "dashboard" });
  const [pendingListName, setPendingListName] = useState<string>("");

  // Toast feedback state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      setToast({ message, type });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sync state helper to reload latest from storage or set
  const refreshLists = useCallback(() => {
    setLists(getLists());
  }, []);

  // --- Handlers ---
  const handleOpenCreateList = () => {
    setPendingListName("");
    setScreen({ type: "create-list" });
  };

  const handleListNameChosen = (name: string) => {
    setPendingListName(name);
    setScreen({ type: "add-people", listName: name });
  };

  const handleSaveNewList = (peopleNames: string[]) => {
    const created = createList(pendingListName, peopleNames);
    refreshLists();
    showToast(`Created "${created.name}" with ${created.people.length} members!`, "success");
    setPendingListName("");
    // Navigate directly into the newly created list's tracker
    setScreen({ type: "attendance-detail", listId: created.id, initialTab: "take" });
  };

  const handleOpenList = (listId: string) => {
    setScreen({ type: "attendance-detail", listId, initialTab: "take" });
  };

  const handleSaveAttendance = (
    listId: string,
    date: string,
    records: { personId: string; status: AttendanceStatus }[]
  ) => {
    const updated = saveAttendanceForDate(listId, date, records);
    if (updated) {
      refreshLists();
    }
  };

  const handleUpdateList = (updated: AttendanceList) => {
    updateList(updated);
    refreshLists();
  };

  const handleDeleteList = (listId: string) => {
    const target = lists.find((l) => l.id === listId);
    deleteList(listId);
    refreshLists();
    showToast(target ? `Deleted "${target.name}".` : "List deleted.", "info");
    if (screen.type === "attendance-detail" && screen.listId === listId) {
      setScreen({ type: "dashboard" });
    }
  };

  // Find currently opened list if in detail view
  const currentList =
    screen.type === "attendance-detail"
      ? lists.find((l) => l.id === screen.listId) || null
      : null;

  return (
    <div className="app-wrapper">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {
            setToast(null);
            setScreen({ type: "dashboard" });
          }}
        />
      )}

      {screen.type === "dashboard" && (
        <Dashboard
          lists={lists}
          onCreateNew={handleOpenCreateList}
          onOpenList={handleOpenList}
          onDeleteList={handleDeleteList}
        />
      )}

      {screen.type === "create-list" && (
        <CreateList
          existingNames={lists.map((l) => l.name)}
          onBack={() => setScreen({ type: "dashboard" })}
          onCreate={handleListNameChosen}
        />
      )}

      {screen.type === "add-people" && (
        <AddPeople
          listName={screen.listName}
          onBack={() => setScreen({ type: "create-list" })}
          onCloseToHome={() => setScreen({ type: "dashboard" })}
          onSave={handleSaveNewList}
        />
      )}

      {screen.type === "attendance-detail" && (
        currentList ? (
          <AttendanceView
            list={currentList}
            allLists={lists}
            initialTab={screen.initialTab}
            onBack={() => setScreen({ type: "dashboard" })}
            onSaveAttendance={(date, records) =>
              handleSaveAttendance(currentList.id, date, records)
            }
            onUpdateList={handleUpdateList}
            onDeleteList={handleDeleteList}
            showToast={showToast}
          />
        ) : (
          <div className="page-container">
            <div className="card">
              <h2>List Not Found</h2>
              <p>The attendance list you are looking for does not exist or was deleted.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setScreen({ type: "dashboard" })}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default App;