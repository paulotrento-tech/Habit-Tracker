import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useApiFetch } from "../useApiFetch";

function HabitsPage() {
  const { token } = useAuth();
  const apiFetch = useApiFetch();
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    apiFetch(`${import.meta.env.VITE_API_URL}/habits`)
      .then((response) => {
        if (!response) return;
        return response.json();
      })
      .then((data) => {
        if (data) setHabits(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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