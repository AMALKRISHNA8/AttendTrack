import { useState } from "react";

interface AddPeopleProps {
    listName: string;
    onBack: () => void;
    onSave: (people: string[]) => void;
}

function AddPeople({ listName, onBack, onSave }: AddPeopleProps) {
    const [name, setName] = useState("");
    const [people, setPeople] = useState<string[]>([]);

    const addPerson = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        if (people.includes(trimmedName)) {
            return;
        }

        setPeople([...people, trimmedName]);
        setName("");
    };

    const removePerson = (personToRemove: string) => {
        setPeople(people.filter((person) => person !== personToRemove));
    };

    return (
        <div className="page">
            <button className="back-button" onClick={onBack}>
                ← Back
            </button>

            <div className="form-card">
                <h2>Add People</h2>

                <p>
                    Add the people who will be included in{" "}
                    <strong>{listName}</strong>.
                </p>

                <div className="add-person-row">
                    <input
                        type="text"
                        placeholder="Enter person's name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                addPerson();
                            }
                        }}
                    />

                    <button className="add-button" onClick={addPerson}>
                        Add
                    </button>
                </div>

                {people.length > 0 && (
                    <div className="people-list">
                        <h3>People ({people.length})</h3>

                        {people.map((person, index) => (
                            <div className="person-row" key={person}>
                                <span>
                                    {index + 1}. {person}
                                </span>

                                <button
                                    className="remove-button"
                                    onClick={() => removePerson(person)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    className="primary-button full-width save-button"
                    onClick={() => onSave(people)}
                    disabled={people.length === 0}
                >
                    Save List
                </button>
            </div>
        </div>
    );
}

export default AddPeople;