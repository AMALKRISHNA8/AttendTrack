import { useState, useRef, useEffect } from "react";

interface AddPeopleProps {
  listName: string;
  initialPeople?: string[];
  onBack: () => void;
  onCloseToHome?: () => void;
  onSave: (people: string[]) => void;
}

function AddPeople({ listName, initialPeople = [], onBack, onCloseToHome, onSave }: AddPeopleProps) {
  const [name, setName] = useState("");
  const [people, setPeople] = useState<string[]>(initialPeople);
  const [error, setError] = useState<string | null>(null);

  // State for inline editing a person
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null) {
      editInputRef.current?.focus();
    }
  }, [editingIndex]);

  const addPerson = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a person's name.");
      nameInputRef.current?.focus();
      return;
    }

    const isDuplicate = people.some(
      (p) => p.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError(`"${trimmedName}" is already in this list.`);
      nameInputRef.current?.focus();
      return;
    }

    setPeople([...people, trimmedName]);
    setName("");
    setError(null);
    nameInputRef.current?.focus();
  };

  const removePerson = (indexToRemove: number) => {
    if (editingIndex === indexToRemove) {
      setEditingIndex(null);
      setEditingName("");
      setEditError(null);
    }
    setPeople(people.filter((_, idx) => idx !== indexToRemove));
  };

  const startEditing = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditingName(currentName);
    setEditError(null);
  };

  const saveEditing = (index: number) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setEditError("Name cannot be empty.");
      return;
    }

    const isDuplicate = people.some(
      (p, idx) => idx !== index && p.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setEditError(`"${trimmedName}" is already in the list.`);
      return;
    }

    const updated = [...people];
    updated[index] = trimmedName;
    setPeople(updated);
    setEditingIndex(null);
    setEditingName("");
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingName("");
    setEditError(null);
  };

  const handleSaveList = () => {
    if (people.length === 0) {
      setError("Please add at least one person to save the list.");
      return;
    }
    onSave(people);
  };

  return (
    <div className="page-container">
      <div className="page-header space-between">
        <button type="button" className="btn btn-secondary back-button" onClick={onBack} title="Go back">
          ← Back
        </button>
        {onCloseToHome && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCloseToHome}
            title="Close and return to home screen"
          >
            ✕ Close
          </button>
        )}
      </div>

      <div className="card form-card add-people-card">
        <div className="card-header">
          <span className="badge badge-neutral">Step 2 of 2</span>
          <h2>Add People to "{listName}"</h2>
          <p className="card-subtitle">
            Enter the names of members, students, or teammates you want to track.
          </p>
        </div>

        <div className="add-person-section">
          <label htmlFor="newPersonName" className="form-label">
            Person's Name
          </label>
          <div className="input-group">
            <input
              id="newPersonName"
              ref={nameInputRef}
              type="text"
              className={`input-field ${error ? "input-error" : ""}`}
              placeholder="e.g. Alex Johnson"
              value={name}
              maxLength={60}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addPerson();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={addPerson}
              disabled={!name.trim()}
            >
              + Add
            </button>
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
        </div>

        <div className="people-list-container">
          <div className="people-list-header">
            <h3>
              People in list <span className="count-pill">{people.length}</span>
            </h3>
            {people.length > 0 && (
              <span className="hint-text">Click edit to rename or remove anytime</span>
            )}
          </div>

          {people.length === 0 ? (
            <div className="empty-people-box">
              <span className="empty-people-icon">👥</span>
              <p>No people added yet.</p>
              <span className="empty-people-subtext">Type a name above and press "Add" or hit Enter.</span>
            </div>
          ) : (
            <ul className="people-list">
              {people.map((person, index) => {
                const isEditing = editingIndex === index;

                return (
                  <li className="person-row-item" key={index}>
                    {isEditing ? (
                      <div className="edit-person-form">
                        <input
                          ref={editInputRef}
                          type="text"
                          className="input-field input-sm"
                          value={editingName}
                          maxLength={60}
                          onChange={(e) => {
                            setEditingName(e.target.value);
                            if (editError) setEditError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEditing(index);
                            } else if (e.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => saveEditing(index)}
                          title="Save name"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={cancelEditing}
                          title="Cancel editing"
                        >
                          Cancel
                        </button>
                        {editError && <p className="error-message edit-error">{editError}</p>}
                      </div>
                    ) : (
                      <>
                        <div className="person-info">
                          <span className="person-index">{index + 1}</span>
                          <span className="person-name">{person}</span>
                        </div>
                        <div className="person-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => startEditing(index, person)}
                            aria-label={`Edit ${person}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost-danger"
                            onClick={() => removePerson(index)}
                            aria-label={`Remove ${person}`}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="form-actions border-top">
          <button
            type="button"
            className="btn btn-primary btn-full save-button"
            onClick={handleSaveList}
            disabled={people.length === 0}
          >
            Save List ({people.length} {people.length === 1 ? "person" : "people"})
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddPeople;