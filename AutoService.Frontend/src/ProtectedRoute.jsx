import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    alert("Нямате достъп до тази страница!");
    return <Navigate to="/" />;
  }

  return children;
}
