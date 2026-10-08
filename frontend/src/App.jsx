import { useState, useEffect } from "react";

const TEMP_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzg2MzA2Njc2fQ.07yZDp4SicUfSDW1UcZzUM4pjkDaLyITsAUIlhPBy-I";

function App() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  function fetchHabits() {
    fetch("http://127.0.0.1:8000/habits", {
      headers: { Authorization: `Bearer ${TEMP_TOKEN}` },
    })
      .then((response) => response.json())
      .then((data) => setHabits(data));
  }

  function fetchLogs() {
    fetch("http://127.0.0.1:8000/logs", {
      headers: { Authorization: `Bearer ${TEMP_TOKEN}` },
    })
      .then((response) => response.json())
      .then((data) => setLogs(data));
  }

  useEffect(() => {
    fetchHabits();
    fetchLogs();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    fetch("http://127.0.0.1:8000/habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEMP_TOKEN}`,
      },
      body: JSON.stringify({ name, type }),
    }).then(() => {
      setName("");
      setType("");
      fetchHabits();
    });
  }

  return (
    <div>
      <h1>Habit Tracker</h1>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            {habit.name} ({habit.type})
          </li>
        ))}
      </ul>

      <h2>Logs</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            Habit #{log.habit_id} — {log.date} — completed: {log.completed ? "yes" : "no"}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Habit name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <button type="submit">Add Habit</button>
      </form>
    </div>
  );
}

export default App;