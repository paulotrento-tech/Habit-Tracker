import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApiFetch } from "../useApiFetch";

function AddHabitPage() {
  const apiFetch = useApiFetch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    apiFetch(`${import.meta.env.VITE_API_URL}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
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
        <button type="submit">Add Habit</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Link to="/habits">Cancel</Link>
    </div>
  );
}

export default AddHabitPage;