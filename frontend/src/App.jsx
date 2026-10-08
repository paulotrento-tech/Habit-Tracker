import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HabitsPage from "./pages/HabitsPage";
import AddHabitPage from "./pages/AddHabitPage";
import HabitDetailPage from "./pages/HabitDetailPage";
import RequireAuth from "./RequireAuth";
import Layout from "./Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/habits" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/habits/new" element={<AddHabitPage />} />
        <Route path="/habits/:habitId" element={<HabitDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/habits" replace />} />
    </Routes>
  );
}

export default App;