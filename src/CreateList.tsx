import { useState } from "react";

interface CreateListProps {
  existingNames?: string[];
  onBack: () => void;
  onCreate: (name: string) => void;
}

function CreateList({ existingNames = [], onBack, onCreate }: CreateListProps) {
  const [listName, setListName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedName = listName.trim();

    if (!trimmedName) {
      setError("Please enter a list name.");
      return;
    }

    const isDuplicate = existingNames.some(
      (name) => name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError(`A list named "${trimmedName}" already exists. Please choose a different name.`);
      return;
    }

    setError(null);
    onCreate(trimmedName);
  };

  return (
    <div className="page-container">
      <div className="page-header space-between">
        <button type="button" className="btn btn-secondary back-button" onClick={onBack} title="Return to home screen">
          ← Back to Home
        </button>
        <button type="button" className="btn btn-ghost" onClick={onBack} title="Close and return to home screen">
          ✕ Close
        </button>
      </div>

      <div className="card form-card">
        <div className="card-header">
          <h2>Create Attendance List</h2>
          <p className="card-subtitle">
            Give your attendance list a clear name to organize your group or event.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="listName" className="form-label">
            List name <span className="required-star">*</span>
          </label>
          <input
            id="listName"
            type="text"
            className={`input-field ${error ? "input-error" : ""}`}
            placeholder="e.g. Football Team, Biology Class, Project Squad"
            value={listName}
            autoFocus
            maxLength={60}
            onChange={(event) => {
              setListName(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
          />
          {error && <p className="error-message" role="alert">{error}</p>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={handleSubmit}
            disabled={!listName.trim()}
          >
            Continue to Add People →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateList;