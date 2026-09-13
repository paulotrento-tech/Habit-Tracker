import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function useApiFetch() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      logout();
      navigate("/login", { replace: true });
      return null;
    }

    return response;
  };
}
