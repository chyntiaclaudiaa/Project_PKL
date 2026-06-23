import { Navigate } from "react-router-dom";

export default function AtasanProtectedRoute({ children }) {

  const user =
    JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "marcom_manager") {
    return <Navigate to="/login" />;
  }

  return children;
}