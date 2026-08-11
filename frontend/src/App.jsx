import { useState, useEffect } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);

  const [habitError, setHabitError] = useState("");
  const [logError, setLogError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [date, setDate] = useState("");
  const [completed, setCompleted] = useState(false);
  const [lessonsCompleted, setLessonsCompleted] = useState("");
  const [pagesRead, setPagesRead] = useState("");
  const [exerciseType, setExerciseType] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [miles, setMiles] = useState("");

  function extractErrorMessage(data, fallback) {
    if (!data || !data.detail) return fallback;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((err) => err.msg).join(", ");
    }
    return fallback;
  }

  function calculateStreak(habitId) {
    const completedDates = [
      ...new Set(
        logs
          .filter((log) => log.habit_id === habitId && log.completed)
          .map((log) => log.date)
      ),
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

  function fetchHabits() {
    fetch("http://127.0.0.1:8000/habits", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setHabits(data));
  }

  function fetchLogs() {
    fetch("http://127.0.0.1:8000/logs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setLogs(data));
  }

  useEffect(() => {
    if (!token) return;
    fetchHabits();
    fetchLogs();
  }, [token]);

  function performLogin() {
    const formBody = new URLSearchParams();
    formBody.append("username", email);
    formBody.append("password", password);

    fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody,
    }).then((response) => {
      if (!response.ok) {
        setLoginError("Incorrect email or password");
        return;
      }
      response.json().then((data) => {
        setToken(data.access_token);
        localStorage.setItem("token", data.access_token);
      });
    });
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginError("");
    performLogin();
  }

  function handleSignupSubmit(event) {
    event.preventDefault();
    setLoginError("");

    fetch("http://127.0.0.1:8000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((response) => {
      if (!response.ok) {
        response.json().then((data) => setLoginError(extractErrorMessage(data, "Signup failed")));
        return;
      }
      performLogin();
    });
  }

  function handleLogout() {
    setToken("");
    localStorage.removeItem("token");
    setHabits([]);
    setLogs([]);
  }

  function handleHabitSubmit(event) {
    event.preventDefault();
    setHabitError("");

    fetch("http://127.0.0.1:8000/habits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, type }),
    }).then((response) => {
      if (!response.ok) {
        response.json().then((data) => setHabitError(extractErrorMessage(data, "Could not create habit")));
        return;
      }
      setName("");
      setType("");
      fetchHabits();
    });
  }

  function handleLogSubmit(event) {
    event.preventDefault();
    setLogError("");

    const payload = {
      habit_id: Number(selectedHabitId),
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

    fetch("http://127.0.0.1:8000/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) {
        response.json().then((data) => setLogError(extractErrorMessage(data, "Could not create log")));
        return;
      }
      setSelectedHabitId("");
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

  if (!token) {
    return (
      <div>
        <h1>Habit Tracker</h1>
        <form onSubmit={isSignup ? handleSignupSubmit : handleLoginSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isSignup ? "Sign Up" : "Log In"}</button>
        </form>
        {loginError && <p style={{ color: "red" }}>{loginError}</p>}
        <button
          onClick={() => {
            setIsSignup(!isSignup);
            setLoginError("");
          }}
        >
          {isSignup ? "Already have an account? Log in" : "Don't have an account? Sign up"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Habit Tracker</h1>
      <button onClick={handleLogout}>Log Out</button>

      <h2>Habits</h2>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            {habit.name} ({habit.type}) — streak: {calculateStreak(habit.id)} days
          </li>
        ))}
      </ul>

      <form onSubmit={handleHabitSubmit}>
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
      {habitError && <p style={{ color: "red" }}>{habitError}</p>}

      <h2>Logs</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            Habit #{log.habit_id} — {log.date} — completed: {log.completed ? "yes" : "no"}
          </li>
        ))}
      </ul>

      <form onSubmit={handleLogSubmit}>
        <select value={selectedHabitId} onChange={(e) => setSelectedHabitId(e.target.value)} required>
          <option value="">Select a habit</option>
          {habits.map((habit) => (
            <option key={habit.id} value={habit.id}>
              {habit.name}
            </option>
          ))}
        </select>

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
    </div>
  );
}

export default App;