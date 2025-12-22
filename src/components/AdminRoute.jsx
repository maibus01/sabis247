import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  if (loggedInUser.role !== "admin") {
    // Not admin → redirect to homepage
    return <Navigate to="/" replace />;
  }

  return children;
}
