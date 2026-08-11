import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <header>
        <h1>Habit Tracker</h1>
        <nav>
          <Link to="/habits">My Habits</Link>
          <button onClick={handleLogout}>Log Out</button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;