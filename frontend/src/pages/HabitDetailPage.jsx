import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useApiFetch } from "../useApiFetch";

function HabitDetailPage() {
  const { habitId } = useParams();
  const { token } = useAuth();
  const apiFetch = useApiFetch();

  const navigate = useNavigate();

  const [isEditingHabit, setIsEditingHabit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [habitError, setHabitError] = useState("");

  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);

  const [date, setDate] = useState("");
  const [fieldValues, setFieldValues] = useState({});
  const [logError, setLogError] = useState("");

  function renderLogDetails(log) {
    return habit.field_definitions
      .map((fd) => {
        const value = log.custom_fields?.[fd.name];
        return value !== undefined && value !== null && value !== ""
          ? `${fd.label}: ${value}`
          : null;
      })
      .filter(Boolean)
      .join(", ");
  }

  function fetchHabit() {
    apiFetch(`${import.meta.env.VITE_API_URL}/habits/${habitId}`)
      .then((response) => {
        if (!response) return;
        return response.json();
      })
      .then((data) => {
        if (!data) return;
        setHabit(data);
        setEditName(data.name);
        setEditType(data.type || "");
      });
  }

  function fetchLogs() {
    apiFetch(`${import.meta.env.VITE_API_URL}/logs?habit_id=${habitId}`)
      .then((response) => {
        if (!response) return;
        return response.json();
      })
      .then((data) => {
        if (data) setLogs(data);
      });
  }

  useEffect(() => {
    fetchHabit();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitId, token]);

  function calculateStreak() {
    const logDates = [...new Set(logs.map((log) => log.date))].sort().reverse();

    if (logDates.length === 0) return 0;

    let streak = 1;
    for (let i = 0; i < logDates.length - 1; i++) {
      const current = new Date(logDates[i]);
      const next = new Date(logDates[i + 1]);
      const dayDifference = (current - next) / (1000 * 60 * 60 * 24);

      if (dayDifference === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  function handleDeleteLog(logId) {
    const confirmed = window.confirm("Delete this log entry?");
    if (!confirmed) return;

    apiFetch(`${import.meta.env.VITE_API_URL}/logs/${logId}`, {
      method: "DELETE",
    }).then((response) => {
      if (response && response.ok) {
        fetchLogs();
      }
    });
  }

  function handleUpdateHabit(event) {
    event.preventDefault();
    setHabitError("");

    apiFetch(`${import.meta.env.VITE_API_URL}/habits/${habitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, type: editType }),
    }).then((response) => {
      if (!response) return;
      if (!response.ok) {
        response.json().then((data) => setHabitError(data.detail || "Could not update habit"));
        return;
      }
      setIsEditingHabit(false);
      fetchHabit();
    });
  }

  function handleDeleteHabit() {
    const confirmed = window.confirm(`Delete "${habit.name}" and all its log entries?`);
    if (!confirmed) return;

    apiFetch(`${import.meta.env.VITE_API_URL}/habits/${habitId}`, {
      method: "DELETE",
    }).then((response) => {
      if (response && response.ok) {
        navigate("/habits");
      }
    });
  }

  function handleFieldValueChange(fieldName, value) {
    setFieldValues({ ...fieldValues, [fieldName]: value });
  }

  function handleLogSubmit(event) {
    event.preventDefault();
    setLogError("");

    const custom_fields = {};
    for (const fd of habit.field_definitions) {
      const raw = fieldValues[fd.name];
      if (raw === undefined || raw === "") continue;
      if (fd.type === "integer") custom_fields[fd.name] = parseInt(raw, 10);
      else if (fd.type === "float") custom_fields[fd.name] = Number(raw);
      else custom_fields[fd.name] = raw;
    }

    const payload = {
      habit_id: Number(habitId),
      date: date,
      custom_fields,
    };

    apiFetch(`${import.meta.env.VITE_API_URL}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response) return;
      if (!response.ok) {
        response.json().then((data) => setLogError(data.detail || "Could not create log"));
        return;
      }
      setDate("");
      setFieldValues({});
      fetchLogs();
    });
  }

  if (!habit) {
    return <p>Loading...</p>;
  }

  const sortedLogs = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      {isEditingHabit ? (
        <form onSubmit={handleUpdateHabit}>
            <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            />
            <input
            type="text"
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditingHabit(false)}>
            Cancel
            </button>
        </form>
      ) : (
        <div>
            <h2>
            {habit.name} ({habit.type})
            </h2>
            <button onClick={() => setIsEditingHabit(true)}>Edit</button>
            <button onClick={handleDeleteHabit}>Delete</button>
        </div>
      )}
      {habitError && <p style={{ color: "red" }}>{habitError}</p>}
      <p>Streak: {calculateStreak()} days</p>

      <h3>Add a Log Entry</h3>
      <form onSubmit={handleLogSubmit}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        {habit.field_definitions.map((fd) => (
          <input
            key={fd.name}
            type={fd.type === "text" ? "text" : "number"}
            step={fd.type === "float" ? "any" : "1"}
            placeholder={fd.label}
            value={fieldValues[fd.name] ?? ""}
            onChange={(e) => handleFieldValueChange(fd.name, e.target.value)}
          />
        ))}

        <button type="submit">Add Log</button>
      </form>
      {logError && <p style={{ color: "red" }}>{logError}</p>}

      <h3>Log Entries</h3>
      <ul>
        {sortedLogs.map((log) => {
          const details = renderLogDetails(log);
          return (
            <li key={log.id}>
              {log.date}
              {details && ` — ${details}`}{" "}
              <button onClick={() => handleDeleteLog(log.id)}>Delete</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default HabitDetailPage;
