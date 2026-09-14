import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApiFetch } from "../useApiFetch";

function slugify(label) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function AddHabitPage() {
  const apiFetch = useApiFetch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [fields, setFields] = useState([]);
  const [error, setError] = useState("");

  function addField() {
    setFields([...fields, { label: "", type: "text" }]);
  }

  function updateField(index, key, value) {
    setFields(fields.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  }

  function removeField(index) {
    setFields(fields.filter((_, i) => i !== index));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const field_definitions = fields
      .filter((f) => f.label.trim())
      .map((f) => ({ name: slugify(f.label), label: f.label, type: f.type }));

    const names = field_definitions.map((f) => f.name);
    if (new Set(names).size !== names.length) {
      setError("Custom field labels must be unique");
      return;
    }
    if (field_definitions.some((f) => !f.name)) {
      setError("Each custom field needs a label with at least one letter or number");
      return;
    }

    apiFetch(`${import.meta.env.VITE_API_URL}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, field_definitions }),
    }).then((response) => {
      if (!response) return;
      if (!response.ok) {
        response.json().then((data) => setError(data.detail || "Could not create habit"));
        return;
      }
      navigate("/habits");
    });
  }

  return (
    <div>
      <h2>Add a Habit</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Habit name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />

        <h3>Custom Fields</h3>
        {fields.map((field, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Field label"
              value={field.label}
              onChange={(e) => updateField(index, "label", e.target.value)}
            />
            <select
              value={field.type}
              onChange={(e) => updateField(index, "type", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="integer">Integer</option>
              <option value="float">Decimal</option>
            </select>
            <button type="button" onClick={() => removeField(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addField}>
          + Add Field
        </button>

        <div>
          <button type="submit">Add Habit</button>
        </div>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Link to="/habits">Cancel</Link>
    </div>
  );
}

export default AddHabitPage;
