import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function HabitsPage() {
  const { token } = useAuth();
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/habits`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setHabits(data));
  }, [token]);

  return (
    <div>
      <h2>Your Habits</h2>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            <Link to={`/habits/${habit.id}`}>
              {habit.name} ({habit.type})
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/habits/new">
        <button>Add Habit</button>
      </Link>
    </div>
  );
}

export default HabitsPage;