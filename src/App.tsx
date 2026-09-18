import { useState } from "react";
import "./App.css";
import CreateList from "./CreateList";

function App() {
  const [showCreateList, setShowCreateList] = useState(false);
  const [listName, setListName] = useState("");

  if (showCreateList) {
    return (
      <CreateList
        onBack={() => setShowCreateList(false)}
        onCreate={(name) => {
          setListName(name);
          setShowCreateList(false);
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>AttendTrack</h1>
          <p>Simple attendance tracking</p>
        </div>

        <button
          className="create-button"
          onClick={() => setShowCreateList(true)}
        >
          + Create List
        </button>
      </header>

      <main className="main">
        {listName ? (
          <section className="list-card">
            <h2>{listName}</h2>
            <p>Your attendance list has been created.</p>
          </section>
        ) : (
          <section className="empty-state">
            <div className="empty-icon">✓</div>

            <h2>No attendance lists yet</h2>

            <p>
              Create your first attendance list to start
              tracking attendance.
            </p>

            <button
              className="primary-button"
              onClick={() => setShowCreateList(true)}
            >
              + Create List
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;