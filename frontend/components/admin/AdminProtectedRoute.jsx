import { Navigate } from "react-router-dom";

import { isUserAuthenticated } from "../../src/services/userAuthStorage";

export default function AdminProtectedRoute({ children }) {
  if (!isUserAuthenticated()) {
    return <Navigate to="/login-admin" replace />;
  }

  return children;
}