import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  function extractErrorMessage(data, fallback) {
    if (!data || !data.detail) return fallback;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((err) => err.msg).join(", ");
    }
    return fallback;
  }

  function performLogin() {
    const formBody = new URLSearchParams();
    formBody.append("username", email);
    formBody.append("password", password);

    fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody,
    }).then((response) => {
      if (!response.ok) {
        setError("Incorrect email or password");
        return;
      }
      response.json().then((data) => {
        login(data.access_token);
        navigate("/habits");
      });
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isSignup) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then((response) => {
        if (!response.ok) {
          response.json().then((data) => setError(extractErrorMessage(data, "Signup failed")));
          return;
        }
        performLogin();
      });
    } else {
      performLogin();
    }
  }

  return (
    <div>
      <h1>Habit Tracker</h1>
      <form onSubmit={handleSubmit}>
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        onClick={() => {
          setIsSignup(!isSignup);
          setError("");
        }}
      >
        {isSignup ? "Already have an account? Log in" : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}

export default LoginPage;