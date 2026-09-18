import { useState } from "react";

interface CreateListProps {
    onBack: () => void;
    onCreate: (name: string) => void;
}

function CreateList({ onBack, onCreate }: CreateListProps) {
    const [listName, setListName] = useState("");

    const handleSubmit = () => {
        const trimmedName = listName.trim();

        if (!trimmedName) {
            return;
        }

        onCreate(trimmedName);
    };

    return (
        <div className="page">
            <button className="back-button" onClick={onBack}>
                ← Back
            </button>

            <div className="form-card">
                <h2>Create Attendance List</h2>

                <p>
                    Give your attendance list a name to get started.
                </p>

                <label htmlFor="listName">List name</label>

                <input
                    id="listName"
                    type="text"
                    placeholder="e.g. Football Team"
                    value={listName}
                    onChange={(event) => setListName(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            handleSubmit();
                        }
                    }}
                />

                <button
                    className="primary-button full-width"
                    onClick={handleSubmit}
                    disabled={!listName.trim()}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

export default CreateList;