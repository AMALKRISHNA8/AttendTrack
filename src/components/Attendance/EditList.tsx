import { useState, useRef, useEffect } from "react";
import type { AttendanceList, Person } from "../../types";
import { generateId } from "../../services/storage";

interface EditListProps {
  list: AttendanceList;
  allLists: AttendanceList[];
  onSave: (updatedList: AttendanceList) => void;
  onCancel: () => void;
}

export function EditList({ list, allLists, onSave, onCancel }: EditListProps) {
  const [listName, setListName] = useState(list.name);
  const [people, setPeople] = useState<Person[]>([...list.people]);
  const [newPersonName, setNewPersonName] = useState("");

  const [nameError, setNameError] = useState<string | null>(null);
  const [personError, setPersonError] = useState<string | null>(null);

  // Inline editing of an existing person
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingPersonName, setEditingPersonName] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPersonId) {
      editInputRef.current?.focus();
    }
  }, [editingPersonId]);

  const handleAddPerson = () => {
    const trimmed = newPersonName.trim();
    if (!trimmed) {
      setPersonError("Please enter a person's name.");
      return;
    }

    const isDuplicate = people.some(
      (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setPersonError(`"${trimmed}" is already in this list.`);
      return;
    }

    const newPerson: Person = {
      id: generateId(),
      name: trimmed,
    };

    setPeople([...people, newPerson]);
    setNewPersonName("");
    setPersonError(null);
  };

  const handleRemovePerson = (idToRemove: string) => {
    if (editingPersonId === idToRemove) {
      setEditingPersonId(null);
      setEditingPersonName("");
      setInlineError(null);
    }
    setPeople(people.filter((p) => p.id !== idToRemove));
  };

  const startEditingPerson = (person: Person) => {
    setEditingPersonId(person.id);
    setEditingPersonName(person.name);
    setInlineError(null);
  };

  const saveEditingPerson = (personId: string) => {
    const trimmed = editingPersonName.trim();
    if (!trimmed) {
      setInlineError("Name cannot be empty.");
      return;
    }

    const isDuplicate = people.some(
      (p) => p.id !== personId && p.name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setInlineError(`"${trimmed}" is already in the list.`);
      return;
    }

    // Preserve the original person id so attendance records remain linked!
    setPeople(
      people.map((p) => (p.id === personId ? { ...p, name: trimmed } : p))
    );
    setEditingPersonId(null);
    setEditingPersonName("");
    setInlineError(null);
  };

  const cancelEditingPerson = () => {
    setEditingPersonId(null);
    setEditingPersonName("");
    setInlineError(null);
  };

  const handleSaveAll = () => {
    const trimmedListName = listName.trim();
    if (!trimmedListName) {
      setNameError("List name cannot be empty.");
      return;
    }

    // Check duplicate list name among other lists
    const isDuplicateName = allLists.some(
      (l) => l.id !== list.id && l.name.trim().toLowerCase() === trimmedListName.toLowerCase()
    );

    if (isDuplicateName) {
      setNameError(`A list named "${trimmedListName}" already exists.`);
      return;
    }

    if (people.length === 0) {
      setPersonError("List must contain at least one person.");
      return;
    }

    const updatedList: AttendanceList = {
      ...list,
      name: trimmedListName,
      people,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedList);
  };

  return (
    <div className="card edit-list-card">
      <div className="card-header">
        <h3>Edit List Details</h3>
        <p className="card-subtitle">
          Rename the list or update members. Renaming existing members preserves their past attendance records.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="editListName" className="form-label">
          List Name
        </label>
        <input
          id="editListName"
          type="text"
          className={`input-field ${nameError ? "input-error" : ""}`}
          value={listName}
          maxLength={60}
          onChange={(e) => {
            setListName(e.target.value);
            if (nameError) setNameError(null);
          }}
        />
        {nameError && <p className="error-message">{nameError}</p>}
      </div>

      <div className="edit-people-section">
        <label className="form-label">Add New Person</label>
        <div className="input-group">
          <input
            type="text"
            className={`input-field ${personError ? "input-error" : ""}`}
            placeholder="Person's name"
            value={newPersonName}
            maxLength={60}
            onChange={(e) => {
              setNewPersonName(e.target.value);
              if (personError) setPersonError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddPerson();
              }
            }}
          />
          <button type="button" className="btn btn-secondary" onClick={handleAddPerson}>
            + Add
          </button>
        </div>
        {personError && <p className="error-message">{personError}</p>}
      </div>

      <div className="people-list-container">
        <div className="people-list-header">
          <h4>
            Current People <span className="count-pill">{people.length}</span>
          </h4>
        </div>

        {people.length === 0 ? (
          <div className="empty-people-box">
            <p>No people in this list. Please add at least one member.</p>
          </div>
        ) : (
          <ul className="people-list">
            {people.map((person, index) => {
              const isEditing = editingPersonId === person.id;

              return (
                <li className="person-row-item" key={person.id}>
                  {isEditing ? (
                    <div className="edit-person-form">
                      <input
                        ref={editInputRef}
                        type="text"
                        className="input-field input-sm"
                        value={editingPersonName}
                        maxLength={60}
                        onChange={(e) => {
                          setEditingPersonName(e.target.value);
                          if (inlineError) setInlineError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEditingPerson(person.id);
                          } else if (e.key === "Escape") {
                            cancelEditingPerson();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => saveEditingPerson(person.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={cancelEditingPerson}
                      >
                        Cancel
                      </button>
                      {inlineError && <p className="error-message edit-error">{inlineError}</p>}
                    </div>
                  ) : (
                    <>
                      <div className="person-info">
                        <span className="person-index">{index + 1}</span>
                        <span className="person-name">{person.name}</span>
                      </div>
                      <div className="person-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => startEditingPerson(person)}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => handleRemovePerson(person.id)}
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

      <div className="form-actions border-top space-between">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSaveAll}
          disabled={!listName.trim() || people.length === 0}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default EditList;
