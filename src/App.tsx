import { useState } from "react";
import "./App.css";
import CreateList from "./CreateList";
import AddPeople from "./AddPeople";

function App() {
  const [showCreateList, setShowCreateList] = useState(false);
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [listName, setListName] = useState("");
  const [people, setPeople] = useState<string[]>([]);

  if (showAddPeople) {
    return (
      <AddPeople
        listName={listName}
        onBack={() => setShowAddPeople(false)}
        onSave={(newPeople) => {
          setPeople(newPeople);
          setShowAddPeople(false);
        }}
      />
    );
  }

  if (showCreateList) {
    return (
      <CreateList
        onBack={() => setShowCreateList(false)}
        onCreate={(name) => {
          setListName(name);
          setShowCreateList(false);
          setShowAddPeople(true);
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

            <p>
              {people.length}{" "}
              {people.length === 1 ? "person" : "people"} added.
            </p>
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