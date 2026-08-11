import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function HabitDetailPage() {
  const { habitId } = useParams();
  const { token } = useAuth();

  const navigate = useNavigate();

  const [isEditingHabit, setIsEditingHabit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [habitError, setHabitError] = useState("");

  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);

  const [date, setDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [lessonsCompleted, setLessonsCompleted] = useState("");
  const [pagesRead, setPagesRead] = useState("");
  const [exerciseType, setExerciseType] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [miles, setMiles] = useState("");
  const [logError, setLogError] = useState("");

  function renderLogDetails(log) {
    switch (habit.type) {
        case "duolingo":
        return `${log.lessons_completed ?? 0} lessons`;
        case "reading":
        return `${log.pages_read ?? 0} pages`;
        case "exercise":
        return `${log.exercise_type || "—"}, ${log.weight ?? 0} lbs, ${log.reps ?? 0} reps, ${log.sets ?? 0} sets`;
        case "running":
        return `${log.miles ?? 0} miles`;
        default:
        return "";
    }
  }

  function fetchHabit() {
    fetch(`${import.meta.env.VITE_API_URL}/habits/${habitId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setHabit(data);
        setEditName(data.name);
        setEditType(data.type || "");
      });
  }

  function fetchLogs() {
    fetch(`${import.meta.env.VITE_API_URL}/logs?habit_id=${habitId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setLogs(data));
  }

  useEffect(() => {
    fetchHabit();
    fetchLogs();
  }, [habitId, token]);

  function calculateStreak() {
    const completedDates = [
      ...new Set(logs.filter((log) => log.completed).map((log) => log.date)),
    ]
      .sort()
      .reverse();

    if (completedDates.length === 0) return 0;

    let streak = 1;
    for (let i = 0; i < completedDates.length - 1; i++) {
      const current = new Date(completedDates[i]);
      const next = new Date(completedDates[i + 1]);
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

    fetch(`${import.meta.env.VITE_API_URL}/logs/${logId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      if (response.ok) {
        fetchLogs();
      }
    });
  }

  function handleUpdateHabit(event) {
    event.preventDefault();
    setHabitError("");

    fetch(`${import.meta.env.VITE_API_URL}/habits/${habitId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName, type: editType }),
    }).then((response) => {
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

    fetch(`${import.meta.env.VITE_API_URL}/habits/${habitId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      if (response.ok) {
        navigate("/habits");
      }
    });
  }

  function handleLogSubmit(event) {
    event.preventDefault();
    setLogError("");

    const payload = {
      habit_id: Number(habitId),
      date: date,
      completed: completed,
    };

    if (lessonsCompleted !== "") payload.lessons_completed = Number(lessonsCompleted);
    if (pagesRead !== "") payload.pages_read = Number(pagesRead);
    if (exerciseType !== "") payload.exercise_type = exerciseType;
    if (weight !== "") payload.weight = Number(weight);
    if (reps !== "") payload.reps = Number(reps);
    if (sets !== "") payload.sets = Number(sets);
    if (miles !== "") payload.miles = Number(miles);

    fetch(`${import.meta.env.VITE_API_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) {
        response.json().then((data) => setLogError(data.detail || "Could not create log"));
        return;
      }
      setDate("");
      setCompleted(false);
      setLessonsCompleted("");
      setPagesRead("");
      setExerciseType("");
      setWeight("");
      setReps("");
      setSets("");
      setMiles("");
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

        <label>
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          Completed
        </label>

        <input
          type="number"
          placeholder="Lessons completed"
          value={lessonsCompleted}
          onChange={(e) => setLessonsCompleted(e.target.value)}
        />
        <input
          type="number"
          placeholder="Pages read"
          value={pagesRead}
          onChange={(e) => setPagesRead(e.target.value)}
        />
        <input
          type="text"
          placeholder="Exercise type"
          value={exerciseType}
          onChange={(e) => setExerciseType(e.target.value)}
        />
        <input
          type="number"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <input
          type="number"
          placeholder="Sets"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
        />
        <input
          type="number"
          placeholder="Miles"
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
        />

        <button type="submit">Add Log</button>
      </form>
      {logError && <p style={{ color: "red" }}>{logError}</p>}

      <h3>Log Entries</h3>
      <ul>
        {sortedLogs.map((log) => (
          <li key={log.id}>
          {log.date} — completed: {log.completed ? "yes" : "no"} — {renderLogDetails(log)}{" "}
          <button onClick={() => handleDeleteLog(log.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HabitDetailPage;