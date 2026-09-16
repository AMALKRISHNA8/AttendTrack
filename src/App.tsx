import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>AttendTrack</h1>
          <p>Simple attendance tracking</p>
        </div>

        <button className="create-button">
          + Create List
        </button>
      </header>

      <main className="main">
        <section className="empty-state">
          <div className="empty-icon">✓</div>

          <h2>No attendance lists yet</h2>

          <p>
            Create your first attendance list to start
            tracking attendance.
          </p>

          <button className="primary-button">
            + Create List
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;